import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { UploadImageDto } from './dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Roles } from 'src/auth/roles.enum';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @Auth([Roles.ADMIN])
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true }))
    uploadImageDto: UploadImageDto,
  ) {
    try {
      const result = await this.imagesService.uploadImage(file, uploadImageDto);
      return {
        message: 'Imagen subida exitosamente',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        'Error al procesar la imagen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllImages() {
    return this.imagesService.getAllImages();
  }

  @Get(':id')
  async getImageById(@Param('id') id: string) {
    const image = await this.imagesService.getImageById(id);
    if (!image) {
      throw new HttpException('Imagen no encontrada', HttpStatus.NOT_FOUND);
    }
    return image;
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    try {
      await this.imagesService.deleteImage(id);
      return {
        message: 'Imagen eliminada exitosamente',
      };
    } catch (error) {
      throw new HttpException(
        'Error al eliminar la imagen',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
