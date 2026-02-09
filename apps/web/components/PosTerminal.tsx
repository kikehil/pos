'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
  Filter,
  Loader2,
  UserPlus,
  UserCheck,
  UserX,
  Users,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  ArrowRight,
  FileText as FileTextIcon
} from 'lucide-react';


import { Product, ProductVariant, formatPrice } from '../types/product';
import Modal from './ui/Modal';
import Receipt from './Receipt';
import ProductAvatar from './ui/ProductAvatar';
import { useScanDetection } from '../hooks/useScanDetection';


interface Props {
  products: Product[];
  tenantId: string;
}

interface TenantInfo {
  name: string;
  address?: string;
  phone?: string;
  rfc?: string;
}

interface CartItem {
  variant: ProductVariant;
  product: Product;
  quantity: number;
}

// Enum de métodos de pago
type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';


// Datos de la venta completada
interface SaleData {
  saleNumber: string;
  total: number;
  paymentMethod: string;
  items?: Array<{
    productName: string;
    variantName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  date?: string;
  subtotal?: number;
  tax?: number;
  customerName?: string;
}

// Estado del Modal de Checkout
interface CheckoutModalState {
  isOpen: boolean;
  data: SaleData | null;
}

// Estado del Modal de Error
interface ErrorModalState {
  isOpen: boolean;
  message: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}


export default function PosTerminal({ products, tenantId }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);

  // Cash Shift States
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [startAmount, setStartAmount] = useState('0');
  const [countedAmount, setCountedAmount] = useState('0');
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

