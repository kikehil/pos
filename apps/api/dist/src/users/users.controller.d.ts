import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(req: any, createUserDto: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
    }>;
    findAll(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        createdAt: Date;
    }[]>;
    remove(req: any, id: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
}
