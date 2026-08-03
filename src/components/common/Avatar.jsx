// src/components/common/Avatar.jsx
import React from 'react';

const DICEBEAR_BASE = (style) => `https://api.dicebear.com/8.x/${style}/svg`;

export default function Avatar({ uid, avatarChoice = 'adventurer', size = 40, alt = 'User' }) {
  const src = `${DICEBEAR_BASE(avatarChoice)}?seed=${encodeURIComponent(uid)}&t=${Date.now()}`;

  const px = typeof size === 'number' ? `${size}px` : size;

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: px, height: px }}
      className="rounded-full object-cover border border-transparent"
      onError={(e) => {
        // fallback to initials via ui-avatars
        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=E6F4EA&color=3A6B48&size=256`;
      }}
    />
  );
}
