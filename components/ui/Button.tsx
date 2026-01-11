import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'distressed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'font-bold tracking-widest transition-all duration-200 focus-rustic disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden cursor-pointer';
  
  const variantClasses = {
    primary: 'header-text bg-primary text-forest hover:opacity-90 active:opacity-80',
    secondary: 'header-text border-2 border-primary text-primary bg-transparent hover:bg-primary/10 active:bg-primary/20',
    distressed: 'distressed-bg text-forest hover:brightness-110 active:scale-[0.98] shadow-xl relative rounded-lg',
  };
  
  const sizeClasses = {
    sm: 'h-10 px-4 text-xs',
    md: 'h-12 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`.trim();
  
  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {variant === 'distressed' && (
        <div className="absolute inset-1 dotted-border rounded-md opacity-30"></div>
      )}
      <span className={variant === 'distressed' ? 'truncate uppercase z-10 font-display relative' : 'header-text'}>
        {children}
      </span>
    </button>
  );
};
