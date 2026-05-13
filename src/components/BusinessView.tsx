import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Globe, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight,
  Briefcase,
  Maximize2,
  Sparkles,
  Zap,
  Brain,
  ShieldCheck,
  Lightbulb,
  History,
  ChevronLeft,
  ChevronRight,
  Bell,
  AlertTriangle,
  X
} from 'lucide-react';
import { Card, Button } from './UI';
import { cn, formatCurrency } from '@/src/lib/utils';
import { getStockAdvice, StockInsight } from '@/src/services/geminiService';
import { TradeModal } from './TradeModal';
import { PriceAlertModal } from './PriceAlertModal';
import { dataService } from '@/src/services/dataService';
import { TradeOrder, PriceAlert } from '@/src/types';
import { APP_LOGO_URL } from '../constants';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  Cell,
  ComposedChart
} from 'recharts';

const INITIAL_STOCKS = [
  { name: 'AAPL', price: 185.92, change: '+1.2%', trend: 'up', type: 'Technology' },
  { name: 'MSFT', price: 412.30, change: '-0.5%', trend: 'down', type: 'Technology' },
  { name: 'GOOGL', price: 142.15, change: '+0.8%', trend: 'up', type: 'Technology' },
  { name: 'TSLA', price: 175.05, change: '-2.4%', trend: 'down', type: 'Automotive' },
];

const MOCK_TRADES: TradeOrder[] = [
  {
    id: 'tr_1',
    userId: 'user_1',
    symbol: 'AAPL',
    type: 'BUY',
    quantity: 10,
    price: 182.50,
    total: 1825.00,
    currency: 'USD',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: 'completed'
  },
  {
    id: 'tr_2',
    userId: 'user_1',
    symbol: 'TSLA',
    type: 'SELL',
    quantity: 5,
    price: 178.20,
    total: 891.00,
    currency: 'USD',
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    status: 'completed'
  },
  {
    id: 'tr_3',
    userId: 'user_1',
    symbol: 'MSFT',
    type: 'BUY',
    quantity: 2,
    price: 410.50,
    total: 821.00,
    currency: 'USD',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    status: 'completed'
  },
  {
    id: 'tr_4',
    userId: 'user_1',
    symbol: 'GOOGL',
    type: 'BUY',
    quantity: 15,
    price: 140.10,
    total: 2101.50,
    currency: 'USD',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    status: 'completed'
  },
  {
    id: 'tr_5',
    userId: 'user_1',
    symbol: 'AAPL',
    type: 'SELL',
    quantity: 8,
    price: 186.20,
    total: 1489.60,
    currency: 'USD',
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    status: 'completed'
  }
];

const INITIAL_FOREX = [
  { pair: 'EUR/USD', rate: 1.0852, change: '+0.05%' },
  { pair: 'GBP/USD', rate: 1.2640, change: '-0.12%' },
  { pair: 'USD/JPY', rate: 151.42, change: '+0.32%' },
];

const NEWS_DATA = [
  {
    title: "Global Supply Chains Stabilize as Shipping Costs Hit Pre-Pandemic Levels",
    source: "Bloomberg",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=60",
    time: "1h ago",
    url: "https://www.bloomberg.com/markets",
    logo: "https://logo.clearbit.com/bloomberg.com"
  },
  {
    title: "Asian Markets Outlook: Tokyo Stock Exchange Reaches Historic Highs",
    source: "Global Finance",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=60",
    time: "45m ago",
    url: "https://www.gfmag.com",
    logo: "https://logo.clearbit.com/gfmag.com"
  },
  {
    title: "Green Energy Investment Surges to Record Highs in EMEA Region",
    source: "Reuters",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=60",
    time: "3h ago",
    url: "https://www.reuters.com/business/",
    logo: "https://logo.clearbit.com/reuters.com"
  },
  {
    title: "European Central Bank Holds Rates Steady Amidst Economic Recovery",
    source: "Forbes Markets",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=60",
    time: "2h ago",
    url: "https://www.forbes.com/markets/",
    logo: "https://logo.clearbit.com/forbes.com"
  },
  {
    title: "Federal Reserve Signals Potential Shift in Monetary Policy for Q3",
    source: "WSJ",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=60",
    time: "6h ago",
    url: "https://www.wsj.com/news/markets",
    logo: "https://logo.clearbit.com/wsj.com"
  },
  {
    title: "Wall Street Prep: Tech Sector Earnings to Watch This Week",
    source: "Investor Daily",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60",
    time: "5h ago",
    url: "https://www.investordaily.com.au",
    logo: "https://logo.clearbit.com/investordaily.com.au"
  }
];

