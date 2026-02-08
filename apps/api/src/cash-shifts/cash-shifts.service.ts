import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashShiftsService {
    constructor(private prisma: PrismaService) { }

    async getCurrentShift(userId: string, tenantId: string) {
        return this.prisma.cashShift.findFirst({
            where: {
                userId,
                tenantId,
                status: 'OPEN',
            },
            include: {
                transactions: true,
            },
        });
    }

    async openShift(userId: string, tenantId: string, startAmount: number) {
        // Verificar si ya tiene uno abierto
        const existing = await this.getCurrentShift(userId, tenantId);
        if (existing) {
            throw new BadRequestException('Ya tienes un turno de caja abierto');
        }

        return this.prisma.cashShift.create({
            data: {
                userId,
                tenantId,
                startAmount,
                expectedAmount: startAmount,
                status: 'OPEN',
            },
        });
    }

    async closeShift(shiftId: string, endAmount: number) {
        const shift = await this.prisma.cashShift.findUnique({
            where: { id: shiftId },
        });

        if (!shift || shift.status === 'CLOSED') {
            throw new BadRequestException('El turno no existe o ya está cerrado');
        }

        return this.prisma.cashShift.update({
            where: { id: shiftId },
            data: {
                endAmount,
                endTime: new Date(),
                status: 'CLOSED',
            },
        });
    }

    // Registrar transacción (Venta)
    async addSaleTransaction(shiftId: string, amount: number, reason: string = 'Venta') {
        return this.prisma.$transaction(async (tx) => {
            // 1. Crear la transacción
            await tx.cashTransaction.create({
                data: {
                    shiftId,
                    amount,
                    type: 'SALE',
                    reason,
                },
            });

            // 2. Actualizar el monto esperado del turno
            await tx.cashShift.update({
                where: { id: shiftId },
                data: {
                    expectedAmount: { increment: amount },
                },
            });
        });
    }
}
