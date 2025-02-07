import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify,sign } from 'hono/jwt';
import { cors } from 'hono/cors';
import axios from 'axios';
import { FLASK_URL } from '../config';
// No npm install needed!

// Define interfaces for tokenData and userInfo to avoid 'unknown' type
interface TokenData {
  access_token: string;
}

interface UserInfo {
  id: string;
  given_name: string;
  family_name: string;
}

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URI: string;
    GOOGLE_API: string
  };
  Variables: {
    userId: string;
  };
}>();

// Use CORS middleware to allow requests from the frontend
app.use(
  "/*",
  cors()
);


const initializeEmbeddings = (): number[] => {
  return new Array(1024).fill(0);
};



app.get('/google/login', async (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.GOOGLE_REDIRECT_URI;

  console.log("GOOGLE_REDIRECT_URI:", redirectUri);

  const authUrl = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email`;

  return c.redirect(authUrl);
});

app.get('/google/callback', async (c) => {
  const { code } = c.req.query();

  if (!code) {
    return c.json({ error: 'Authorization code missing' }, 400);
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: c.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    return c.json({ error: 'Failed to exchange code for token' }, 500);
  }

  // Cast tokenData to TokenData interface
  const tokenData: TokenData = await tokenResponse.json();
  
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoResponse.ok) {
    return c.json({ error: 'Failed to fetch user info' }, 500);
  }

  // Cast userInfo to UserInfo interface
  const userInfo: UserInfo = await userInfoResponse.json();

  // Initialize Prisma client
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: c.env.DATABASE_URL,
      },
    },
  }).$extends(withAccelerate());
  
  // Check if the user exists in the database
  let user = await prisma.user.findUnique({
    where: { userName: userInfo.id,},
  });

  // Create a new user if not found
  if (!user) {
    user = await prisma.user.create({
      data: {
        userName: userInfo.id,
        firstName: userInfo.given_name || 'Google',
        lastName: userInfo.family_name || 'User',
        password: '', // No password needed for Google users
        likedem: initializeEmbeddings(),
        dislikedem: initializeEmbeddings()
      },
    });
  }

  // Generate JWT token
  const token = await sign({ id: user.id }, c.env.JWT_SECRET);

  return c.redirect(`http://localhost:5173/dashboard?jwt=${token}`);
});

app.post('/signup', async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        userName: body.userName,
        password: body.password,
        likedem:initializeEmbeddings(),
        dislikedem: initializeEmbeddings(),
      },
    });
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt: token });
  } catch (e: any) {
    console.error("Server error:", e.message);
    return c.json({ error: "Error occurred while signing up." }, 500);
  }
});

app.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        userName: body.userName,
        password: body.password,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ error: "User not found" });
    }

    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt: token });
  } catch (e: any) {
    console.error("Server error:", e.message);
    return c.json({ error: "Error occurred while signing in." }, 500);
  }
});

app.use("/*", async (c, next) => {
  const header = c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;
  if (!token) {
      c.status(403);
      return c.json({ error: "Authorization token missing or malformed" });
  }
  try{
    const response = await verify(token, c.env.JWT_SECRET);
    if (response && typeof response.id === "number") {
      c.set("userId", String(response.id));
      await next();
    } else {
      c.status(403);
      return c.json({ error: "Invalid token payload" });
    }
  }
  catch(e)
  {   
    c.status(403);
    return c.json({
      message:"Please Login in!"
    })
  }
});

