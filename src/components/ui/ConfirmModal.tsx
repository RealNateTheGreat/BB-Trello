import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  isLoading,
  onCancel,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg border-2 p-6 shadow-2xl bb-panel animate-fade-in">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-2 text-red-100 transition-colors hover:bg-red-950/40"
          aria-label="Close confirmation"
        >
          <X className="h-5 w-5" />
        </button>

        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border-2"
          style={{ backgroundColor: 'rgba(127, 29, 29, 0.25)', borderColor: 'rgba(239, 68, 68, 0.55)' }}
        >
          <AlertTriangle className="h-7 w-7 text-red-100" />
        </div>

        <h2 className="text-2xl font-black text-stone-50">{title}</h2>
        <p className="mt-3 leading-relaxed text-red-100">{message}</p>

        <div className="mt-6 flex flex-col justify-end gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-red-900/50 px-5 py-3 text-red-100 transition-colors hover:bg-red-950/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-red-400/70 bg-red-700/70 px-5 py-3 font-semibold text-stone-50 transition-all duration-200 hover:bg-red-600/80 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isLoading ? 'Deleting...' : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
