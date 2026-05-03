'use client';

interface RichTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  label?: string;
}

export default function RichTextarea({ value, onChange, placeholder, rows = 4, id, label }: RichTextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-xs text-muted font-mono uppercase tracking-wider">{label}</label>}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm placeholder-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50 resize-y min-h-[80px]"
      />
    </div>
  );
}
