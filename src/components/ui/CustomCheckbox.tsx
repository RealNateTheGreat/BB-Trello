import React from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ checked, onChange, label, disabled }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-lg border border-red-900/45 bg-black/20 px-3 py-3 text-left text-red-100 transition-all duration-200 hover:border-red-400/70 hover:bg-red-950/25 disabled:cursor-not-allowed disabled:opacity-50"
      aria-pressed={checked}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
          checked ? 'border-red-300 bg-red-600/80' : 'border-red-800 bg-black/25'
        }`}
      >
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
};

export default CustomCheckbox;
