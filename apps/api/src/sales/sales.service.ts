import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSaleDto, CreateSaleItemDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CashShiftsService } from '../cash-shifts/cash-shifts.service';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cashShiftsService: CashShiftsService
  ) { }

  async create(createSaleDto: CreateSaleDto, userId: string) {
    const { tenantId, total, paymentMethod, notes, items, customerId, receivedAmount, changeAmount } = createSaleDto;


    // 1. Verificar si hay un turno de caja abierto para este usuario
    const currentShift = await this.cashShiftsService.getCurrentShift(userId, tenantId);
    if (!currentShift) {
      throw new BadRequestException('Debes abrir el turno de caja antes de realizar una venta');
    }

    // Usar transacción para garantizar integridad de datos
    return this.prisma.$transaction(async (tx) => {
      // 2. Generar número de venta único
      const saleCount = await tx.sale.count({ where: { tenantId } });
      const saleNumber = `V-${String(saleCount + 1).padStart(6, '0')}`;

      // 3. Validar stock y preparar items
      const saleItemsData = await this.validateAndPrepareItems(tx, items);

      // 4. Crear la venta
      const sale = await tx.sale.create({
        data: {
          saleNumber,
          total,
          subtotal: total,
          paymentMethod: paymentMethod as any,
          receivedAmount,
          changeAmount,
          notes,
          tenantId,
          userId,
          customerId,
        },
      });



      // 5. Crear los items de la venta y actualizar stock
      for (const itemData of saleItemsData) {
        // Crear el item de la venta
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            quantity: itemData.quantity,
            unitPrice: itemData.unitPrice,
            subtotal: itemData.subtotal,
            productName: itemData.productName,
            variantName: itemData.variantName,
            productSku: itemData.productSku,
            variantId: itemData.variantId,
          },
        });

        // Actualizar el stock de la variante
        if (itemData.variantId) {
          const updatedVariant = await tx.productVariant.update({
            where: { id: itemData.variantId },
            data: { stock: { decrement: itemData.quantity } },
          });

          // Verificar que el stock no quedó negativo (doble verificación)
          if (updatedVariant.stock < 0) {
            throw new BadRequestException(
              `Stock insuficiente para "${itemData.productName} - ${itemData.variantName}". ` +
              `Stock disponible: ${updatedVariant.stock + itemData.quantity}, solicitado: ${itemData.quantity}`
            );
          }
        }
      }

      // 6. Registrar movimiento en la caja
      await this.cashShiftsService.addSaleTransaction(currentShift.id, Number(sale.total));

      // 7. Retornar la venta completa con sus items
      return tx.sale.findUnique({

        where: { id: sale.id },
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
      });
    });
  }

  /**
   * Valida el stock disponible y prepara los datos de los items
   * Si algún producto no tiene stock suficiente, lanza una excepción
   */
  private async validateAndPrepareItems(tx: any, items: CreateSaleItemDto[]) {
    const preparedItems = [];

    for (const item of items) {
      // Obtener el producto
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Producto con ID ${item.productId} no encontrado`);
      }

      // Obtener la variante si existe
      let variant = null;
      if (item.variantId) {
        variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
        });

        if (!variant) {
          throw new NotFoundException(
            `Variante con ID ${item.variantId} no encontrada para el producto "${product.name}"`
          );
        }

        // CRÍTICO: Verificar stock ANTES de procesar
        if (variant.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuficiente para "${product.name} - ${variant.name}". ` +
            `Stock disponible: ${variant.stock}, solicitado: ${item.quantity}`
          );
        }
      }

      preparedItems.push({
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: item.price * item.quantity,
        productName: product.name,
        variantName: variant?.name || 'Sin variante',
        productSku: variant?.sku || product.sku,
        variantId: item.variantId || null,
      });
    }

    return preparedItems;
  }

  async findAll(tenantId: string, startDate?: string, endDate?: string) {
    // Construir el filtro de fechas si se proporcionan
    const dateFilter: any = {};

    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }

    if (endDate) {
      // Agregar 1 día para incluir todo el día final
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      dateFilter.lt = end;
    }

    return this.prisma.sale.findMany({
      where: {
        tenantId,
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limitar a 50 resultados por defecto
    });
  }

  async findOne(id: string) {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });
  }

  update(id: string, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: string) {
    return `This action removes a #${id} sale`;
  }
}
