import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}) => {
  return (
    <label className={`flex flex-col min-w-40 flex-1 ${containerClassName}`}>
      {label && (
        <p className="text-primary text-base font-medium leading-normal pb-2 ml-1 font-display">
          {label}
        </p>
      )}
      <input
        className={`form-input flex w-full min-w-0 flex-1 text-primary focus:outline-0 focus:ring-1 focus:ring-primary/50 bg-forest/50 h-14 placeholder:text-primary/40 p-[15px] text-base sm:text-lg font-normal leading-normal input-smooth-border font-body placeholder:font-body ${className}`}
        style={{ 
          fontSize: '16px',
          backgroundColor: 'rgba(20, 83, 61, 0.5)',
          WebkitTextFillColor: '#C5B48F',
        }}
        autoComplete={props.autoComplete || (props.type === 'email' ? 'email' : props.type === 'tel' ? 'tel' : 'off')}
        {...props}
      />
      {error && (
        <span className="text-error text-sm mt-1 ml-1">{error}</span>
      )}
    </label>
  );
};
