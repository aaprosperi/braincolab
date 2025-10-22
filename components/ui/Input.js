import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
