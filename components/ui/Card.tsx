import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'rustic' | 'vintage';
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  padding = 'md',
}) => {
  const baseClasses = 'bg-forest';
  
  const variantClasses = {
    default: 'border border-primary/20',
    rustic: 'rustic-border',
    vintage: 'vintage-seal bg-kraft-50',
  };
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`.trim();
  
  return (
    <div className={classes}>
      {children}
    </div>
  );
};
