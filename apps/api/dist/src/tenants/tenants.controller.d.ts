import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getCurrentTenant(): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        rfc: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown> & {}>;
    updateCurrentTenant(updateTenantDto: UpdateTenantDto): Promise<import("@prisma/client/runtime/library").GetResult<{
        id: string;
        name: string;
        slug: string;
        address: string | null;
        phone: string | null;
        rfc: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, unknown> & {}>;
}
