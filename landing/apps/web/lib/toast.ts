export const toast = {
  success(message: string) {
    if (typeof window !== 'undefined') {
      // Reemplaza esto por tu librería de toasts (sonner, react-hot-toast, etc.)
      // Ejemplo: toastLib.success(message)
      // Por ahora usamos alert como placeholder visual.
      // eslint-disable-next-line no-alert
      alert(message);
    }
  },
  error(message: string) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-alert
      alert(message);
    }
  },
};


