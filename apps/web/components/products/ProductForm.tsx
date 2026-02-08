'use client';

import { useState, useEffect } from 'react';
import {
    Package,
    Tag,
    DollarSign,
    Layers,
    Save,
    X,
    Plus,
    AlertCircle,
    Hash,
    Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { Product, Category } from '../../types/product';

interface ProductFormProps {
    product?: Product | null;
    categories: Category[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sku: '',
        categoryId: '',
        price: '',
        stock: '',
        cost: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            const mainVariant = product.variants[0];
            setFormData({
                name: product.name,
                description: product.description || '',
                sku: product.sku || '',
                categoryId: product.categoryId || '',
                price: mainVariant?.price.toString() || '',
                stock: mainVariant?.stock.toString() || '',
                cost: mainVariant?.cost?.toString() || '',
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = product
                ? `http://localhost:3000/products/${product.id}`
                : 'http://localhost:3000/products';

            const method = product ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    cost: formData.cost ? parseFloat(formData.cost) : undefined,
                    categoryId: formData.categoryId || undefined,
                }),
            });


            if (response.ok) {
                toast.success(product ? 'Cambios guardados' : 'Producto creado con éxito');
                onSuccess();
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Error al procesar el producto');
            }
        } catch (error) {
            toast.error('Error de conexión con el servidor');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Nombre del Producto - Full Width */}
                <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2 px-1">
                        Nombre del Producto
                    </label>
                    <div className="relative group">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Galletas de Chocolate"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 shadow-sm"
                        />
                    </div>
                </div>

                {/* SKU */}
                <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2 px-1">
                        Código SKU / Barras
                    </label>
                    <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Auto-generado si se deja vacío"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 shadow-sm"
                        />
                    </div>
                </div>

                {/* Precio de Venta */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2 px-1">
                        Precio de Venta
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="text-sm font-black text-indigo-500">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="0.00"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-black text-gray-900 shadow-sm"
                        />
                    </div>
                </div>

                {/* Costo */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2 px-1">
                        Costo (Opcional)
                    </label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-400">$</span>
                        </div>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            placeholder="0.00"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 shadow-sm"
                        />
                    </div>
                </div>

                {/* Stock Inicial */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2 px-1">
                        Stock Inicial
                    </label>
                    <div className="relative group">
                        <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="number"
                            required
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="0"
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 shadow-sm"
                        />
                    </div>
                </div>

                {/* Categoría */}
                <div>
                    <label className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2 px-1">
                        Categoría
                    </label>
                    <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-900 shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="">Seleccionar...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-6 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-2xl text-sm font-bold hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-[0.98]"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5 text-indigo-400" />
                            <span>Guardar Producto</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
