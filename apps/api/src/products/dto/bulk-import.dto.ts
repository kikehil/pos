import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkImportItemDto {
    @IsString()
    name: string;

    @IsNumber()
    price: number;

    @IsNumber()
    @IsOptional()
    cost?: number;

    @IsNumber()
    stock: number;

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
    items: BulkImportItemDto[];
}
