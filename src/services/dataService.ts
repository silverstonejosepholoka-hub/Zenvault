import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, Account, Transaction, PriceAlert } from '../types';

export const dataService = {
  // User Profile
  async getUserProfile(uid: string) {
    const path = `users/${uid}`;
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async createUserProfile(profile: Partial<UserProfile>) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    
    const path = `users/${uid}`;
    const newProfile = {
      uid,
      email: profile.email || auth.currentUser?.email || '',
      phoneNumber: profile.phoneNumber || auth.currentUser?.phoneNumber || '',
      displayName: profile.displayName || '',
      currency: profile.currency || 'USD',
      createdAt: Date.now(),
      securitySetup: false,
      ...profile
    };

    try {
      await setDoc(doc(db, 'users', uid), newProfile);
      return newProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Accounts
  async getAccounts() {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    const path = 'accounts';
    try {
      const q = query(collection(db, 'accounts'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Account & { id: string })[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  subscribeToAccounts(callback: (accounts: (Account & { id: string })[]) => void) {
    const uid = auth.currentUser?.uid;
    if (!uid) return () => {};

    const q = query(collection(db, 'accounts'), where('userId', '==', uid));
    return onSnapshot(q, (snapshot) => {
      const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Account & { id: string })[];
      callback(accounts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'accounts');
    });
  },

  async createAccount(account: Omit<Account, 'userId'>) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    const path = 'accounts';
    try {
      const docRef = await addDoc(collection(db, 'accounts'), {
        ...account,
        userId: uid,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Transactions
  async getTransactions(accountId?: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    try {
      let q = query(collection(db, 'transactions'), where('userId', '==', uid));
      if (accountId) {
        q = query(q, where('accountId', '==', accountId));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Transaction & { id: string })[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    }
  },

  async convertCurrency(fromId: string, toId: string, amount: number, exchangeRates: any) {
    const fromAccount = (await getDoc(doc(db, 'accounts', fromId))).data() as Account;
    const toAccount = (await getDoc(doc(db, 'accounts', toId))).data() as Account;
    
    if (!fromAccount || !toAccount) throw new Error('Account not found');
    if (fromAccount.balance < amount) throw new Error('Insufficient funds');

    const convertedAmount = amount * (exchangeRates.rates[toAccount.currency] / exchangeRates.rates[fromAccount.currency]);

    // In a real app, this should be a Firestore Transaction for atomicity
    try {
      await setDoc(doc(db, 'accounts', fromId), {
        ...fromAccount,
        balance: fromAccount.balance - amount
      });
      await setDoc(doc(db, 'accounts', toId), {
        ...toAccount,
        balance: toAccount.balance + convertedAmount
      });

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId: auth.currentUser?.uid,
        accountId: fromId,
        amount,
        currency: fromAccount.currency,
        type: 'debit',
        category: 'Transfer',
        description: `Exchanged for ${toAccount.currency}`,
        timestamp: Date.now(),
        status: 'completed'
      });

      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'accounts');
    }
  },

  // Price Alerts
  async createPriceAlert(alert: Omit<PriceAlert, 'id' | 'userId' | 'createdAt' | 'isActive'>) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');

    try {
      const docRef = await addDoc(collection(db, 'priceAlerts'), {
        ...alert,
        userId: uid,
        isActive: true,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'priceAlerts');
    }
  },

  subscribeToPriceAlerts(callback: (alerts: PriceAlert[]) => void) {
    const uid = auth.currentUser?.uid;
    if (!uid) return () => {};

    const q = query(collection(db, 'priceAlerts'), where('userId', '==', uid), where('isActive', '==', true));
    return onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PriceAlert[];
      callback(alerts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'priceAlerts');
    });
  },

  async deletePriceAlert(id: string) {
    try {
      await setDoc(doc(db, 'priceAlerts', id), { isActive: false }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'priceAlerts');
    }
  }
};
