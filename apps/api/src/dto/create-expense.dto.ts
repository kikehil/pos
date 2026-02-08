import { IsString, IsNumber, IsOptional, IsDateString, IsNotEmpty, Min } from 'class-validator';

export class CreateExpenseDto {
    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsNumber()
    @Min(0)
    amount!: number;

    @IsString()
    @IsNotEmpty()
    category!: string;

    @IsDateString()
    @IsOptional()
    date?: string;

    @IsString()
    @IsNotEmpty()
    tenantId!: string;
}
