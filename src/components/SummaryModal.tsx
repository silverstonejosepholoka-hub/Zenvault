import React from 'react';
import { motion } from 'motion/react';
import { X, ChevronRight, ShieldCheck, Zap, Gift } from 'lucide-react';
import { Button } from './UI';
import { cn } from '@/src/lib/utils';

interface SummaryModalProps {
  onClose: () => void;
  type: 'pay' | 'claim';
  data: {
    title: string;
    description: string;
    stats: { label: string; value: string }[];
  };
}

export function SummaryModal({ onClose, type, data }: SummaryModalProps) {
  const Icon = type === 'pay' ? Zap : Gift;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white rounded-t-[48px] overflow-hidden shadow-2xl relative"
      >
        {/* Design Circles */}
        <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary-50 rounded-full blur-2xl" />
        <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-luxury-gold/10 rounded-full blur-xl" />

        <div className="relative z-10">
          <div className="p-8 pb-4 flex justify-between items-start">
            <div className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl",
              type === 'pay' ? "bg-primary-900 shadow-primary-900/20" : "bg-luxury-gold shadow-luxury-gold/20"
            )}>
              <Icon size={32} />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-300" />
            </button>
          </div>

          <div className="px-8 pb-10 space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-slate-800">{data.title}</h2>
              <p className="text-slate-500 font-medium leading-relaxed">{data.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {data.stats.map((stat, i) => (
                <div key={`${stat.label}-${i}`} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-lg font-black text-slate-800">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-primary-50 rounded-[32px] flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
                <ShieldCheck size={20} />
              </div>
              <p className="text-xs font-bold text-primary-900 uppercase tracking-tight">
                Assets guarded by ZenVault Gold Security
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-2xl" onClick={onClose}>
                Dismiss
              </Button>
              <Button className={cn(
                "flex-1 py-4 font-black uppercase tracking-widest text-xs rounded-2xl gap-2",
                type === 'pay' ? "bg-primary-900" : "bg-luxury-gold text-primary-950"
              )}>
                Confirm Action <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
