import { useState, useEffect } from 'react';
import { MinusCircle, PlusCircle, AlertTriangle, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import { Product } from '../../types/product';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSuccess: () => void;
}

type AdjustmentType = 'INCREMENT' | 'DECREMENT';
type AdjustmentReason = 'DAMAGED' | 'EXPIRED' | 'THEFT' | 'ADMIN_ADJUSTMENT' | 'RETURN';

const REASON_LABELS: Record<AdjustmentReason, string> = {
    DAMAGED: 'Producto Dañado / Roto',
    EXPIRED: 'Producto Caducado',
    THEFT: 'Robo / Pérdida',
    ADMIN_ADJUSTMENT: 'Error Administrativo / Inventario',
    RETURN: 'Devolución de Cliente'
};

export default function StockAdjustmentModal({ isOpen, onClose, product, onSuccess }: StockAdjustmentModalProps) {
    const [type, setType] = useState<AdjustmentType>('DECREMENT');
    const [reason, setReason] = useState<AdjustmentReason>('DAMAGED');
    const [quantity, setQuantity] = useState<string>('1');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset al abrir
    useEffect(() => {
        if (isOpen) {
            setType('DECREMENT');
            setReason('DAMAGED');
            setQuantity('1');
            setNotes('');
            setIsSubmitting(false);
        }
    }, [isOpen, product]);

    const currentStock = product?.variants?.[0]?.stock || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error('La cantidad debe ser mayor a 0');
            return;
        }

        if (type === 'DECREMENT' && qty > currentStock) {
            toast.error('No puedes ajustar más cantidad de la que existe en stock');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/inventory/adjustments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: product.id,
                    type,
                    reason,
                    quantity: qty,
                    notes: notes || undefined
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al guardar ajuste');
            }

            toast.success('Inventario ajustado correctamente');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Ocurrió un error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!product) return null;

    const isDecrement = type === 'DECREMENT';
    const newStock = isDecrement ? currentStock - (parseInt(quantity) || 0) : currentStock + (parseInt(quantity) || 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Ajuste de Stock (Mermas/Correcciones)"
            maxWidth="max-w-xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Product Info */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Producto</p>
                        <p className="text-lg font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{product.sku}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Stock Actual</p>
                        <p className="text-2xl font-black text-gray-900">{currentStock}</p>
                    </div>
                </div>

                {/* Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => { setType('DECREMENT'); setReason('DAMAGED'); }}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold ${isDecrement
                                ? 'border-red-500 bg-red-50 text-red-600'
                                : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <MinusCircle className="w-5 h-5" />
                        Salida / Merma
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType('INCREMENT'); setReason('ADMIN_ADJUSTMENT'); }}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-bold ${!isDecrement
                                ? 'border-green-500 bg-green-50 text-green-600'
                                : 'border-transparent bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <PlusCircle className="w-5 h-5" />
                        Entrada / Corrección
                    </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Cant. a {isDecrement ? 'restar' : 'sumar'}</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-bold"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Motivo</label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none"
                            required
                        >
                            {isDecrement ? (
                                <>
                                    <option value="DAMAGED">{REASON_LABELS['DAMAGED']}</option>
                                    <option value="EXPIRED">{REASON_LABELS['EXPIRED']}</option>
                                    <option value="THEFT">{REASON_LABELS['THEFT']}</option>
                                    <option value="ADMIN_ADJUSTMENT">{REASON_LABELS['ADMIN_ADJUSTMENT']}</option>
                                </>
                            ) : (
                                <>
                                    <option value="ADMIN_ADJUSTMENT">{REASON_LABELS['ADMIN_ADJUSTMENT']}</option>
                                    <option value="RETURN">{REASON_LABELS['RETURN']}</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Notas (Opcional)</label>
                    <textarea
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[80px]"
                        placeholder="Detalles adicionales sobre el ajuste..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Prediction */}
                <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3 border border-amber-100">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-800 font-medium">Previo al guardar:</p>
                        <p className="text-xs text-amber-700 mt-1">
                            El stock pasará de <strong>{currentStock}</strong> a <strong>{newStock}</strong>.
                            Esta acción quedará registrada en el historial.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className={`px-6 py-2.5 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 ${isDecrement ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                            }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Confirmar Ajuste
                    </button>
                </div>
            </form>
        </Modal>
    );
}
