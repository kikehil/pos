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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(tenantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const todaySales = await this.prisma.sale.aggregate({
            where: {
                tenantId,
                createdAt: {
                    gte: today,
                    lte: endOfToday,
                },
            },
            _sum: {
                total: true,
            },
            _count: {
                id: true,
            },
        });
        const lowStockCount = await this.prisma.productVariant.count({
            where: {
                product: {
                    tenantId,
                },
                stock: {
                    lt: 10,
                },
                isActive: true,
            },
        });
        const last7Days = [];
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            const daySales = await this.prisma.sale.aggregate({
                where: {
                    tenantId,
                    createdAt: {
                        gte: dayStart,
                        lte: dayEnd,
                    },
                },
                _sum: {
                    total: true,
                },
            });
            last7Days.push({
                name: days[date.getDay()],
                date: date.toISOString().split('T')[0],
                total: Number(daySales._sum.total) || 0,
            });
        }
        const topProductsRaw = await this.prisma.saleItem.groupBy({
            by: ['productName'],
            where: {
                sale: {
                    tenantId,
                },
            },
            _sum: {
                subtotal: true,
            },
            orderBy: {
                _sum: {
                    subtotal: 'desc',
                },
            },
            take: 5,
        });
        const topProducts = topProductsRaw.map(item => ({
            name: item.productName,
            total: Number(item._sum.subtotal) || 0,
        }));
        return {
            totalSalesToday: Number(todaySales._sum.total) || 0,
            totalOrdersToday: todaySales._count.id || 0,
            lowStockProducts: lowStockCount,
            salesByDay: last7Days,
            topProducts,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map