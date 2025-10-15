-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "url" TEXT[],
    "altText" TEXT,
    "title" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "people" TEXT,
    "year" TEXT,
    "decade" TEXT,
    "zone" TEXT,
    "previous_data" TEXT,
    "patrimonial_value" INTEGER,
    "owner" TEXT,
    "cultural_fund" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);
