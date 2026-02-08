import { CashShiftsService } from './cash-shifts.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class CashShiftsController {
    private readonly cashShiftsService;
    private readonly prisma;
    constructor(cashShiftsService: CashShiftsService, prisma: PrismaService);
    getCurrent(req: any): Promise<({
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
    open(req: any, amount: number): Promise<import("@prisma/client/runtime/library").GetResult<{
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
    close(req: any, countedAmount: number): Promise<import("@prisma/client/runtime/library").GetResult<{
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
}
