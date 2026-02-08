"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createProductDto) {
        const { name, description, sku, price, stock, categoryId, tenantId } = createProductDto;
        const generatedSku = sku || (name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000));
        return this.prisma.product.create({
            data: {
                name,
                description,
                sku: generatedSku,
                categoryId,
                tenantId: tenantId || '',
                variants: {
                    create: {
                        name: 'Standard',
                        sku: `${generatedSku}-STD`,
                        price: price,
                        stock: stock,
                        isActive: true,
                    },
                },
            },
            include: {
                variants: true,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.product.findMany({
            where: {
                tenantId,
                isActive: true,
            },
            include: {
                variants: true,
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                variants: true,
                category: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado`);
        }
        return product;
    }
    async update(id, updateProductDto) {
        const { name, description, sku, categoryId, price, stock } = updateProductDto;
        const product = await this.prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                sku,
                categoryId,
            },
            include: {
                variants: true,
            },
        });
        if (price !== undefined || stock !== undefined) {
            const defaultVariant = product.variants[0];
            if (defaultVariant) {
                await this.prisma.productVariant.update({
                    where: { id: defaultVariant.id },
                    data: {
                        price: price !== undefined ? price : undefined,
                        stock: stock !== undefined ? stock : undefined,
                    },
                });
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const product = await this.findOne(id);
        return this.prisma.product.delete({
            where: { id: product.id },
        });
    }
    async findAllCategories(tenantId) {
        return this.prisma.category.findMany({
            where: { tenantId },
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map