app.post('/update-location', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    
    const userId = c.get('userId');
    const body = await c.req.json();
    let latitude: number | undefined;
    let longitude: number | undefined;


    // Handle location name geocoding
    if (body.locationName) {
      const encodedLocation = encodeURIComponent(body.locationName);
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${c.env.GOOGLE_API}`;
      const response = await fetch(geocodeUrl);
      // Define the expected response type
      interface GeocodeResponse {
        status: string;
        results: { geometry: { location: { lat: number; lng: number } } }[];
      }

      // Cast the response to the expected type
      const data = (await response.json()) as GeocodeResponse;

      if (data.status !== 'OK' || !data.results[0]?.geometry?.location) {
        return c.json({ error: 'Failed to geocode location' }, 400);
      }

      latitude = data.results[0].geometry.location.lat;
      longitude = data.results[0].geometry.location.lng;
    }
    // Handle direct coordinates
    else if (body.location?.lat && body.location?.lng) {
      latitude = body.location.lat;
      longitude = body.location.lng;
    } else {
      return c.json({ error: 'Invalid request format' }, 400);
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        latitude,
        longitude,
      },
    });

    return c.json({
      message: 'Location updated successfully',
      latitude: updatedUser.latitude,
      longitude: updatedUser.longitude,
    });
  } catch (error) {
    console.error('Error updating location:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});


// Add this route to your existing HONO app
app.post('/Quiz', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    // 1. Extract user ID from JWT
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // 2. Get user preferences
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        likedTours: true,
        dislikedTours: true
      }
    });
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    console.log("1x")
    // console.log("things_of_user",user.likedTours,user.likedTours)

    // 3. Prepare payload for Flask
    const payload = {
      liked_tours: user.likedTours || [],
      disliked_tours: user.dislikedTours || [],
      include_embeddings: true
    };
    // 4. Call Flask recommendation API
    const flaskResponse = await axios.post(
      `${FLASK_URL}/quiz`,  // Ensure FLASK_URL has no spaces
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    // console.log(flaskResponse)
    // 5. Return recommendations to frontend
    return c.json(flaskResponse.data);

  } catch (error: any) {
    console.error('Recommendation error:', error);
    return c.json({ 
      error: 'Failed to get recommendations',
      details: error.message 
    }, 500);
  }
});

// Add this route after your middleware
app.get("/user", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("userId");
    if (!userId) {
      c.status(401);
      return c.json({ error: "Unauthorized" });
    }

    // Get user from Prisma
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        firstName: true,
        lastName: true,
        userName: true,
        password: true,
      },
    });

    if (!user) {
      c.status(404);
      return c.json({ error: "User not found" });
    }

    let result;

    if (!user.password) {
      if (user.firstName || user.lastName) {
        // Combine firstName and lastName (fallback to empty string for missing parts)
        result = (user.firstName || "") + (user.lastName || "");
      } else {
        result = user.userName; // Fallback to username
      }
    } else {
      result = user.userName; // Send username if password exists
    }

    return c.json({ result });
  } catch (error) {
    console.error("Error fetching user:", error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

app.post('/feedback', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get('userId');
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { answer, embeddings } = await c.req.json();

    // Fetch current user embeddings and tours
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { 
        likedem: true, 
        dislikedem: true,
        likedTours: true,
        dislikedTours: true,
      },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Initialize arrays for embedding calculations
    const sumLiked = new Array(user.likedem.length).fill(0);
    const sumDisliked = new Array(user.dislikedem.length).fill(0);

    // Initialize arrays for tour IDs
    const likedTourIds: number[] = [];
    const dislikedTourIds: number[] = [];

    // Process each answer

    for (const [tourIdStr, isLiked] of Object.entries(answer)) {
      const tourId = parseInt(tourIdStr);
      const embedding = embeddings[tourIdStr];

      // Track liked/disliked tour IDs
      if (isLiked) {
        likedTourIds.push(tourId);
      } else {
        dislikedTourIds.push(tourId);
      }

      // Existing embedding processing
      if (!embedding) {
        console.warn(`No embedding found for tour ID ${tourIdStr}`);
        continue;
      }

      if (embedding.length !== user.likedem.length) {
        console.error(`Embedding length mismatch for tour ${tourIdStr}`);
        continue;
      }

      const targetArray = isLiked ? sumLiked : sumDisliked;
      for (let i = 0; i < embedding.length; i++) {
        targetArray[i] += embedding[i];
      }
    }

    // Update tour preference arrays with cap of 50
    const updatedLikedTours = [...user.likedTours, ...likedTourIds].slice(-50);
    const updatedDislikedTours = [...user.dislikedTours, ...dislikedTourIds].slice(-50);

    // Calculate new embeddings (existing logic)
    let newLiked = user.likedem.map((val, i) => val * 0.9 + sumLiked[i]);
    let newDisliked = user.dislikedem.map((val, i) => val * 0.9 + sumDisliked[i]);

    const normalize = (vector: number[]) => {
      const norm = Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
      return norm > 0 ? vector.map(val => val / norm) : vector;
    };

    newLiked = normalize(newLiked);
    newDisliked = normalize(newDisliked);

    // Update user with both embeddings and tour preferences
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { 
        likedem: newLiked,
        dislikedem: newDisliked,
        likedTours: updatedLikedTours,
        dislikedTours: updatedDislikedTours,
      },
    });

    return c.json({ success: true });

  } catch (error: any) {
    console.error('Feedback error:', error);
    return c.json({ 
      error: 'Failed to process feedback',
      details: error.message 
    }, 500);
  }
});

// Add to your existing backend routes
app.get("/reverse-geocoding", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get("userId");
    if (!userId) {
      c.status(401);
      return c.json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        latitude: true,
        longitude: true
      },
    });
    console.log(user?.latitude,user?.longitude)
    if (!user?.latitude || !user?.longitude) {
      return c.json({ 
        error: "Location not set",
        message: "No preference provided" 
      });
    }

    // Reverse geocode using Google Maps API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${user.latitude},${user.longitude}&key=${c.env.GOOGLE_API}`
    );
    
    const data = await response.json();
    if (data.status !== "OK") {
      return c.json({ error: "Location lookup failed" });
    }

    return c.json({
      location: data.results[0].formatted_address
    });
  } catch (error) {
    console.error("Error fetching location:", error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});


