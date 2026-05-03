'use client';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

const PRESETS = ['#AAFF00', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8C42', '#6C5CE7', '#FD79A8'];

export default function ColorPicker({ value, onChange, label = 'Couleur' }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-muted font-mono uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3">
        <input type="color" value={value || '#AAFF00'} onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 border border-[#333] rounded cursor-pointer bg-transparent" />
        <div className="flex gap-1 flex-wrap">
          {PRESETS.map((c) => (
            <button key={c} onClick={() => onChange(c)} type="button" role="button" tabIndex={0}
              className={`w-6 h-6 rounded-full border-2 transition-all ${value === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }} aria-label={`Couleur ${c}`} aria-pressed={value === c} />
          ))}
        </div>
      </div>
    </div>
  );
}
