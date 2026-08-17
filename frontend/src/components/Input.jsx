import '../styles/input.css';

export function Input({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  error = '',
  ...props
}) {
  return (
    <div className="input-group">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
