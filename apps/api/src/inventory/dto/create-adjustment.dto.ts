import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum AdjustmentType {
    INCREMENT = 'INCREMENT',
    DECREMENT = 'DECREMENT',
}

export enum AdjustmentReason {
    DAMAGED = 'DAMAGED',
    EXPIRED = 'EXPIRED',
    THEFT = 'THEFT',
    ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
    RETURN = 'RETURN',
}

export class CreateAdjustmentDto {
    @IsUUID()
    productId: string;

    @IsEnum(AdjustmentType)
    type: AdjustmentType;

    @IsEnum(AdjustmentReason)
    reason: AdjustmentReason;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsString()
    @IsOptional()
    notes?: string;
}
