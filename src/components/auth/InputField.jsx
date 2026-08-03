// InputField.jsx
import React from "react";

export default function InputField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  children, // For the eye toggle button
  ...props
}) {
  return (
    <div {...props}>
      <label className="text-sm text-white/80">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`ap-input ${children ? 'pr-10' : ''}`}
          placeholder={placeholder}
        />
        {children && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">
            {children}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}