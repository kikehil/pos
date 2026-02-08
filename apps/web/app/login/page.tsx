'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CreditCard, Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {

        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('¡Bienvenido de nuevo!');
                router.push('/');
            } else {
                toast.error(data.message || 'Credenciales incorrectas');
            }
        } catch (error) {
            toast.error('Error al conectar con el servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Elementos Decorativos de Fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-100/40 rounded-full blur-[100px]" />

            <div className="w-full max-w-md relative">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 bg-gray-900 rounded-[22px] flex items-center justify-center shadow-2xl shadow-gray-200 mb-6 group transition-transform hover:scale-105 active:scale-95 duration-300">
                        <CreditCard className="w-8 h-8 text-indigo-400 group-hover:rotate-12 transition-transform" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">POS Pro</h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enterprise Edition v1.2</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Iniciar sesión</h2>
                        <p className="text-sm text-gray-400 font-medium">Gestiona tu negocio con la mejor herramienta.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Corporativo</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm font-medium text-gray-900 shadow-sm"
                                        placeholder="name@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contraseña</label>
                                    <a href="#" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">¿Olvidaste?</a>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm font-medium text-gray-900 shadow-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest relative overflow-hidden group shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <span>Acceder al Sistema</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Footer Card */}
                    <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                        <p className="text-xs text-gray-400 font-medium tracking-tight">
                            ¿No tienes una cuenta?{' '}
                            <a href="#" className="text-gray-900 font-bold hover:underline transition-all">Solicitar acceso</a>
                        </p>
                    </div>
                </div>

                {/* Background Footer Credits */}
                <p className="mt-12 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                    Secure Infrastructure & Encrypted Access
                </p>
            </div>
        </div>
    );
}
