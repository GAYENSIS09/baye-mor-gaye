interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export default function FieldWrapper({ label, htmlFor, error, children, required }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-xs text-muted font-mono uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
    </div>
  );
}
