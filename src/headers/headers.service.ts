import { Injectable } from '@nestjs/common';
import { CreateHeaderDto } from './dto/create-header.dto';
import { UpdateHeaderDto } from './dto/update-header.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { title } from 'process';

@Injectable()
export class HeadersService {
  constructor(private readonly prismaService: PrismaService) {}
  // create(createHeaderDto: CreateHeaderDto) {
  //   return this.prismaService.headers.create({ data: createHeaderDto });
  // }


  async findByName(name: string) {
    const header = await this.prismaService.headers.findFirst({
      where: { name },
      select: {
        title: true,
        images: {
          select: {
            variants: {
              select: {
                url: true,
                format: true,
              },
            },
          },
        },
      },
    });

    // Tomar la url del tercer objeto del array de variantes de la primera imagen
    let imgFullUrl = null;
    if (header?.images?.variants && Array.isArray(header.images.variants) && header.images.variants.length >= 3) {
      imgFullUrl = process.env.API_URL + header.images.variants[2].url;
    }

    return {
      title: header?.title,
      img: imgFullUrl,
    }
  }

  update(id: string, updateHeaderDto: UpdateHeaderDto) {
    return this.prismaService.headers.update({
      where: { id },
      data: updateHeaderDto,
    });
  }

}
