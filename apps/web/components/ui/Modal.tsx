'use client';

import { ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

type ModalType = 'success' | 'error' | 'info';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  type?: ModalType;
  maxWidth?: string;
}


const typeConfig = {
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    borderColor: 'border-green-500',
    bgColor: 'bg-green-50',
  },
  error: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-50',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-50',
  },
};

export default function Modal({ isOpen, onClose, title, children, type, maxWidth = 'max-w-md' }: ModalProps) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const config = type ? typeConfig[type] : null;
  const IconComponent = config?.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Backdrop - click para cerrar */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`
          relative z-10 w-full ${maxWidth}
          bg-white rounded-2xl shadow-2xl
          transform transition-all
          ${config ? `border-l-4 ${config.borderColor}` : ''}
        `}
      >


        {/* Botón cerrar (X) en esquina superior derecha */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className={`flex items-center gap-3 p-6 pb-4 ${config?.bgColor || ''} rounded-t-2xl`}>
          {IconComponent && (
            <div className={`p-2 rounded-full ${config?.bgColor || 'bg-gray-100'}`}>
              <IconComponent className={`w-8 h-8 ${config?.iconColor || 'text-gray-500'}`} />
            </div>
          )}
          <h2 className="flex-1 text-xl font-bold text-gray-800">{title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente adicional para botones del modal
interface ModalButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  disabled?: boolean;
}

export function ModalButton({ onClick, variant = 'primary', children, disabled }: ModalButtonProps) {
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
      `}
    >
      {children}
    </button>
  );
}

// Componente para el footer del modal con botones
interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
      {children}
    </div>
  );
}

