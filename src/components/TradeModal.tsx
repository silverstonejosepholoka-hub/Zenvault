import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { Button } from './UI';
import { cn, formatCurrency } from '@/src/lib/utils';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    name: string;
    price: number;
    type: string;
  };
  action: 'BUY' | 'SELL';
  onConfirm: (tradeData: any) => void;
}

export function TradeModal({ isOpen, onClose, asset, action, onConfirm }: TradeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'config' | 'success'>('config');

  const total = quantity * asset.price;
  const fee = total * 0.0012; // 0.12% network fee
  const grandTotal = action === 'BUY' ? total + fee : total - fee;

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate trade processing across ZenVault network
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep('success');
    onConfirm({ asset, action, quantity, total: grandTotal });
  };

  const handleClose = () => {
    setStep('config');
    setQuantity(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden relative z-10"
        >
          {step === 'config' ? (
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                    action === 'BUY' ? 'bg-primary-900 shadow-primary-900/20' : 'bg-rose-500 shadow-rose-500/20'
                  )}>
                    <ArrowRight size={24} className={cn(action === 'SELL' ? 'rotate-180' : '')} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-800 tracking-tight">
                      {action === 'BUY' ? 'Execute Purchase' : 'Execute Sale'}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {asset.name} • {asset.type}
                    </p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-[32px] p-6 space-y-6 border border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Value</span>
                  <span className="font-black text-slate-800 text-lg">{formatCurrency(asset.price, 'USD')}</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Asset Quantity</label>
                  <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 text-center font-black text-xl text-slate-800 outline-none bg-transparent"
                    />
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Fee (0.12%)</span>
                  <span className="text-xs font-bold text-slate-600">{formatCurrency(fee, 'USD')}</span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{action === 'BUY' ? 'Total Commitment' : 'Expected Proceeds'}</span>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none mt-1">
                      {formatCurrency(grandTotal, 'USD')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-2xl text-primary-600 border border-primary-100/50">
                <Info size={18} className="flex-shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                  Orders are executed instantly on the ZenVault distributed ledger. Market volatility may affect final execution price slightly.
                </p>
              </div>

              <Button 
                className={cn(
                  "w-full text-lg py-5 rounded-[24px] uppercase tracking-[0.1em]",
                  action === 'BUY' ? 'bg-primary-900 border-primary-900' : 'bg-rose-600 border-rose-600'
                )}
                isLoading={isProcessing}
                onClick={handleConfirm}
              >
                Confirm {action === 'BUY' ? 'Purchase' : 'Sale'}
              </Button>
            </div>
          ) : (
            <div className="p-8 pb-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-500/40">
                    <CheckCircle2 size={32} />
                  </div>
                </div>
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-150 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Order Successful</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  The {action === 'BUY' ? 'purchase' : 'sale'} of <span className="font-black text-slate-800">{quantity} units</span> of <br/> 
                  <span className="font-black text-primary-600">{asset.name}</span> has been finalized.
                </p>
              </div>

              <div className="bg-slate-50 rounded-[32px] p-6 space-y-3 border border-slate-100">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Transaction Hash</span>
                  <span className="text-slate-800 font-mono">zv_tx_{Math.random().toString(36).substring(7)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Final Amount</span>
                  <span className="text-slate-900">{formatCurrency(grandTotal, 'USD')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Execution Index</span>
                  <span className="text-emerald-600">PREMIUM_NODE_01</span>
                </div>
              </div>

              <Button 
                className="w-full bg-slate-900 text-white rounded-[24px] py-4 uppercase tracking-widest text-xs"
                onClick={handleClose}
              >
                Back to Command Center
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
