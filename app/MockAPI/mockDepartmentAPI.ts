import { Transaction, StatusType, TransactionAPI } from '@/types/types';

const DEPARTMENT_STORAGE_KEY = 'department_transactions';

const DEFAULT_DEPARTMENT_DATA: Transaction[] = [
  {
    id: '001',
    status: 'Active',
    totalSale: 1003500,
    date: '2023-04-05, 00:05PM',
  },
  {
    id: '002',
    status: 'Active',
    totalSale: 1002500,
    date: '2023-04-05, 00:05PM',
  },
];

const getStorageKey = (email: string) => `${email}_${DEPARTMENT_STORAGE_KEY}`;

export const departmentAPI: TransactionAPI = {
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
      return DEFAULT_DEPARTMENT_DATA;
    } catch (error) {
      console.error('Error loading department transactions:', error);
      return DEFAULT_DEPARTMENT_DATA;
    }
  },

  updateTransactionStatus: (transactionId: string, newStatus: StatusType): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = departmentAPI.getTransactions();
      
      const updatedTransactions = transactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: newStatus }
          : transaction
      );

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error updating department transaction status:', error);
      return [];
    }
  },

  searchTransactions: (searchTerm: string): Transaction[] => {
    const transactions = departmentAPI.getTransactions();
    if (!searchTerm) return transactions;

    return transactions.filter(transaction => 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.totalSale.toString().includes(searchTerm)
    );
  },

  deleteTransaction: (transactionId: string): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = departmentAPI.getTransactions();
      
      const updatedTransactions = transactions.filter(
        transaction => transaction.id !== transactionId
      );

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error deleting department transaction:', error);
      return [];
    }
  },

  addTransaction: (transaction: Omit<Transaction, 'id'>): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = departmentAPI.getTransactions();
      
      const lastId = transactions.length > 0 
        ? parseInt(transactions[transactions.length - 1].id.replace('D', ''))
        : 0;
      
      const newTransaction = {
        ...transaction,
        id: `D${String(lastId + 1).padStart(3, '0')}`,
      };

      const updatedTransactions = [...transactions, newTransaction];
      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedTransactions));
      return updatedTransactions;
    } catch (error) {
      console.error('Error adding department transaction:', error);
      return [];
    }
  },

  // เพิ่มเมธอดที่ขาด
  initialize: () => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        const existingData = localStorage.getItem(getStorageKey(email));
        if (!existingData) {
          localStorage.setItem(getStorageKey(email), JSON.stringify(DEFAULT_DEPARTMENT_DATA));
        }
      }
    } catch (error) {
      console.error('Error initializing department data:', error);
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
      console.error('Error clearing department storage:', error);
    }
  },
  resetToDefault: (): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return DEFAULT_DEPARTMENT_DATA;

      const { email } = JSON.parse(currentProfile);
      localStorage.setItem(getStorageKey(email), JSON.stringify(DEFAULT_DEPARTMENT_DATA));
      return DEFAULT_DEPARTMENT_DATA;
    } catch (error) {
      console.error('Error resetting to default data:', error);
      return DEFAULT_DEPARTMENT_DATA;
    }
  },
};