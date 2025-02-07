-- CreateTable
CREATE TABLE "Trek" (
    "tour_id" INTEGER NOT NULL,
    "route_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "short_description" TEXT,
    "long_description" TEXT,
    "images" JSONB NOT NULL,
    "map_url" TEXT,
    "amenities" JSONB NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[],
    "best_months" TEXT[],
    "url" TEXT NOT NULL,
    "cover_image" JSONB NOT NULL,
    "real_tour_id" TEXT NOT NULL,

    CONSTRAINT "Trek_pkey" PRIMARY KEY ("tour_id")
);