const CANDLESTICK_DATA: Record<string, any[]> = {
  '1D': [
    { time: '09:00', open: 180, close: 182, high: 184, low: 178 },
    { time: '10:00', open: 182, close: 185, high: 186, low: 181 },
    { time: '11:00', open: 185, close: 183, high: 187, low: 182 },
    { time: '12:00', open: 183, close: 186, high: 188, low: 183 },
    { time: '13:00', open: 186, close: 184, high: 187, low: 183 },
    { time: '14:00', open: 184, close: 188, high: 189, low: 184 },
    { time: '15:00', open: 188, close: 185, high: 190, low: 184 },
  ],
  '5D': [
    { time: 'Mon', open: 175, close: 178, high: 180, low: 173 },
    { time: 'Tue', open: 178, close: 182, high: 184, low: 177 },
    { time: 'Wed', open: 182, close: 180, high: 183, low: 179 },
    { time: 'Thu', open: 180, close: 185, high: 186, low: 179 },
    { time: 'Fri', open: 185, close: 188, high: 190, low: 184 },
  ],
  '1M': [
    { time: 'W1', open: 160, close: 165, high: 168, low: 158 },
    { time: 'W2', open: 165, close: 172, high: 175, low: 163 },
    { time: 'W3', open: 172, close: 170, high: 174, low: 168 },
    { time: 'W4', open: 170, close: 185, high: 188, low: 169 },
  ],
  '6M': [
    { time: 'Jan', open: 140, close: 155, high: 160, low: 135 },
    { time: 'Feb', open: 155, close: 150, high: 158, low: 148 },
    { time: 'Mar', open: 150, close: 165, high: 170, low: 145 },
    { time: 'Apr', open: 165, close: 160, high: 168, low: 158 },
    { time: 'May', open: 160, close: 175, high: 180, low: 155 },
    { time: 'Jun', open: 175, close: 185, high: 190, low: 170 },
  ],
  '1Y': [
    { time: '2023 Q1', open: 120, close: 145, high: 150, low: 115 },
    { time: '2023 Q2', open: 145, close: 135, high: 148, low: 130 },
    { time: '2023 Q3', open: 135, close: 160, high: 165, low: 132 },
    { time: '2023 Q4', open: 160, close: 180, high: 185, low: 155 },
  ],
};

const MARKET_CHART = [
  { time: '09:00', value: 4200 },
  { time: '10:00', value: 4230 },
  { time: '11:00', value: 4215 },
  { time: '12:00', value: 4250 },
  { time: '13:00', value: 4280 },
  { time: '14:00', value: 4260 },
  { time: '15:00', value: 4300 },
];

interface TimeframeButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  key?: string;
}

const TimeframeButton = ({ active, onClick, children }: TimeframeButtonProps) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active 
        ? 'bg-primary-900 shadow-lg shadow-primary-900/20 text-white' 
        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

