// src/components/auth/AuthCard.jsx
import React from "react";

export default function AuthCard({ title, subtitle, actions, children }) {
  return (
    <div className="
      w-full max-w-md
      bg-[rgba(255,255,255,0.04)]
      border border-[rgba(255,255,255,0.06)]
      rounded-3xl p-8
      backdrop-blur-xl
      shadow-[0_10px_40px_rgba(0,0,0,0.45)]
    ">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="text-sm text-[rgba(255,255,255,0.7)] mt-1">{subtitle}</p>
        </div>
        {actions && <div>{actions}</div>}
      </div>

      {children}
    </div>
  );
}
