import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Tv, 
  GraduationCap, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2,
  Calendar,
  Clock,
  Info,
  Shield,
  FileText
} from 'lucide-react';
import { Button } from './UI';
import { cn } from '@/src/lib/utils';
import { formatCurrency } from '@/src/lib/utils';

type Category = 'Power' | 'Water' | 'Internet' | 'TV' | 'Education' | 'Insurance' | 'Taxes';

interface Biller {
  id: string;
  name: string;
  logo?: string;
  placeholder: string;
}

const BILLERS: Record<Category, Biller[]> = {
  Power: [
    { id: 'umeme', name: 'Umeme Yaka', placeholder: 'Meter Number' },
    { id: 'uedcl', name: 'UEDCL', placeholder: 'Account Number' },
    { id: 'power_hub', name: 'PowerHub Global', placeholder: 'Wallet ID' },
  ],
  Water: [
    { id: 'nwsc', name: 'NWSC', placeholder: 'Customer Reference' },
    { id: 'water_corp', name: 'City Water Corp', placeholder: 'Account ID' },
  ],
  Internet: [
    { id: 'zuku', name: 'Zuku Fiber', placeholder: 'Account ID' },
    { id: 'liquid', name: 'Liquid Intelligent', placeholder: 'Customer ID' },
    { id: 'roke', name: 'Roke Telkom', placeholder: 'Account Number' },
    { id: 'starlink', name: 'Starlink Premium', placeholder: 'Service Node ID' },
  ],
  TV: [
    { id: 'dstv', name: 'DSTV', placeholder: 'Smart Card Number' },
    { id: 'gotv', name: 'GOtv', placeholder: 'IUC Number' },
    { id: 'startimes', name: 'StarTimes', placeholder: 'Smart Card Number' },
    { id: 'canalsat', name: 'Canal+ Digital', placeholder: 'Decoder ID' },
  ],
  Education: [
    { id: 'fees', name: 'School Fees Pay', placeholder: 'Student ID / Payment Code' },
    { id: 'univerity', name: 'Vault University', placeholder: 'Student Registration' },
    { id: 'exams', name: 'National Exam Board', placeholder: 'Index Number' },
  ],
  Insurance: [
    { id: 'liberty', name: 'Liberty Life', placeholder: 'Policy Number' },
    { id: 'jubilee', name: 'Jubilee Health', placeholder: 'Membership ID' },
    { id: 'uap', name: 'UAP Old Mutual', placeholder: 'Policy Reference' },
  ],
  Taxes: [
    { id: 'ura', name: 'Revenue Authority', placeholder: 'PRN Number' },
    { id: 'kcca', name: 'City Council', placeholder: 'Customer Number' },
  ],
};

const CATEGORY_ICONS: Record<Category, any> = {
  Power: Zap,
  Water: Droplets,
  Internet: Wifi,
  TV: Tv,
  Education: GraduationCap,
  Insurance: Shield,
  Taxes: FileText,
};

const CATEGORY_COLORS: Record<Category, string> = {
  Power: 'bg-orange-50 text-orange-600',
  Water: 'bg-indigo-50 text-indigo-600',
  Internet: 'bg-indigo-premium/10 text-indigo-premium',
  TV: 'bg-coral-accent/10 text-coral-accent',
  Education: 'bg-emerald-50 text-emerald-600',
  Insurance: 'bg-primary-50 text-primary-600',
  Taxes: 'bg-slate-100 text-slate-800',
};

interface UtilityPaymentsProps {
  onClose: () => void;
  onPaymentComplete: (details: any) => void;
  initialCategory?: Category;
}

