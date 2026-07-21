import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-[6px] font-medium transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-white border border-accent text-accent hover:bg-accent-light',
    ghost: 'bg-transparent text-accent hover:bg-accent-light',
    danger: 'bg-white border border-danger text-danger hover:bg-red-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg h-[48px]',
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  className 
}: BadgeProps) {
  const variants = {
    success: 'bg-success/12 text-success',
    warning: 'bg-warning/12 text-warning',
    danger: 'bg-danger/12 text-danger',
    neutral: 'bg-text-muted/12 text-text-muted',
  };

  return (
    <span className={cn(
      'rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
