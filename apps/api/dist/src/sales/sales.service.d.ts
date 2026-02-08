import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CashShiftsService } from '../cash-shifts/cash-shifts.service';
export declare class SalesService {
    private readonly prisma;
    private readonly cashShiftsService;
    constructor(prisma: PrismaService, cashShiftsService: CashShiftsService);
    create(createSaleDto: CreateSaleDto, userId: string): Promise<({
        items: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            productName: string;
            variantName: string;
            productSku: string | null;
            createdAt: Date;
            saleId: string;
            variantId: string | null;
        }, unknown> & {})[];
        user: {
            name: string;
            email: string;
        };
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        saleNumber: string;
        total: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").PaymentMethod;
        receivedAmount: import("@prisma/client/runtime/library").Decimal | null;
        changeAmount: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        customerId: string | null;
    }, unknown> & {}) | null>;
    private validateAndPrepareItems;
    findAll(tenantId: string, startDate?: string, endDate?: string): Promise<({
        items: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            productName: string;
            variantName: string;
            productSku: string | null;
            createdAt: Date;
            saleId: string;
            variantId: string | null;
        }, unknown> & {})[];
        user: {
            name: string;
            email: string;
        };
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        saleNumber: string;
        total: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").PaymentMethod;
        receivedAmount: import("@prisma/client/runtime/library").Decimal | null;
        changeAmount: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        customerId: string | null;
    }, unknown> & {})[]>;
    findOne(id: string): Promise<({
        items: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discount: import("@prisma/client/runtime/library").Decimal;
            productName: string;
            variantName: string;
            productSku: string | null;
            createdAt: Date;
            saleId: string;
            variantId: string | null;
        }, unknown> & {})[];
        user: {
            name: string;
            email: string;
        };
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        saleNumber: string;
        total: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        tax: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: import(".prisma/client").PaymentMethod;
        receivedAmount: import("@prisma/client/runtime/library").Decimal | null;
        changeAmount: import("@prisma/client/runtime/library").Decimal | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        userId: string;
        customerId: string | null;
    }, unknown> & {}) | null>;
    update(id: string, updateSaleDto: UpdateSaleDto): string;
    remove(id: string): string;
}
