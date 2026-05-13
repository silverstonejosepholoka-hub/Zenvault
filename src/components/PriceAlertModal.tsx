import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bell, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './UI';
import { cn } from '@/src/lib/utils';
import { dataService } from '../services/dataService';

interface PriceAlertModalProps {
  stock: { symbol: string; price: number };
  onClose: () => void;
}

export function PriceAlertModal({ stock, onClose }: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState(stock.price.toString());
  const [condition, setCondition] = useState<'above' | 'below'>(
    parseFloat(targetPrice) > stock.price ? 'above' : 'below'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      await dataService.createPriceAlert({
        symbol: stock.symbol,
        targetPrice: parseFloat(targetPrice),
        condition
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Bell size={20} />
            </div>
            <h3 className="font-black text-2xl tracking-tight text-slate-800 uppercase">Set Alert</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Price</p>
                <p className="text-xl font-black text-slate-800">{stock.symbol}</p>
              </div>
              <p className="text-2xl font-black">${stock.price.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Price</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-10 py-5 outline-none focus:border-primary-500 transition-all text-2xl font-black"
                value={targetPrice}
                onChange={(e) => {
                  setTargetPrice(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    setCondition(val > stock.price ? 'above' : 'below');
                  }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setCondition('above')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                condition === 'above' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-50 bg-slate-50 text-slate-400"
              )}
            >
              <TrendingUp size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Goes Above</span>
            </button>
            <button
              onClick={() => setCondition('below')}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                condition === 'below' ? "border-rose-500 bg-rose-50 text-rose-700" : "border-slate-50 bg-slate-50 text-slate-400"
              )}
            >
              <TrendingDown size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Drops Below</span>
            </button>
          </div>

          <Button 
            className="w-full py-5 rounded-[24px] bg-primary-900 hover:bg-black text-white font-black shadow-xl" 
            isLoading={isLoading}
            disabled={!targetPrice}
            onClick={handleCreate}
          >
            Create Alert
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
