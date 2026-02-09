import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
        const { email, phone } = createCustomerDto;

        // Validar unicidad de email dentro del mismo tenant si se proporciona
        if (email) {
            const existingEmail = await this.prisma.customer.findFirst({
                where: { email, tenantId },
            });
            if (existingEmail) {
                throw new BadRequestException('El email ya está registrado para otro cliente');
            }
        }

        // Validar unicidad de teléfono si se proporciona
        if (phone) {
            const existingPhone = await this.prisma.customer.findFirst({
                where: { phone, tenantId },
            });
            if (existingPhone) {
                throw new BadRequestException('El teléfono ya está registrado para otro cliente');
            }
        }

        return this.prisma.customer.create({
            data: {
                ...createCustomerDto,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
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

    async findOne(id: string, tenantId: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, tenantId },
        });

        if (!customer) {
            throw new NotFoundException('Cliente no encontrado');
        }

        return customer;
    }

    async update(id: string, tenantId: string, updateCustomerDto: UpdateCustomerDto) {
        await this.findOne(id, tenantId);

        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }

    async remove(id: string, tenantId: string) {
        await this.findOne(id, tenantId);

        return this.prisma.customer.delete({
            where: { id },
        });
    }

    async getHistory(id: string, tenantId: string) {
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
}

