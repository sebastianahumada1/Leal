'use client';

import React, { useState } from 'react';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className={`flex flex-col min-w-40 flex-1 ${containerClassName}`}>
      {label && (
        <p className="text-primary text-base font-medium leading-normal pb-2 ml-1 font-display">
          {label}
        </p>
      )}
      <div className="flex w-full flex-1 items-stretch input-smooth-border">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`form-input flex w-full min-w-0 flex-1 text-primary focus:outline-0 focus:ring-1 focus:ring-primary/50 bg-forest/50 h-14 placeholder:text-primary/40 p-[15px] password-input-smooth-border-left text-base sm:text-lg font-normal leading-normal font-body placeholder:font-body ${className}`}
          style={{ 
            fontSize: '16px',
            backgroundColor: 'rgba(20, 83, 61, 0.5)',
            WebkitTextFillColor: '#C5B48F',
          }}
          autoComplete={props.autoComplete || (props.name?.includes('confirm') ? 'new-password' : 'current-password')}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-primary/60 flex bg-forest/50 items-center justify-center pr-[15px] password-icon-smooth-border-right cursor-pointer hover:text-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
      {error && (
        <span className="text-error text-sm mt-1 ml-1">{error}</span>
      )}
    </label>
  );
};
