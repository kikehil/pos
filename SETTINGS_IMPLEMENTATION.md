# Implementación de Configuración de Empresa (Settings)

## ✅ Componentes Implementados

### 🔧 Backend - Endpoints de Tenant

#### 1. **Actualización del Schema de Prisma**

**Campos agregados al modelo `Tenant`:**
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  address   String?  @db.Text    // ✅ NUEVO
  phone     String?              // ✅ NUEVO
  rfc       String?              // ✅ NUEVO (Tax ID)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // ...
}
```

**Migración creada:**
- ✅ `add_tenant_info_fields` - Agrega campos address, phone y rfc

---

#### 2. **Tenants Module** (`apps/api/src/tenants/`)

**Estructura de archivos:**
```
tenants/
├── dto/
│   └── update-tenant.dto.ts    // DTO para actualizar tenant
├── tenants.controller.ts       // Endpoints GET y PATCH
├── tenants.service.ts          // Lógica de negocio
└── tenants.module.ts           // Módulo NestJS
```

**Endpoints disponibles:**

##### `GET /tenants/me`
Obtiene la información del tenant actual (agencia-demo)

**Response:**
```json
{
  "id": "uuid",
  "name": "Abarrotes Don Pepe",
  "slug": "agencia-demo",
  "address": "Calle Principal #123",
  "phone": "(555) 123-4567",
  "rfc": "ABC123456XYZ",
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T..."
}
```

##### `PATCH /tenants/me`
Actualiza la información del tenant actual

**Request Body:**
```json
{
  "name": "Abarrotes Don Pepe",
  "address": "Calle Principal #123, Col. Centro",
  "phone": "(555) 123-4567",
  "rfc": "ABC123456XYZ"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Abarrotes Don Pepe",
  "slug": "agencia-demo",
  "address": "Calle Principal #123, Col. Centro",
  "phone": "(555) 123-4567",
  "rfc": "ABC123456XYZ",
  "createdAt": "2026-02-07T...",
  "updatedAt": "2026-02-07T..."
}
```

---

### 🎨 Frontend - Página de Configuración

#### 1. **Sidebar Actualizado** (`components/Sidebar.tsx`)

**Nueva opción agregada:**
```typescript
{ name: 'Configuración', href: '/settings', icon: '⚙️' }
```

**Navegación completa:**
- 💰 Caja
- 📊 Ventas
- 📦 Productos
- ⚙️ Configuración ← **NUEVO**

---

#### 2. **Settings Page** (`app/settings/page.tsx`)

**Layout:**
```
┌──────────────┬─────────────────────────────────┐
│              │  ⚙️ Configuración               │
│   Sidebar    ├─────────────────────────────────┤
│              │  ┌──────────────────────────┐   │
│ - Caja       │  │ 📋 Datos de la Empresa  │   │
│ - Ventas     │  ├──────────────────────────┤   │
│ - Productos  │  │ Nombre: [Input]          │   │
│ - Config ✓   │  │ Dirección: [Textarea]    │   │
│              │  │ Teléfono: [Input]        │   │
│              │  │ RFC: [Input]             │   │
│              │  │ [Restablecer] [Guardar]  │   │
│              │  └──────────────────────────┘   │
│              │  ┌──────────────────────────┐   │
│              │  │ 👁️ Vista Previa         │   │
│              │  │ [Ticket Preview]         │   │
│              │  └──────────────────────────┘   │
└──────────────┴─────────────────────────────────┘
```

**Características del Formulario:**

1. **Campos:**
   - ✅ **Nombre del Negocio** (requerido, input grande)
   - ✅ **Dirección** (opcional, textarea de 3 líneas)
   - ✅ **Teléfono** (opcional, input)
   - ✅ **RFC / Tax ID** (opcional, input)

2. **Funcionalidades:**
   - ✅ Carga automática de datos al montar (`useEffect`)
   - ✅ Actualización en tiempo real de la vista previa
   - ✅ Validación de campo requerido (nombre)
   - ✅ Toast de éxito al guardar
   - ✅ Toast de error si falla
   - ✅ Botón "Restablecer" para recargar datos originales
   - ✅ Estados de carga (loading, saving)

3. **Vista Previa del Ticket:**
   - ✅ Muestra en tiempo real cómo se verá en el ticket
   - ✅ Formato monoespaciado simulando ticket térmico
   - ✅ Actualización dinámica al escribir

**Diseño:**
- ✅ Card con gradiente azul-púrpura en header
- ✅ Formulario espaciado y limpio
- ✅ Grid responsive (2 columnas en desktop)
- ✅ Nota informativa con icono
- ✅ Botones con gradientes y efectos hover

---

#### 3. **PosTerminal Actualizado** (`components/PosTerminal.tsx`)

**Cambios realizados:**

1. **Nueva interfaz:**
```typescript
interface TenantInfo {
  name: string;
  address?: string;
  phone?: string;
  rfc?: string;
}
```

2. **Nuevo estado:**
```typescript
const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
```

3. **useEffect para cargar datos:**
```typescript
useEffect(() => {
  const fetchTenantInfo = async () => {
    const response = await fetch('http://localhost:3000/tenants/me');
    const data = await response.json();
    setTenantInfo({
      name: data.name,
      address: data.address || undefined,
      phone: data.phone || undefined,
      rfc: data.rfc || undefined,
    });
  };
  fetchTenantInfo();
}, []);
```

4. **Pasar datos al Receipt:**
```typescript
<Receipt 
  ref={componentRef} 
  saleData={checkoutModal.data} 
  tenantInfo={tenantInfo || undefined}
