import { $Enums, Prisma } from '@prisma/client';

export class User implements Prisma.UsersCreateInput {
  email: string;
  id?: string;
  password: string;
  name?: string;
  surname?: string;
  role?: $Enums.Role;
  lastConnection?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
