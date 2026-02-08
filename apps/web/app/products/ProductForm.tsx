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
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Product, Category } from '../../types/product';

interface ProductFormProps {
    product: Product | null;
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
            });
        } else {
            setFormData({
                name: '',
                description: '',
                sku: '',
                categoryId: '',
                price: '',
                stock: '',
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
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    categoryId: formData.categoryId || undefined,
                }),
            });

            if (response.ok) {
                toast.success(product ? 'Producto actualizado' : 'Producto creado con éxito');
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
            <div className="space-y-4">
                {/* Nombre */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                        Nombre del Producto
                    </label>
                    <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Coca Cola 600ml"
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Precio */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                            Precio de Venta
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                            Stock Inicial
                        </label>
                        <div className="relative">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="number"
                                required
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="0"
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Categoría */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                        Categoría
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
                        >
                            <option value="">Seleccionar categoría...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* SKU */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                        Código SKU / Barras
                    </label>
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-0" /> {/* Spacer */}
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Auto-generado si se deja vacío"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
                        />
                    </div>
                </div>

                {/* Descripción */}
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">
                        Descripción (Opcional)
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalles adicionales del producto..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-medium resize-none"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            {product ? 'Actualizar' : 'Guardar Producto'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
