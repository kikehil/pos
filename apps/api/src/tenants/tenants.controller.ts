import { Controller, Get, Patch, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    /**
     * GET /tenants/me
     * Obtener información del tenant actual
     */
    @Get('me')
    getCurrentTenant() {
        return this.tenantsService.getCurrentTenant();
    }

    /**
     * PATCH /tenants/me
     * Actualizar información del tenant actual
     */
    @Patch('me')
    updateCurrentTenant(@Body() updateTenantDto: UpdateTenantDto) {
        return this.tenantsService.updateCurrentTenant(updateTenantDto);
    }
}
