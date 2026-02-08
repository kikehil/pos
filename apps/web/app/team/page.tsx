'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Plus,
    Trash2,
    Loader2,
    Mail,
    Shield,
    Calendar,
    ArrowRight,
    UserCircle,
    BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/ui/Modal';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'CASHIER';
    createdAt: string;
}

export default function TeamPage() {
    const [team, setTeam] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CASHIER' as 'ADMIN' | 'CASHIER'
    });

    const getAuthHeader = (): Record<string, string> => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };


    const fetchTeam = async () => {
        try {
            const response = await fetch('http://localhost:3000/users', {
                headers: getAuthHeader(),
            });
            if (response.status === 401) {
                router.push('/login');
                return;
            }
            if (response.status === 403) {
                router.push('/');
                toast.error('No tienes permisos para ver esta sección');
                return;
            }
            const data = await response.json();
            setTeam(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching team:', error);
            toast.error('Error al cargar el equipo');
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
        fetchTeam();
    }, [router]);


    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeader()
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success('Miembro del equipo añadido');
                setIsModalOpen(false);
                setFormData({ name: '', email: '', password: '', role: 'CASHIER' });
                fetchTeam();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Error al crear usuario');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (user: User) => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id === currentUser.id) {
            toast.error('No puedes eliminarte a ti mismo');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar a ${user.name}?`)) return;

        try {
            const response = await fetch(`http://localhost:3000/users/${user.id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });

            if (response.ok) {
                toast.success('Usuario eliminado');
                fetchTeam();
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
                {/* Header Section */}
                <header className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Mi Equipo</h1>
                            <p className="text-xs text-gray-400 font-medium font-mono uppercase tracking-tighter">Gestión de accesos y roles</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Empleado
                    </button>
                </header>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p className="text-sm font-medium">Sincronizando equipo...</p>
                        </div>
                    ) : team.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Users className="w-10 h-10 text-gray-200" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">No hay empleados</p>
                            <p className="text-sm text-gray-400 mb-8">Comienza añadiendo a tu primer colaborador</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-indigo-600 font-bold text-sm hover:underline"
                            >
                                Registrar mi primer empleado
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm max-w-6xl mx-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Miembro</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rol</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Alta</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Gestión</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {team.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                        <UserCircle className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                                    {user.role === 'ADMIN' ? 'Admin' : 'Cajero'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">
                                                        {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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

            {/* Creation Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registro de Empleado"
            >
                <form onSubmit={handleCreate} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre Completo</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Juan Pérez"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Acceso</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="empleado@empresa.com"
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contraseña Temporal</label>
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all outline-none text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Rol en el Sistema</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'CASHIER' })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.role === 'CASHIER'
                                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.role === 'CASHIER' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <UserCircle className="w-5 h-5" />
                                        </div>
                                        {formData.role === 'CASHIER' && <BadgeCheck className="w-4 h-4 text-indigo-600" />}
                                    </div>
                                    <p className="text-xs font-bold text-gray-900">Cajero</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Solo ventas y caja</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${formData.role === 'ADMIN'
                                        ? 'border-gray-900 bg-gray-50 shadow-sm'
                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.role === 'ADMIN' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        {formData.role === 'ADMIN' && <BadgeCheck className="w-4 h-4 text-indigo-600" />}
                                    </div>
                                    <p className="text-xs font-bold text-gray-900">Admin</p>
                                    <p className="text-[10px] text-gray-400 font-medium">Acceso total</p>
                                </button>
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
                                <span>Dar de Alta Empleado</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
