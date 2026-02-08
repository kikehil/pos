'use client';

import { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import {
    LayoutGrid,
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Loader2,
    Package,
    AlertCircle,
    Tag,
    Eye,
    ChevronRight,
    Barcode as BarcodeIcon,
    Printer
} from 'lucide-react';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';

import { toast } from 'sonner';
import Sidebar from '../../components/Sidebar';
import { Product, Category, formatPrice } from '../../types/product';
import Modal from '../../components/ui/Modal';
import ProductAvatar from '../../components/ui/ProductAvatar';
import ProductForm from '../../components/products/ProductForm';


export default function ProductsPage() {
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


    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [selectedProductForLabel, setSelectedProductForLabel] = useState<Product | null>(null);

    const labelRef = useRef<HTMLDivElement>(null);
    const handlePrintLabel = useReactToPrint({
        contentRef: labelRef,
        documentTitle: `Etiqueta_${selectedProductForLabel?.name || 'Producto'}`,
    });


    const getAuthHeader = (): Record<string, string> => {

        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/products', {
                headers: getAuthHeader(),
            });

            if (response.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error al cargar productos');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:3000/products/categories', {
                headers: getAuthHeader(),
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`http://localhost:3000/products/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (response.ok) {
                toast.success('Producto eliminado');
                fetchProducts();
            } else {
                toast.error('Error al eliminar producto');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };


    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const openLabelModal = (product: Product) => {
        setSelectedProductForLabel(product);
        setIsLabelModalOpen(true);
    };


    return (
        <div className="flex h-screen bg-white">
            <Sidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Inventario</h1>
                            <p className="text-xs text-gray-400 font-medium">Gestión de catálogo y existencias</p>
                        </div>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Producto
                    </button>
                </header>

                {/* Search & Stats */}
                <div className="px-8 py-6 bg-gray-50/30 border-b border-gray-100">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm outline-none"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p className="text-sm font-medium">Sincronizando inventario...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                <Package className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">No hay productos</p>
                            <p className="text-sm">Inicia cargando tu primer producto al sistema</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Precio</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Stock</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => {
                                        const mainVariant = product.variants[0];
                                        const stock = mainVariant?.stock || 0;
                                        const stockColor = stock > 10 ? 'text-green-600 bg-green-50' : stock < 5 ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';

                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                            <ProductAvatar name={product.name} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
                                                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter mt-0.5">{product.sku || 'SIN-SKU'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-gray-500">
                                                        <Tag className="w-3 h-3" />
                                                        <span className="text-xs font-medium">{product.category?.name || 'Gral.'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-gray-900">
                                                        {formatPrice(mainVariant?.price || 0)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black ${stockColor}`}>
                                                        {stock} und.
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`w-2 h-2 rounded-full inline-block ${product.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openLabelModal(product)}
                                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                            title="Imprimir Etiqueta"
                                                        >
                                                            <BarcodeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(product)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal para Crear/Editar */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            >

                <ProductForm
                    product={editingProduct}
                    categories={categories}
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchProducts();
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>

            {/* Modal para Imprimir Etiqueta */}
            <Modal
                isOpen={isLabelModalOpen}
                onClose={() => setIsLabelModalOpen(false)}
                title="Generar Etiqueta"
            >
                <div className="flex flex-col items-center py-6 space-y-8">
                    {/* Área de Impresión */}
                    <div
                        ref={labelRef}
                        className="bg-white p-6 border border-gray-100 rounded-xl shadow-sm flex flex-col items-center justify-center text-center w-[280px]"
                    >
                        <p className="text-sm font-black text-gray-900 mb-1">{selectedProductForLabel?.name}</p>
                        <p className="text-xl font-black text-indigo-600 mb-4">
                            {formatPrice(selectedProductForLabel?.variants[0]?.price || 0)}
                        </p>
                        <div className="bg-white">
                            {selectedProductForLabel?.sku ? (
                                <Barcode
                                    value={selectedProductForLabel.sku}
                                    width={1.5}
                                    height={50}
                                    fontSize={12}
                                    margin={0}
                                />
                            ) : (
                                <div className="p-4 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-100">
                                    EL PRODUCTO NO TIENE SKU
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => handlePrintLabel()}
                        disabled={!selectedProductForLabel?.sku}
                        className="w-full bg-gray-900 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir Etiqueta
                    </button>
                </div>
            </Modal>
        </div>

    );
}