const TradeHistorySection = ({ trades }: { trades: TradeOrder[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(trades.length / itemsPerPage);
  
  const paginatedTrades = trades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="font-black text-xl tracking-tight text-slate-800">Trading History</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-white border border-slate-100 rounded-lg text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        {paginatedTrades.map((trade, i) => {
          const isBuy = trade.type === 'BUY';

          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={trade.id}
              className="flex items-center justify-between p-4 bg-white hover:bg-slate-50 rounded-[28px] border border-slate-200/40 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                  isBuy ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {isBuy ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-slate-800 leading-tight">{trade.symbol}</p>
                    <span className={cn(
                      "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                      isBuy ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    )}>
                      {trade.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      {trade.quantity} Units @ ${trade.price}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium opacity-60">
                      {new Date(trade.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black tracking-tight text-slate-900">
                  {formatCurrency(trade.total, trade.currency)}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className={cn(
                    "w-1 h-1 rounded-full",
                    trade.status === 'completed' ? "bg-emerald-500" : 
                    trade.status === 'pending' ? "bg-amber-500" : "bg-rose-500"
                  )} />
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{trade.status}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const CandlestickShape = (props: any) => {
  const {
    fill,
    x,
    y,
    width,
    height,
    open,
    close,
    high,
    low,
  } = props;

  const isUp = close >= open;
  const candleColor = isUp ? '#10b981' : '#f43f5e';
  const wickColor = isUp ? '#059669' : '#e11d48';

  // Calculate coordinates
  // Recharts 'y' is the top of the bar, 'height' is the length of the bar.
  // We need to map our high/low/open/close to the SVG coordinate system.
  // The 'props' passed to a custom bar shape include the data values, 
  // but Recharts has already scaled them to pixels.
  // However, we need to know the scale to draw the wick correctly.
  
  // Since Recharts doesn't easily expose the scale in the 'shape' props, 
  // we'll use the coordinate values if they were mapped correctly.
  // Wait, Recharts custom shape props: x, y, width, height are the bounding box of the Bar.
  // For candlestick, we need the high/low coordinates too.
  
  // A better way is to use a custom component that has access to the internal scale.
  // But we can also pass the coordinates as data keys if we calculate them or use specific mapping.
  
  // Let's use a standard approach where we draw the wick from high to low 
  // and the candle from open to close.
  
  // For simplicity and robustness within Recharts, we can use 
  // multiple Bars for wicks and body if we transform the data.
  // But let's try a custom SVG component that receives the scaled y-coordinates.
  
  if (x === undefined || y === undefined) return null;

  const ratio = height / Math.abs(open - close);
  const highY = y - (high - Math.max(open, close)) * ratio;
  const lowY = y + height + (Math.min(open, close) - low) * ratio;

  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={wickColor}
        strokeWidth={1.5}
      />
      {/* Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={candleColor}
        rx={2}
      />
    </g>
  );
};

const ForexSparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-8 w-16">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          fill={color} 
          fillOpacity={0.1} 
          strokeWidth={1.5} 
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const INVESTMENT_OPTIONS = [
  {
    type: 'Mutual Fund',
    name: 'Zen Global Growth',
    description: 'Diversified exposure to leading tech and sustainable energy firms globally.',
    risk: 'Medium',
    icon: BarChart3,
    color: 'bg-emerald-50 text-emerald-600',
    price: 1245.80
  },
  {
    type: 'ETF',
    name: 'Vault S&P 500 Index',
    description: 'Passive tracking of the 500 largest US companies with ultra-low expense ratios.',
    risk: 'Low',
    icon: Globe,
    color: 'bg-indigo-50 text-indigo-600',
    price: 432.15
  },
  {
    type: 'Alternative',
    name: 'Tokenized Real Estate',
    description: 'Fractional ownership in prime commercial properties across EMEA markets.',
    risk: 'High',
    icon: Briefcase,
    color: 'bg-orange-50 text-orange-600',
    price: 5240.00
  },
  {
    type: 'ETF',
    name: 'Post-Quantum Tech',
    description: 'Strategic investment in firms leading the transition to quantum-safe systems.',
    risk: 'High',
    icon: Zap,
    color: 'bg-coral-accent/10 text-coral-accent',
    price: 89.42
  }
];

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

export function BusinessView() {
  const [viewMode, setViewMode] = useState<'market' | 'history'>('market');
  const [timeframe, setTimeframe] = useState('1D');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stocks, setStocks] = useState(INITIAL_STOCKS);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [alertingStock, setAlertingStock] = useState<{ symbol: string; price: number } | null>(null);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);
  const [forex, setForex] = useState(INITIAL_FOREX);
  const [lastUpdate, setLastUpdate] = useState<Record<string, 'up' | 'down' | null>>({});
  const [aiInsight, setAiInsight] = useState<StockInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Trade Modal State
  const [tradeModal, setTradeModal] = useState({
    isOpen: false,
    action: 'BUY' as 'BUY' | 'SELL',
    asset: { name: '', price: 0, type: '' }
  });

  const openTrade = (asset: any, action: 'BUY' | 'SELL') => {
    setTradeModal({
      isOpen: true,
      action,
      asset: {
        name: asset.name,
        price: asset.price,
        type: asset.type || 'Asset'
      }
    });
  };

  useEffect(() => {
    const unsubscribe = dataService.subscribeToPriceAlerts(setPriceAlerts);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (priceAlerts.length === 0) return;

    const newTriggered: PriceAlert[] = [];
    priceAlerts.forEach(alert => {
      const stock = stocks.find(s => s.name === alert.symbol);
      if (stock) {
        const isTriggered = alert.condition === 'above' 
          ? stock.price >= alert.targetPrice 
          : stock.price <= alert.targetPrice;
        
        if (isTriggered) {
          newTriggered.push(alert);
          dataService.deletePriceAlert(alert.id);
        }
      }
    });

    if (newTriggered.length > 0) {
      setTriggeredAlerts(prev => [...prev, ...newTriggered]);
    }
  }, [stocks, priceAlerts]);

  useEffect(() => {
    async function updateAiInsight() {
      const stock = stocks.find(s => s.name === selectedStock);
      if (!stock) return;
      
      setIsAnalyzing(true);
      const insight = await getStockAdvice(stock.name, stock.price, parseFloat(stock.change));
      setAiInsight(insight);
      setIsAnalyzing(false);
    }
    updateAiInsight();
  }, [selectedStock]);

  useEffect(() => {
    const interval = setInterval(() => {
      const updates: Record<string, 'up' | 'down' | null> = {};

      setStocks(prev => prev.map(s => {
        const volatility = 0.002; 
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        const newPrice = s.price * change;
        updates[s.name] = newPrice > s.price ? 'up' : 'down';
        
        // Calculate a basic change percentage relative to INITIAL price for simplification
        const initialPrice = INITIAL_STOCKS.find(st => st.name === s.name)?.price || s.price;
        const totalChange = ((newPrice - initialPrice) / initialPrice) * 100;
        
        return {
          ...s,
          price: Number(newPrice.toFixed(2)),
          change: (totalChange >= 0 ? '+' : '') + totalChange.toFixed(2) + '%',
          trend: newPrice > s.price ? 'up' : 'down' as 'up' | 'down'
        };
      }));

      setForex(prev => prev.map(f => {
        const volatility = 0.0005;
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        const newRate = f.rate * change;
        updates[f.pair] = newRate > f.rate ? 'up' : 'down';
        
        const initialRate = INITIAL_FOREX.find(fr => fr.pair === f.pair)?.rate || f.rate;
        const totalChange = ((newRate - initialRate) / initialRate) * 100;

        return {
          ...f,
          rate: Number(newRate.toFixed(4)),
          change: (totalChange >= 0 ? '+' : '') + totalChange.toFixed(2) + '%'
        };
      }));

      setLastUpdate(updates);
      setTimeout(() => setLastUpdate({}), 1500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div variants={itemVariants} className="space-y-8">
      {/* Market Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center p-1 overflow-hidden">
            <img src={APP_LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600">Business Command Center</span>
        </div>
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-black tracking-tight text-slate-800">
            {viewMode === 'market' ? 'Global Markets' : 'Trading Hub'}
          </h2>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setViewMode('market')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'market' 
                  ? 'bg-primary-900 shadow-lg shadow-primary-900/20 text-white' 
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Globe size={12} />
              Market
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                viewMode === 'history' 
                  ? 'bg-primary-900 shadow-lg shadow-primary-900/20 text-white' 
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <History size={12} />
              History
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'market' ? (
          <motion.div 
            key="market-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Forex Ticker */}
      <motion.div variants={itemVariants} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {forex.map((item) => {
          const isUp = item.change.startsWith('+');
          const sparklineData = Array.from({ length: 15 }, (_, i) => ({ 
            value: item.rate * (1 + (Math.random() * 0.002 - 0.001)) 
          }));

          return (
            <motion.div 
              key={item.pair} 
              animate={{ 
                backgroundColor: lastUpdate[item.pair] === 'up' ? '#f0fdf4' : lastUpdate[item.pair] === 'down' ? '#fef2f2' : '#ffffff'
              }}
              className="flex-shrink-0 border border-slate-100 p-5 rounded-[2.5rem] min-w-[200px] shadow-sm bg-white transition-colors duration-500 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.pair}</p>
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[9px] font-black ${
                  isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {item.change}
                </div>
              </div>
              <div className="flex items-end justify-between gap-4">
                <span className="text-xl font-black text-slate-900 tracking-tight">{item.rate.toFixed(4)}</span>
                <ForexSparkline 
                  data={sparklineData} 
                  color={isUp ? '#10b981' : '#f43f5e'} 
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Market Performance Chart */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-4 border-indigo-50 bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-indigo-400">S&P 500 Performance</h3>
              <p className="text-2xl font-black text-slate-800">4,300.25 <span className="text-emerald-500 text-sm font-bold">+0.85%</span></p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MARKET_CHART}>
                <defs>
                  <linearGradient id="marketColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#marketColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Stock Watchlist */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-black text-lg tracking-tight text-slate-800">Stock Watchlist</h3>
          <button className="text-primary-600 text-xs font-black uppercase tracking-widest">Market Open</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stocks.map((stock) => (
            <Card 
              key={stock.name} 
              className={`p-5 flex flex-col gap-3 cursor-pointer transition-all relative group overflow-hidden ${
                selectedStock === stock.name ? 'border-primary-600 ring-2 ring-primary-100 shadow-md' : 'hover:border-primary-100'
              } ${lastUpdate[stock.name] === 'up' ? 'bg-emerald-50/30' : lastUpdate[stock.name] === 'down' ? 'bg-rose-50/30' : ''}`}
              onClick={() => setSelectedStock(stock.name)}
            >
              {/* Quick Actions Overlay */}
              <div className="absolute top-0 right-0 p-2 transform translate-x-full group-hover:translate-x-0 transition-transform flex gap-1 z-20">
                <button 
                  onClick={(e) => { e.stopPropagation(); openTrade(stock, 'BUY'); }}
                  className="w-10 h-10 bg-primary-900 border-2 border-white text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <ArrowUpRight size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setAlertingStock({ symbol: stock.name, price: stock.price }); }}
                  className="w-10 h-10 bg-amber-500 border-2 border-white text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <Bell size={18} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); openTrade(stock, 'SELL'); }}
                  className="w-10 h-10 bg-rose-600 border-2 border-white text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <ArrowDownRight size={18} />
                </button>
              </div>

              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xs text-slate-600">
                  {stock.name.slice(0, 2)}
                </div>
                <div className={`p-1.5 rounded-lg ${stock.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {stock.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
              </div>
              <div>
                <p className="font-black text-slate-800">{stock.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-black text-slate-900">${stock.price}</span>
                  <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-black ${
                    stock.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {stock.change}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* AI Analyst Insights */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 overflow-hidden relative border-primary-100 bg-gradient-to-br from-white via-primary-50/10 to-indigo-50/20">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Brain size={120} className="text-primary-600" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-900 text-white rounded-2xl shadow-lg shadow-primary-900/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 tracking-tight">Vault AI Analyst</h3>
                  <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Real-time Neural Analysis
                  </div>
                </div>
              </div>
              
              {aiInsight && (
                <div className={cn(
                  "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm",
                  aiInsight.recommendation === 'BUY' ? 'bg-emerald-500 text-white' :
                  aiInsight.recommendation === 'SELL' ? 'bg-rose-500 text-white' :
                  'bg-slate-800 text-white'
                )}>
                  {aiInsight.recommendation} SIGNAL
                </div>
              )}
            </div>

            {isAnalyzing ? (
              <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-black text-slate-800">Processing Market Sentiment</p>
                  <p className="text-xs text-slate-400">Querying regional nodes for {selectedStock}...</p>
                </div>
              </div>
            ) : aiInsight ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="p-4 bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
                  <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                    "{aiInsight.analysis}"
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Risk Profile</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-800">{aiInsight.riskLevel}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className={cn(
                              "w-6 h-1.5 rounded-full",
                              i === 1 ? 'bg-emerald-400' : 
                              i === 2 && (aiInsight.riskLevel === 'MEDIUM' || aiInsight.riskLevel === 'HIGH') ? 'bg-orange-400' :
                              i === 3 && aiInsight.riskLevel === 'HIGH' ? 'bg-rose-400' :
                              'bg-slate-200'
                            )} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-900 rounded-2xl text-white space-y-3 shadow-lg shadow-primary-900/10">
                    <div className="flex items-center gap-2 text-primary-200">
                      <Lightbulb size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Key Catalysts</span>
                    </div>
                    <ul className="space-y-1">
                      {aiInsight.keyFactors.map((f, i) => (
                        <li key={i} className="text-[10px] font-medium flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
            
            <Button 
              className="w-full bg-white border-slate-100 text-slate-600 hover:bg-slate-50 py-4 rounded-[24px]"
              onClick={() => {
                const stock = stocks.find(s => s.name === selectedStock);
                if (stock) getStockAdvice(stock.name, stock.price, parseFloat(stock.change)).then(setAiInsight);
              }}
            >
              Refresh Deep Analysis
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Candlestick Analytics Section */}
      <motion.div variants={itemVariants}>
        <Card className="p-6 space-y-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-900/20">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-800">Market Dynamics</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedStock} / USD</p>
              </div>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
              {['1D', '5D', '1M', '6M', '1Y'].map((tf) => (
                <TimeframeButton 
                  key={tf} 
                  active={timeframe === tf} 
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </TimeframeButton>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CANDLESTICK_DATA[timeframe] || CANDLESTICK_DATA['1D']}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                  orientation="right" 
                />
                <Tooltip 
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '5 5' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isUp = data.close >= data.open;
                      return (
                        <Card className="p-4 space-y-3 bg-white/90 backdrop-blur-xl border-slate-100 shadow-2xl min-w-[160px]">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.time}</p>
                            <div className={`w-2 h-2 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Open</span>
                            <span className="text-xs font-black text-slate-800 text-right">${data.open}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Close</span>
                            <span className={`text-xs font-black text-right ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>${data.close}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">High</span>
                            <span className="text-xs font-bold text-slate-600 text-right">${data.high}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase">Low</span>
                            <span className="text-xs font-bold text-slate-600 text-right">${data.low}</span>
                          </div>
                        </Card>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="close" 
                  barSize={timeframe === '1D' ? 20 : 12} 
                  shape={<CandlestickShape />}
                />
              </ComposedChart>
            </ResponsiveContainer>
            
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-lg shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume</span>
                <span className="text-xs font-black text-slate-800">$24.8B</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Volatility</span>
                <span className="text-xs font-black text-slate-800">Low</span>
              </div>
            </div>
            <button className="flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
              Full Analysis <Maximize2 size={14} />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Investment Options */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h3 className="font-black text-lg tracking-tight text-slate-800">Investment Options</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curated Portfolio Opportunities</p>
          </div>
          <button className="text-primary-600 text-xs font-black uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-xl hover:bg-primary-100 transition-colors">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INVESTMENT_OPTIONS.map((option) => (
            <motion.div
              variants={itemVariants}
              key={option.name}
            >
              <Card className="p-5 h-full flex flex-col gap-4 group hover:border-primary-200 hover:shadow-md transition-all">
                <div className="flex justify-between items-start">
                  <div className={cn("p-2.5 rounded-2xl", option.color)}>
                    <option.icon size={20} />
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                    option.risk === 'Low' ? 'bg-emerald-50 text-emerald-600' :
                    option.risk === 'Medium' ? 'bg-orange-50 text-orange-600' :
                    'bg-rose-50 text-rose-600'
                  )}>
                    {option.risk} Risk
                  </div>
                </div>
                
                <div>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">{option.type}</p>
                  <h4 className="font-black text-slate-800 group-hover:text-primary-600 transition-colors">{option.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {option.description}
                  </p>
                </div>
                
                <div className="mt-auto pt-2 grid grid-cols-2 gap-2">
                  <Button 
                    className="bg-primary-900 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95"
                    onClick={() => openTrade(option, 'BUY')}
                  >
                    Buy
                  </Button>
                  <Button 
                    className="bg-white border-slate-200 text-rose-600 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95"
                    onClick={() => openTrade(option, 'SELL')}
                  >
                    Sell
                  </Button>
                  <Button 
                    className="col-span-2 bg-slate-50 border-transparent text-slate-600 hover:bg-slate-900 hover:text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest group/btn mt-1"
                    onClick={() => alert(`Accessing deep-dive data for ${option.name}. Loading secure documentation...`)}
                  >
                    Learn More
                    <ArrowUpRight size={14} className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

            {/* World Business News */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-black text-lg tracking-tight text-slate-800">World Business News</h3>
                <Globe size={20} className="text-slate-400" />
              </div>
              <div className="space-y-4">
                {NEWS_DATA.map((news) => (
                  <motion.div 
                    variants={itemVariants}
                    key={news.url} 
                    onClick={() => window.open(news.url, '_blank', 'noopener,noreferrer')}
                    className="group flex gap-4 bg-white p-3 rounded-[32px] border border-slate-100 hover:border-primary-100 shadow-sm transition-all overflow-hidden cursor-pointer active:scale-[0.98]"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={news.image} alt="news" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center gap-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center p-1 border border-slate-100 flex-shrink-0">
                          <img 
                            src={news.logo} 
                            alt={news.source} 
                            className="w-full h-full object-contain" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              // Fallback to favicon if clearbit fails
                              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(news.url).hostname}&sz=64`;
                            }}
                          />
                        </div>
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.1em]",
                          news.source.includes('Forbes') ? 'text-coral-accent' : 
                          news.source.includes('Global') ? 'text-indigo-premium' : 
                          news.source.includes('Bloomberg') ? 'text-orange-500' :
                          news.source.includes('Reuters') ? 'text-blue-600' :
                          news.source.includes('WSJ') ? 'text-slate-900' :
                          'text-primary-600'
                        )}>{news.source}</span>
                      </div>
                      <h4 className="font-black text-sm text-slate-800 leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {news.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold">{news.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="history-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <TradeHistorySection trades={MOCK_TRADES} />
            
            <Card className="p-6 bg-primary-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <TrendingUp size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sparkles size={20} className="text-luxury-gold" />
                  </div>
                  <div>
                    <h3 className="font-black tracking-tight">Performance Summary</h3>
                    <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">Monthly Trade Analysis</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Win Rate</p>
                    <p className="text-2xl font-black">68.2%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Avg Profit</p>
                    <p className="text-2xl font-black text-emerald-400">+$245.12</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <TradeModal 
        isOpen={tradeModal.isOpen} 
        onClose={() => setTradeModal(prev => ({ ...prev, isOpen: false }))}
        action={tradeModal.action}
        asset={tradeModal.asset}
        onConfirm={(data) => console.log('Trade Executed:', data)}
      />

      {alertingStock && (
        <PriceAlertModal 
          stock={alertingStock} 
          onClose={() => setAlertingStock(null)} 
        />
      )}

      {/* Triggered Alerts Notification */}
      <AnimatePresence>
        {triggeredAlerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-[150] sm:left-auto sm:right-8 sm:w-80"
          >
            <Card className="p-4 bg-amber-900 text-white border-2 border-luxury-gold shadow-2xl">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-luxury-gold text-primary-900 flex items-center justify-center flex-shrink-0 animate-bounce">
                  <Bell size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-sm uppercase tracking-tight">Price Alert</h4>
                    <button onClick={() => setTriggeredAlerts(prev => prev.filter(a => a.id !== alert.id))}>
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-primary-100 mt-1">
                    <span className="font-black text-luxury-gold">{alert.symbol}</span> has reached your target of 
                    <span className="font-black ml-1">${alert.targetPrice.toFixed(2)}</span>.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

