import React, { useRef } from 'react';

export interface AnnualOptionItem {
  value: string;
  label?: string;
  emoji?: string;
  badge?: string; // optional left badge (e.g., A/B/C/D)
}

interface AnnualOptionListProps {
  options: AnnualOptionItem[];
  multiple?: boolean;
  value: string | string[] | null;
  onChange: (val: string | string[]) => void;
  className?: string;
  optionClassName?: string;
  showCheckIndicator?: boolean; // for single-select add small indicator
}

const AnnualOptionList: React.FC<AnnualOptionListProps> = ({
  options,
  multiple,
  value,
  onChange,
  className = '',
  optionClassName = '',
  showCheckIndicator = false
}) => {
  const current = value;
  const handleSelect = (val: string) => {
    if (multiple) {
      const arr = Array.isArray(current) ? current.slice() : [];
      const idx = arr.indexOf(val);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
      onChange(arr);
    } else {
      if (current === val) onChange(val); else onChange(val);
    }
  };
  const isSelected = (val: string) => multiple ? Array.isArray(current) && current.includes(val) : current === val;
  const lastSelectedRef = useRef<string | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      {options.map(opt => {
        const selected = isSelected(opt.value);
        const animate = selected && lastSelectedRef.current === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            onMouseDown={(e) => e.currentTarget.classList.add('pressing')}
            onMouseUp={(e) => e.currentTarget.classList.remove('pressing')}
            onMouseLeave={(e) => e.currentTarget.classList.remove('pressing')}
            className={`w-full rounded-2xl border px-5 py-4 flex items-center gap-4 justify-between transition [transition-property:background,border,color,transform] duration-200 shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400/70 ${selected ? 'bg-white/25 border-white text-white shadow-lg' : 'bg-white/10 border-white/40 text-white hover:bg-white/15'} ${animate ? 'animate-selectPop' : ''} ${optionClassName}`}
            aria-pressed={selected}
            onAnimationEnd={() => { if (selected) lastSelectedRef.current = opt.value; }}
            onClickCapture={() => { if (!multiple) { lastSelectedRef.current = opt.value; } else { lastSelectedRef.current = opt.value; } }}
          >
            {opt.badge && (
              <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500 text-white text-xs font-bold border border-white/40 shadow flex-shrink-0">{opt.badge}</span>
            )}
            <span className="flex-1 text-left flex items-center gap-3">
              {opt.emoji && <span className="text-lg leading-none">{opt.emoji}</span>}
              {opt.label || opt.value}
            </span>
            {multiple && selected && <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-inner" />}
            {!multiple && showCheckIndicator && selected && <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-inner" />}
          </button>
        );
      })}
    </div>
  );
};

export default AnnualOptionList;