  // Customer States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isQuickCustomerModalOpen, setIsQuickCustomerModalOpen] = useState(false);
  const [quickCustomerData, setQuickCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    taxId: '',
    address: ''
  });


  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<string>('');



  const componentRef = useRef<HTMLDivElement>(null);

  const getAuthHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : ({} as any);
  };

  // Sonidos de feedback
  const playBeep = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(type === 'success' ? 880 : 220, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error('Audio feedback error', e);
    }
  };

  const handleScanProduct = (code: string) => {
    // Buscar el producto por SKU o barcode
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.sku === code || product.sku === code) {
          addToCart(product, variant);
          playBeep('success');
          return;
        }
      }
    }

    playBeep('error');
    toast.error('Producto no encontrado', {
      description: `Código: ${code}`,
    });
  };

  useScanDetection({
    onScan: handleScanProduct
  });


  const fetchCurrentShift = async () => {
    try {
      const response = await fetch('/api/cash-shifts/current', {
        headers: getAuthHeader(),
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setCurrentShift(data);
        // Si no hay turno (data es null), abrimos el modal
        if (!data) {
          setIsShiftModalOpen(true);
        }
      } else {
        console.error('Error al cargar turno:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar turno:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories([{ id: 'ALL', name: 'Todos' }, ...data]);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };



  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const response = await fetch('/api/tenants/me', {
          headers: getAuthHeader(),
        });
        if (response.ok) {
          const data = await response.json();
          setTenantInfo({
            name: data.name,
            address: data.address || undefined,
            phone: data.phone || undefined,
            rfc: data.rfc || undefined,
          });
        }
      } catch (error) {
        console.error('Error al cargar información del tenant:', error);
      }
    };
    fetchTenantInfo();
    fetchCurrentShift();
    fetchCategories();
    fetchCustomers();
  }, []);


  const handleOpenShift = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/cash-shifts/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ amount: parseFloat(startAmount) }),
      });
      if (response.ok) {
        toast.success('Caja abierta correctamente');
        setIsShiftModalOpen(false);
        fetchCurrentShift();
      }
    } catch (error) {
      toast.error('Error al abrir caja');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseShift = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/cash-shifts/close', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ countedAmount: parseFloat(countedAmount) }),
      });
      if (response.ok) {
        toast.success('Caja cerrada con éxito');
        setCurrentShift(null);
        setIsClosingShift(false);
        setIsShiftModalOpen(true);
      }
    } catch (error) {
      toast.error('Error al cerrar caja');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'Ticket de Venta',
  });


  const [checkoutModal, setCheckoutModal] = useState<CheckoutModalState>({
    isOpen: false,
    data: null,
  });

  const [errorModal, setErrorModal] = useState<ErrorModalState>({
    isOpen: false,
    message: '',
  });

  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || product.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    }
  );


  const getDisplayPrice = (product: Product): string => {
    if (product.variants.length === 0) return 'Sin precio';
    if (product.variants.length === 1) return formatPrice(product.variants[0].price);
    const prices = product.variants.map((v) => parseFloat(v.price));
    return `${formatPrice(Math.min(...prices).toString())}+`;
  };

  const addToCart = (product: Product, variant: ProductVariant) => {
    if (!currentShift) {
      toast.error('Debes abrir caja primero');
      setIsShiftModalOpen(true);
      return;
    }
    const existingItem = cart.find((item) => item.variant.id === variant.id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;

    if (currentQuantityInCart >= variant.stock) {
      toast.error('Inventario insuficiente', {
        description: `Solo hay ${variant.stock} unidades de "${variant.name}"`,
      });
      return;
    }

    setCart((prevCart) => {
      const existingCartItem = prevCart.find((item) => item.variant.id === variant.id);
      if (existingCartItem) {
        return prevCart.map((item) =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { variant, product, quantity: 1 }];
    });

    toast.success('Agregado', {
      description: `${product.name} (${variant.name})`,
      duration: 1500,
    });
  };

  const removeFromCart = (variantId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    const item = cart.find((item) => item.variant.id === variantId);
    if (item && quantity > item.variant.stock) {
      toast.error('Inventario insuficiente');
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.variant.id === variantId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce(
    (total, item) => total + parseFloat(item.variant.price) * item.quantity,
    0
  );

  const clearCart = () => setCart([]);

  const openPaymentModal = () => {
    if (cart.length === 0) return;
    setReceivedAmount('');
    setIsPaymentModalOpen(true);
  };

  const handleCheckout = async () => {

    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const saleItems = cart.map((item) => ({
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: item.quantity,
        price: parseFloat(item.variant.price),
      }));

      const finalReceivedAmount = paymentMethod === 'CASH' ? parseFloat(receivedAmount) : cartTotal;
      const finalChangeAmount = paymentMethod === 'CASH' ? Math.max(0, finalReceivedAmount - cartTotal) : 0;

      const saleData = {
        tenantId,
        total: cartTotal,
        paymentMethod,
        items: saleItems,
        customerId: selectedCustomer?.id || null,
        receivedAmount: finalReceivedAmount,
        changeAmount: finalChangeAmount,
      };



      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(saleData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al procesar la venta');

      setCheckoutModal({
        isOpen: true,
        data: {
          saleNumber: data.saleNumber,
          total: cartTotal,
          paymentMethod: paymentMethod,
          items: cart.map((item) => ({
            productName: item.product.name,
            variantName: item.variant.name,
            quantity: item.quantity,
            price: parseFloat(item.variant.price),
            total: parseFloat(item.variant.price) * item.quantity,
          })),
          date: new Date().toLocaleString('es-MX', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
          }),
          customerName: selectedCustomer?.name,
        },
      });

      setCart([]);
      setSelectedCustomer(null);
      fetchCurrentShift(); // Actualizar el monto esperado del turno

    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSale = () => {
    setCheckoutModal({ isOpen: false, data: null });
  };

  const handleCloseError = () => {
    setErrorModal({ isOpen: false, message: '' });
  };

  const handleQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(quickCustomerData),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        toast.success('Cliente registrado');
        setCustomers(prev => [newCustomer, ...prev]);
        setSelectedCustomer(newCustomer);
        setIsQuickCustomerModalOpen(false);
        setQuickCustomerData({ name: '', email: '', phone: '', taxId: '', address: '' });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al registrar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="flex h-full bg-white relative">
      {/* Modal Bloqueante: Apertura de Caja */}
      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => { }} // No se puede cerrar sin abrir caja
        title="Apertura de Turno"
      >
        <div className="py-2">
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Para comenzar a vender, ingresa el monto inicial en efectivo que hay en el cajón.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Efectivo Inicial</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={startAmount}
                  onChange={(e) => setStartAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all font-black text-xl"
                  placeholder="0.00"
                />
              </div>
            </div>
            <button
              onClick={handleOpenShift}
              disabled={isProcessing}
              className="w-full bg-gray-900 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Abrir Turno de Caja'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Cierre de Caja */}
      <Modal
        isOpen={isClosingShift}
        onClose={() => setIsClosingShift(false)}
        title="Cierre de Turno (Corte Z)"
      >
        <div className="py-2">
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Esperado en Caja</span>
              <span className="text-xl font-black text-gray-900">{formatPrice(currentShift?.expectedAmount || 0)}</span>
            </div>
            <div className="h-px bg-gray-200 mb-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Saldo Inicial</span>
                <span className="font-bold text-gray-700">{formatPrice(currentShift?.startAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 font-medium">Ventas del Turno</span>
                <span className="font-bold text-emerald-600">+{formatPrice((currentShift?.expectedAmount || 0) - (currentShift?.startAmount || 0))}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Efectivo Real en Caja</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input
                  type="number"
                  value={countedAmount}
                  onChange={(e) => setCountedAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-black text-xl"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsClosingShift(false)}
                className="flex-1 h-14 bg-gray-100 text-gray-500 rounded-2xl font-bold uppercase tracking-widest text-[10px]"
              >
                Volver
              </button>
              <button
                onClick={handleCloseShift}
                disabled={isProcessing}
                className="flex-1 bg-red-600 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-red-700 shadow-xl shadow-red-100 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Cerrar y Finalizar'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modals con estilo profesional */}
      <Modal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ ...checkoutModal, isOpen: false })}
        title="Operación Exitosa"
        type="success"
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Venta Procesada</h3>
          <p className="text-gray-500 text-sm mb-6">Folio: {checkoutModal.data?.saleNumber}</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="text-3xl font-bold text-gray-900">
              {checkoutModal.data && formatPrice(checkoutModal.data.total)}
            </div>
            <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Total Cobrado</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              🖨️ Ticket
            </button>
            <button
              onClick={handleNewSale}
              className="bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 shadow-md transition-all"
            >
              Nueva Venta
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={errorModal.isOpen}
        onClose={handleCloseError}
        title="Error de Transacción"
        type="error"
      >
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10" />
            </div>
          </div>
          <p className="text-gray-600 mb-6">{errorModal.message}</p>
          <button
            onClick={handleCloseError}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition-all"
          >
            Entendido
          </button>
        </div>
      </Modal>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/20">
        {/* Header Search & Title */}
        <div className="h-20 px-8 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-4 ml-4">
            <button
              onClick={() => setIsClosingShift(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
            >
              Corte Z
            </button>
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Terminal Activa</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">{tenantInfo?.name || 'Cargando...'}</p>
            </div>
          </div>
        </div>


        {/* Categories Tab Bar */}
        <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 mr-2 pr-3 border-r border-gray-200 text-gray-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tight">Filtros</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${selectedCategory === cat.id
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'bg-transparent text-gray-500 hover:bg-gray-100'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-indigo-100 transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => product.variants.length === 1 && addToCart(product, product.variants[0])}
              >
                {/* Product Avatar Area */}
                <ProductAvatar name={product.name} />

                {/* Product Details */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors text-sm">
                      {product.name}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-black tracking-widest uppercase mb-3">
                      {product.sku || 'N/A-SKU'}
                    </p>
                  </div>

                  {/* Variants / Price Section */}
                  <div className="mt-auto">
                    {product.variants.length > 1 ? (
                      <div className="space-y-1.5 mt-2">
                        {product.variants.map((variant) => (
                          <button
                            key={variant.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product, variant);
                            }}
                            disabled={variant.stock <= 0}
                            className={`w-full text-[10px] flex justify-between items-center px-2.5 py-1.5 rounded-lg border transition-all ${variant.stock > 0
                              ? 'bg-white border-gray-100 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                              : 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed opacity-60'
                              }`}
                          >
                            <span className="font-bold truncate">{variant.name}</span>
                            <span className="font-black text-gray-900">{formatPrice(variant.price)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Liquidación</span>
                        <span className="text-base font-black text-indigo-600">
                          {formatPrice(product.variants[0].price)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Search className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-bold text-gray-900">Sin coincidencias</p>
              <p className="text-xs">Prueba con otros términos o categorías</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Sidebar Redesigned */}
      <div className="w-[420px] shrink-0 border-l border-gray-200 flex flex-col bg-gray-50/50 shadow-2xl">
        {/* Header - White Background */}
        <div className="px-6 h-20 bg-white border-b border-gray-100 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Carrito</h2>
              <p className="text-[10px] text-gray-400 font-bold">{cart.length} articulos en orden</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Selector Section */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="relative">
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm font-bold text-xs">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{selectedCustomer.name}</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight">{selectedCustomer.phone || 'Sin teléfono'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-xs font-medium"
                    />
                  </div>
                  <button
                    onClick={() => setIsQuickCustomerModalOpen(true)}
                    className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    title="Cliente Rápido"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>

                {showCustomerDropdown && customerSearchTerm.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto overflow-x-hidden">
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || c.phone?.includes(customerSearchTerm))
                      .map(customer => (
                        <button
                          key={customer.id}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setCustomerSearchTerm('');
                            setShowCustomerDropdown(false);
                          }}
                          className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 transition-all border-b border-gray-50 last:border-0"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate">{customer.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{customer.phone || 'Sin teléfono'}</p>
                          </div>
                        </button>
                      ))}
                    {customers.filter(c => c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || c.phone?.includes(customerSearchTerm)).length === 0 && (
                      <div className="p-4 text-center">
                        <p className="text-xs text-gray-400">No se encontraron clientes</p>
                      </div>
                    )}
                  </div>
                )}
                {showCustomerDropdown && customerSearchTerm.length > 0 && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowCustomerDropdown(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>


        {/* Cart List - Floating Cards Style */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 opacity-50">
              <div className="w-20 h-20 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm">
                <ShoppingCart className="w-10 h-10" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Esperando Productos</p>
                <p className="text-[10px] font-medium">Selecciona articulos del catálogo</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.variant.id} className="group relative bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{item.product.name}</p>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tight mt-0.5">{item.variant.name}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.variant.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-500 rounded-full transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-900 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-9 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-900 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-right">
                      {item.quantity > 1 && (
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          Unit: {formatPrice(parseFloat(item.variant.price))}
                        </p>
                      )}
                      <p className="text-sm font-black text-gray-900">
                        {formatPrice(parseFloat(item.variant.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Billing - White Background */}
        <div className="mt-auto border-t border-gray-200 bg-white p-8 space-y-6 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span className="text-gray-900 font-black">{formatPrice(cartTotal / 1.16)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 font-bold uppercase tracking-widest">
              <span>Impuestos (IVA 16%)</span>
              <span className="text-gray-900 font-black">{formatPrice(cartTotal - (cartTotal / 1.16))}</span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Cifra de Liquidación</span>
                <p className="text-4xl font-black text-gray-900 leading-none tracking-tighter">
                  {formatPrice(cartTotal)}
                </p>
              </div>
            </div>

          </div>

          <button
            onClick={openPaymentModal}
            disabled={cart.length === 0 || isProcessing}
            className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest ${cart.length === 0 || isProcessing

              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-200 active:scale-[0.98]'
              }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Cobrar Orden</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="hidden">
        <Receipt
          ref={componentRef}
          saleData={checkoutModal.data}
          tenantInfo={tenantInfo || undefined}
        />
      </div>

      {/* Modal: Registro Rápido de Cliente */}
      <Modal
        isOpen={isQuickCustomerModalOpen}
        onClose={() => setIsQuickCustomerModalOpen(false)}
        title="Cliente Rápido"
      >
        <form onSubmit={handleQuickCustomer} className="space-y-5 pt-2">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Nombre Completo</label>
            <input
              required
              type="text"
              value={quickCustomerData.name}
              onChange={(e) => setQuickCustomerData({ ...quickCustomerData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium transition-all"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Teléfono</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={quickCustomerData.phone}
                  onChange={(e) => setQuickCustomerData({ ...quickCustomerData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium transition-all"
                  placeholder="55 1234 5678"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">RFC / DNI</label>
              <div className="relative">
                <FileTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={quickCustomerData.taxId}
                  onChange={(e) => setQuickCustomerData({ ...quickCustomerData, taxId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium transition-all"
                  placeholder="XAXX010101"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={quickCustomerData.email}
                onChange={(e) => setQuickCustomerData({ ...quickCustomerData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-600 outline-none text-sm font-medium transition-all"
                placeholder="cliente@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-gray-900 text-white h-14 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl shadow-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Registrar y Seleccionar <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </Modal>

      {/* Modal: Proceso de Cobro "Tipo ATM" */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Finalizar Venta"
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col md:flex-row gap-8 pt-4">
          {/* Lado Izquierdo: Resumen */}
          <div className="flex-1 space-y-6">
            <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-2">Total a Pagar</span>
              <p className="text-6xl font-black text-gray-900 tracking-tighter">
                {formatPrice(cartTotal)}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Resumen de Orden</h3>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-h-[200px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.variant.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-500">{item.quantity}x</span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{item.product.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{item.variant.name}</p>
                      </div>
                    </div>
                    <p className="text-xs font-black text-gray-900">{formatPrice(parseFloat(item.variant.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedCustomer && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tight">Cliente Vinculado</p>
                  <p className="text-sm font-bold text-indigo-900">{selectedCustomer.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lado Derecho: Acción de Cobro */}
          <div className="flex-1 space-y-8">
            {/* Tabs de Métodos */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Método de Pago</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'CASH', label: 'Efectivo', icon: '💵' },
                  { id: 'CARD', label: 'Tarjeta', icon: '💳' },
                  { id: 'TRANSFER', label: 'Transf.', icon: '🏦' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:bg-white'
                      }`}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculadora de Cambio para EFECTIVO */}
            {paymentMethod === 'CASH' && (
              <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Monto Recibido</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-gray-400">$</span>
                    <input
                      autoFocus
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-6 py-6 bg-white border border-gray-100 rounded-3xl text-4xl font-black text-gray-900 focus:ring-4 focus:ring-indigo-50 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Sugestiones rápidas */}
                <div className="flex flex-wrap gap-2">
                  {[
                    Math.ceil(cartTotal / 50) * 50,
                    Math.ceil(cartTotal / 100) * 100,
                    Math.ceil(cartTotal / 200) * 200 > Math.ceil(cartTotal / 100) * 100 ? Math.ceil(cartTotal / 200) * 200 : Math.ceil(cartTotal / 100) * 100 + 100
                  ].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setReceivedAmount(amount.toString())}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                    >
                      ${amount}
                    </button>
                  ))}
                  <button
                    onClick={() => setReceivedAmount(cartTotal.toString())}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-xs font-black shadow-sm"
                  >
                    Exacto
                  </button>
                </div>

                {/* Resultado de Cambio */}
                <div className={`p-6 rounded-3xl flex justify-between items-center transition-all ${parseFloat(receivedAmount) >= cartTotal
                  ? 'bg-green-50 text-green-700 border-2 border-green-100'
                  : 'bg-red-50 text-red-700 border-2 border-red-100'
                  }`}>
                  <span className="text-xs font-black uppercase tracking-widest">
                    {parseFloat(receivedAmount) >= cartTotal ? 'Cambio a Devolver' : 'Monto Insuficiente'}
                  </span>
                  <span className="text-2xl font-black">
                    {formatPrice(Math.max(0, (parseFloat(receivedAmount) || 0) - cartTotal))}
                  </span>
                </div>
              </div>
            )}

            {/* Referencia para TARJETA/TRANSFERENCIA */}
            {paymentMethod !== 'CASH' && (
              <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Referencia / Folio</label>
                  <input
                    type="text"
                    placeholder="Opcional: No. Autorización"
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium px-1">Asegúrate de procesar el pago en la terminal bancaria antes de finalizar.</p>
              </div>
            )}

            {/* Footer de Acción */}
            <div className="flex gap-4">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 h-16 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={isProcessing || (paymentMethod === 'CASH' && (parseFloat(receivedAmount) || 0) < cartTotal)}
                onClick={async () => {
                  await handleCheckout();
                  setIsPaymentModalOpen(false);
                }
                }
                className={`flex-[2] h-16 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all ${isProcessing || (paymentMethod === 'CASH' && (parseFloat(receivedAmount) || 0) < cartTotal)
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                  }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Confirmar y Cobrar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>


  );
}



