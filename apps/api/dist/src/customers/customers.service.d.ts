import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createCustomerDto: CreateCustomerDto): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
    findAll(tenantId: string): Promise<({
        _count: {
            sales: number;
        };
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {})[]>;
    findOne(id: string, tenantId: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
    update(id: string, tenantId: string, updateCustomerDto: UpdateCustomerDto): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
    remove(id: string, tenantId: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        taxId: string | null;
        address: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {}>;
    getHistory(id: string, tenantId: string): Promise<({
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
}
