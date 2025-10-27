import { Prisma } from "@prisma/client";

export class Header implements Prisma.HeadersCreateInput {
    images: Prisma.ImageCreateNestedOneWithoutHeadersInput;
    id?: string;
    name: string;
    img: string;
    logo: string;
    title: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
    