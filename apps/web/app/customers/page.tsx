'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Plus,
    Search,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Loader2,
    UserCircle,
    BadgeCheck,
    CreditCard,
    ArrowRight,
    FileText,
    History,
    Calendar,
    ChevronRight,
    ShoppingBag
} from 'lucide-react';

import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';

interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    taxId: string | null;
    address: string | null;
    createdAt: string;
    _count?: {
        sales: number;
    };
}

interface SaleHistory {
    id: string;
    saleNumber: string;
    total: string;
    paymentMethod: string;
    createdAt: string;
    user: { name: string };
    items: any[];
}


export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [purchaseHistory, setPurchaseHistory] = useState<SaleHistory[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const router = useRouter();


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        taxId: '',
        address: ''
    });

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost:3000/customers', {
                headers: getAuthHeader() as HeadersInit,
            });

            if (response.status === 401) {
                router.push('/login');
                return;
            }
            const data = await response.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Error al cargar clientes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        fetchCustomers();
    }, [router]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                } as HeadersInit,
                body: JSON.stringify(formData),

            });

            if (response.ok) {
                toast.success('Cliente registrado correctamente');
                setIsModalOpen(false);
                setFormData({ name: '', email: '', phone: '', taxId: '', address: '' });
                fetchCustomers();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al registrar cliente');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`¿Estás seguro de eliminar a ${customer.name}?`)) return;

        try {
            const response = await fetch(`http://localhost:3000/customers/${customer.id}`, {
                method: 'DELETE',
                headers: getAuthHeader() as HeadersInit,
            });


            if (response.ok) {
                toast.success('Cliente eliminado');
                fetchCustomers();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al eliminar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const handleViewHistory = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsHistoryModalOpen(true);
        setIsHistoryLoading(true);

        try {
            const response = await fetch(`http://localhost:3000/customers/${customer.id}/history`, {
                headers: getAuthHeader() as HeadersInit,
            });


            if (response.ok) {
                const data = await response.json();
                setPurchaseHistory(data);
            } else {
                toast.error('Error al cargar historial');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsHistoryLoading(false);
        }
    };


    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/30">
                {/* Header */}
                <header className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mis Clientes</h1>
                            <p className="text-xs text-gray-400 font-medium font-mono uppercase tracking-tighter">Directorio y Cartera</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Cliente
                    </button>
                </header>

                {/* Sub-header: Search */}
                <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, tel o email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p className="text-sm font-medium">Cargando directorio...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Users className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">No hay clientes</p>
                            <p className="text-sm text-gray-400 mb-8">Comienza registrando a tu primer comprador constante</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-indigo-600 font-bold text-sm hover:underline"
                            >
                                Registrar mi primer cliente
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm max-w-6xl mx-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cliente</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contacto</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">RFC / DNI</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Compras</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-white group-hover:shadow-sm transition-all font-bold">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                                                            Cliente desde {new Date(customer.createdAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="space-y-1">
                                                    {customer.phone && (
                                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                                            <Phone className="w-3 h-3" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2 text-gray-400 text-[11px] font-medium">
                                                            <Mail className="w-3 h-3" />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-mono font-medium text-gray-600">
                                                    {customer.taxId || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-1.5">
                                                    <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                                                    <span className="text-xs font-bold text-gray-900">
                                                        {customer._count?.sales || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewHistory(customer)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all group/btn"
                                                    >
                                                        <History className="w-3.5 h-3.5" />
                                                        <span className="hidden sm:inline">Historial</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(customer)}
                                                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Creation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registro de Cliente"
            >
                <form onSubmit={handleCreate} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre o Razón Social</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Juan Pérez o Empresa S.A."
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="55 1234 5678"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">RFC / DNI</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        placeholder="XAXX010101000"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email (Opcional)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="cliente@email.com"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Dirección (Opcional)</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-4 h-4 text-gray-400" />
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Calle, Número, Colonia, Ciudad..."
                                    rows={3}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gray-900 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <span>Guardar Cliente</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </Modal>
            {/* Purchase History Modal */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title={`Historial: ${selectedCustomer?.name}`}
            >
                <div className="py-2">
                    {isHistoryLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="text-xs font-medium">Cargando transacciones...</p>
                        </div>
                    ) : purchaseHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingBag className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-900">Sin compras registradas</p>
                            <p className="text-xs text-gray-400">Este cliente aún no ha realizado transacciones vinculadas.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Últimas 5 ventas</p>
                            {purchaseHistory.map((sale) => (
                                <div key={sale.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-indigo-100 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-black text-gray-900">#{sale.saleNumber}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                <p className="text-[10px] text-gray-500 font-medium">
                                                    {new Date(sale.createdAt).toLocaleString('es-ES', {
                                                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-indigo-600">${parseFloat(sale.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{sale.paymentMethod}</p>
                                        </div>
                                    </div>
                                    <div className="h-px bg-gray-200/50 w-full my-3" />
                                    <div className="flex justify-between items-center text-[9px]">
                                        <span className="text-gray-400 font-medium italic">Atendió: {sale.user.name}</span>
                                        <div className="flex items-center gap-1 text-indigo-500 font-bold uppercase tracking-widest cursor-pointer hover:text-indigo-700">
                                            Detalles <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>

    );
}
