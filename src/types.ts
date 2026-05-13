export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  currency: string; // Default currency
  createdAt: number;
  securitySetup: boolean;
  pinHash?: string;
  biometricEnabled?: boolean;
}

export interface Account {
  id?: string;
  userId: string;
  currency: string;
  balance: number;
  label: string;
  type: 'wallet' | 'mobile_money' | 'bank';
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  timestamp: number;
  recipientId?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
  currency: string;
  period: 'monthly' | 'weekly';
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: number;
}

export interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  isActive: boolean;
  type: 'visa' | 'mastercard';
}

export interface TradeOrder {
  id: string;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  currency: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: number;
}
