'use client';

import { Lock, Bell, Eye } from 'lucide-react';

const settings = [
  {
    title: 'Privacy',
    description: 'Control who can see your profile',
    icon: <Eye size={18} />,
  },
  {
    title: 'Notifications',
    description: 'Manage your notification preferences',
    icon: <Bell size={18} />,
  },
  {
    title: 'Security',
    description: 'Update your password and security settings',
    icon: <Lock size={18} />,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 font-mono">
      <div className="border-l-4 border-green-400 pl-4 py-1">
        <h1 className="text-xl font-bold tracking-widest uppercase text-white">
          Settings
        </h1>
        <p className="text-gray-600 text-xs mt-1">system configuration</p>
      </div>

      <div className="space-y-3 max-w-2xl">
        {settings.map((setting, index) => (
          <div
            key={index}
            className="border border-green-900 bg-black/40 p-4 flex items-center justify-between hover:border-green-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-green-500">{setting.icon}</span>
              <div>
                <p className="text-green-400 text-sm font-bold uppercase tracking-widest">
                  {setting.title}
                </p>
                <p className="text-gray-600 text-xs mt-0.5">
                  {setting.description}
                </p>
              </div>
            </div>
            <button className="text-[10px] font-mono text-gray-500 border border-gray-700 hover:border-green-600 hover:text-green-400 px-3 py-1 uppercase tracking-wider transition-colors">
              edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
