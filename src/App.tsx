import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { VirtualCard } from './components/VirtualCard';
import { SpendingChart } from './components/SpendingChart';
import { GoalProgress } from './components/GoalProgress';
import { PaymentScanner } from './components/PaymentScanner';
import { AuthPage } from './components/AuthPage';
import { UtilityPayments } from './components/UtilityPayments';
import { SummaryModal } from './components/SummaryModal';
import { BusinessView } from './components/BusinessView';
import { CreateAccountModal } from './components/CreateAccountModal';
import { ConversionModal } from './components/ConversionModal';
import { AiAssistant } from './components/AiAssistant';
import { Button, Card } from './components/UI';
import { 
  Bell, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Smartphone, 
  Link as LinkIcon, 
  Grid,
  Zap,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Gift,
  Share2,
  X,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { dataService } from './services/dataService';
import { APP_LOGO_URL } from './constants';
import { UserProfile, Account as AccountType, Transaction, Goal, VirtualCard as VirtualCardType } from './types';
import { getExchangeRates, ExchangeRates } from './services/currencyService';
import { cn } from '@/src/lib/utils';

// Mock data for initial fallback
const defaultUser = {
  name: 'Joseph',
  balances: [
    { currency: 'USD', amount: 12500.50 },
  ]
};

const mockTransactions: Transaction[] = [
  { id: '1', userId: 'u1', accountId: 'a1', amount: 45.00, currency: 'USD', type: 'debit', category: 'Shopping', description: 'Amazon.com', timestamp: Date.now() - 3600000, status: 'completed' },
  { id: '2', userId: 'u1', accountId: 'a1', amount: 1200.00, currency: 'USD', type: 'credit', category: 'Salary', description: 'Monthly Paycheck', timestamp: Date.now() - 86400000, status: 'completed' },
  { id: '3', userId: 'u1', accountId: 'a1', amount: 12.50, currency: 'USD', type: 'debit', category: 'Utilities', description: 'Netflix Subscription', timestamp: Date.now() - 172800000, status: 'completed' },
  { id: '4', userId: 'u1', accountId: 'a1', amount: 350.00, currency: 'USD', type: 'debit', category: 'Transfer', description: 'Sent to Sarah', timestamp: Date.now() - 259200000, status: 'completed' },
];

const mockCard: VirtualCardType = {
  id: 'c1',
  userId: 'u1',
  cardNumber: '4532782190124456',
  expiryDate: '08/28',
  cvv: '344',
  cardHolder: 'JOSEPH OLOKA',
  isActive: true,
  type: 'visa'
};

const mockGoal: Goal = {
  id: 'g1',
  userId: 'u1',
  title: 'Tesla Model S Save',
  targetAmount: 50000,
  currentAmount: 12500,
  currency: 'USD'
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<(AccountType & { id: string })[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [mode, setMode] = useState<'personal' | 'business'>('business');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [showUtilitiesModal, setShowUtilitiesModal] = useState(false);

  (window as any).openCreateAccount = () => setShowCreateAccountModal(true);
  (window as any).openConversion = () => setShowConversionModal(true);
  const [utilityCategory, setUtilityCategory] = useState<any>(undefined);
  const [summaryModal, setSummaryModal] = useState<{ 
    type: 'pay' | 'claim'; 
    isOpen: boolean; 
    data: any 
  }>({ 
    isOpen: false, 
    type: 'pay', 
    data: null 
  });
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

  const openUtilities = (category?: any) => {
    setUtilityCategory(category);
    setShowUtilitiesModal(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await dataService.getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser(profile);
        } else {
          // If profile doesn't exist, it will be created during AuthPage success
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Vault User',
            currency: 'USD',
            createdAt: Date.now(),
            securitySetup: false
          });
        }
      } else {
        setUser(null);
        setAccounts([]);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = dataService.subscribeToAccounts(setAccounts);
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    async function fetchRates() {
      const rates = await getExchangeRates(displayCurrency);
      setExchangeRates(rates);
    }
    fetchRates();
  }, [displayCurrency]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-primary-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onComplete={() => {}} />;
  }

  const userName = user.displayName?.split(' ')[0] || 'Member';
  const displayBalances = accounts.length > 0 
    ? accounts.map(a => ({ currency: a.currency, amount: a.balance }))
    : [{ currency: 'USD', amount: 0 }];

  const renderContent = () => {
    if (mode === 'business' && activeTab === 'home') {
      return <BusinessView />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <header className="flex justify-between items-center px-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden p-1.5 hover:scale-110 transition-transform cursor-pointer">
                  <img src={APP_LOGO_URL} alt="ZenVault Logo" className="w-full h-full object-contain" />
                </div>
                <div onClick={() => setActiveTab('home')} className="cursor-pointer">
                  <p className="text-xs text-slate-400 font-medium tracking-tight">Financial Overview</p>
                  <h1 className="font-black text-xl tracking-tight leading-none text-slate-800">{userName}'s Vault</h1>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('pay')}
                  className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-primary-600 transition-colors"
                >
                  <Search size={20} />
                </button>
                <button className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-primary-600 transition-colors relative">
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-luxury-gold rounded-full border-2 border-white" />
                </button>
              </div>
            </header>

            <motion.div variants={itemVariants}>
              <BalanceCard 
                balances={displayBalances} 
                userName={userName} 
                displayCurrency={displayCurrency}
                exchangeRates={exchangeRates}
                onCurrencyChange={setDisplayCurrency}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-x-2 gap-y-4 px-1">
              <QuickAction 
                icon={ArrowUpRight} 
                label="Pay" 
                color="bg-primary-900 text-white shadow-primary-900/10" 
                onClick={() => setSummaryModal({
                  isOpen: true,
                  type: 'pay',
                  data: {
                    title: "Quick Vault Pay",
                    description: "Instant capital transfer to verified local nodes and partners.",
                    stats: [
                      { label: "Vault Limit", value: "$5,000" },
                      { label: "Settle Time", value: "Instant" }
                    ]
                  }
                })}
              />
              <QuickAction 
                icon={ArrowDownLeft} 
                label="Deposit" 
                color="bg-indigo-600 text-white shadow-indigo-600/20" 
                onClick={() => setSummaryModal({
                  isOpen: true,
                  type: 'pay',
                  data: {
                    title: "Asset Deposit",
                    description: "Connect your primary bank account or mobile money to start a secure vault deposit.",
                    stats: [
                      { label: "Providers", value: "Verified Only" },
                      { label: "Method", value: "Bank / Crypto" }
                    ]
                  }
                })}
              />
              <QuickAction 
                icon={Smartphone} 
                label="Network" 
                color="bg-orange-500 text-white shadow-orange-500/20" 
                onClick={() => setSummaryModal({
                  isOpen: true,
                  type: 'pay',
                  data: {
                    title: "Network Status",
                    description: "ZenVault Global Ledger is operational. All 12 regional nodes are healthy.",
                    stats: [
                      { label: "Latency", value: "24ms" },
                      { label: "Nodes", value: "Active" }
                    ]
                  }
                })}
              />
              <QuickAction 
                icon={Plus} 
                label="Add" 
                color="bg-coral-accent text-white shadow-coral-accent/20" 
                onClick={() => setShowCreateAccountModal(true)}
              />
              <QuickAction 
                icon={RefreshCw} 
                label="Convert" 
                color="bg-emerald-600 text-white shadow-emerald-600/20" 
                onClick={() => (window as any).openConversion?.()}
              />
              
              <QuickAction icon={Zap} label="Bills" color="bg-primary-600 text-white shadow-primary-600/10" onClick={() => openUtilities()} />
              <QuickAction 
                icon={LinkIcon} 
                label="Market" 
                color="bg-indigo-premium text-white shadow-indigo-premium/10" 
                onClick={() => setMode('business')}
              />
              <QuickAction 
                icon={Gift} 
                label="Rewards" 
                color="bg-orange-600 text-white shadow-orange-600/10" 
                onClick={() => setSummaryModal({
                  isOpen: true,
                  type: 'claim',
                  data: {
                    title: "Vault Dividends",
                    description: "Claim your daily performance rewards and asset growth bonuses.",
                    stats: [
                      { label: "Available", value: "$24.60" },
                      { label: "Growth", value: "+12%" }
                    ]
                  }
                })}
              />
              <QuickAction 
                icon={Grid} 
                label="Tools" 
                color="bg-slate-800 text-white shadow-slate-800/10" 
                onClick={() => setActiveTab('hub')}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary-900 via-primary-950 to-black p-8 rounded-[32px] text-white flex items-center justify-between shadow-2xl shadow-primary-900/20 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative z-10 space-y-1">
                <p className="font-black text-[10px] uppercase tracking-[0.3em] text-luxury-gold">Exclusive Offer</p>
                <h3 className="text-2xl font-black tracking-tight">Earn $5 Gold</h3>
                <p className="text-xs text-primary-200">Grow your wealth with friends</p>
              </div>
              <Button size="sm" className="relative z-10 rounded-2xl bg-luxury-gold hover:bg-luxury-gold-dark text-primary-950 font-black border-none" onClick={() => setShowInviteModal(true)}>
                Claim
              </Button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <TransactionList transactions={mockTransactions} />
            </motion.div>
          </motion.div>
        );


      case 'cards':
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.header variants={itemVariants} className="flex justify-between items-center px-1">
              <h1 className="font-bold text-2xl">Your Cards</h1>
              <Button variant="secondary" size="icon" className="rounded-full" onClick={() => setSummaryModal({
                isOpen: true,
                type: 'pay',
                data: {
                  title: "Order New Card",
                  description: "Select from physical or virtual titanium cards for your global vault.",
                  stats: [
                    { label: "Delivery", value: "3-5 Days" },
                    { label: "Issuance", value: "Instant" }
                  ]
                }
              })}>
                <Plus size={20} />
              </Button>
            </motion.header>

            <motion.div variants={itemVariants}>
              <VirtualCard card={mockCard} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-4 space-y-4">
                <h3 className="font-bold text-sm">Card Settings</h3>
                <div className="space-y-2">
                  <CardOption icon={ShieldCheck} label="Freeze Card" color="text-indigo-600" action={<Toggle />} />
                  <CardOption icon={Zap} label="Contactless Payments" color="text-orange-500" action={<Toggle defaultChecked />} />
                  <CardOption 
                    icon={Settings} 
                    label="Manage Limits" 
                    color="text-slate-500" 
                    onClick={() => setSummaryModal({
                      isOpen: true,
                      type: 'pay',
                      data: {
                        title: "Limit Manager",
                        description: "Adjust your daily spending and withdrawal limits for maximum security.",
                        stats: [
                          { label: "Daily Limit", value: "$2,000" },
                          { label: "Status", value: "Verified" }
                        ]
                      }
                    })}
                  />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-primary-50 p-6 rounded-[32px] border border-primary-100 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-primary-700 font-black text-sm mb-1 uppercase tracking-widest">Upgrade To Platinum</p>
                <p className="text-xs text-primary-600/60 max-w-[150px] font-medium">Unlock 2.5% cashback & VIP lounge access</p>
              </div>
              <Button size="sm" className="rounded-2xl bg-primary-900 hover:bg-black text-white px-6">Explore</Button>
            </motion.div>
          </motion.div>
        );


      case 'pay':
        return (
          <div className="space-y-6">
            <header className="px-1">
              <h1 className="font-bold text-2xl">Payment</h1>
              <p className="text-slate-400 text-sm mt-1">Scan or use links to transfer</p>
            </header>
            
            <PaymentScanner 
              userId="zen_458821" 
              onScan={(d) => alert(`Scanned Vault Address: ${d}. Preparing secure handshake...`)} 
            />

            <div className="space-y-3">
              <h3 className="font-bold text-sm">Transfer Options</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="p-4 bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center"
                >
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <LinkIcon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">Send via Link</p>
                    <p className="text-[10px] text-slate-400 mt-1">For non-Zen users</p>
                  </div>
                </button>
                <button 
                  onClick={() => alert('Mobile Money Bridge: Connecting to regional telco gateways. Please have your phone ready for PIN prompt.')}
                  className="p-4 bg-white rounded-3xl border border-slate-100 flex flex-col items-center gap-3 text-center"
                >
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">Mobile Money</p>
                    <p className="text-[10px] text-slate-400 mt-1">MTN / Airtel / M-Pesa</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'hub':
        return (
          <motion.div variants={itemVariants} className="space-y-8">
            <motion.header variants={itemVariants} className="px-1">
              <h1 className="font-bold text-2xl">Hub</h1>
              <p className="text-slate-400 text-sm mt-1">Manage goals and utilities</p>
            </motion.header>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              <GoalProgress goal={mockGoal} />
              <div className="space-y-4">
                <Card className="p-4 flex flex-col gap-2 bg-slate-900 text-white border-none h-full justify-center">
                  <Gift size={24} className="text-amber-400" />
                  <div>
                    <p className="font-bold text-sm">Rewards</p>
                    <p className="text-xs opacity-60">You have 450 pts</p>
                  </div>
                </Card>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SpendingChart />
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-black text-lg text-slate-800 tracking-tight uppercase tracking-widest">Vault Services</h3>
                <Grid size={20} className="text-slate-400" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                <HubItem icon={Zap} label="Electricity" color="bg-orange-50 text-orange-600" onClick={() => openUtilities('Power')} />
                <HubItem icon={LinkIcon} label="Internet" color="bg-indigo-50 text-indigo-premium" onClick={() => openUtilities('Internet')} />
                <HubItem icon={Gift} label="Gift Cards" color="bg-coral-accent/10 text-coral-accent" onClick={() => openUtilities('TV')} />
                <HubItem 
                  icon={ChevronRight} 
                  label="Network" 
                  color="bg-slate-50 text-slate-600" 
                  onClick={() => setSummaryModal({
                    isOpen: true,
                    type: 'pay',
                    data: {
                      title: "Partner Network",
                      description: "Explore the global ZenVault partner portal for institutional services.",
                      stats: [
                        { label: "Partners", value: "240+" },
                        { label: "Status", value: "Locked" }
                      ]
                    }
                  })} 
                />
              </div>
            </motion.div>
          </motion.div>
        );


      case 'profile':
        return (
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.header variants={itemVariants} className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary-100 border-4 border-white shadow-xl overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="avatar" />
                </div>
                <button 
                  onClick={() => setActiveTab('cards')}
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-primary-700 transition-colors"
                >
                  <Search size={14} className="rotate-45" />
                </button>
              </div>
              <div className="text-center">
                <h2 className="font-bold text-xl">{user.displayName || 'Vault User'}</h2>
                <p className="text-slate-400 text-sm">{user.email || user.phoneNumber || 'ZenVault Member'}</p>
              </div>
            </motion.header>

            <motion.div variants={itemVariants} className="space-y-2">
              <ProfileOption 
                icon={ShieldCheck} 
                label="Personal Information" 
                color="text-indigo-600" 
                onClick={() => setSummaryModal({
                  isOpen: true,
                  type: 'pay',
                  data: {
                    title: "Identity Vault",
                    description: "Manage your verified identity records and biometric encryption keys.",
                    stats: [
                      { label: "Verified", value: "Level 3" },
                      { label: "Status", value: "Protected" }
                    ]
                  }
                })} 
              />
              <ProfileOption 
                icon={ShieldCheck} 
                label="Security & Privacy" 
                color="text-orange-500" 
                onClick={() => setSummaryModal({
                  isOpen: true,
                  type: 'pay',
                  data: {
                    title: "Security Center",
                    description: "ZenVault uses post-quantum encryption protocols to secure your global assets.",
                    stats: [
                      { label: "MFA", value: "Active" },
                      { label: "Protocol", value: "PQ-RSA" }
                    ]
                  }
                })} 
              />
              <ProfileOption icon={Settings} label="General Settings" color="text-slate-500" onClick={() => setActiveTab('hub')} />
              <ProfileOption icon={Share2} label="Refer a Friend" color="text-primary-600" onClick={() => setShowInviteModal(true)} />
              <ProfileOption icon={LogOut} label="Log Out" color="text-coral-accent" onClick={() => auth.signOut()} />
            </motion.div>

            <motion.div variants={itemVariants} className="text-center mt-8">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Version 1.0.4 (Beta)</p>
            </motion.div>
          </motion.div>
        );


      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} mode={mode} onModeChange={setMode}>
      {renderContent()}

      <AnimatePresence>
        {showInviteModal && (
          <div key="invite-modal" className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-sm bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-luxury-gold via-primary-600 to-luxury-gold"></div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-2xl tracking-tight text-slate-800">Invite to ZenVault</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col items-center gap-6 border-2 border-dashed border-primary-100 relative group">
                <div className="p-5 bg-white rounded-[24px] shadow-sm group-hover:scale-110 transition-transform">
                  <LinkIcon size={40} className="text-primary-600" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono font-bold bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 text-primary-700">
                    zenvault.app/vault/j-oloka-88
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-center text-[11px] text-slate-500 font-medium leading-relaxed px-4">
                  When your friend unlocks their first Vault using this link, you both receive a <span className="font-black text-primary-600">$5.00</span> reward.
                </p>
                <Button className="w-full gap-3 py-5 rounded-[24px] shadow-2xl shadow-primary-200 bg-primary-900 hover:bg-black text-white text-lg font-black">
                  <Share2 size={20} />
                  Share Vault Key
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showCreateAccountModal && (
          <CreateAccountModal onClose={() => setShowCreateAccountModal(false)} />
        )}

        {showConversionModal && (
          <ConversionModal 
            accounts={accounts} 
            exchangeRates={exchangeRates} 
            onClose={() => setShowConversionModal(false)}
            onConvert={async (from, to, amt) => {
              await dataService.convertCurrency(from, to, amt, exchangeRates);
            }}
          />
        )}

        {showUtilitiesModal && (
          <div key="utilities-modal" className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="w-full max-w-md bg-white h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-[48px] sm:rounded-[48px] overflow-hidden shadow-2xl"
            >
              <UtilityPayments 
                initialCategory={utilityCategory}
                onClose={() => setShowUtilitiesModal(false)}
                onPaymentComplete={(details) => {
                  console.log('Payment complete:', details);
                }}
              />
            </motion.div>
          </div>
        )}

        {summaryModal.isOpen && (
          <SummaryModal 
            onClose={() => setSummaryModal(prev => ({ ...prev, isOpen: false }))}
            type={summaryModal.type}
            data={summaryModal.data}
          />
        )}
      </AnimatePresence>
      <AiAssistant />
    </Layout>
  );
}

