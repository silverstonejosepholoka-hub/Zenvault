import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { VirtualCard as VirtualCardType } from '@/src/types';
import { formatCardNumber } from '@/src/lib/utils';

export function VirtualCard({ card }: { card: VirtualCardType }) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="perspective-1000 w-full h-56 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary-900 to-black rounded-[32px] p-8 text-white shadow-2xl overflow-hidden border border-white/5 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-12 h-10 bg-luxury-gold/20 rounded-lg border border-luxury-gold/40 shadow-inner flex items-center justify-center">
              <div className="w-8 h-6 bg-luxury-gold/10 rounded-sm border border-luxury-gold/30" />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase">Virtual Card</span>
              <p className="text-xs font-black tracking-widest mt-1 text-luxury-gold">PREMIER VAULT</p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-center group" onClick={(e) => { e.stopPropagation(); setRevealed(!revealed); }}>
              <h3 className="text-2xl font-mono tracking-[0.15em] text-white">
                {revealed ? formatCardNumber(card.cardNumber) : '•••• •••• •••• ' + card.cardNumber.slice(-4)}
              </h3>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity text-luxury-gold">
                {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="flex justify-between items-end mt-6">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Card Holder</p>
                <p className="text-xs font-black tracking-tight uppercase text-primary-200">{card.cardHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1">Expires</p>
                <p className="text-xs font-black text-primary-200">{card.expiryDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary-950 to-black rounded-[32px] text-white shadow-2xl overflow-hidden border border-white/5 rotate-y-180 flex flex-col py-8">
          <div className="w-full h-12 bg-black/80 my-4" />
          <div className="px-8 mt-4 flex justify-between items-center">
            <div className="w-40 h-8 bg-white/10 rounded flex items-center px-3">
              <div className="w-full h-1 bg-white/20 rounded-full" />
            </div>
            <div className="bg-luxury-gold text-primary-950 px-4 py-1.5 rounded-lg font-mono font-black">
              {card.cvv}
            </div>
          </div>
          <div className="px-8 mt-auto">
            <p className="text-[8px] text-white/20 max-w-[200px] leading-tight font-bold uppercase tracking-wider">
              This digital card is property of ZenWallet. Private use only. Secured by Gold-Standard Encryption.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
