import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = '',
  className = '',
  icon,
  ...props
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="input-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({
  label,
  error,
  placeholder = '',
  rows = 4,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full mb-4">
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-gray-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        className={`input-field ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="input-error">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
