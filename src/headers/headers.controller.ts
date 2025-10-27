import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HeadersService } from './headers.service';
import { CreateHeaderDto } from './dto/create-header.dto';
import { UpdateHeaderDto } from './dto/update-header.dto';
import { LoginDto } from 'src/auth/dto/login.dto';

@Controller('headers')
export class HeadersController {
  constructor(private readonly headersService: HeadersService) {}

  // @Post()
  // create(@Body() createHeaderDto: CreateHeaderDto) {
  //   return this.headersService.create(createHeaderDto);
  // }

  @Get(':name')
  findByName(@Param('name') name: string) {
    return this.headersService.findByName(name);
  }
  @Get()
  findAll() {
    return {
        img: 'https://example.com/image.png',
        title: 'Sample Title',
        logo: 'https://example.com/logo.png',
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHeaderDto: UpdateHeaderDto) {
    return this.headersService.update(id, updateHeaderDto);
  }


}