export function UtilityPayments({ onClose, onPaymentComplete, initialCategory }: UtilityPaymentsProps) {
  const [step, setStep] = useState<'categories' | 'billers' | 'details' | 'confirm'>(initialCategory ? 'billers' : 'categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(initialCategory || null);
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly');

  const handleBillerSelect = (biller: Biller) => {
    setSelectedBiller(biller);
    setStep('details');
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep('billers');
  };

  const handlePay = () => {
    setStep('confirm');
    setTimeout(() => {
      onPaymentComplete({
        biller: selectedBiller?.name,
        amount: parseFloat(amount),
        account: accountNumber,
        recurring: isRecurring,
        frequency: isRecurring ? frequency : null
      });
      onClose();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="flex items-center justify-between p-6 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          {step !== 'categories' && step !== 'confirm' && (
            <button 
              onClick={() => {
                if (step === 'billers') setStep('categories');
                if (step === 'details') setStep('billers');
              }}
              className="p-2 hover:bg-slate-50 rounded-full text-slate-400"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 className="text-xl font-black tracking-tight text-slate-800">
            {step === 'categories' ? 'Pay Bills' : selectedCategory}
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-400 font-bold text-sm">Close</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {step === 'categories' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-4"
            >
              {(Object.keys(BILLERS) as Category[]).map((cat) => {
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center gap-4 hover:border-primary-200 hover:shadow-md transition-all active:scale-95 group"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner",
                      CATEGORY_COLORS[cat]
                    )}>
                      <Icon size={28} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{cat}</span>
                  </button>
                );
              })}
            </motion.div>
          )}

          {step === 'billers' && selectedCategory && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Provider</p>
              {BILLERS[selectedCategory].map((biller) => (
                <button
                  key={biller.id}
                  onClick={() => handleBillerSelect(biller)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-[24px] border border-slate-100 shadow-sm hover:border-indigo-100 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                      {biller.name.charAt(0)}
                    </div>
                    <span className="font-black text-sm text-slate-800">{biller.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-slate-300" />
                </button>
              ))}
            </motion.div>
          )}

          {step === 'details' && selectedBiller && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 bg-primary-800 rounded-[32px] text-white shadow-xl shadow-primary-900/10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Paying To</p>
                <h3 className="text-2xl font-black tracking-tight">{selectedBiller.name}</h3>
                <p className="text-xs text-primary-200 mt-2 flex items-center gap-1">
                  <Info size={12} /> Instant processing verified
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Account Information</label>
                  <input 
                    type="text"
                    placeholder={selectedBiller.placeholder}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-[24px] px-6 py-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Amount</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">UGX</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border-2 border-slate-100 rounded-[24px] pl-20 pr-6 py-4 outline-none focus:border-indigo-500 transition-all text-2xl font-black text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">Scheduled Payment</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Automate this bill</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all relative",
                        isRecurring ? "bg-primary-600" : "bg-slate-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: isRecurring ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isRecurring && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2"
                      >
                        <div className="flex gap-2">
                          {['weekly', 'monthly'].map((freq) => (
                            <button
                              key={freq}
                              onClick={() => setFrequency(freq as any)}
                              className={cn(
                                "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                frequency === freq ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20" : "bg-slate-100 text-slate-400"
                              )}
                            >
                              Every {freq === 'weekly' ? 'Week' : 'Month'}
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-primary-500 mt-3 font-bold flex items-center gap-1">
                          <Clock size={10} /> Payment will be initiated on this date {frequency === 'monthly' ? 'every month' : 'next week'}.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <Button 
                className="w-full py-5 rounded-[28px] shadow-xl text-lg mt-4" 
                disabled={!amount || !accountNumber}
                onClick={handlePay}
              >
                Continue to Pay
              </Button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-6"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[32px] flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-800 mb-2">Payment Sent!</h2>
              <p className="text-slate-500 font-medium">Your {selectedBiller?.name} bill was paid successfully.</p>
              
              <div className="w-full mt-10 space-y-3">
                <div className="flex justify-between py-3 border-b border-dashed border-slate-200">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Amount Paid</span>
                  <span className="text-sm font-black text-slate-800">{formatCurrency(parseFloat(amount), 'UGX')}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Account</span>
                  <span className="text-sm font-black text-slate-800">{accountNumber}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
