import { useEffect, useRef } from 'react';

interface UseScanDetectionOptions {
    onScan: (code: string) => void;
    timeBeforeScanTest?: number;
    avgTimeByChar?: number;
    minLength?: number;
}

/**
 * Hook para detectar escaneos de códigos de barras.
 * Los escáneres emulan un teclado pero escriben a una velocidad sobrehumana.
 */
export const useScanDetection = ({
    onScan,
    timeBeforeScanTest = 100,
    avgTimeByChar = 50,
    minLength = 3,
}: UseScanDetectionOptions) => {
    const bufferRef = useRef<string>('');
    const lastKeyTimeRef = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignorar si el usuario está escribiendo en campos de texto
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            const currentTime = Date.now();
            const timeDiff = currentTime - lastKeyTimeRef.current;
            lastKeyTimeRef.current = currentTime;

            // Si pasa mucho tiempo entre teclas, reiniciamos el buffer (es humano escribiendo)
            if (timeDiff > timeBeforeScanTest) {
                bufferRef.current = '';
            }

            // El escáner suele terminar con "Enter"
            if (e.key === 'Enter') {
                if (bufferRef.current.length >= minLength) {
                    onScan(bufferRef.current);
                    bufferRef.current = '';
                    e.preventDefault();
                }
                return;
            }

            // Solo acumulamos caracteres imprimibles (evitamos Shift, Ctrl, etc.)
            if (e.key.length === 1) {
                bufferRef.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan, timeBeforeScanTest, minLength]);
};
