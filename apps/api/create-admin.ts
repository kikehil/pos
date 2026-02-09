import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@admin.com'; // Puedes cambiar esto
    const password = 'admin'; // Puedes cambiar esto
    const tenantSlug = 'demo';

    try {
        console.log('🚀 Iniciando creación de usuario administrativo...');

        // 1. Crear o buscar el Tenant
        let tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug }
        });

        if (!tenant) {
            tenant = await prisma.tenant.create({
                data: {
                    name: 'Empresa Demo',
                    slug: tenantSlug,
                }
            });
            console.log(`✅ Tenant '${tenantSlug}' creado.`);
        } else {
            console.log(`ℹ️ El Tenant '${tenantSlug}' ya existe.`);
        }

        // 2. Hash de password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear o actualizar Usuario
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                tenantId: tenant.id,
                role: 'ADMIN',
            },
            create: {
                email,
                name: 'Administrador',
                password: hashedPassword,
                tenantId: tenant.id,
                role: 'ADMIN',
            }
        });

        console.log(`\n✨ Usuario creado/actualizado exitosamente:`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔑 Password: ${password} (ya hasheada en DB)`);
        console.log(`🏢 Tenant: ${tenant.name}\n`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
