# Implementación del Ticket Térmico (Receipt)

## ✅ Componentes Implementados

### 1. **Receipt Component** (`apps/web/components/Receipt.tsx`)

Componente React especializado para impresión de tickets térmicos con las siguientes características:

#### Características Técnicas:
- ✅ **React.forwardRef**: Implementado para compatibilidad con `react-to-print`
- ✅ **Ancho fijo**: `w-[80mm]` (aprox 300px, estándar de impresoras térmicas)
- ✅ **Estilos optimizados**: 
  - Fondo blanco, texto negro puro (`text-black`)
  - Fuente monoespaciada (`font-mono text-xs`)
  - Padding: `p-4`

#### Estructura Visual:

**Cabecera:**
- Nombre de la tienda (negrita, centrado)
- Dirección
- Teléfono
- RFC/Tax ID

**Información de Venta:**
- Número de ticket
- Fecha y hora
- Método de pago

**Cuerpo (Items):**
- Lista de productos vendidos
- Formato: `Cantidad x Nombre ... Total`
- Detalles de variante
- Precio unitario

**Totales:**
- Subtotal
- IVA (16%)
- **TOTAL** (grande y negrita)

**Pie:**
- Mensaje de agradecimiento
- Código de barras simulado
- Nota de validez

#### Props Interface:
```typescript
interface ReceiptProps {
  saleData: SaleData | null;
  tenantInfo?: TenantInfo;
}

interface SaleData {
  saleNumber: string;
  total: number;
  paymentMethod: string;
  items?: Array<{
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  date?: string;
}
```

### 2. **Integración en PosTerminal** (`apps/web/components/PosTerminal.tsx`)

#### Cambios Realizados:

**1. Imports Agregados:**
```typescript
import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Receipt from './Receipt';
```

**2. Referencia para Impresión:**
```typescript
const componentRef = useRef<HTMLDivElement>(null);
```

**3. Función de Impresión:**
```typescript
const handlePrint = useReactToPrint({
  contentRef: componentRef,
  documentTitle: 'Ticket de Venta',
});
```

**4. Datos Extendidos en SaleData:**
- Se agregó array `items` con detalles de productos
- Se agregó campo `date` con timestamp de la venta

**5. Actualización del Checkout:**
El método `handleCheckout` ahora guarda los items del carrito:
```typescript
items: cart.map((item) => ({
  productName: item.product.name,
  variantName: item.variant.name,
  quantity: item.quantity,
  price: parseFloat(item.variant.price),
  total: parseFloat(item.variant.price) * item.quantity,
})),
date: new Date().toLocaleString('es-MX', { ... })
```

**6. Botón de Impresión:**
```typescript
<button onClick={handlePrint}>
  🖨️ Imprimir
</button>
```

**7. Componente Oculto:**
```typescript
<div className="hidden">
  <Receipt ref={componentRef} saleData={checkoutModal.data} />
</div>
```

## 📦 Dependencias Instaladas

```bash
npm install react-to-print
```

## 🎯 Flujo de Uso

1. Usuario completa una venta en el POS
2. Se procesa la venta y se muestra el modal de éxito
3. Usuario hace clic en "🖨️ Imprimir"
4. `react-to-print` renderiza el componente `Receipt` oculto
5. Se abre el diálogo de impresión del navegador
6. El ticket se imprime en formato térmico (80mm)

## 🖨️ Compatibilidad

- **Impresoras térmicas**: 80mm (estándar POS)
- **Navegadores**: Chrome, Firefox, Edge, Safari
- **Formato**: A4 reducido a 80mm de ancho

## 🔧 Personalización

Para personalizar la información de la tienda, pasar el prop `tenantInfo`:

```typescript
<Receipt 
  ref={componentRef} 
  saleData={checkoutModal.data}
  tenantInfo={{
    name: "Mi Tienda",
    address: "Calle Principal #123",
    phone: "Tel: (555) 123-4567",
    taxId: "RFC: ABC123456XYZ"
  }}
/>
```

## ✨ Características Adicionales

- **Cálculo automático de IVA**: Si no se proporciona, calcula 16% automáticamente
- **Formato de moneda**: Utiliza `formatPrice` para formato MXN
- **Fecha automática**: Si no se proporciona, usa la fecha actual
- **Validación**: Retorna `null` si no hay `saleData`

## 🚀 Estado Actual

✅ **Implementación completa y funcional**
- Componente Receipt creado
- Integración con PosTerminal completada
- Botón de impresión conectado
- Servidor de desarrollo corriendo en `http://localhost:3001`

## 📝 Próximos Pasos Sugeridos

1. Probar impresión con impresora térmica real
2. Ajustar estilos según necesidades específicas
3. Agregar logo de la tienda (opcional)
4. Implementar código de barras real (opcional)
5. Configurar información de tenant desde base de datos
