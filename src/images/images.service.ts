import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadImageDto } from './dto';
import * as sharp from 'sharp';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';

export interface ImageVariantInfo {
  path: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
}

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  async uploadImage(file: Express.Multer.File, metadata: UploadImageDto) {
    const uniqueId = uuidv4();
    const timestamp = Date.now();
    const baseFileName = `${uniqueId}-${timestamp}`;

    try {
      // Crear las tres variantes de la imagen
      const variants = await this.processImageVariants(
        file.buffer,
        baseFileName,
      );

      // Transformar patrimonialValue de string a número si existe
      const patrimonialValue = metadata.patrimonialValue
        ? parseInt(metadata.patrimonialValue.toString(), 10)
        : null;

      // Crear el registro principal de la imagen
      const image = await this.prisma.image.create({
        data: {
          title: metadata.title,
          altText: metadata.altText,
          description: metadata.description,
          notes: metadata.notes,
          people: metadata.people,
          year: metadata.year,
          decade: metadata.decade,
          zone: metadata.zone,
          previousData: metadata.previousData,
          patrimonialValue: patrimonialValue,
          owner: metadata.owner,
          culturalFund: metadata.culturalFund,
        },
      });

      // Crear los registros de las variantes
      const imageVariants = await Promise.all(
        variants.map((variant, index) => {
          const variantType = ['thumbnail', 'medium', 'full'][index];
          return this.prisma.imageVariant.create({
            data: {
              url: variant.url,
              width: variant.width,
              height: variant.height,
              format: 'webp',
              quality:
                variantType === 'thumbnail'
                  ? 80
                  : variantType === 'medium'
                    ? 85
                    : 90,
              sizeBytes: variant.sizeBytes,
              imageId: image.id,
            },
          });
        }),
      );

      const result = this.transformImageUrls([
        { ...image, variants: imageVariants },
      ])[0];

      return {
        image: result,
        variants: result.variants,
      };
    } catch (error) {
      throw error;
    }
  }

  private async processImageVariants(
    buffer: Buffer,
    baseFileName: string,
  ): Promise<ImageVariantInfo[]> {
    const variants: ImageVariantInfo[] = [];

    // Configuraciones para cada variante
    const configs = [
      { folder: 'thumbnails', width: 150, height: 150, fit: 'cover' as const },
      { folder: 'medium', width: 800, height: null, fit: 'inside' as const },
      { folder: 'full', width: null, height: null, fit: 'inside' as const },
    ];

    for (const config of configs) {
      const fileName = `${baseFileName}.webp`;
      const filePath = join(
        process.cwd(),
        'public',
        'images',
        config.folder,
        fileName,
      );
      const publicUrl = `/public/images/${config.folder}/${fileName}`;

      let sharpInstance = sharp(buffer).webp({ quality: 90 });

      if (config.width && config.height) {
        // Para thumbnail: tamaño fijo con recorte
        sharpInstance = sharpInstance.resize(config.width, config.height, {
          fit: config.fit,
        });
      } else if (config.width) {
        // Para medium: ancho fijo, altura proporcional
        sharpInstance = sharpInstance.resize(config.width, null, {
          fit: config.fit,
        });
      }
      // Para full: mantenemos el tamaño original, solo convertimos a WebP

      const processedBuffer = await sharpInstance.toBuffer();
      await fs.writeFile(filePath, processedBuffer);

      // Obtener metadatos de la imagen procesada
      const metadata = await sharp(processedBuffer).metadata();

      variants.push({
        path: filePath,
        url: publicUrl,
        width: metadata.width || 0,
        height: metadata.height || 0,
        sizeBytes: processedBuffer.length,
      });
    }

    return variants;
  }

  async getAllImages() {
    const images = await this.prisma.image.findMany({
      include: {
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.transformImageUrls(images);
  }

  async getImageById(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!image) return null;

    return this.transformImageUrls([image])[0];
  }

  async deleteImage(id: string) {
    // Obtener la imagen con sus variantes
    const image = await this.prisma.image.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!image) {
      throw new Error('Imagen no encontrada');
    }

    // Eliminar archivos físicos
    for (const variant of image.variants) {
      try {
        const filePath = join(
          process.cwd(),
          variant.url.replace('/public', 'public'),
        );
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`No se pudo eliminar el archivo: ${variant.url}`, error);
      }
    }

    // Eliminar de la base de datos (las variantes se eliminan automáticamente por CASCADE)
    return this.prisma.image.delete({
      where: { id },
    });
  }

  private transformImageUrls(images: any[]) {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';

    return images.map((image) => ({
      ...image,
      variants: image.variants.map((variant) => ({
        ...variant,
        url: `${apiUrl}${variant.url}`,
      })),
    }));
  }
}
