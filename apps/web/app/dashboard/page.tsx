'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    ShoppingBag,
    AlertTriangle,
    LayoutDashboard,
    ArrowUpRight,
    TrendingDown,
    DollarSign,
    Target
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import Sidebar from '../../components/Sidebar';
import { formatPrice } from '../../types/product';

import { useRouter } from 'next/navigation';

interface DashboardData {
    totalSalesToday: number;
    totalOrdersToday: number;
    lowStockProducts: number;
    salesByDay: { name: string; total: number }[];
    topProducts: { name: string; total: number }[];
    monthlyStats?: {
        totalExpenses: number;
        grossProfit: number;
        netProfit: number;
        totalRevenue: number;
    };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

        const user = JSON.parse(userStr);
        if (user.role !== 'ADMIN') {
            router.push('/');
            return;
        }


        const fetchDashboard = async () => {
            try {
                const response = await fetch('/api/analytics/dashboard', {
                    headers: getAuthHeader(),
                });
                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                if (!response.ok) throw new Error('Failed to fetch dashboard');
                const result = await response.json();

                if (result && typeof result.totalOrdersToday !== 'undefined') {
                    setData(result);
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, [router]);

    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="flex h-screen bg-white">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
                {/* Header */}
                <header className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Resumen del Negocio</h1>
                            <p className="text-xs text-gray-400 font-medium capitalize">{today}</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Stat Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            label="Utilidad Neta"
                            value={data?.monthlyStats ? formatPrice(data.monthlyStats.netProfit) : '$0.00'}
                            icon={Target}
                            color={data?.monthlyStats && data.monthlyStats.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}
                            bgColor={data?.monthlyStats && data.monthlyStats.netProfit >= 0 ? "bg-emerald-50" : "bg-rose-50"}
                            isLoading={isLoading}
                            trend={data?.monthlyStats && data.monthlyStats.netProfit >= 0 ? "UP" : "DOWN"}
                        />
                        <StatCard
                            label="Gastos Mes"
                            value={data?.monthlyStats ? formatPrice(data.monthlyStats.totalExpenses) : '$0.00'}
                            icon={TrendingDown}
                            color="text-amber-600"
                            bgColor="bg-amber-50"
                            isLoading={isLoading}
                        />
                        <StatCard
                            label="Ventas Hoy"
                            value={data ? formatPrice(data.totalSalesToday) : '$0.00'}
                            icon={TrendingUp}
                            color="text-indigo-600"
                            bgColor="bg-indigo-50"
                            isLoading={isLoading}
                        />
                        <StatCard
                            label="Bajo Stock"
                            value={data?.lowStockProducts?.toString() ?? '0'}
                            icon={AlertTriangle}
                            color={data?.lowStockProducts && data.lowStockProducts > 0 ? "text-rose-600" : "text-gray-400"}
                            bgColor={data?.lowStockProducts && data.lowStockProducts > 0 ? "bg-rose-50" : "bg-gray-50"}
                            isLoading={isLoading}
                            warning={data?.lowStockProducts && data.lowStockProducts > 0}
                        />
                    </div>


                    {/* Main Content: Chart + Top Products */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Chart Area (2/3) */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Tendencia Semanal</h3>
                                    <p className="text-xs text-gray-400 font-medium">Ventas totales de los últimos 7 días</p>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                                    <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Ventas (MXN)</span>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                {isLoading ? (
                                    <Skeleton className="w-full h-full rounded-2xl" />
                                ) : (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={data?.salesByDay || []}>
                                            <defs>
                                                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="total"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorVentas)"
                                                animationDuration={1500}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Top Products (1/3) */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Top Productos</h3>
                                    <p className="text-xs text-gray-400 font-medium">Artículos más vendidos</p>
                                </div>
                                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <ArrowUpRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Skeleton className="w-10 h-10 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-3 w-1/2" />
                                                <Skeleton className="h-2 w-1/4" />
                                            </div>
                                        </div>
                                    ))
                                ) : data?.topProducts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-sm font-medium text-gray-400">Sin datos de ventas</p>
                                    </div>
                                ) : (
                                    data?.topProducts.map((product, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all group">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-700' :
                                                index === 1 ? 'bg-slate-100 text-slate-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-400'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Venta Total</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-gray-900">{formatPrice(product.total)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bgColor, isLoading, warning, trend }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm group hover:border-indigo-100 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black ${trend === 'UP' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'} px-2 py-1 rounded-full`}>
                        {trend === 'UP' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{trend === 'UP' ? '+ Real' : '- Déficit'}</span>
                    </div>
                )}
            </div>
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            ) : (
                <>
                    <h4 className={`text-xl font-black ${warning ? 'text-rose-600' : 'text-gray-900'} tracking-tight`}>{value}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
                </>
            )}
        </div>
    );
}

function Skeleton({ className }: { className?: string }) {
    return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}
