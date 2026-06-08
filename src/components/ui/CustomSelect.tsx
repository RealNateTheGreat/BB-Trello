import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange, disabled, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border-2 bg-black/25 px-4 py-3 text-left text-stone-50 transition-all duration-200 hover:border-red-400/70 disabled:cursor-not-allowed disabled:opacity-50"
        style={{ borderColor: 'rgba(127, 29, 29, 0.82)' }}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">{selectedOption?.label || 'Select'}</span>
          {selectedOption?.description && (
            <span className="mt-1 block truncate text-xs text-red-100/70">{selectedOption.description}</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-red-100 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 z-[70] mt-2 overflow-hidden rounded-lg border-2 shadow-2xl animate-fade-in"
          style={{ backgroundColor: 'rgba(24, 18, 16, 0.98)', borderColor: 'rgba(185, 28, 28, 0.72)' }}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  selected ? 'bg-red-700/35 text-stone-50' : 'text-red-100 hover:bg-red-950/35'
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{option.label}</span>
                  {option.description && (
                    <span className="mt-1 block truncate text-xs text-red-100/70">{option.description}</span>
                  )}
                </span>
                {selected && <Check className="h-4 w-4 shrink-0 text-red-100" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
