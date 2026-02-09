import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkImportItemDto } from './dto/bulk-import.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    const { name, description, sku, price, stock, categoryId, tenantId } = createProductDto;

    // Generar un SKU automático si no viene: 3 letras + números aleatorios
    const generatedSku = sku || (name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000));

    return this.prisma.product.create({
      data: {
        name,
        description,
        sku: generatedSku,
        categoryId,
        tenantId: tenantId || '',
        variants: {
          create: {
            name: 'Standard', // Nombre solicitado
            sku: `${generatedSku}-STD`,
            price: price,
            stock: stock,
            isActive: true,
          },
        },
      },
      include: {
        variants: true,
      },
    });
  }


  async findAll(tenantId: string) {
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        variants: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { name, description, sku, categoryId, price, stock } = updateProductDto;

    // Primero actualizamos el producto padre
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        sku,
        categoryId,
      },
      include: {
        variants: true,
      },
    });

    // Si se envió precio o stock, actualizamos la primera variante (producto simple)
    if (price !== undefined || stock !== undefined) {
      const defaultVariant = product.variants[0];
      if (defaultVariant) {
        await this.prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            price: price !== undefined ? price : undefined,
            stock: stock !== undefined ? stock : undefined,
          },
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Borrado físico (según requerimiento)
    // Prisma borrará las variantes en cascada (según esquema onDelete: Cascade)
    const product = await this.findOne(id);
    return this.prisma.product.delete({
      where: { id: product.id },
    });
  }

  async findAllCategories(tenantId: string) {
    return this.prisma.category.findMany({
      where: { tenantId },
    });
  }

  async bulkImport(tenantId: string, items: BulkImportItemDto[]) {
    return this.prisma.$transaction(async (tx) => {
      let importedCount = 0;

      for (const item of items) {
        // 1. Resolver Categoría
        let categoryId: string | null = null;
        if (item.categoryName) {
          const existingCategory = await tx.category.findFirst({
            where: {
              tenantId,
              name: item.categoryName,
            },
          });

          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            const newCategory = await tx.category.create({
              data: {
                name: item.categoryName,
                tenantId,
              },
            });
            categoryId = newCategory.id;
          }
        }

        // 2. Resolver Producto (Upsert por SKU)
        // Generar SKU si no existe para la creación
        const productSku = item.sku || (item.name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000));

        let existingProduct = null;
        if (item.sku) {
          existingProduct = await tx.product.findFirst({
            where: {
              tenantId,
              sku: item.sku,
            },
            include: { variants: true }
          });
        }

        if (existingProduct) {
          // Actualizar producto existente
          await tx.product.update({
            where: { id: existingProduct.id },
            data: {
              name: item.name,
              categoryId: categoryId, // Actualizar categoría si cambió
              // No actualizamos SKU del padre si ya existía
            }
          });

          // Actualizar variante principal (la primera)
          if (existingProduct.variants.length > 0) {
            await tx.productVariant.update({
              where: { id: existingProduct.variants[0].id },
              data: {
                price: item.price,
                stock: item.stock, // Opcional: Sumar stock o reemplazar? Reemplazar es lo común en importación completa, pero prompt dice "actualice". Asumo reemplazar.
                cost: item.cost ?? undefined,
              }
            });
          }
        } else {
          // Crear nuevo producto
          await tx.product.create({
            data: {
              name: item.name,
              sku: productSku,
              tenantId,
              categoryId,
              variants: {
                create: {
                  name: 'Standard',
                  sku: `${productSku}-STD`,
                  price: item.price,
                  stock: item.stock,
                  cost: item.cost,
                  isActive: true,
                }
              }
            }
          });
        }
        importedCount++;
      }

      return { success: true, count: importedCount, errors: [] };
    });
  }
}

