-- CreateEnum
CREATE TYPE "role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "image_variants" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "format" TEXT,
    "quality" INTEGER,
    "sizeBytes" INTEGER,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "image_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "altText" TEXT,
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

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "surname" TEXT,
    "role" "role" NOT NULL DEFAULT 'USER',
    "lastConnection" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refreshToken" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
