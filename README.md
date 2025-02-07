# Fantasy2Reality

Fantasy2Reality is a personalized hiking trip planning platform that provides user-specific hiking spot recommendations. The platform uniquely offers personalized suggestions based on users' leisure preferences, which can be expressed through pictures, drawings, or quiz results. The system analyzes this data to identify hikes that match their style, ensuring everyone receives suggestions tailored to their personalities.

## Table of Contents
- [System Architecture](#system-architecture)
- [Components](#components)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Usage](#usage)
- [System Flow](#system-flow)

## System Architecture

The project consists of four main components:
1. Frontend (React/Vite)
2. Backend (Cloudflare Worker)
3. Flask Backend (Recommendation System)
4. Additional Testing Components

## Components

### Frontend
- Built with React and Vite
- Handles user interface and interactions
- Located in the `frontend` directory
- Deployable to Vercel

### Backend
- Built with Hono framework
- Runs on Cloudflare Workers
- Handles API routing and business logic
- Located in the `backend` directory

### Flask Backend
- Contains the recommendation system algorithms
- Requires Python environment specified in `environment.yml`
- Located in the root directory
- Needs to be exposed via ngrok for production use

### Additional Testing
- Contains testing components that were used in the development of this project including:
  - ImageData/Cover_image_selector
  - NeuralNetSelector
  - Other testing utilities
## Prerequisites

### Required Software
1. Download and Install Node.js and npm:
   - Visit [Node.js website](https://nodejs.org/)
   - Download and install the LTS version

2. Download and Install Python:
   - Visit [Python website](https://www.python.org/downloads/)
   - Download and install Python 3.8 or later
   
3. Download and Install Conda:
   - Visit [Anaconda website](https://www.anaconda.com/products/distribution)
   - Download and install Anaconda or Miniconda

4. Download and Install ngrok:
   - Visit [ngrok website](https://ngrok.com/download)
   - Download and install ngrok
   - Sign up for a free account to get your authtoken
   - Configure ngrok with your authtoken:
     ```bash
     ngrok config add-authtoken <your-authtoken>
     ```

### Required Accounts
- Cloudflare account (Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up))
- Vercel account (Sign up at [Vercel](https://vercel.com/signup))
- Google Cloud account (Sign up at [Google Cloud](https://cloud.google.com/))
- ngrok account (Sign up at [ngrok](https://ngrok.com/))

### Development Tools (Optional but Recommended)
- Git (Download from [Git website](https://git-scm.com/downloads))
- VS Code (Download from [VS Code website](https://code.visualstudio.com/))
## Installation

1. Clone the repository:
```bash
git clone https://github.com/TUM-RecSys-WS-2024/Team_5.git
```

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd backend
npm install
```

4. Set up Flask Backend Environment:
```bash
conda env create -n Fantasy2Reality -f environment.yml
conda activate Fantasy2Reality
```

5. install the model for Sketch2image from 
- <a href='https://patsorn.me/projects/tsbir/data/tsbir_model_final.pt' > Pre-trained models </a>  

6. place it in `.\FLASK_SERVER\Sketch2ImageRetriever\model`
## Configuration

### Google API Setup
1. Enable the following APIs in Google Cloud Console:
   - Reverse Geocoding API
   - Distance Matrix API
2. Create API credentials
3. Add the credentials to your backend environment variables

### Backend Configuration
in the `.env` file in the backend directory replace the follwoing empty details
```env
DATABASE_URL=""
JWT_SECRET=""
GOOGLE_REDIRECT_URI=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_API=""
```

## Deployment
### Flask Backend Configuration
1. Start your Flask server locally
```bash  
cd FLASK_SERVER
python server.py
```
2. Use ngrok to create a tunnel:
```bash
ngrok http 5000
```
3. Copy the ngrok URL and update `config.ts` in the backend:
```typescript
export const FLASK_URL = "your-ngrok-url"
```

### Backend Deployment (Cloudflare)
1. Configure your Cloudflare Worker
2. Deploy using Wrangler:
```bash
wrangler publish
```
3. After the deployment replace the backend url that you have in the `.\frontend\config.ts` file.

### Frontend Deployment (Vercel)
1. Navigate to frontend directory:
```bash
cd frontend
```
2. Use the build command:
```bash
npm run build
```
3. Deploy using Vercel CLI or GitHub integration


## System Flow

The system operates in the following sequence:

1. User Interface (Frontend)
   - Hosted on Vercel
   - Handles user interactions and input

2. API Requests
   - Frontend makes requests to Cloudflare Worker backend
   - Backend processes requests and coordinates with Flask server

3. Recommendation System
   - Flask backend (exposed via ngrok) processes recommendation requests
   - Returns personalized hiking suggestions

4. Response Flow
   - Flask server → Cloudflare Worker → Frontend → User



## Local Development



1. Start Flask Server:
```bash
cd FLASK_SERVER
python app.py
cd ..
ngrok http 5000
```
2. Copy the given url by ngrok into `.\backend\config.ts`

3. Add your required ids into `.\backend\wrangler.toml` and Start Backend:
```bash
cd backend
npm i
npm run dev
cd ..
```

4. Copy the given url by backend into `.\frontend\config.ts` adn start frontend:

```bash
cd frontend
npm i
npm run dev
cd ..
```

### Production

Ensure all components are properly configured and deployed:
- Frontend on Vercel
- Backend on Cloudflare
- Flask backend running with ngrok tunnel
- All environment variables and API keys properly set