import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    PrismaModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ImagesModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