app.get('/user/location', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = c.get('userId');
    
    // Using Prisma to fetch user location
    const user = await prisma.user.findUnique({
      where: { 
        id: Number(userId) 
      },
      select: {
        latitude: true,
        longitude: true
      },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Ensure the field names match your Prisma schema
    return c.json({
      lat: user.latitude,
      lon: user.longitude
    });
    
  } catch (error) {
    console.error('Location endpoint error:', error);
    return c.json({ 
      error: 'Failed to fetch location',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/*
for the below call
{
  "destinations": [
    {"latitude": 40.7128, "longitude": -74.0060},
    {"latitude": 34.0522, "longitude": -118.2437},
    // ... up to 25 destinations (Google's limit per request)
  ]
}

*/
app.post('/distance', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    // Get authenticated user's ID from middleware
    const userId = c.get('userId');
    
    // Get user's location from Prisma
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { latitude: true, longitude: true }
    });

    if (!user?.latitude || !user?.longitude) {
      c.status(400);
      return c.json({ error: "User location not found" });
    }

    // Parse request body
    const body = await c.req.json();
    const destinations = body.destinations;

    if (!destinations || !Array.isArray(destinations)) {
      c.status(400);
      return c.json({ error: "Invalid destinations format" });
    }

    // Format coordinates for Google API
    const origin = `${user.latitude},${user.longitude}`;
    const destString = destinations
      .map(d => `${d.latitude},${d.longitude}`)
      .join('|');

    // Call Google Distance Matrix API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      new URLSearchParams({
        origins: origin,
        destinations: destString,
        key: c.env.GOOGLE_API,
        units: 'metric'
      })
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      c.status(500);
      return c.json({ error: "Distance calculation failed", details: data });
    }

    // Map results to destinations
    const results = data.rows[0].elements.map((element: any, index: number) => ({
      destination: destinations[index],
      distance: element.distance,
      duration: element.duration,
      status: element.status
    }));

    return c.json({
      origin,
      destinations: results
    });

  } catch (error) {
    console.error('Error:', error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

app.post('/sketch', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    interface Amenities {
      duration?: {
        value?: number;
        unit?: string;
      };
      // Add other expected properties
    }
    
    interface CoverImage {
      url?: string;
      score?: number;
    }

    // List of banned URLs to exclude
    const bannedUrls = new Set([
      "https://img3.oastatic.com/img2/70047569/c/variant.png",
      "https://img1.oastatic.com/img2/70954987/c/variant.png",
      "https://img.oastatic.com/img2/604696010/c/variant.jpg",
    ]);

    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);

    // Get user location
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { latitude: true, longitude: true }
    });

    if (!user?.latitude || !user?.longitude) {
      return c.json({ error: "User location not set" }, 400);
    }


    const { sketch, caption } = await c.req.json();
    const flaskPayload: any = {};
    if (sketch) flaskPayload.sketch = sketch;
    if (caption) flaskPayload.caption = caption;

    const flaskResponse = await axios.post(
      `${FLASK_URL}/Sketch2ImageRetriever`,
      flaskPayload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const usedTourIds = new Set<number>();
    
    // Enrich data with trek details
    const enrichedResults = await Promise.all(
      flaskResponse.data.results.map(async (result: any) => {
        const tourId = parseInt(result.tour_id);
        
        // Skip duplicate tour IDs
        if (usedTourIds.has(tourId)) return null;
        usedTourIds.add(tourId);

        const trek = await prisma.trek.findUnique({
          where: { tour_id: tourId },
        });
        
        if (!trek) return null;
        
        // Type cast the JSON fields
        const amenities = trek.amenities as Amenities;
        const coverImage = trek.cover_image as CoverImage;
        
        const durationValue = amenities?.duration?.value ?? 0;;
        const duration = durationValue 
          ? `${Math.floor(durationValue / 60)} hours ${durationValue % 60} minutes`
          : 'N/A';

        // Check for banned URLs in cover image
        let imageUrl = result.url;
        const images = (trek.images as any[]) || [];

        if (imageUrl && bannedUrls.has(imageUrl)) {
          // Find first non-banned image in the array
          imageUrl = images.find(img => img?.url && !bannedUrls.has(img.url))?.url || '';
        } else if (!imageUrl) {
          // Use first non-banned image if no cover image
          imageUrl = images.find(img => img?.url && !bannedUrls.has(img.url))?.url || '';
        }

        return {
          id: trek.tour_id,
          route_type:trek.route_type,
          title: trek.title,
          difficulty: trek.difficulty || 'medium',
          image: imageUrl,
          rating: result.similarity,
          durationValue: durationValue,
          duration:duration,
          latitude: parseFloat(trek.latitude),
          longitude: parseFloat(trek.longitude)
        };
      })
    );

    const validResults = enrichedResults.filter(Boolean);

    // Batch process distance matrix
    const batchSize = 25;
    const distanceMatrixResults: { trekId: any; distance: any; time_to_reach: any; }[] = [];

    for (let i = 0; i < validResults.length; i += batchSize) {
      const batch = validResults.slice(i, i + batchSize);
      const destinations = batch.map(t => `${t.latitude},${t.longitude}`).join('|');
      
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json`,
          {
            params: {
              origins: `${user.latitude},${user.longitude}`,
              destinations: destinations,
              key: c.env.GOOGLE_API,
            }
          }
        );

        if (response.data.status === 'OK') {
          response.data.rows[0].elements.forEach((element: any, index: number) => {
            distanceMatrixResults.push({
              trekId: batch[index].id,
              distance: element.status === 'OK' ? element.distance : null,
              time_to_reach: element.status === 'OK' ? element.duration : null,
            });
          });
        }
      } catch (error) {
        console.error('Distance Matrix API error:', error);
        batch.forEach(() => {
          distanceMatrixResults.push({
            trekId: null,
            distance: null,
            time_to_reach: null,
          });
        });
      }
    }

    // Create distance/duration lookup map
    const distanceMap = new Map();
    distanceMatrixResults.forEach(item => {
      distanceMap.set(item.trekId, {
        distance: item.distance,
        time_to_reach: item.time_to_reach,
      });
    });
    // In your backend route handler
    const filterMetadata = {
      difficulties: new Set<string>(),
      routeTypes: new Set<string>(),
      maxDuration: 0,
      maxDistance: 0,
      maxTimeToReach: 0,
    };

    // Merge results
    const finalResults = validResults.map(result => {
      // Collect filter metadata
      if (result.difficulty) {
        filterMetadata.difficulties.add(result.difficulty.toLowerCase());
      }
      if (result.route_type) {
        filterMetadata.routeTypes.add(result.route_type.toLowerCase());
      }
      
      // Convert duration string to seconds
      let durationSeconds = result.durationValue*60;

      // Track max values
      filterMetadata.maxDuration = Math.max(filterMetadata.maxDuration, durationSeconds);
      filterMetadata.maxDistance = Math.max(filterMetadata.maxDistance, distanceMap.get(result.id).distance?.value || 0);
      filterMetadata.maxTimeToReach = Math.max(filterMetadata.maxTimeToReach, distanceMap.get(result.id).time_to_reach?.value || 0);

      return {
        ...result,
        distance: distanceMap.get(result.id).distance ? distanceMap.get(result.id).distance.value: 5000000,
        TimeToReach: distanceMap.get(result.id).time_to_reach ? distanceMap.get(result.id).time_to_reach.value : 1800000,
      };
    });
    const filters = {
      difficulties: Array.from(filterMetadata.difficulties),
      routeTypes: Array.from(filterMetadata.routeTypes),
      maxDuration: Math.ceil(filterMetadata.maxDuration / 3600), // Convert to hours
      maxDistance: Math.ceil(filterMetadata.maxDistance / 1000), // Convert to km
      maxTimeToReach: Math.ceil(filterMetadata.maxTimeToReach / 3600), // Convert to hours
    };
    console.log(finalResults.length)
    console.log(filters)

    return c.json({ 
      results: finalResults,
      filters 
    });
  } catch (error: any) {
    console.error('Sketch processing error:', error);
    return c.json({ 
      error: 'Failed to process sketch',
      details: error.message 
    }, 500);
  }
});

// In your Hono router
app.get("/find", async (c) => {
  const prisma = new PrismaClient({ 
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    interface Amenities {
      duration?: {
        value?: number;
        unit?: string;
      };
    }
    
    interface CoverImage {
      url?: string;
      score?: number;
    }

    // Get authenticated user
    const userId = c.get("userId");
    
    // Get user data including location
    const userData = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        likedem: true,
        dislikedem: true,
        likedTours: true,
        dislikedTours: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }

    // Check if user location is set
    if (userData.latitude === null || userData.longitude === null) {
      return c.json({ error: "User location not set" }, 400);
    }
    // Convert embeddings to dictionary format
    const stored_embeddings= {
      "liked":userData.likedem,
      "disliked":userData.dislikedem
    };    
    
    const comments = await prisma.trek_comment.findMany({
      where: { userId: Number(userId) },
      select: {
        trekId: true,
        comment: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    
    
    // Process comments to extract ratings
    const tour_ratings = comments
    .filter(c => c.comment && typeof c.comment === 'object' && 'rating' in c.comment)
    .map(c => ({
      tour_id: c.trekId,
      rating: (c.comment as any).rating
    }));
    
    // Prepare Flask payload
    const flaskPayload = {
      user_id: userId,
      user_query: c.req.query("location") || "",
      stored_embeddings: stored_embeddings,
      tour_ratings: tour_ratings,
      disliked_tour_indices: userData.dislikedTours || [],
    };
    // Call Flask endpoint
    const flaskResponse = await axios.post(
      `${FLASK_URL}/recommendations`,
      flaskPayload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (flaskResponse.data.status !== 'success') {
      console.error("Flask API error:", flaskResponse.data);
      return c.json({ error: "Recommendation service failed" }, 500);
    }
    // console.log(flaskResponse.data.data)
    const usedTourIds = new Set<number>();
    
    const enrichedResults = await Promise.all(
      flaskResponse.data.data.recommendations.map(async (result: any) => {
        const tourId = parseInt(result.tour_id);
        
        // Skip duplicate tour IDs
        if (usedTourIds.has(tourId)) return null;
        usedTourIds.add(tourId);

        const trek = await prisma.trek.findUnique({
          where: { tour_id: tourId },
        });
        
        if (!trek) return null;
        
        // Type cast the JSON fields
        const amenities = trek.amenities as Amenities;
        const coverImage = trek.cover_image as CoverImage;
        
        const durationValue = amenities?.duration?.value;
        const duration = durationValue 
          ?`${Math.floor(durationValue / 60)} hours ${durationValue % 60} minutes`
          : 'N/A';

        // Check for banned URLs in cover image
        return {
          id: trek.tour_id,
          route_type:trek.route_type,
          title: trek.title,
          difficulty: trek.difficulty || 'medium',
          image: coverImage.url || "",
          rating: result.similarity_score,
          durationValue: durationValue,
          duration: duration,
          latitude: parseFloat(trek.latitude),
          longitude: parseFloat(trek.longitude)
        };
      })
    );


    // Return complete results with metadata
    // Filter out null results
    const validResults = enrichedResults.filter(Boolean);

    // Batch processing for Distance Matrix API
    const batchSize = 25;
    const distanceMatrixResults: { trekId: any; distance: any; time_to_reach: any; }[] = [];

    for (let i = 0; i < validResults.length; i += batchSize) {
      const batch = validResults.slice(i, i + batchSize);
      const destinations = batch.map(t => `${t.latitude},${t.longitude}`).join('|');
      
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/distancematrix/json`,
          {
            params: {
              origins: `${userData.latitude},${userData.longitude}`,
              destinations: destinations,
              key: c.env.GOOGLE_API,
            }
          }
        );

        if (response.data.status === 'OK') {
          response.data.rows[0].elements.forEach((element: any, index: number) => {
            distanceMatrixResults.push({
              trekId: batch[index].id,
              distance: element.status === 'OK' ? element.distance : null,
              time_to_reach: element.status === 'OK' ? element.duration : null,
            });
          });
        }
      } catch (error) {
        console.error('Distance Matrix API error:', error);
        // Push null results for failed batch
        batch.forEach(() => {
          distanceMatrixResults.push({
            trekId: null,
            distance: null,
            time_to_reach: null,
          });
        });
      }
    }

    // Create distance/duration lookup map
    const distanceMap = new Map();
    distanceMatrixResults.forEach(item => {
      distanceMap.set(item.trekId, {
        distance: item.distance,
        time_to_reach: item.time_to_reach,
      });
    });

    // In your backend route handler
    const filterMetadata = {
      difficulties: new Set<string>(),
      routeTypes: new Set<string>(),
      maxDuration: 0,
      maxDistance: 0,
      maxTimeToReach: 0,
    };

    const finalResults = validResults.map(result => {
      // Collect filter metadata
      console.log(result)
      if (result.difficulty) {
        filterMetadata.difficulties.add(result.difficulty);
      }
      if (result.route_type) {
        filterMetadata.routeTypes.add(result.route_type);
      }
      
      // Convert duration string to seconds
      let durationSeconds = result.durationValue*60;

      // Track max values
      filterMetadata.maxDuration = Math.max(filterMetadata.maxDuration, durationSeconds);
      filterMetadata.maxDistance = Math.max(filterMetadata.maxDistance, distanceMap.get(result.id).distance?.value || 0);
      filterMetadata.maxTimeToReach = Math.max(filterMetadata.maxTimeToReach, distanceMap.get(result.id).time_to_reach?.value || 0);

      return {
        ...result,
        distance: distanceMap.get(result.id).distance ? distanceMap.get(result.id).distance.value: 5000000,
        TimeToReach: distanceMap.get(result.id).time_to_reach ? distanceMap.get(result.id).time_to_reach.value : 1800000,
      };
    });

    const filters = {
      difficulties: Array.from(filterMetadata.difficulties),
      routeTypes: Array.from(filterMetadata.routeTypes),
      maxDuration: Math.ceil(filterMetadata.maxDuration / 3600), // Convert to hours
      maxDistance: Math.ceil(filterMetadata.maxDistance / 1000), // Convert to km
      maxTimeToReach: Math.ceil(filterMetadata.maxTimeToReach / 3600), // Convert to hours
    };
    console.log(finalResults)
    console.log(filters)
    return c.json({ 
      results: finalResults,
      filters 
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    return c.json({ 
      status: 'error',
      message: 'Failed to get recommendations',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/:id', async (c) => {
  const id = c.req.param('id');
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  
  try {
    const trek = await prisma.trek.findUnique({
      where: { tour_id: Number(id) },
    });
    const trek_comments = await prisma.trek_comment.findMany({
      where: { trekId: Number(id) },
      include: {
        user:{
          select:
          {
            userName:true,
            firstName:true
          }
        }
      }
    });
    const Total_data={
      trek_data:trek,
      trek_comments:trek_comments
    };
    if (!trek) return c.json({ error: "Tour not found" }, 404);
    return c.json(Total_data);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Server error" }, 500);
  }
});

// Add to your backend (hono.js routes)
app.post('/:id/comments', async (c) => {
  const id = c.req.param('id');
  const { rating, text, images } = await c.req.json();
  const userId = Number(c.get("userId"));
  
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const newComment = await prisma.trek_comment.create({
      data: {
        userId: Number(userId),
        trekId: Number(id),
        comment: {
          rating,
          text,
          images,
          timestamp: new Date().toISOString()
        }
      }
    });

    return c.json(newComment);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create comment" }, 500);
  }
});

export default app;