import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {

    constructor(
        private readonly analyticsService: AnalyticsService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('dashboard')
    @Roles(UserRole.ADMIN)
    async getDashboard() {
        // Buscar el tenant por defecto (Agencia Demo)
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: 'agencia-demo' },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant no encontrado');
        }

        return this.analyticsService.getDashboardStats(tenant.id);
    }
}
