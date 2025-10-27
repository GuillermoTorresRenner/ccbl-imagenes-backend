import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesModule } from './images/images.module';
import { HeadersModule } from './headers/headers.module';

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
    HeadersModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
