'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    History,
    RefreshCcw,
    Eye,
    FileText,
    Calendar,
    CreditCard,
    User as UserIcon,
    Search,
    ChevronRight,
    Loader2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';
import { formatPrice } from '../../types/product';

interface SaleItem {
    id: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    productName: string;
    variantName: string;
    productSku: string | null;
}

interface Sale {
    id: string;
    saleNumber: string;
    total: string;
    subtotal: string;
    tax: string;
    paymentMethod: string | null;
    createdAt: string;
    items: SaleItem[];
    user: {
        name: string;
        email: string;
    };
}

export default function SalesPage() {
    const [sales, setSales] = useState<Sale[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const getAuthHeader = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        fetchSales();
    }, [router]);


    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/sales', {
                headers: getAuthHeader(),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }

            const data = await response.json();
            setSales(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (sale: Sale) => {
        setSelectedSale(sale);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentMethodLabel = (method: string | null) => {
        if (!method) return 'N/A';
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
        <div className="flex h-screen bg-white">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600" />
                            Historial de Ventas
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Gestiona y consulta todas tus transacciones recientes</p>
                    </div>
                    <button
                        onClick={fetchSales}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </button>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                            <p className="text-sm font-medium">Sincronizando operaciones...</p>
                        </div>
                    ) : sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-20 h-20 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                <Search className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">Sin historial</p>
                            <p className="text-sm">Realiza tu primera venta para ver datos aquí</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Folio</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Método</th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cajero</th>
                                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bruto</th>
                                            <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sales.map((sale) => (
                                            <tr
                                                key={sale.id}
                                                className="hover:bg-gray-50/50 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-mono text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                        {sale.saleNumber}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-sm text-gray-600">
                                                    {formatDate(sale.createdAt)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                                                        {getPaymentMethodLabel(sale.paymentMethod)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-sm text-gray-600">
                                                    {sale.user.name}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-black text-gray-900">
                                                        {formatPrice(sale.total)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleViewDetails(sale)}
                                                        className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xs hover:text-indigo-800 transition-colors"
                                                    >
                                                        Detalles
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Total de registros: <span className="text-gray-900">{sales.length}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Detalles Estilizado */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Detalle de Operación"
                type="info"
            >
                {selectedSale && (
                    <div className="space-y-6 py-2">
                        {/* Summary Header */}
                        <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Folio de Venta</p>
                                        <p className="text-lg font-black text-gray-900">{selectedSale.saleNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Monto Total</p>
                                    <p className="text-2xl font-black text-indigo-600 leading-tight">{formatPrice(selectedSale.total)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 pt-4 border-t border-gray-200">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <Calendar className="w-3 h-3" /> Fecha
                                    </p>
                                    <p className="text-xs font-semibold text-gray-700">{formatDate(selectedSale.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <CreditCard className="w-3 h-3" /> Pago
                                    </p>
                                    <p className="text-xs font-semibold text-gray-700">{getPaymentMethodLabel(selectedSale.paymentMethod)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                                        <UserIcon className="w-3 h-3" /> Cajero
                                    </p>
                                    <p className="text-xs font-semibold text-gray-700">{selectedSale.user.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Productos en esta orden</p>
                            <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                                {selectedSale.items.map((item) => (
                                    <div key={item.id} className="p-4 flex justify-between items-center group hover:bg-gray-50 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 text-sm">{item.productName}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">{item.quantity} un x {item.variantName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-gray-900 text-sm">{formatPrice(item.subtotal)}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">@ {formatPrice(item.unitPrice)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Breakdown */}
                        <div className="bg-gray-900 rounded-2xl p-6 text-white space-y-2">
                            <div className="flex justify-between text-xs font-medium text-gray-400">
                                <span>Subtotal</span>
                                <span>{formatPrice(selectedSale.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-gray-400">
                                <span>Impuestos (16%)</span>
                                <span>{formatPrice(selectedSale.tax)}</span>
                            </div>
                            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
                                <span className="text-sm font-bold uppercase tracking-widest text-indigo-400">Liquidación Final</span>
                                <span className="text-2xl font-black">{formatPrice(selectedSale.total)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
                        >
                            Cerrar Detalles
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