// Subcomponents helper logic
function QuickAction({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
      <button className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 shadow-lg",
        color
      )}>
        <Icon size={24} strokeWidth={2.5} />
      </button>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">{label}</span>
    </div>
  );
}

function CardOption({ icon: Icon, label, color, action, onClick }: { icon: any, label: string, color?: string, action?: React.ReactNode, onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between py-2 cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-slate-50", color)}>
          <Icon size={18} />
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {action || <ChevronRight size={16} className="text-slate-300" />}
    </div>
  );
}

function ProfileOption({ icon: Icon, label, color, onClick }: { icon: any, label: string, color?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-white rounded-3xl border border-slate-50 hover:bg-slate-50 transition-colors pointer-cursor">
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-2xl bg-slate-100 text-slate-600", color && "bg-red-50")}>
          <Icon size={20} className={color} />
        </div>
        <span className={cn("font-bold text-sm", color)}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-slate-300" />
    </button>
  );
}

function HubItem({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={onClick}>
      <button className={cn("p-4 rounded-[1.5rem] transition-all hover:scale-105 active:scale-95", color)}>
        <Icon size={20} />
      </button>
      <span className="text-[9px] font-extrabold text-slate-400 uppercase text-center leading-tight">{label}</span>
    </div>
  );
}

function Toggle({ defaultChecked = false }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button 
      onClick={() => setChecked(!checked)}
      className={cn(
        "w-10 h-5 rounded-full p-1 transition-colors relative",
        checked ? "bg-primary-600" : "bg-slate-200"
      )}
    >
      <motion.div 
        animate={{ x: (checked ? 20 : 0) }}
        initial={false}
        className="w-3 h-3 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}
