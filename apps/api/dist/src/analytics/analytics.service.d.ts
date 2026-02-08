import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(tenantId: string): Promise<{
        totalSalesToday: number;
        totalOrdersToday: number;
        lowStockProducts: number;
        salesByDay: {
            name: string;
            date: string;
            total: number;
        }[];
        topProducts: {
            name: string;
            total: number;
        }[];
    }>;
}
