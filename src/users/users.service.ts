import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async register(createUserDto: CreateUserDto) {
    try {
      const userExists = await this.findByEmail(createUserDto.email);
      if (userExists) throw new BadRequestException('El usuario ya existe');
      const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
      const user = await this.prismaService.users.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al registrar usuario',
        error,
      });
    }
  }

  a;
  async findById(id: string) {
    const user = await this.prismaService.users.findUnique({
      where: {
        id,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return await this.prismaService.users.findUnique({
      where: {
        email,
      },
    });
  }

  async updateLastConnection(id: string) {
    return await this.prismaService.users.update({
      where: {
        id,
      },
      data: {
        lastConnection: new Date(),
      },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    return await this.prismaService.users.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async HashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
