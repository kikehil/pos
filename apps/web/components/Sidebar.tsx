'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LayoutGrid,
    ShoppingCart,
    Archive,
    Settings,
    CreditCard,
    LayoutDashboard,
    Tag,
    LogIn,
    LogOut,
    Users
} from 'lucide-react';


const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Caja', href: '/', icon: ShoppingCart, roles: ['ADMIN', 'CASHIER'] },
    { name: 'Ventas', href: '/sales', icon: Archive, roles: ['ADMIN', 'CASHIER'] },
    { name: 'Mis Clientes', href: '/customers', icon: Users, roles: ['ADMIN'] },
    { name: 'Productos', href: '/products', icon: LayoutGrid, roles: ['ADMIN'] },
    { name: 'Categorías', href: '/categories', icon: Tag, roles: ['ADMIN'] },
    { name: 'Equipo', href: '/team', icon: LayoutGrid, roles: ['ADMIN'] },
    { name: 'Configuración', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];





export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>('Usuario');
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserRole(user.role);
            setUserName(user.name);
            setUserEmail(user.email);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        router.refresh(); // Asegurar que todo el estado se limpie
    };

    const filteredNavigation = navigation.filter(item =>
        !item.roles || (userRole && item.roles.includes(userRole))
    );


    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Logo / Header */}
            <div className="p-6 h-20 flex items-center border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                        POS Pro
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${isActive
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute left-0 w-1 h-5 bg-indigo-600 rounded-r-full" />
                            )}
                            <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>


            {/* Footer / User Profile */}
            <div className="p-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm text-indigo-600 font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{userName}</p>
                            <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-tighter">
                                {userRole === 'ADMIN' ? 'Administrador' : 'Cajero'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-100 rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}


