import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardStats(tenantId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Ventas de hoy
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

        // 2. Productos con bajo stock (< 10)
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

        // 3. Gastos del mes
        const monthlyExpenses = await this.prisma.expense.aggregate({
            where: {
                tenantId,
                date: {
                    gte: startOfMonth,
                }
            },
            _sum: {
                amount: true
            }
        });

        // 4. Utilidad (Ventas Totales - Costos de Productos de este mes)
        // Obtenemos todas las ventas del mes para calcular utilidad bruta
        const monthlySalesData = await this.prisma.sale.findMany({
            where: {
                tenantId,
                createdAt: { gte: startOfMonth }
            },
            include: {
                items: {
                    include: {
                        variant: { select: { cost: true } }
                    }
                }
            }
        });

        let totalMonthlyRevenue = 0;
        let totalMonthlyCost = 0;

        monthlySalesData.forEach(sale => {
            totalMonthlyRevenue += Number(sale.total);
            sale.items.forEach(item => {
                const cost = Number(item.variant?.cost || 0);
                totalMonthlyCost += cost * item.quantity;
            });
        });

        const grossProfit = totalMonthlyRevenue - totalMonthlyCost;
        const totalExpenses = Number(monthlyExpenses._sum.amount) || 0;
        const netProfit = grossProfit - totalExpenses;

        // 5. Ventas de los últimos 7 días
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


        // 6. Top productos (por venta total en SaleItem)
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
            monthlyStats: {
                totalExpenses,
                grossProfit,
                netProfit,
                totalRevenue: totalMonthlyRevenue
            }
        };
    }
}
