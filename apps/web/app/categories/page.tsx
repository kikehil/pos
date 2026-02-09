'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    Tag,
    Plus,
    Trash2,
    Loader2,
    Package,
    ChevronRight,
    Search,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';

interface Category {
    id: string;
    name: string;
    _count?: {
        products: number;
    };
}

export default function CategoriesPage() {
    const router = useRouter();

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
    }, [router]);


    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getAuthHeader = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };


    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/categories', {
                headers: getAuthHeader(),
            });
            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error al cargar categorías');
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/categories', {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify({ name: newName }),
            });

            if (response.ok) {
                toast.success('Categoría creada');
                setNewName('');
                setIsModalOpen(false);
                fetchCategories();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al crear categoría');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;

        try {
            const response = await fetch(`/api/categories/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });

            if (response.ok) {
                toast.success('Categoría eliminada');
                fetchCategories();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al eliminar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };


    return (
        <div className="flex h-screen bg-white">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/30">
                {/* Header */}
                <header className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Tag className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Categorías</h1>
                            <p className="text-xs text-gray-400 font-medium font-mono uppercase tracking-tighter">Organización del catálogo</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nueva Categoría
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p className="text-sm font-medium">Cargando categorías...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <Tag className="w-12 h-12 opacity-10 mb-4" />
                            <p className="text-lg font-bold text-gray-900">No hay categorías</p>
                            <p className="text-sm">Divide tus productos para encontrarlos más rápido</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Productos</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded-lg flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{cat.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-50 text-gray-500">
                                                    {cat._count?.products || 0} items
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Nueva Categoría"
            >

                <form onSubmit={handleCreate} className="space-y-6 pt-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Nombre</label>
                        <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ej: Bebidas, Snacks, Frutas..."
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                        />
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
                            className="flex-1 bg-gray-900 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Categoría'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
