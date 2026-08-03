// src/components/profile/AvatarPicker.jsx
import React from 'react';
import Avatar from '../common/Avatar';

const PRESETS = [
  { id: 'adventurer', label: 'Adventurer' },
  { id: 'lorelei', label: 'Lorelei' },
  { id: 'avataaars', label: 'Avataaars' },
  { id: 'fun-emoji', label: 'FunEmoji' },
  { id: 'bottts-neutral', label: 'Bottts' }
];

export default function AvatarPicker({ uid, value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {PRESETS.map(p => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-shadow focus:outline-none ${
            value === p.id ? 'ring-2 ring-forest-accent bg-white/5' : 'hover:bg-white/2'
          }`}
        >
          <Avatar uid={uid} avatarChoice={p.id} size={64} alt={p.label} />
          <span className="text-xs text-forest-text/80">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
