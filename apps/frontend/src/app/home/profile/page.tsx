'use client';

import { motion } from 'framer-motion';
import {
  FintechCard,
  FintechCardContent,
  FintechCardHeader,
  FintechCardTitle,
} from '@/components/fintech-card';
import { User, Mail, Phone } from 'lucide-react';

export default function ProfilePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key="profile-page"
    >
      <h1 className="text-3xl font-bold tracking-tighter mb-8">Profile</h1>

      <FintechCard variant="glass" className="max-w-2xl">
        <FintechCardHeader>
          <FintechCardTitle>Account Information</FintechCardTitle>
        </FintechCardHeader>
        <FintechCardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <User size={24} className="text-cyan-400" />
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-medium">John Doe</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <Mail size={24} className="text-cyan-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-medium">john@example.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <Phone size={24} className="text-cyan-400" />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-medium">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </FintechCardContent>
      </FintechCard>
    </motion.div>
  );
}
