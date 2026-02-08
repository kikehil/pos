import { PrismaService } from '../prisma/prisma.service';
export declare class CashShiftsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentShift(userId: string, tenantId: string): Promise<({
        transactions: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: string;
            reason: string | null;
            createdAt: Date;
            shiftId: string;
        }, unknown> & {})[];
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        startTime: Date;
        endTime: Date | null;
        startAmount: import("@prisma/client/runtime/library").Decimal;
        endAmount: import("@prisma/client/runtime/library").Decimal | null;
        expectedAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").ShiftStatus;
        notes: string | null;
        tenantId: string;
        userId: string;
    }, unknown> & {}) | null>;
    openShift(userId: string, tenantId: string, startAmount: number): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        startTime: Date;
        endTime: Date | null;
        startAmount: import("@prisma/client/runtime/library").Decimal;
        endAmount: import("@prisma/client/runtime/library").Decimal | null;
        expectedAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").ShiftStatus;
        notes: string | null;
        tenantId: string;
        userId: string;
    }, unknown> & {}>;
    closeShift(shiftId: string, endAmount: number): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        startTime: Date;
        endTime: Date | null;
        startAmount: import("@prisma/client/runtime/library").Decimal;
        endAmount: import("@prisma/client/runtime/library").Decimal | null;
        expectedAmount: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").ShiftStatus;
        notes: string | null;
        tenantId: string;
        userId: string;
    }, unknown> & {}>;
    addSaleTransaction(shiftId: string, amount: number, reason?: string): Promise<void>;
}
