import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesModule } from './images/images.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    ImagesModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
