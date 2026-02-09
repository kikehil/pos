import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Obtener información del tenant actual (por defecto "agencia-demo")
     */
    async getCurrentTenant() {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug: 'agencia-demo' },
        });

        if (!tenant) {
            throw new NotFoundException('Tenant no encontrado');
        }

        return tenant;
    }

    /**
     * Actualizar información del tenant actual
     */
    async updateCurrentTenant(updateTenantDto: UpdateTenantDto) {
        // Obtener el tenant actual
        const tenant = await this.getCurrentTenant();

        // Actualizar solo los campos proporcionados
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: tenant.id },
            data: updateTenantDto,
        });

        return updatedTenant;
    }
}
