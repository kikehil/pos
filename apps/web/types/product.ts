/**
 * Interfaces para los productos del sistema POS
 * Nota: Los campos Decimal de Prisma vienen como string en el JSON
 */

/**
 * Variante de producto (tallas, colores, etc.)
 */
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string; // Decimal viene como string desde Prisma
  cost: string | null;
  stock: number;
  minStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

/**
 * Producto completo con sus variantes
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
  categoryId: string | null;
  category: Category | null;
  variants: ProductVariant[];
}


/**
 * Producto simplificado para listados
 */
export interface ProductListItem {
  id: string;
  name: string;
  sku: string | null;
  isActive: boolean;
  variants: Pick<ProductVariant, 'id' | 'name' | 'price' | 'stock'>[];
}

/**
 * DTO para crear un producto
 */
export interface CreateProductDto {
  name: string;
  description?: string;
  sku?: string;
  categoryId?: string;
  variants: CreateVariantDto[];
}

/**
 * DTO para crear una variante
 */
export interface CreateVariantDto {
  name: string;
  sku: string;
  price: number;
  cost?: number;
  stock?: number;
  minStock?: number;
}

/**
 * Helper para convertir precio string a número
 */
export const parsePrice = (price: string): number => {
  return parseFloat(price);
};

/**
 * Helper para formatear precio a moneda
 */
export const formatPrice = (price: string | number, currency = 'MXN'): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(numericPrice);
};


