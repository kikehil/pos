import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(req: any, createCustomerDto: CreateCustomerDto): Promise<import("@prisma/client/runtime/library").GetResult<{
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
    findAll(req: any): Promise<({
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
    findOne(req: any, id: string): Promise<import("@prisma/client/runtime/library").GetResult<{
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
    update(req: any, id: string, updateCustomerDto: UpdateCustomerDto): Promise<import("@prisma/client/runtime/library").GetResult<{
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
    remove(req: any, id: string): Promise<import("@prisma/client/runtime/library").GetResult<{
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
    getHistory(req: any, id: string): Promise<({
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
