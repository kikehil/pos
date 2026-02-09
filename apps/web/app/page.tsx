'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ServerCrash,
  PackageSearch,
  Terminal,
  AlertCircle,
  Loader2
} from 'lucide-react';
import PosTerminal from '../components/PosTerminal';
import Sidebar from '../components/Sidebar';
import { Product } from '../types/product';

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tenantId, setTenantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        router.push('/login');
        return;
      }


      try {
        const res = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store',
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const data: Product[] = await res.json();
        setProducts(data);
        if (data.length > 0) {
          setTenantId(data[0].tenantId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetch();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Configurando Estación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ServerCrash className="w-10 h-10" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Conexión Interrumpida</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed px-4">
              El terminal no puede establecer comunicación con el núcleo de datos del sistema POS.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8 flex items-start gap-4 text-left border border-gray-100">
              <AlertCircle className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
              <div className="font-mono text-[11px] text-gray-600 break-all leading-relaxed">{error}</div>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                <Terminal className="w-3 h-3" /> Guía de resolución rápida
              </div>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-indigo-300 text-left">
                <p className="mb-1 text-gray-500"># Iniciar servidor backend</p>
                <p className="text-white">npm run start:dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          <div className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm text-center">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageSearch className="w-10 h-10" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sin Inventario Activo</h1>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed px-4">
              No se han detectado productos vinculados a tu empresa.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-8 flex flex-col gap-4 text-left border border-gray-100">
              <p className="text-xs font-semibold text-gray-600 text-center">Es necesario cargar el catálogo inicial:</p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-indigo-300 text-left">
                <p className="mb-1 text-gray-400">// Ejecuta este comando en la terminal:</p>
                <p className="text-white">npm run seed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <PosTerminal products={products} tenantId={tenantId} />
      </div>
    </div>
  );
}
