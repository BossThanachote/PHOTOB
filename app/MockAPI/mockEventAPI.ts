import { Transaction, StatusType, TransactionAPI } from '@/types/types';

const EVENT_STORAGE_KEY = 'event_transactions';

const DEFAULT_EVENT_DATA: Transaction[] = [
  {
    id: '001',
    status: 'Active',
    totalSale: 1006100,
    date: '2023-04-05, 00:05PM',
  },
  {
    id: '002',
    status: 'Active',
    totalSale: 1002500,
    date: '2023-04-05, 00:05PM',
  },
];

const getStorageKey = (email: string) => `${email}_${EVENT_STORAGE_KEY}`;

export const eventAPI: TransactionAPI = {
  getTransactions: (): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        const savedTransactions = localStorage.getItem(getStorageKey(email));
        if (savedTransactions) {
          return JSON.parse(savedTransactions);
        }
      }
      return DEFAULT_EVENT_DATA;
    } catch (error) {
      console.error('Error loading event transactions:', error);
      return DEFAULT_EVENT_DATA;
    }
  },

  updateTransactionStatus: (transactionId: string, newStatus: StatusType): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = eventAPI.getTransactions();
      
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: newStatus }
          : transaction
      );

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error updating event transaction status:', error);
      return [];
    }
  },

  searchTransactions: (searchTerm: string): Transaction[] => {
    try {
      const transactions = eventAPI.getTransactions();
      if (!searchTerm) return transactions;

      return transactions.filter(transaction => 
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.totalSale.toString().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching transactions:', error);
      return [];
    }
  },

  deleteTransaction: (transactionId: string): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = eventAPI.getTransactions();
      
      const updatedTransactions = transactions.filter(
        transaction => transaction.id !== transactionId
      );

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error deleting event transaction:', error);
      return [];
    }
  },

  addTransaction: (transaction: Omit<Transaction, 'id'>): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = eventAPI.getTransactions();
      
      const lastId = transactions.length > 0 
        ? parseInt(transactions[transactions.length - 1].id.replace('E', ''))
        : 0;
      
      const newTransaction = {
        ...transaction,
        id: `E${String(lastId + 1).padStart(3, '0')}`,
      };

      const updatedTransactions = [...transactions, newTransaction];
      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error adding event transaction:', error);
      return [];
    }
  },

  initialize: () => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        const existingData = localStorage.getItem(getStorageKey(email));
        if (!existingData) {
          localStorage.setItem(getStorageKey(email), JSON.stringify(DEFAULT_EVENT_DATA));
        }
      }
    } catch (error) {
      console.error('Error initializing event data:', error);
    }
  },

  clearStorage: () => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        localStorage.removeItem(getStorageKey(email));
      }
    } catch (error) {
      console.error('Error clearing event storage:', error);
    }
  },
  resetToDefault: (): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return DEFAULT_EVENT_DATA;

      const { email } = JSON.parse(currentProfile);
      localStorage.setItem(getStorageKey(email), JSON.stringify(DEFAULT_EVENT_DATA));
      return DEFAULT_EVENT_DATA;
    } catch (error) {
      console.error('Error resetting to default data:', error);
      return DEFAULT_EVENT_DATA;
    }
  }
  
};