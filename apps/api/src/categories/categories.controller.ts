import { Controller, Get, Post, Body, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {

    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly prisma: PrismaService,
    ) { }

    private async getDemoTenantId() {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: 'agencia-demo' },
        });
        if (!tenant) throw new NotFoundException('Tenant no encontrado');
        return tenant.id;
    }

    @Post()
    async create(@Body('name') name: string) {
        const tenantId = await this.getDemoTenantId();
        return this.categoriesService.create(name, tenantId);
    }

    @Get()
    async findAll() {
        const tenantId = await this.getDemoTenantId();
        return this.categoriesService.findAll(tenantId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const tenantId = await this.getDemoTenantId();
        return this.categoriesService.remove(id, tenantId);
    }
}
