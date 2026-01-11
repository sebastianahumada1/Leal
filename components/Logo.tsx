'use client';

interface LogoProps {
  variant?: 'default' | 'small' | 'large';
  showSubtitle?: boolean;
  className?: string;
}

export default function Logo({ variant = 'default', showSubtitle = false, className = '' }: LogoProps) {
  const sizeClasses = {
    default: 'text-4xl md:text-5xl',
    small: 'text-2xl md:text-3xl',
    large: 'text-5xl md:text-7xl',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h1 
        className={`logo-text ${sizeClasses[variant]}`}
        data-text="LEAL"
      >
        LEAL
      </h1>
      {showSubtitle && (
        <p className="text-secondary text-sm md:text-base mt-2 tracking-wider opacity-90">
          MEXICAN FOOD
        </p>
      )}
    </div>
  );
}
