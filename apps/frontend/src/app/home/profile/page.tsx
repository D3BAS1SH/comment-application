'use client';

import { User, Mail, Phone } from 'lucide-react';

const fields = [
  { label: 'Name', value: 'John Doe', icon: <User size={16} /> },
  { label: 'Email', value: 'john@example.com', icon: <Mail size={16} /> },
  { label: 'Phone', value: '+1 (555) 123-4567', icon: <Phone size={16} /> },
];

export default function ProfilePage() {
  return (
    <div className="space-y-6 font-mono">
      <div className="border-l-4 border-green-400 pl-4 py-1">
        <h1 className="text-xl font-bold tracking-widest uppercase text-white">
          Profile
        </h1>
        <p className="text-gray-600 text-xs mt-1">account information</p>
      </div>

      <div className="border border-green-900 bg-black/40 max-w-2xl">
        <div className="px-4 py-3 border-b border-green-900">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest">
            {/* account info */}
          </p>
        </div>
        <div className="divide-y divide-green-900/50">
          {fields.map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex items-center gap-4 px-4 py-4 hover:bg-green-900/10 transition-colors"
            >
              <span className="text-green-600 flex-shrink-0">{icon}</span>
              <div>
                <p className="text-gray-600 text-[10px] uppercase tracking-widest">
                  {label}
                </p>
                <p className="text-green-300 text-sm font-bold mt-0.5">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
