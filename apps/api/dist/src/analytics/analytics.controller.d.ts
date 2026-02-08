import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    private readonly prisma;
    constructor(analyticsService: AnalyticsService, prisma: PrismaService);
    getDashboard(): Promise<{
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
