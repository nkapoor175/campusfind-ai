import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  id,
  options = [],
  value,
  onChange,
  error,
  helperText,
  required = false,
  className = '',
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`select-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className={`select-wrapper ${error ? 'has-error' : ''}`}>
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          className="select-field"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const optVal = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={optVal} value={optVal}>
                {optLabel}
              </option>
            );
          })}
        </select>
        <ChevronDown size={18} className="select-arrow" />
      </div>
      {error && <p className="select-error-msg">{error}</p>}
      {helperText && !error && <p className="select-helper-msg">{helperText}</p>}

      <style>{`
        .select-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1.15rem;
          text-align: left;
        }
        .select-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal-800);
        }
        .required-star {
          color: var(--coral-500);
        }
        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-md);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .select-wrapper:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3.5px rgba(224, 109, 83, 0.15);
        }
        .select-wrapper.has-error {
          border-color: #E63946;
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.15);
        }
        .select-field {
          flex: 1;
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          border: none;
          outline: none;
          padding: 0.65rem 2.2rem 0.65rem 0.95rem;
          color: var(--charcoal-900);
          font-size: 0.95rem;
          font-family: inherit;
          cursor: pointer;
        }
        .select-arrow {
          position: absolute;
          right: 0.95rem;
          pointer-events: none;
          color: var(--charcoal-400);
        }
        .select-error-msg {
          font-size: 0.78rem;
          color: #E63946;
          margin: 0;
          font-weight: 500;
        }
        .select-helper-msg {
          font-size: 0.78rem;
          color: var(--charcoal-400);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
