import React from 'react';
import { motion } from 'motion/react';
import { Goal } from '@/src/types';
import { formatCurrency } from '@/src/lib/utils';
import { Card } from './UI';

export function GoalProgress({ goal }: { goal: Goal }) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
          💰
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Growth Goal</p>
          <h4 className="font-black text-sm tracking-tight text-slate-800">{goal.title}</h4>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
          />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {progress.toFixed(0)}% Focused
          </p>
          <span className="text-primary-600 font-bold text-xs">
            {formatCurrency(goal.currentAmount, goal.currency)}
          </span>
        </div>
      </div>
    </Card>
  );
}
