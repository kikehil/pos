import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCocaColaStock() {
    try {
        // Buscar todas las variantes de productos que contengan "Coca Cola"
        const variants = await prisma.productVariant.findMany({
            include: {
                product: true,
            },
            where: {
                product: {
                    name: {
                        contains: 'Coca Cola',
                    },
                },
            },
        });

        console.log(`\n📦 Encontradas ${variants.length} variantes de Coca Cola:\n`);

        // Actualizar el stock de cada variante a 500
        for (const variant of variants) {
            const updated = await prisma.productVariant.update({
                where: { id: variant.id },
                data: { stock: 500 },
            });

            console.log(`✅ ${variant.product.name} - ${variant.name}`);
            console.log(`   Stock anterior: ${variant.stock} → Stock nuevo: ${updated.stock}`);
            console.log(`   SKU: ${variant.sku}\n`);
        }

        console.log('🎉 Stock actualizado exitosamente!\n');
    } catch (error) {
        console.error('❌ Error al actualizar stock:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateCocaColaStock();