/>
```

---

#### 4. **Receipt Component** (Ya existente, ahora recibe datos reales)

**Antes:**
```typescript
const defaultTenant: TenantInfo = {
  name: 'Mi Tienda',  // ❌ Hardcoded
  address: 'Dirección no especificada',
  // ...
};
```

**Ahora:**
```typescript
const defaultTenant: TenantInfo = {
  name: tenantInfo?.name || 'Mi Tienda',  // ✅ Dinámico
  address: tenantInfo?.address || 'Dirección no especificada',
  phone: tenantInfo?.phone || 'Tel: N/A',
  rfc: tenantInfo?.rfc || 'RFC: N/A',
};
```

---

## 🎯 Flujo de Uso

### Configurar la Empresa:

1. Usuario hace clic en **"⚙️ Configuración"** en el sidebar
2. Se carga la página `/settings`
3. Se hace fetch a `GET /tenants/me` y se rellenan los campos
4. Usuario edita la información (nombre, dirección, teléfono, RFC)
5. La vista previa se actualiza en tiempo real
6. Usuario hace clic en **"💾 Guardar Cambios"**
7. Se hace `PATCH /tenants/me` con los datos
8. Se muestra toast de éxito: "Información actualizada"

### Usar en Tickets:

1. Usuario realiza una venta en la Caja
2. PosTerminal carga automáticamente la info del tenant
3. Al hacer clic en "🖨️ Imprimir"
4. El componente Receipt usa los datos reales del tenant
5. El ticket impreso muestra:
   - ✅ Nombre real del negocio
   - ✅ Dirección real
   - ✅ Teléfono real
   - ✅ RFC real

---

## 📊 Estructura de Datos

### TenantInfo (Frontend)
```typescript
interface TenantInfo {
  name: string;
  address?: string;
  phone?: string;
  rfc?: string;
}
```

### UpdateTenantDto (Backend)
```typescript
class UpdateTenantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  rfc?: string;
}
```

---

## 🎨 Diseño Visual

### Página de Settings:

**Colores:**
- Header: Gradiente azul-púrpura (`from-blue-600 to-purple-600`)
- Botón Guardar: Gradiente azul-púrpura con shadow
- Botón Restablecer: Gris (`bg-gray-200`)
- Nota informativa: Azul claro (`bg-blue-50`)
- Vista previa: Gris con borde punteado

**Animaciones:**
- ✅ Loading spinner al cargar
- ✅ Saving spinner al guardar
- ✅ Hover effects en botones
- ✅ Transiciones suaves en inputs

---

## 🚀 Estado Actual

✅ **Backend:**
- Schema actualizado con campos adicionales
- Migración aplicada
- TenantsModule creado
- Endpoints GET y PATCH funcionando
- Validación con class-validator

✅ **Frontend:**
- Sidebar con enlace a Settings
- Página de configuración completa
- Formulario con validación
- Vista previa en tiempo real
- PosTerminal cargando datos reales
- Receipt usando información dinámica

---

## 📝 Ejemplo de Ticket Personalizado

**Antes (hardcoded):**
```
================================
        MI TIENDA
    Dirección no especificada
    Tel: N/A
      RFC: N/A
================================
```

**Después (dinámico):**
```
================================
    ABARROTES DON PEPE
  Calle Principal #123
   Col. Centro, Ciudad
    Tel: (555) 123-4567
    RFC: ABC123456XYZ
================================
```

---

## 🧪 Pruebas

### Para probar el sistema:

1. **Configurar la empresa:**
   - Ir a `http://localhost:3001/settings`
   - Completar el formulario
   - Guardar cambios
   - Verificar toast de éxito

2. **Verificar en ticket:**
   - Ir a la Caja
   - Realizar una venta
   - Imprimir ticket
   - Verificar que aparezcan los datos correctos

### Endpoints de prueba:
```bash
# Ver información actual
curl http://localhost:3000/tenants/me

# Actualizar información
curl -X PATCH http://localhost:3000/tenants/me \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abarrotes Don Pepe",
    "address": "Calle Principal #123",
    "phone": "(555) 123-4567",
    "rfc": "ABC123456XYZ"
  }'
```

---

## 📁 Archivos Creados/Modificados

**Backend:**
- ✅ `apps/api/prisma/schema.prisma` - Campos agregados
- ✅ `apps/api/src/tenants/dto/update-tenant.dto.ts` - DTO
- ✅ `apps/api/src/tenants/tenants.service.ts` - Servicio
- ✅ `apps/api/src/tenants/tenants.controller.ts` - Controller
- ✅ `apps/api/src/tenants/tenants.module.ts` - Módulo
- ✅ `apps/api/src/app.module.ts` - Import agregado

**Frontend:**
- ✅ `apps/web/components/Sidebar.tsx` - Enlace Settings
- ✅ `apps/web/app/settings/page.tsx` - Página completa
- ✅ `apps/web/components/PosTerminal.tsx` - Carga de tenant info
- ✅ `apps/web/components/Receipt.tsx` - Ya soportaba tenantInfo

---

## 🎉 Resultado Final

Ahora el sistema permite:
1. ✅ Personalizar completamente la información de la empresa
2. ✅ Ver una vista previa en tiempo real
3. ✅ Guardar los cambios en la base de datos
4. ✅ Usar automáticamente esos datos en todos los tickets
5. ✅ Mantener la información actualizada y consistente

¡El negocio ahora puede tener su propia identidad en cada ticket! 🎊
