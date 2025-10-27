import { IsNotEmpty, IsString } from "class-validator";

export class CreateHeaderDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    img: string;

  

    @IsString()
    @IsNotEmpty()
    title: string;
}
