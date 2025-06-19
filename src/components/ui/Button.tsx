import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes with conflict resolution
function cn(...classes: (string | undefined | false | null)[]): string {
  return twMerge(classes.filter(Boolean).join(' '));
}

type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
  leadingIcon?: ReactNode;
  full?: boolean;
}

const getVariantClasses = (variant: ButtonVariant): string => {
  const variants = {
    solid:
      'bg-accent text-text-neutral-dark-1 hover:bg-accent/90 focus:ring-accent/50 ',
    outline:
      'border border-stroke-neutral-1 bg-bg-neutral-light-1 hover:bg-accent/5 text-accent focus:ring-accent/50',
    ghost: 'text-accent hover:bg-accent/5 focus:ring-accent/50',
    link: 'text-link-light underline-offset-4 underline focus:ring-accent/50 font-normal',
  };
  return variants[variant];
};

const getSizeClasses = (size: ButtonSize): string => {
  const sizes = {
    sm: 'w-auto p-0',
    md: 'w-auto py-2 px-4',
  };
  return sizes[size];
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'solid',
      size = 'md',
      className,
      children,
      disabled,
      leadingIcon,
      full,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex text-sm font-medium items-center justify-center whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 disabled:cursor-none cursor-pointer transition-all duration-200 disabled:hover:none';

    const variantClasses = getVariantClasses(variant);
    const sizeClasses = getSizeClasses(size);
    const customClasses = cn(full ? 'w-full' : '');
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses,
          sizeClasses,
          customClasses,
          className
        )}
        {...props}
      >
        {leadingIcon && <span className="mr-2">{leadingIcon}</span>}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
