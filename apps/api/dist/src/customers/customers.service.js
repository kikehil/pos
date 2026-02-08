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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CustomersService = class CustomersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createCustomerDto) {
        const { email, phone } = createCustomerDto;
        if (email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email, tenantId },
            });
            if (existingEmail) {
                throw new common_1.BadRequestException('El email ya está registrado para otro cliente');
            }
        }
        if (phone) {
            const existingPhone = await this.prisma.customer.findFirst({
                where: { phone, tenantId },
            });
            if (existingPhone) {
                throw new common_1.BadRequestException('El teléfono ya está registrado para otro cliente');
            }
        }
        return this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                tenantId,
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.customer.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { sales: true }
                }
            }
        });
    }
    async findOne(id, tenantId) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Cliente no encontrado');
        }
        return customer;
    }
    async update(id, tenantId, updateCustomerDto) {
        await this.findOne(id, tenantId);
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.customer.delete({
            where: { id },
        });
    }
    async getHistory(id, tenantId) {
        await this.findOne(id, tenantId);
        return this.prisma.sale.findMany({
            where: { customerId: id, tenantId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                items: true,
                user: {
                    select: { name: true }
                }
            }
        });
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomersService);
//# sourceMappingURL=customers.service.js.map