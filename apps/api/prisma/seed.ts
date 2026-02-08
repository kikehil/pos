import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos MySQL...\n');

  // 1. Limpiar la base de datos existente
  // Orden importante: eliminar primero las tablas con foreign keys (de hijos a padres)
  console.log('🧹 Limpiando base de datos...');
  try {
    await prisma.saleItem.deleteMany();
    await prisma.sale.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    console.log('✅ Base de datos limpiada correctamente\n');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }

  // 2. Crear Tenant principal "Agencia Demo"
  console.log('🏢 Creando Tenant principal...');
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Agencia Demo',
      slug: 'agencia-demo',
    },
  });
  console.log(`✅ Tenant creado: ${tenant.name} (${tenant.slug})\n`);

  // 3. Crear Usuario Admin
  console.log('👤 Creando Usuario Admin...');
  const hashedPassword = await bcrypt.hash('123456', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agencia.com',
      name: 'Administrador',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Usuario Admin creado: ${adminUser.email} (${adminUser.role})\n`);

  // 4. Crear Categorías
  console.log('📁 Creando Categorías...');
  const categoriaBebidas = await prisma.category.create({
    data: {
      name: 'Bebidas',
      description: 'Bebidas y refrescos',
      tenantId: tenant.id,
    },
  });

  const categoriaSnacks = await prisma.category.create({
    data: {
      name: 'Snacks',
      description: 'Snacks y botanas',
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Categorías creadas: ${categoriaBebidas.name}, ${categoriaSnacks.name}\n`);

  // 5. Crear Producto Simple: "Coca Cola"
  console.log('🥤 Creando Producto Simple: Coca Cola...');
  const cocaCola = await prisma.product.create({
    data: {
      name: 'Coca Cola',
      description: 'Refresco de cola',
      sku: 'COC-001',
      isActive: true,
      tenantId: tenant.id,
      categoryId: categoriaBebidas.id,
      variants: {
        create: {
          name: 'Regular',
          sku: 'COC-001-REG',
          price: 20.00,
          stock: 100,
          minStock: 10,
          isActive: true,
        },
      },
    },
    include: {
      variants: true,
    },
  });
  console.log(`✅ Producto creado: ${cocaCola.name}`);
  console.log(`   - Variante: ${cocaCola.variants[0].name} - Precio: $${cocaCola.variants[0].price} - Stock: ${cocaCola.variants[0].stock}\n`);

  // 6. Crear Producto con Variantes: "Camiseta Polo"
  console.log('👕 Creando Producto con Variantes: Camiseta Polo...');
  const camisetaPolo = await prisma.product.create({
    data: {
      name: 'Camiseta Polo',
      description: 'Camiseta polo de algodón',
      sku: 'POL-001',
      isActive: true,
      tenantId: tenant.id,
      categoryId: categoriaSnacks.id,
      variants: {
        create: [
          {
            name: 'Talla S - Roja',
            sku: 'POL-001-S-ROJA',
            price: 150.00,
            stock: 50,
            minStock: 5,
            isActive: true,
          },
          {
            name: 'Talla M - Azul',
            sku: 'POL-001-M-AZUL',
            price: 160.00,
            stock: 50,
            minStock: 5,
            isActive: true,
          },
        ],
      },
    },
    include: {
      variants: true,
    },
  });
  console.log(`✅ Producto creado: ${camisetaPolo.name} con ${camisetaPolo.variants.length} variantes:`);
  camisetaPolo.variants.forEach((variant) => {
    console.log(`   - ${variant.name} - Precio: $${variant.price} - Stock: ${variant.stock}`);
  });
  console.log('');

  // Resumen final
  const totalProducts = await prisma.product.count({ where: { tenantId: tenant.id } });
  const totalVariants = await prisma.productVariant.count({
    where: { product: { tenantId: tenant.id } },
  });
  const totalCategories = await prisma.category.count({ where: { tenantId: tenant.id } });

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`   - Tenant: ${tenant.name} (${tenant.slug})`);
  console.log(`   - Usuarios: 1 (${adminUser.email} - ${adminUser.role})`);
  console.log(`   - Categorías: ${totalCategories}`);
  console.log(`   - Productos: ${totalProducts}`);
  console.log(`   - Variantes: ${totalVariants}`);
  console.log('\n✨ Base de datos lista para desarrollo!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de Prisma Client');
  });
