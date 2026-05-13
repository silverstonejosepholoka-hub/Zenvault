import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, CreditCard, QrCode, Grid, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  mode: 'personal' | 'business';
  onModeChange: (mode: 'personal' | 'business') => void;
}

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'cards', icon: CreditCard, label: 'Cards' },
  { id: 'pay', icon: QrCode, label: 'Pay' },
  { id: 'hub', icon: Grid, label: 'Hub' },
  { id: 'profile', icon: User, label: 'Profile' },
];

interface NavItemProps {
  tab: any;
  isActive: boolean;
  onClick: () => void;
  vertical?: boolean;
  key?: any;
}

function NavItem({ tab, isActive, onClick, vertical = false }: NavItemProps) {
  const Icon = tab.icon;
  
  if (tab.id === 'pay' && !vertical) {
    return (
      <button
        onClick={onClick}
        className="w-16 h-16 bg-primary-600 rounded-[28px] flex items-center justify-center text-white -mt-10 border-4 border-primary-950 shadow-xl shadow-primary-900/40 transition-all active:scale-95 group"
      >
        <div className="group-hover:rotate-12 transition-transform">
          <Icon size={28} strokeWidth={2.5} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center transition-all group",
        vertical ? "flex-row gap-4 w-full px-6 py-4 rounded-3xl" : "gap-1.5 w-16",
        isActive ? (vertical ? "bg-primary-900/40 text-luxury-gold shadow-inner border border-white/5" : "text-luxury-gold") : "text-white/40 hover:text-white/60"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-2xl transition-all",
        isActive && !vertical ? "bg-white/10" : "bg-transparent",
        vertical && "p-0"
      )}>
        <Icon size={vertical ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span className={cn(
        "font-black uppercase tracking-widest transition-all",
        vertical ? "text-xs" : "text-[10px] leading-none",
        !vertical && (isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0')
      )}>
        {tab.label}
      </span>
    </button>
  );
}

export function Layout({ children, activeTab, onTabChange, mode, onModeChange }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-primary-950 font-sans text-slate-900 relative overflow-hidden">
      {/* Wealth Pattern Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.05]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="coin-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="60" cy="60" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#coin-pattern)" />
        </svg>
      </div>

      {/* Decorative Luxury Circles - More Diverse Colors */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] aspect-square bg-indigo-premium/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[25%] aspect-square bg-coral-accent/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col fixed left-0 top-0 h-screen bg-primary-950/80 backdrop-blur-3xl border-r border-white/10 z-[60] p-8 justify-between">
        <div className="space-y-12">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/30 group-hover:scale-105 transition-transform">
              <div className="w-6 h-6 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">ZenVault</h1>
          </div>

          <nav className="space-y-3">
            {tabs.map((tab) => (
              <NavItem 
                key={tab.id} 
                tab={tab} 
                isActive={activeTab === tab.id} 
                onClick={() => onTabChange(tab.id)} 
                vertical 
              />
            ))}
          </nav>
        </div>

        <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white/20 overflow-hidden shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph`} alt="avatar" />
            </div>
            <div>
              <p className="text-sm font-black text-white">Joseph Oloka</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Member</p>
            </div>
          </div>
          <button 
            onClick={() => onTabChange('profile')} // Navigate to profile for logout option, or I could pass a logout handler
            className="w-full py-3 bg-white text-primary-950 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-luxury-cream transition-colors"
          >
            Manage Profile
          </button>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10 lg:pl-72">
        <header className="h-20 bg-white/10 backdrop-blur-3xl border-b border-white/5 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-50 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/20">
              <div className="w-5 h-5 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-800">ZenVault</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white overflow-hidden shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph`} alt="avatar" />
            </div>
          </div>
        </header>

        {/* Global Action Bar (Personal/Business) */}
        <div className="h-16 flex items-center justify-center lg:justify-end lg:px-12 sticky top-0 lg:top-8 z-40 bg-transparent pointer-events-none">
          <div className="pointer-events-auto flex gap-2 bg-white/80 backdrop-blur-xl p-1.5 rounded-full border border-slate-200 shadow-xl shadow-primary-950/10">
            <button 
              onClick={() => onModeChange('personal')}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                mode === 'personal' ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Personal
            </button>
            <button 
              onClick={() => onModeChange('business')}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                mode === 'business' ? "bg-primary-900 text-white shadow-lg shadow-primary-900/20" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Business
            </button>
          </div>
        </div>

        <main className="flex-1 pb-24 lg:pb-12 w-full max-w-4xl mx-auto px-4 sm:px-8 mt-4 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.22, 1, 0.36, 1] // Custom quintic ease-out for a more "luxurious" feel
              }}
              className="bg-white min-h-[calc(100vh-12rem)] shadow-2xl shadow-primary-950/60 border border-white/5 overflow-hidden rounded-[48px] sm:rounded-[60px]"
            >
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.1
                    }
                  }
                }}
                className="p-6 sm:p-10 lg:p-12 h-full"
              >
                {children}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-6 left-6 right-6 z-50 bg-primary-950/90 backdrop-blur-3xl border border-white/10 flex items-center justify-around h-20 rounded-[40px] shadow-2xl px-4">
          {tabs.map((tab) => (
            <NavItem 
              key={tab.id} 
              tab={tab} 
              isActive={activeTab === tab.id} 
              onClick={() => onTabChange(tab.id)} 
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
