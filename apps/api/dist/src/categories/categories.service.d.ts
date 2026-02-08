import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(name: string, tenantId: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
    findAll(tenantId: string): Promise<({
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
    remove(id: string, tenantId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
