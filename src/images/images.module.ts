import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { PrismaModule } from '../prisma/prisma.module';
import * as multer from 'multer';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: multer.memoryStorage(), // Almacenamos en memoria para procesar con Sharp
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
