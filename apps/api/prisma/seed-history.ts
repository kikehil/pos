import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed de historial de ventas...');

    // 1. Buscamos el tenant y el usuario demo
    const tenant = await prisma.tenant.findUnique({
        where: { slug: 'agencia-demo' },
    });

    const user = await prisma.user.findFirst({
        where: { tenantId: tenant?.id },
    });

    if (!tenant || !user) {
        console.error('❌ Error: No se encontró el tenant o usuario demo. Ejecuta el seed principal primero.');
        return;
    }

    // 2. Traemos productos para generar ventas
    const products = await prisma.product.findMany({
        where: { tenantId: tenant.id },
        include: { variants: true },
    });

    if (products.length === 0) {
        console.error('❌ Error: No hay productos en la base de datos.');
        return;
    }

    // 3. Generamos 20 ventas en los últimos 7 días
    for (let i = 0; i < 20; i++) {
        // Fecha aleatoria entre hoy y hace 7 días
        const randomDays = Math.floor(Math.random() * 8); // 0 a 7
        const randomHours = Math.floor(Math.random() * 24);
        const saleDate = new Date();
        saleDate.setDate(saleDate.getDate() - randomDays);
        saleDate.setHours(randomHours);

        // Seleccionamos un producto aleatorio
        const product = products[Math.floor(Math.random() * products.length)];
        const variant = product.variants[0];

        const quantity = Math.floor(Math.random() * 3) + 1; // 1 a 3
        const unitPrice = Number(variant.price);
        const subtotal = unitPrice * quantity;

        await prisma.sale.create({
            data: {
                saleNumber: `HIST-${Date.now()}-${i}`,
                total: subtotal,
                subtotal: subtotal,
                tax: subtotal * 0.16,
                paymentMethod: Math.random() > 0.5 ? 'Efectivo' : 'Tarjeta',
                tenantId: tenant.id,
                userId: user.id,
                createdAt: saleDate,
                items: {
                    create: {
                        quantity,
                        unitPrice,
                        subtotal,
                        productName: product.name,
                        variantName: variant.name,
                        productSku: variant.sku,
                        variantId: variant.id,
                    },
                },
            },
        });
    }

    console.log('✅ Historial de ventas generado con éxito.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
