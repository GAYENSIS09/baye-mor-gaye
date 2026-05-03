'use client';
import { useState, type KeyboardEvent } from 'react';

interface TechTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TechTagInput({ tags, onChange, placeholder = 'Ajouter...', label = 'Technologies' }: TechTagInputProps) {
  const [input, setInput] = useState('');

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-muted font-mono uppercase tracking-wider">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 border border-[#333] rounded bg-transparent focus-within:border-acid/50 transition-colors min-h-[42px]">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 bg-acid/10 text-acid text-xs px-2 py-1 rounded-full font-mono">
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-red-400 ml-0.5" aria-label={`Supprimer ${tag}`}>×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input) addTag(input); }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] bg-transparent text-off-white text-sm placeholder-muted focus-visible:outline-none"
        />
      </div>
    </div>
  );
}
