import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefixIcon, suffixIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {prefixIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-xl border bg-white/5 px-4 py-3 text-gray-100 shadow-sm
              placeholder:text-gray-500
              transition-all duration-200
              focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10
              disabled:cursor-not-allowed disabled:bg-white/[0.02] disabled:text-gray-600
              ${error ? 'border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-red-500/10' : 'border-white/10 hover:border-white/20'}
              ${prefixIcon ? 'pl-10' : ''}
              ${suffixIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {suffixIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              {suffixIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
