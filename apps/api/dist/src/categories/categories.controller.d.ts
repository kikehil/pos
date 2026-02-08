import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesController {
    private readonly categoriesService;
    private readonly prisma;
    constructor(categoriesService: CategoriesService, prisma: PrismaService);
    private getDemoTenantId;
    create(name: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
    findAll(): Promise<({
        _count: {
            products: number;
        };
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {})[]>;
    remove(id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
