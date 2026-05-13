import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, TrendingUp, RefreshCw, ChevronDown } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { ExchangeRates, convertCurrency } from '@/src/services/currencyService';

interface BalanceCardProps {
  balances: { currency: string; amount: number }[];
  userName: string;
  displayCurrency: string;
  exchangeRates: ExchangeRates | null;
  onCurrencyChange: (currency: string) => void;
}

const SUPPORTED_DISPLAY_CURRENCIES = ['USD', 'EUR', 'UGX', 'KES', 'GBP'];

export function BalanceCard({ 
  balances, 
  userName, 
  displayCurrency, 
  exchangeRates,
  onCurrencyChange 
}: BalanceCardProps) {
  const [index, setIndex] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const current = balances[index];

  const totalAssets = useMemo(() => {
    if (!exchangeRates) return null;
    return balances.reduce((total, b) => {
      return total + convertCurrency(b.amount, b.currency, displayCurrency, exchangeRates);
    }, 0);
  }, [balances, displayCurrency, exchangeRates]);

  const convertedCurrent = useMemo(() => {
    if (!exchangeRates || current.currency === displayCurrency) return null;
    return convertCurrency(current.amount, current.currency, displayCurrency, exchangeRates);
  }, [current, displayCurrency, exchangeRates]);

  return (
    <div className="bg-gradient-to-br from-primary-900 via-primary-950 to-indigo-premium/20 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-900/40 min-h-[280px] flex flex-col justify-between border border-white/5">
      {/* Decorative Blur Accents */}
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-premium/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20px] left-[-20px] w-40 h-40 bg-coral-accent/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-primary-300 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                Available Balance
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
              
              <div className="relative">
                <button 
                  onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10"
                >
                  Base: {displayCurrency}
                  <ChevronDown size={12} className={cn("transition-transform", showCurrencyPicker && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showCurrencyPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-32 bg-primary-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-1"
                    >
                      {SUPPORTED_DISPLAY_CURRENCIES.map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            onCurrencyChange(curr);
                            setShowCurrencyPicker(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors",
                            displayCurrency === curr ? "bg-white/20 text-white" : "hover:bg-white/10 text-white/60"
                          )}
                        >
                          {curr}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index + (showBalance ? 'v' : 'h')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-1"
                >
                  <h2 className="text-4xl font-black tracking-tight text-white">
                    {showBalance ? formatCurrency(current.amount, current.currency) : '••••••'}
                  </h2>
                  {showBalance && convertedCurrent && (
                    <p className="text-xs text-primary-300 font-bold opacity-80">
                      ≈ {formatCurrency(convertedCurrent, displayCurrency)}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
              <button 
                onClick={() => setShowBalance(!showBalance)} 
                className={cn(
                  "p-1.5 hover:bg-white/10 rounded-full transition-colors opacity-60",
                  !showBalance && "text-primary-300 opacity-100"
                )}
              >
                {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          <button 
            onClick={() => setIndex((prev) => (prev + 1) % balances.length)}
            className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition-all active:scale-90 ml-4 h-fit border border-white/10"
          >
            <RefreshCw size={24} className="text-white" />
          </button>
        </div>

        <div className="flex gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {balances.map((b, idx) => (
            <button
              key={`${b.currency}-${idx}`}
              onClick={() => setIndex(idx)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all border shrink-0",
                index === idx
                  ? "bg-luxury-gold border-luxury-gold text-primary-950 shadow-lg shadow-luxury-gold/40"
                  : "bg-transparent border-white/20 text-white/40 hover:text-white/60 hover:border-white/40"
              )}
            >
              {b.currency}
            </button>
          ))}
          <button
            onClick={() => (window as any).openCreateAccount?.()}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white/80 hover:bg-white/10 transition-all shrink-0"
          >
            <RefreshCw size={14} className="rotate-45" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-end mt-8 border-t border-white/5 pt-6">
        <div>
          <p className="text-[10px] text-luxury-gold font-black uppercase tracking-[0.2em] mb-2">Total Net Assets ({displayCurrency})</p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black tracking-tight text-white">
              {showBalance ? (totalAssets ? formatCurrency(totalAssets, displayCurrency) : '---') : '••••••'}
            </h3>
            {totalAssets && showBalance && (
              <span className="flex items-center text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                <TrendingUp size={10} className="mr-1" />
                +2.4%
              </span>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex -space-x-3 mb-3 justify-end">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full border-2 border-primary-950 overflow-hidden bg-slate-200 shadow-sm"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}${i}`} alt="user" />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider mb-0.5">Account Guardian</p>
          <p className="text-xs font-black uppercase tracking-tight text-white">{userName} Oloka</p>
        </div>
      </div>
    </div>
  );
}
