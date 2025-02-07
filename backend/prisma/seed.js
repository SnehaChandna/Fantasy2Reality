const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  await prisma.trek_comment.deleteMany();
  
  // Then delete all treks
  await prisma.trek.deleteMany();
  console.log('All existing records have been deleted from Trek and related tables.');

  const treksData = JSON.parse(fs.readFileSync("D:\semesters\semester_ex\courses\practical\Fantasy2Reality\final_data_multi_lat.json", 'utf-8'));

  for (const trek of treksData) {
    await prisma.trek.create({
      data: {
        tour_id: trek.tour_id,
        route_type: trek.route_type,
        title: trek.title || null,
        short_description: trek.short_description || null,
        long_description: trek.long_description || null,
        images: trek.images || [],
        map_url: trek.map_url || null,
        amenities: trek.amenities || [],
        difficulty: trek.difficulty || null,
        tags: trek.tags || [],
        best_months: trek.best_months || [],
        url: trek.url,
        latitude:trek.latitude,
        longitude:trek.longitude,
        cover_image: trek.cover_image || [],
        real_tour_id: trek.real_tour_id,
      },
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
