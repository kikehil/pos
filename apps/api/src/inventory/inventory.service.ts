import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAdjustmentDto, AdjustmentType } from './dto/create-adjustment.dto';

@Injectable()
export class InventoryService {
    constructor(private readonly prisma: PrismaService) { }

    async createAdjustment(userId: string, tenantId: string, dto: CreateAdjustmentDto) {
        const { productId, type, reason, quantity, notes } = dto;

        return this.prisma.$transaction(async (tx) => {
            // 1. Buscar el producto
            const product = await tx.product.findUnique({
                where: { id: productId },
                include: { variants: true },
            });

            if (!product || product.tenantId !== tenantId) {
                throw new NotFoundException('Producto no encontrado');
            }

            // Asumimos que el stock principal está en la primera variante (producto simple)
            // Si hay gestión avanzada de variantes, esto debería recibir variantId
            const mainVariant = product.variants[0];
            if (!mainVariant) {
                throw new BadRequestException('El producto no tiene variantes para ajustar stock');
            }

            // 2. Calcular nuevo stock
            let newStock = mainVariant.stock;
            if (type === AdjustmentType.INCREMENT) {
                newStock += quantity;
            } else {
                newStock -= quantity;
            }

            if (newStock < 0) {
                throw new BadRequestException('El ajuste resultaría en stock negativo');
            }

            // 3. Actualizar Producto (Variante)
            await tx.productVariant.update({
                where: { id: mainVariant.id },
                data: { stock: newStock },
            });

            // 4. Crear Registro de Ajuste
            const adjustment = await tx.stockAdjustment.create({
                data: {
                    productId,
                    userId,
                    tenantId,
                    type: type as any, // Casting necesario si los enums de prisma no coinciden 100% con TS en builds estrictos, pero deberían
                    reason: reason as any,
                    quantity,
                    currentStock: newStock,
                    notes,
                },
            });

            return adjustment;
        });
    }
}
