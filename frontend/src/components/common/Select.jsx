import React from 'react';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  className = '',
  placeholder = 'Select an option',
  disabled = false,
  required = false,
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const val = typeof option === 'string' ? option : option.value;
          const lab = typeof option === 'string' ? option : option.label;
          return (
            <option key={val} value={val}>
              {lab}
            </option>
          );
        })}
      </select>
      {error && <p className="text-xs text-red-600 mt-0.5">{error}</p>}
    </div>
  );
}
