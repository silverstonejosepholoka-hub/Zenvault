import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Landmark, Smartphone, Wallet, ChevronRight } from 'lucide-react';
import { Button, Card } from './UI';
import { cn } from '@/src/lib/utils';
import { dataService } from '../services/dataService';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'UGX', 'KES', 'NGN', 'ZAR', 'RWF'];
const ACCOUNT_TYPES = [
  { id: 'wallet', label: 'Digital Vault', icon: Wallet, desc: 'Secure cloud-based storage' },
  { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone, desc: 'Connect to regional gateways' },
  { id: 'bank', label: 'Direct Bank', icon: Landmark, desc: 'Legacy banking bridge' },
];

export function CreateAccountModal({ onClose }: { onClose: () => void }) {
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState('wallet');
  const [label, setLabel] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await dataService.createAccount({
        currency,
        type: type as any,
        label: label || `${currency} ${type.replace('_', ' ')}`,
        balance: 0
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-black text-2xl tracking-tight text-slate-800">Add Account</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Currency</label>
            <div className="grid grid-cols-4 gap-2">
              {CURRENCIES.map(curr => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={cn(
                    "py-2 rounded-xl text-xs font-black transition-all border",
                    currency === curr ? "bg-primary-600 border-primary-600 text-white" : "bg-slate-50 border-slate-100 text-slate-400"
                  )}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Account Type</label>
            <div className="space-y-2">
              {ACCOUNT_TYPES.map(item => (
                <button
                  key={item.id}
                  onClick={() => setType(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                    type === item.id ? "border-primary-600 bg-primary-50/30" : "border-slate-50 bg-slate-50"
                  )}
                >
                  <div className={cn("p-2 rounded-xl", type === item.id ? "bg-primary-600 text-white" : "bg-white text-slate-400 border border-slate-100")}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  {type === item.id && <ChevronRight size={16} className="text-primary-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Custom Label (Optional)</label>
            <input
              type="text"
              placeholder="e.g. My Savings"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none focus:border-primary-500 focus:bg-white transition-all text-sm font-bold"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <Button 
            className="w-full py-5 rounded-[24px] bg-primary-900 hover:bg-black text-white font-black shadow-xl" 
            isLoading={isLoading}
            onClick={handleCreate}
          >
            Deploy Account
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
