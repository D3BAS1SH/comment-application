'use client';

import { motion } from 'framer-motion';
import {
  FintechCard,
  FintechCardHeader,
  FintechCardTitle,
} from '@/components/fintech-card';
import { FintechButton } from '@/components/fintech-button';
import { Lock, Bell, Eye } from 'lucide-react';

export default function SettingsPage() {
  const settings = [
    {
      title: 'Privacy',
      description: 'Control who can see your profile',
      icon: <Eye size={20} />,
    },
    {
      title: 'Notifications',
      description: 'Manage your notification preferences',
      icon: <Bell size={20} />,
    },
    {
      title: 'Security',
      description: 'Update your password and security settings',
      icon: <Lock size={20} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Settings</h1>

      <div className="space-y-4 max-w-2xl">
        {settings.map((setting, index) => (
          <FintechCard key={index} variant="hover-glow">
            <FintechCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-cyan-400">{setting.icon}</div>
                  <div>
                    <FintechCardTitle className="text-lg">
                      {setting.title}
                    </FintechCardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      {setting.description}
                    </p>
                  </div>
                </div>
                <FintechButton variant="outline" size="sm">
                  Edit
                </FintechButton>
              </div>
            </FintechCardHeader>
          </FintechCard>
        ))}
      </div>
    </motion.div>
  );
}
