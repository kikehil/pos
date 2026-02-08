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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cash_shifts_service_1 = require("../cash-shifts/cash-shifts.service");
let SalesService = class SalesService {
    constructor(prisma, cashShiftsService) {
        this.prisma = prisma;
        this.cashShiftsService = cashShiftsService;
    }
    async create(createSaleDto, userId) {
        const { tenantId, total, paymentMethod, notes, items, customerId, receivedAmount, changeAmount } = createSaleDto;
        const currentShift = await this.cashShiftsService.getCurrentShift(userId, tenantId);
        if (!currentShift) {
            throw new common_1.BadRequestException('Debes abrir el turno de caja antes de realizar una venta');
        }
        return this.prisma.$transaction(async (tx) => {
            const saleCount = await tx.sale.count({ where: { tenantId } });
            const saleNumber = `V-${String(saleCount + 1).padStart(6, '0')}`;
            const saleItemsData = await this.validateAndPrepareItems(tx, items);
            const sale = await tx.sale.create({
                data: {
                    saleNumber,
                    total,
                    subtotal: total,
                    paymentMethod: paymentMethod,
                    receivedAmount,
                    changeAmount,
                    notes,
                    tenantId,
                    userId,
                    customerId,
                },
            });
            for (const itemData of saleItemsData) {
                await tx.saleItem.create({
                    data: {
                        saleId: sale.id,
                        quantity: itemData.quantity,
                        unitPrice: itemData.unitPrice,
                        subtotal: itemData.subtotal,
                        productName: itemData.productName,
                        variantName: itemData.variantName,
                        productSku: itemData.productSku,
                        variantId: itemData.variantId,
                    },
                });
                if (itemData.variantId) {
                    const updatedVariant = await tx.productVariant.update({
                        where: { id: itemData.variantId },
                        data: { stock: { decrement: itemData.quantity } },
                    });
                    if (updatedVariant.stock < 0) {
                        throw new common_1.BadRequestException(`Stock insuficiente para "${itemData.productName} - ${itemData.variantName}". ` +
                            `Stock disponible: ${updatedVariant.stock + itemData.quantity}, solicitado: ${itemData.quantity}`);
                    }
                }
            }
            await this.cashShiftsService.addSaleTransaction(currentShift.id, Number(sale.total));
            return tx.sale.findUnique({
                where: { id: sale.id },
                include: {
                    items: true,
                    user: { select: { name: true, email: true } },
                },
            });
        });
    }
    async validateAndPrepareItems(tx, items) {
        const preparedItems = [];
        for (const item of items) {
            const product = await tx.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Producto con ID ${item.productId} no encontrado`);
            }
            let variant = null;
            if (item.variantId) {
                variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId },
                });
                if (!variant) {
                    throw new common_1.NotFoundException(`Variante con ID ${item.variantId} no encontrada para el producto "${product.name}"`);
                }
                if (variant.stock < item.quantity) {
                    throw new common_1.BadRequestException(`Stock insuficiente para "${product.name} - ${variant.name}". ` +
                        `Stock disponible: ${variant.stock}, solicitado: ${item.quantity}`);
                }
            }
            preparedItems.push({
                quantity: item.quantity,
                unitPrice: item.price,
                subtotal: item.price * item.quantity,
                productName: product.name,
                variantName: variant?.name || 'Sin variante',
                productSku: variant?.sku || product.sku,
                variantId: item.variantId || null,
            });
        }
        return preparedItems;
    }
    async findAll(tenantId, startDate, endDate) {
        const dateFilter = {};
        if (startDate) {
            dateFilter.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1);
            dateFilter.lt = end;
        }
        return this.prisma.sale.findMany({
            where: {
                tenantId,
                ...(startDate || endDate ? { createdAt: dateFilter } : {}),
            },
            include: {
                items: {
                    orderBy: { createdAt: 'asc' },
                },
                user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async findOne(id) {
        return this.prisma.sale.findUnique({
            where: { id },
            include: {
                items: true,
                user: { select: { name: true, email: true } },
            },
        });
    }
    update(id, updateSaleDto) {
        return `This action updates a #${id} sale`;
    }
    remove(id) {
        return `This action removes a #${id} sale`;
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cash_shifts_service_1.CashShiftsService])
], SalesService);
//# sourceMappingURL=sales.service.js.map