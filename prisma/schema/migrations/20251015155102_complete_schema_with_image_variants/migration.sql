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

-- AddForeignKey
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;