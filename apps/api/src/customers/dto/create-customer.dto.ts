import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    name!: string;


    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    taxId?: string;

    @IsString()
    @IsOptional()
    address?: string;
}
