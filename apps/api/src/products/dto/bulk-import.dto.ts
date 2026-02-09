import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkImportItemDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsNumber()
    @IsNotEmpty()
    price!: number;

    @IsNumber()
    @IsOptional()
    cost?: number;

    @IsInt()
    @IsNotEmpty()
    stock!: number;

    @IsString()
    @IsOptional()
    sku?: string;

    @IsString()
    @IsOptional()
    categoryName?: string;
}

export class BulkImportDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BulkImportItemDto)
    items!: BulkImportItemDto[];
}
