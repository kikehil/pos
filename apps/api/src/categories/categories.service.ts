import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async create(name: string, tenantId: string) {
        return this.prisma.category.create({
            data: {
                name,
                tenantId,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.category.findMany({
            where: { tenantId },
            include: {
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    }

    async remove(id: string, tenantId: string) {
        // Verificar si tiene productos
        const productCount = await this.prisma.product.count({
            where: { categoryId: id },
        });

        if (productCount > 0) {
            throw new BadRequestException('No se puede eliminar una categoría con productos asociados');
        }

        return this.prisma.category.deleteMany({
            where: { id, tenantId },
        });
    }
}
