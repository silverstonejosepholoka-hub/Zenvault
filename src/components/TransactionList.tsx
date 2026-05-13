import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Zap, Wallet, Cpu, FastForward } from 'lucide-react';
import { Transaction } from '@/src/types';
import { formatCurrency, cn } from '@/src/lib/utils';

const categoryIcons: Record<string, any> = {
  Shopping: ShoppingBag,
  Utilities: Zap,
  Transfer: FastForward,
  Salary: Wallet,
  Other: Cpu,
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="font-black text-xl tracking-tight text-slate-800">Recent Activity</h3>
        <button className="text-primary-600 text-sm font-black hover:text-primary-700 transition-colors uppercase tracking-widest">View All</button>
      </div>

      <div className="space-y-1">
        {transactions.map((tx, i) => {
          const Icon = categoryIcons[tx.category] || Cpu;
          const isCredit = tx.type === 'credit';

          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={`${tx.id}-${i}`}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-[28px] border border-slate-200/40 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                  isCredit ? "bg-emerald-50 text-emerald-600" : "bg-primary-50 text-primary-600"
                )}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 leading-tight">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400 border border-slate-100 px-1.5 rounded uppercase">
                      {tx.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium opacity-60">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-sm font-black tracking-tight",
                  isCredit ? "text-emerald-600" : "text-slate-900"
                )}>
                  {isCredit ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className={cn(
                    "w-1 h-1 rounded-full",
                    tx.status === 'completed' ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{tx.status}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
