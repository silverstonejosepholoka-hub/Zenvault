import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { Button, Card } from './UI';
import { cn, formatCurrency } from '@/src/lib/utils';
import { convertCurrency, ExchangeRates } from '../services/currencyService';
import { Account } from '../types';

interface ConversionModalProps {
  accounts: (Account & { id: string })[];
  exchangeRates: ExchangeRates | null;
  onClose: () => void;
  onConvert: (fromId: string, toId: string, amount: number) => Promise<void>;
}

export function ConversionModal({ accounts, exchangeRates, onClose, onConvert }: ConversionModalProps) {
  const [fromId, setFromId] = useState(accounts[0]?.id || '');
  const [toId, setToId] = useState(accounts[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fromAccount = useMemo(() => accounts.find(a => a.id === fromId), [accounts, fromId]);
  const toAccount = useMemo(() => accounts.find(a => a.id === toId), [accounts, toId]);

  const targetAmount = useMemo(() => {
    if (!amount || !fromAccount || !toAccount || !exchangeRates) return 0;
    return convertCurrency(parseFloat(amount), fromAccount.currency, toAccount.currency, exchangeRates);
  }, [amount, fromAccount, toAccount, exchangeRates]);

  const handleConvert = async () => {
    if (!fromId || !toId || !amount) return;
    setIsLoading(true);
    try {
      await onConvert(fromId, toId, parseFloat(amount));
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-2xl tracking-tight text-slate-800 italic uppercase">Exchange</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">From Account</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-primary-500 transition-all font-bold text-sm"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.label} ({a.currency}) - {formatCurrency(a.balance, a.currency)}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center -my-3 relative z-10">
            <button className="bg-primary-900 text-white p-3 rounded-full shadow-lg border-4 border-white">
              <ArrowRightLeft size={20} className="rotate-90" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">To Account</label>
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-primary-500 transition-all font-bold text-sm"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.label} ({a.currency})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Amount to Convert</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-primary-500 transition-all text-xl font-black"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{fromAccount?.currency}</div>
            </div>
          </div>

          {targetAmount > 0 && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-1">
              <div className="flex justify-between items-center text-emerald-800">
                <p className="text-[10px] font-black uppercase tracking-widest">You will receive</p>
                <div className="flex items-center gap-1 text-[10px] font-black bg-emerald-100 px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} /> Live Rate
                </div>
              </div>
              <p className="text-2xl font-black mt-1">{formatCurrency(targetAmount, toAccount?.currency || 'USD')}</p>
            </div>
          )}

          <Button 
            className="w-full py-5 rounded-[24px] bg-primary-900 hover:bg-black text-white font-black shadow-xl" 
            isLoading={isLoading}
            disabled={!amount || parseFloat(amount) > (fromAccount?.balance || 0) || fromId === toId}
            onClick={handleConvert}
          >
            Settle Exchange
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
