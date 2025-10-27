/*
  Warnings:

  - You are about to drop the column `img` on the `Headers` table. All the data in the column will be lost.
  - Added the required column `imgId` to the `Headers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Headers" DROP COLUMN "img",
ADD COLUMN     "imgId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Headers" ADD CONSTRAINT "Headers_imgId_fkey" FOREIGN KEY ("imgId") REFERENCES "images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
