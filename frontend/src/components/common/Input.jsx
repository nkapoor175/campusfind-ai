import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span className="required-star">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="input-field"
          {...props}
        />
      </div>
      {error && <p className="input-error-msg">{error}</p>}
      {helperText && !error && <p className="input-helper-msg">{helperText}</p>}

      <style>{`
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1.15rem;
          text-align: left;
        }
        .input-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--charcoal-800);
        }
        .required-star {
          color: var(--coral-500);
        }
        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: #FFFFFF;
          border: 1.5px solid var(--border-warm);
          border-radius: var(--radius-md);
          padding: 0.65rem 0.95rem;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }
        .input-wrapper:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3.5px rgba(224, 109, 83, 0.15);
        }
        .input-wrapper.has-error {
          border-color: #E63946;
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.15);
        }
        .input-wrapper.is-disabled {
          background: var(--cream-soft);
          opacity: 0.7;
          cursor: not-allowed;
        }
        .input-icon {
          color: var(--charcoal-400);
          flex-shrink: 0;
        }
        .input-field {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          color: var(--charcoal-900);
          font-size: 0.95rem;
          font-family: inherit;
        }
        .input-field::placeholder {
          color: var(--charcoal-400);
          opacity: 0.7;
        }
        .input-error-msg {
          font-size: 0.78rem;
          color: #E63946;
          margin: 0;
          font-weight: 500;
        }
        .input-helper-msg {
          font-size: 0.78rem;
          color: var(--charcoal-400);
          margin: 0;
        }
      `}</style>
    </div>
  );
}
