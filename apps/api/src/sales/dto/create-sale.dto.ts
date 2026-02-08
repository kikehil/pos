import { IsString, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum para métodos de pago
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}


/**
 * DTO para cada item de la venta
 */
export class CreateSaleItemDto {
  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  variantId?: string; // Opcional para productos simples

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  price!: number; // Precio al que se vendió
}

/**
 * DTO para crear una venta
 */
export class CreateSaleDto {
  @IsString()
  tenantId!: string; // TODO: Obtener del token/header en producción

  @IsNumber()
  @Min(0)
  total!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsNumber()
  receivedAmount?: number;

  @IsOptional()
  @IsNumber()
  changeAmount?: number;



  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];
}
