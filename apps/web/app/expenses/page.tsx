'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    TrendingDown,
    Plus,
    Trash2,
    Loader2,
    Calendar,
    User,
    DollarSign,
    Search,
    AlertCircle,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';
import { formatPrice } from '../../types/product';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    user: {
        name: string;
    };
}

const CATEGORIES = [
    'Servicios (Luz, Agua, etc.)',
    'Renta',
    'Nómina',
    'Mantenimiento',
    'Suministros',
    'Internet/Teléfono',
    'Otros'
];

export default function ExpensesPage() {
    const router = useRouter();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Form state
    const [form, setForm] = useState({
        description: '',
        amount: '',
        category: CATEGORIES[0],
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        if (userData.role !== 'ADMIN') {
            router.push('/');
            return;
        }
    }, [router]);

    const getAuthHeader = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : ({} as any);
    };

    const fetchExpenses = async () => {
        try {
            const response = await fetch('/api/expenses', {
                headers: getAuthHeader(),
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            setExpenses(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            toast.error('Error al cargar gastos');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.amount) {
            toast.error('Completa los campos obligatorios');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({
                    ...form,
                    amount: parseFloat(form.amount),
                    tenantId: user?.tenantId
                }),
            });

            if (response.ok) {
                toast.success('Gasto registrado correctamente');
                setForm({
                    description: '',
                    amount: '',
                    category: CATEGORIES[0],
                    date: new Date().toISOString().split('T')[0]
                });
                setIsModalOpen(false);
                fetchExpenses();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al registrar gasto');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar este registro de gasto?')) return;

        try {
            const response = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });

            if (response.ok) {
                toast.success('Gasto eliminado');
                fetchExpenses();
            } else {
                toast.error('Error al eliminar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const totalAmount = expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/30">
                {/* Header */}
                <header className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Registro de Gastos</h1>
                            <p className="text-xs text-gray-400 font-medium font-mono uppercase tracking-tighter">Control de egresos operativos</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Registrar Gasto
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* Summary Card */}
                    <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Gastos (Este mes)</p>
                                <p className="text-2xl font-black text-red-600">-{formatPrice(totalAmount.toString())}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-500">
                                <Filter className="w-3.5 h-3.5" />
                                Todos los gastos
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p className="text-sm font-medium">Cargando histórico de gastos...</p>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <TrendingDown className="w-12 h-12 opacity-10 mb-4" />
                            <p className="text-lg font-bold text-gray-900">No hay gastos registrados</p>
                            <p className="text-sm">Registra salidas de dinero para ver tu utilidad real</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Concepto</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {expenses.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">{exp.description}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-50 text-gray-500 border border-gray-100">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(exp.date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                                    <User className="w-3.5 h-3.5" />
                                                    {exp.user?.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-red-600">
                                                    -{formatPrice(exp.amount.toString())}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(exp.id)}
                                                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Registro */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registrar Nuevo Gasto"
            >
                <form onSubmit={handleCreate} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Concepto / Descripción</label>
                            <input
                                autoFocus
                                required
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Ej: Pago de luz local principal..."
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all outline-none text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Monto ($)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all outline-none text-sm font-black"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Fecha</label>
                            <input
                                required
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all outline-none text-sm font-medium"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Categoría</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all outline-none text-sm font-medium appearance-none"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-red-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-100"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <TrendingDown className="w-4 h-4" />
                                    Registrar Salida
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
