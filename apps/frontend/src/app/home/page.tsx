'use client';

import { motion } from 'framer-motion';
import {
  FintechCard,
  FintechCardContent,
  FintechCardHeader,
  FintechCardTitle,
} from '@/components/fintech-card';
import {
  BarChart3,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export default function HomePage() {
  const stats = [
    {
      title: 'Total Balance',
      value: '$12,450.50',
      change: '+5.2%',
      icon: <Wallet className="h-8 w-8 text-cyan-400" />,
      positive: true,
    },
    {
      title: 'Monthly Spending',
      value: '$3,240.00',
      change: '+2.1%',
      icon: <TrendingUp className="h-8 w-8 text-violet-400" />,
      positive: false,
    },
    {
      title: 'Investments',
      value: '$8,960.75',
      change: '+12.5%',
      icon: <BarChart3 className="h-8 w-8 text-cyan-400" />,
      positive: true,
    },
  ];

  const transactions = [
    {
      id: 1,
      name: 'Netflix Subscription',
      amount: '-$15.99',
      type: 'subscription',
    },
    { id: 2, name: 'Direct Deposit', amount: '+$2,500.00', type: 'income' },
    { id: 3, name: 'Grocery Store', amount: '-$82.50', type: 'expense' },
    { id: 4, name: 'Freelance Payment', amount: '+$450.00', type: 'income' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tighter">Welcome Back!</h1>
        <p className="text-gray-400 mt-2">Here is your financial overview</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <FintechCard variant="hover-glow">
              <FintechCardHeader>
                <div className="flex items-center justify-between">
                  <div>{stat.icon}</div>
                  <div
                    className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {stat.positive ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownLeft size={16} />
                    )}
                    {stat.change}
                  </div>
                </div>
              </FintechCardHeader>
              <FintechCardContent>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {stat.value}
                </p>
              </FintechCardContent>
            </FintechCard>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <FintechCard variant="glass">
          <FintechCardHeader>
            <FintechCardTitle>Recent Transactions</FintechCardTitle>
          </FintechCardHeader>
          <FintechCardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
                >
                  <div>
                    <p className="text-white font-medium">{transaction.name}</p>
                    <p className="text-gray-400 text-sm capitalize">
                      {transaction.type}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${transaction.amount.includes('-') ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {transaction.amount}
                  </p>
                </div>
              ))}
            </div>
          </FintechCardContent>
        </FintechCard>
      </motion.div>
    </div>
  );
}
