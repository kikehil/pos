import React from 'react';
import { formatPrice } from '../types/product';

interface ReceiptItem {
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
    total: number;
}

interface TenantInfo {
    name: string;
    address?: string;
    phone?: string;
    taxId?: string;
}

interface SaleData {
    saleNumber: string;
    total: number;
    paymentMethod: string;
    items?: ReceiptItem[];
    date?: string;
    subtotal?: number;
    tax?: number;
    customerName?: string;
}

interface ReceiptProps {
    saleData: SaleData | null;
    tenantInfo?: TenantInfo;
}

const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(
    ({ saleData, tenantInfo }, ref) => {
        // Si no hay datos de venta, no renderizar nada
        if (!saleData) return null;

        // Datos por defecto de la tienda
        const defaultTenant: TenantInfo = {
            name: tenantInfo?.name || 'Mi Tienda',
            address: tenantInfo?.address || 'Dirección no especificada',
            phone: tenantInfo?.phone || 'Tel: N/A',
            taxId: tenantInfo?.taxId || 'RFC: N/A',
        };

        // Fecha actual o la proporcionada
        const saleDate = saleData.date || new Date().toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Calcular subtotal e impuestos si no están proporcionados
        const subtotalValue = saleData.subtotal || saleData.total / 1.16;
        const taxValue = saleData.tax || saleData.total - subtotalValue;

        // Obtener etiqueta del método de pago
        const getPaymentMethodLabel = (method: string) => {
            const labels: Record<string, string> = {
                CASH: 'Efectivo',
                CARD: 'Tarjeta',
                TRANSFER: 'Transferencia',
                CREDIT: 'Crédito',
                OTHER: 'Otro',
            };
            return labels[method] || method;
        };

        return (
            <div ref={ref} className="w-[80mm] bg-white text-black font-mono text-xs p-4">
                {/* Cabecera */}
                <div className="text-center mb-3">
                    <h1 className="font-bold text-sm uppercase">{defaultTenant.name}</h1>
                    <p className="text-[10px] mt-1">{defaultTenant.address}</p>
                    <p className="text-[10px]">{defaultTenant.phone}</p>
                    <p className="text-[10px]">{defaultTenant.taxId}</p>
                </div>

                {/* Separador */}
                <div className="border-b border-dashed border-gray-400 my-2"></div>

                {/* Información de la venta */}
                <div className="mb-2 text-[10px]">
                    <div className="flex justify-between">
                        <span>Ticket:</span>
                        <span className="font-bold">#{saleData.saleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Fecha:</span>
                        <span>{saleDate}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Pago:</span>
                        <span>{getPaymentMethodLabel(saleData.paymentMethod)}</span>
                    </div>
                    {saleData.customerName && (
                        <div className="flex justify-between mt-1 border-t border-gray-100 pt-1">
                            <span>Cliente:</span>
                            <span className="font-bold">{saleData.customerName}</span>
                        </div>
                    )}
                </div>

                {/* Separador */}
                <div className="border-b border-dashed border-gray-400 my-2"></div>

                {/* Cuerpo - Lista de items */}
                <div className="mb-2">
                    {saleData.items && saleData.items.length > 0 ? (
                        saleData.items.map((item, index) => (
                            <div key={index} className="mb-2">
                                <div className="flex justify-between">
                                    <span className="flex-1 truncate">
                                        {item.quantity}x {item.productName}
                                    </span>
                                    <span className="font-bold ml-2">
                                        {formatPrice(item.total.toString())}
                                    </span>
                                </div>
                                {item.variantName && (
                                    <div className="text-[10px] text-gray-600 ml-4">
                                        {item.variantName}
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-600 ml-4">
                                    @ {formatPrice(item.price.toString())} c/u
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-2">
                            No hay items disponibles
                        </div>
                    )}
                </div>

                {/* Separador */}
                <div className="border-b border-dashed border-gray-400 my-2"></div>

                {/* Totales */}
                <div className="mb-2 text-[11px]">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(subtotalValue.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>IVA (16%):</span>
                        <span>{formatPrice(taxValue.toString())}</span>
                    </div>
                    <div className="border-t border-gray-400 mt-1 pt-1"></div>
                    <div className="flex justify-between font-bold text-base">
                        <span>TOTAL:</span>
                        <span>{formatPrice(saleData.total.toString())}</span>
                    </div>
                </div>

                {/* Separador */}
                <div className="border-b border-dashed border-gray-400 my-2"></div>

                {/* Pie */}
                <div className="text-center mt-3">
                    <p className="font-bold text-[11px] mb-2">¡Gracias por su compra!</p>

                    {/* Espacio para código de barras (simulado) */}
                    <div className="flex justify-center my-3">
                        <div className="border border-gray-400 px-4 py-2 text-[10px]">
                            *{saleData.saleNumber}*
                        </div>
                    </div>

                    <p className="text-[9px] text-gray-600 mt-2">
                        Este ticket es válido como comprobante de compra
                    </p>
                </div>
            </div>
        );
    }
);

Receipt.displayName = 'Receipt';

export default Receipt;
