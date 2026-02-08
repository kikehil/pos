import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").UserRole;
        createdAt: Date;
    }>;
    findAllByTenant(tenantId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").UserRole;
        createdAt: Date;
    }[]>;
    remove(id: string, tenantId: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: import(".prisma/client").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
}
