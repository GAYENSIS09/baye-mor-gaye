'use client';

import { type LabelHTMLAttributes, forwardRef } from 'react';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className = '', children, ...props }, ref) => (
    <label
      ref={ref}
      className={`block text-sm font-medium text-off-white mb-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  )
);

Label.displayName = 'Label';