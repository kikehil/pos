"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashShiftsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CashShiftsService = class CashShiftsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrentShift(userId, tenantId) {
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
    async openShift(userId, tenantId, startAmount) {
        const existing = await this.getCurrentShift(userId, tenantId);
        if (existing) {
            throw new common_1.BadRequestException('Ya tienes un turno de caja abierto');
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
    async closeShift(shiftId, endAmount) {
        const shift = await this.prisma.cashShift.findUnique({
            where: { id: shiftId },
        });
        if (!shift || shift.status === 'CLOSED') {
            throw new common_1.BadRequestException('El turno no existe o ya está cerrado');
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
    async addSaleTransaction(shiftId, amount, reason = 'Venta') {
        return this.prisma.$transaction(async (tx) => {
            await tx.cashTransaction.create({
                data: {
                    shiftId,
                    amount,
                    type: 'SALE',
                    reason,
                },
            });
            await tx.cashShift.update({
                where: { id: shiftId },
                data: {
                    expectedAmount: { increment: amount },
                },
            });
        });
    }
};
exports.CashShiftsService = CashShiftsService;
exports.CashShiftsService = CashShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CashShiftsService);
//# sourceMappingURL=cash-shifts.service.js.map