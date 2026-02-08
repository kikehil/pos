'use client';

import { useState, useEffect } from 'react';
import {
    Settings,
    Building2,
    MapPin,
    Phone,
    Hash,
    Info,
    RotateCcw,
    Save,
    Eye,
    CheckCircle2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface TenantInfo {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
    rfc: string | null;
}

export default function SettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        rfc: '',
    });

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

        fetchTenantInfo();
    }, [router]);


    const fetchTenantInfo = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/tenants/me');
            const data: TenantInfo = await response.json();

            setFormData({
                name: data.name || '',
                address: data.address || '',
                phone: data.phone || '',
                rfc: data.rfc || '',
            });
        } catch (error) {
            console.error('Error al cargar información:', error);
            toast.error('Error de Conexión', {
                description: 'No se pudo recuperar la información de la empresa.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            const response = await fetch('http://localhost:3000/tenants/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar');
            }

            toast.success('Configuración Guardada', {
                description: 'Los cambios se aplicarán en todos los nuevos tickets generados.',
            });
        } catch (error) {
            console.error('Error al guardar:', error);
            toast.error('Error al Guardar', {
                description: 'Verifica tu conexión y vuelve a intentarlo.',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-600" />
                            Configuración del Sistema
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">Personaliza la identidad y los datos de facturación de tu negocio</p>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="w-12 h-12 border-4 border-gray-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                            <p className="text-sm font-medium">Cargando perfil empresarial...</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Form Section */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-gray-400" />
                                                Perfil de Empresa
                                            </h2>
                                        </div>

                                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                            <div className="space-y-1.5">
                                                <label htmlFor="name" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                                    Nombre Comercial *
                                                </label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        required
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm font-medium"
                                                        placeholder="Ej: POS Pro Solution"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                                    Dirección Operativa
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                                    <textarea
                                                        id="address"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        rows={3}
                                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm font-medium resize-none"
                                                        placeholder="Calle, Número, Colonia, Ciudad..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label htmlFor="phone" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                                        Teléfono
                                                    </label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            id="phone"
                                                            name="phone"
                                                            value={formData.phone}
                                                            onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm font-medium"
                                                            placeholder="Ej: +52 (55) 0000 0000"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label htmlFor="rfc" className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                                        ID Fiscal / RFC
                                                    </label>
                                                    <div className="relative">
                                                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            id="rfc"
                                                            name="rfc"
                                                            value={formData.rfc}
                                                            onChange={handleChange}
                                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all text-sm font-medium"
                                                            placeholder="Ej: XAXX010101000"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                                <p className="text-xs text-indigo-700 leading-relaxed">
                                                    <span className="font-bold">Información de Impresión:</span> Los cambios guardados se reflejarán instantáneamente en todos los puntos de venta vinculados y aparecerán en la cabecera de los próximos tickets de compra.
                                                </p>
                                            </div>

                                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                                <button
                                                    type="button"
                                                    onClick={fetchTenantInfo}
                                                    disabled={saving}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                                >
                                                    <RotateCcw className="w-4 h-4" />
                                                    Descartar
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 active:scale-95"
                                                >
                                                    {saving ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4" />
                                                    )}
                                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Preview Section */}
                                <div className="space-y-6">
                                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 sticky top-8">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                            Vista Previa del Ticket
                                        </h3>

                                        <div className="bg-white border border-gray-300 border-dashed rounded-lg p-6 font-mono text-[10px] text-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                            {/* Receipt Cut Effect */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />

                                            <div className="text-center space-y-1 mb-4">
                                                <p className="text-xs font-black uppercase tracking-tight break-words">
                                                    {formData.name || 'MI NEGOCIO'}
                                                </p>
                                                <p className="line-clamp-2 leading-tight text-gray-500 italic">
                                                    {formData.address || 'Dirección de Operación'}
                                                </p>
                                                <p className="text-gray-500">
                                                    {formData.phone ? `Tél: ${formData.phone}` : 'Tel: (000) 000-0000'}
                                                </p>
                                                <p className="text-gray-500 font-bold">
                                                    {formData.rfc ? `RFC: ${formData.rfc}` : 'RFC: XAXX010101000'}
                                                </p>
                                            </div>

                                            <div className="border-t border-dotted border-gray-300 my-4" />

                                            <div className="space-y-1 opacity-20">
                                                <div className="flex justify-between"><span>PRODUCTO DEMO</span><span>$100.00</span></div>
                                                <div className="flex justify-between"><span>VARIACIÓN DEMO</span><span>$50.00</span></div>
                                                <div className="border-t border-dotted border-gray-300 my-1" />
                                                <div className="flex justify-between font-bold"><span>TOTAL</span><span>$150.00</span></div>
                                            </div>

                                            <div className="mt-6 text-center">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full font-bold text-[8px] uppercase tracking-widest">
                                                    <CheckCircle2 className="w-2.5 h-2.5" /> Diseño Verificado
                                                </div>
                                            </div>

                                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" style={{ clipPath: 'polygon(0% 100%, 5% 70%, 10% 100%, 15% 70%, 20% 100%, 25% 70%, 30% 100%, 35% 70%, 40% 100%, 45% 70%, 50% 100%, 55% 70%, 60% 100%, 65% 70%, 70% 100%, 75% 70%, 80% 100%, 85% 70%, 90% 100%, 95% 70%, 100% 100%)' }} />
                                        </div>

                                        <p className="text-[10px] text-gray-400 mt-4 text-center px-4 leading-relaxed">
                                            Esta es una representación visual aproximada de la cabecera de tus tickets impresos.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

