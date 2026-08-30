import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '../../store';
import clsx from 'clsx';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  const colors = {
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    info: 'bg-info text-white',
    warning: 'bg-warning text-white',
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-medium min-w-[300px]',
            colors[toast.type]
          )}
        >
          {icons[toast.type]}
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-80"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
