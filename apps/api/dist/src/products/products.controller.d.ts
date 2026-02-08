import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly prisma;
    constructor(productsService: ProductsService, prisma: PrismaService);
    findAllCategories(): Promise<(import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
    }, unknown> & {})[]>;
    create(createProductDto: CreateProductDto): Promise<{
        variants: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            cost: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            minStock: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
        }, unknown> & {})[];
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        sku: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }, unknown> & {}>;
    findAll(): Promise<({
        variants: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            cost: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            minStock: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
        }, unknown> & {})[];
        category: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        }, unknown> & {}) | null;
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        sku: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }, unknown> & {})[]>;
    findOne(id: string): Promise<{
        variants: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            cost: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            minStock: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
        }, unknown> & {})[];
        category: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        }, unknown> & {}) | null;
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        sku: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }, unknown> & {}>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
        variants: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            sku: string;
            price: import("@prisma/client/runtime/library").Decimal;
            cost: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            minStock: number;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            productId: string;
        }, unknown> & {})[];
        category: (import("@prisma/client/runtime/library").GetResult<{
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
        }, unknown> & {}) | null;
    } & import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        sku: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }, unknown> & {}>;
    remove(id: string): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        description: string | null;
        sku: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        categoryId: string | null;
    }, unknown> & {}>;
    private getDemoTenant;
}
