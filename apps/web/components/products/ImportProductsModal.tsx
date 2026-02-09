import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '../ui/Modal';

interface ImportProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface PreviewItem {
    name: string;
    price: number | string;
    cost: number | string;
    stock: number | string;
    sku: string;
    categoryName: string;
    isValid: boolean;
    errors: string[];
}

export default function ImportProductsModal({ isOpen, onClose, onSuccess }: ImportProductsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PreviewItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isReading, setIsReading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setIsReading(true);
        setPreviewData([]);

        try {
            const data = await selectedFile.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const mappedData: PreviewItem[] = jsonData.map((row: any) => {
                const errors: string[] = [];
                let price = row['Precio'] || row['price'] || 0;
                let stock = row['Stock'] || row['stock'] || 0;
                let cost = row['Costo'] || row['cost'] || 0;

                // Validaciones
                if (!row['Nombre'] && !row['name']) errors.push('Falta Nombre');

                if (typeof price !== 'number') {
                    // Intentar convertir si es string
                    const parsedPrice = parseFloat(price);
                    if (isNaN(parsedPrice)) {
                        errors.push('Precio inválido');
                    } else {
                        price = parsedPrice;
                    }
                }

                if (typeof stock !== 'number') {
                    const parsedStock = parseInt(stock);
                    if (isNaN(parsedStock)) {
                        errors.push('Stock inválido');
                    } else {
                        stock = parsedStock;
                    }
                }

                return {
                    name: row['Nombre'] || row['name'] || '',
                    price: price,
                    cost: cost,
                    stock: stock,
                    sku: row['SKU'] || row['sku'] || '',
                    categoryName: row['Categoria'] || row['category'] || '',
                    isValid: errors.length === 0,
                    errors
                };
            });

            setPreviewData(mappedData.slice(0, 5)); // Mostrar solo las primeras 5 filas
        } catch (error) {
            console.error('Error reading excel:', error);
            toast.error('Error al leer el archivo Excel');
            setFile(null);
        } finally {
            setIsReading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = ['Nombre', 'Precio', 'Costo', 'Stock', 'SKU', 'Categoria'];
        const worksheet = XLSX.utils.aoa_to_sheet([headers]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');
        XLSX.writeFile(workbook, 'plantilla_productos.xlsx');
    };

    const handleImport = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            // Re-leer todo el archivo para enviar todos los datos, no solo el preview
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            const itemsToImport = jsonData.map((row: any) => ({
                name: row['Nombre'] || row['name'],
                price: Number(row['Precio'] || row['price']),
                cost: Number(row['Costo'] || row['cost'] || 0),
                stock: Number(row['Stock'] || row['stock'] || 0),
                sku: row['SKU'] || row['sku'] ? String(row['SKU'] || row['sku']) : undefined,
                categoryName: row['Categoria'] || row['category'],
            })).filter(item => item.name && !isNaN(item.price)); // Filtrar inválidos básicos

            const token = localStorage.getItem('token');
            const response = await fetch('/api/products/bulk-import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: itemsToImport }),
            });

            if (!response.ok) throw new Error('Error en la importación');

            const result = await response.json();
            toast.success(`Importación exitosa: ${result.count} productos procesados`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error importing:', error);
            toast.error('Ocurrió un error al importar los productos');
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPreviewData([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Importar Productos desde Excel"
            maxWidth="max-w-4xl"
        >
            <div className="space-y-6">
                {/* Actions Area */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="text-sm text-gray-500">
                        <p>Sube un archivo .xlsx para cargar productos masivamente.</p>
                        <p className="text-xs mt-1">Las columnas deben ser: Nombre, Precio, Stock, Costo (opcional), SKU (opcional), Categoria (opcional).</p>
                    </div>
                    <button
                        onClick={downloadTemplate}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Descargar Plantilla
                    </button>
                </div>

                {/* Drop Zone / Upload */}
                {!file ? (
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/10 transition-all group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500" />
                        </div>
                        <p className="text-lg font-medium text-gray-700">Haz clic para subir tu Excel</p>
                        <p className="text-sm text-gray-400 mt-1">Formato .xlsx o .csv</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={reset}
                                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isReading ? (
                            <div className="p-8 flex flex-col items-center justify-center text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p>Leyendo archivo...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3">Precio</th>
                                            <th className="px-4 py-3">Stock</th>
                                            <th className="px-4 py-3">Categoría</th>
                                            <th className="px-4 py-3">SKU</th>
                                            <th className="px-4 py-3">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {previewData.map((row, idx) => (
                                            <tr key={idx} className={!row.isValid ? 'bg-red-50' : ''}>
                                                <td className="px-4 py-3 max-w-[200px] truncate" title={row.name}>{row.name || <span className="text-red-400 italic">Vacío</span>}</td>
                                                <td className="px-4 py-3">{typeof row.price === 'number' ? `$${row.price}` : <span className="text-red-500 font-bold">{row.price || 'Err'}</span>}</td>
                                                <td className="px-4 py-3">{typeof row.stock === 'number' ? row.stock : <span className="text-red-500 font-bold">{row.stock || 'Err'}</span>}</td>
                                                <td className="px-4 py-3">{row.categoryName || '-'}</td>
                                                <td className="px-4 py-3">{row.sku || <span className="text-gray-400 italic">Auto</span>}</td>
                                                <td className="px-4 py-3">
                                                    {row.isValid ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                            <CheckCircle className="w-3 h-3" /> OK
                                                        </span>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            {row.errors.map((err, i) => (
                                                                <span key={i} className="flex items-center gap-1 text-red-600 text-[10px] font-bold">
                                                                    <AlertCircle className="w-3 h-3" /> {err}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {previewData.length > 0 && <tr className="bg-gray-50/50">
                                            <td colSpan={6} className="px-4 py-2 text-center text-xs text-gray-500 font-medium">
                                                Mostrando {previewData.length} primeras filas (previsualización)
                                            </td>
                                        </tr>}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || isUploading || previewData.some(item => !item.isValid)}
                        className="px-6 py-2 bg-gray-900 text-white hover:bg-black rounded-lg font-medium transition-all shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Importando...
                            </>
                        ) : (
                            'Confirmar Importación'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
