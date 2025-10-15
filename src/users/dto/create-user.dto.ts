import { Role } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsString()
  password: string;
  @IsString()
  @MinLength(3)
  name: string;
  @IsString()
  @MinLength(3)
  surname: string;
  @IsString()
  role: Role;
}
