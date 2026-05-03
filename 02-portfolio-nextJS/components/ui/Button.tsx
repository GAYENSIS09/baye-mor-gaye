import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

type LinkProps = { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;
type BtnProps = { href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
} & (LinkProps | BtnProps);

const variantStyles: Record<Variant, string> = {
  primary:   'bg-acid text-black hover:bg-acid/90',
  secondary: 'bg-[#222] text-off-white hover:bg-[#333]',
  ghost:     'text-muted hover:text-off-white hover:bg-[#222]',
  destructive: 'bg-red-600 text-white hover:bg-red-500',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const base = `inline-flex items-center justify-center gap-2 font-mono uppercase tracking-widest rounded-lg transition-all duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if ('href' in rest && rest.href) {
    const { href, target, rel, onClick, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} target={target} rel={rel} onClick={onClick} className={base} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { href: _h, ...buttonRest } = rest as BtnProps;
  return (
    <button className={base} {...buttonRest}>
      {children}
    </button>
  );
}
