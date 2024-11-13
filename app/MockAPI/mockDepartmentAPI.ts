import { Transaction, StatusType, TransactionAPI } from '@/types/types';

const DEPARTMENT_STORAGE_KEY = 'department_transactions';

// Default department data
const DEFAULT_DEPARTMENT_DATA: Transaction[] = [
  {
    id: '001',
    name: 'Department 001',
    ipAddress: '172.16.254.1',
    type: 'Department',
    status: 'Active',
    totalSale: 1003500,
    date: '2023-04-05, 00:05PM',
    frames: [], 
    stickers: []
  },
  {
    id: '002',
    name: 'Department 002',
    ipAddress: '172.16.254.2',
    type: 'Department',
    status: 'Active',
    totalSale: 1002500,
    date: '2023-04-05, 00:05PM',
    frames: [],
    stickers: []
  }
];

// Helper function to get storage key with email prefix
const getStorageKey = (email: string) => `${email}_${DEPARTMENT_STORAGE_KEY}`;

// Helper function to reorder IDs
const reorderIds = (transactions: Transaction[]): Transaction[] => {
  return transactions.map((transaction, index) => ({
    ...transaction,
    id: String(index + 1).padStart(3, '0'),
    name: `${transaction.type} ${String(index + 1).padStart(3, '0')}`
  }));
};

// Helper function to save to localStorage
const saveToStorage = (transactions: Transaction[]) => {
  try {
    const currentProfile = localStorage.getItem('adminProfile');
    if (currentProfile) {
      const { email } = JSON.parse(currentProfile);
      localStorage.setItem(getStorageKey(email), JSON.stringify(transactions));
    }
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

// Helper function to load from localStorage
const loadFromStorage = (): Transaction[] => {
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
    console.error('Error loading transactions:', error);
    return DEFAULT_DEPARTMENT_DATA;
  }
};

// Department API implementation
export const departmentAPI: TransactionAPI = {
  getTransactions: (): Transaction[] => {
    return loadFromStorage();
  },

  getTransactionById: (transactionId: string): Transaction | null => {
    const transactions = loadFromStorage();
    return transactions.find(transaction => transaction.id === transactionId) || null;
  },

  updateTransactionStatus: (transactionId: string, newStatus: StatusType): Transaction[] => {
    const transactions = loadFromStorage();
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === transactionId 
        ? { ...transaction, status: newStatus }
        : transaction
    );
    saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  updateTransaction: (transactionId: string, data: Partial<Transaction>): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const transactions = loadFromStorage();
      const currentTransaction = transactions.find(transaction => transaction.id === transactionId);

      // ถ้ามีการเปลี่ยน Type จาก Department เป็น Event
      if (data.type && data.type === 'Event' && currentTransaction?.type === 'Department') {
        // 1. ลบข้อมูลออกจาก Department
        const remainingTransactions = transactions.filter(transaction => transaction.id !== transactionId);
        const reorderedTransactions = reorderIds(remainingTransactions);
        saveToStorage(reorderedTransactions);

        // 2. เพิ่มข้อมูลไปยัง Event
        const eventAPI = require('./mockEventAPI').eventAPI;
        const eventTransactions = eventAPI.getTransactions();
        const newEventId = String(eventTransactions.length + 1).padStart(3, '0');

        const movedTransaction: Transaction = {
          ...currentTransaction,
          ...data,
          id: newEventId,
          name: `Event ${newEventId}`,
          type: 'Event',
          date: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        };

        eventTransactions.push(movedTransaction);
        localStorage.setItem(
          `${email}_event_data`,
          JSON.stringify(eventTransactions)
        );

        return reorderedTransactions;
      }

      // ถ้าไม่มีการเปลี่ยน Type ให้ทำงานปกติ
      const updatedTransactions = transactions.map(transaction =>
        transaction.id === transactionId
          ? {
              ...transaction,
              ...data,
              date: new Date().toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            }
          : transaction
      );
      
      saveToStorage(updatedTransactions);
      return updatedTransactions;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return [];
    }
  },

  addFramesToTransaction: (transactionId: string, frameIds: string[]): Transaction[] => {
    const transactions = loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId
        ? {
            ...transaction,
            frames: [...new Set([...(transaction.frames || []), ...frameIds])]
          }
        : transaction
    );
    saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  removeFrameFromTransaction: (transactionId: string, frameId: string): Transaction[] => {
    const transactions = loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId
        ? {
            ...transaction,
            frames: (transaction.frames || []).filter(id => id !== frameId)
          }
        : transaction
    );
    saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  addStickersToTransaction: (transactionId: string, stickerIds: string[]): Transaction[] => {
    const transactions = loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId
        ? {
            ...transaction,
            stickers: [...new Set([...(transaction.stickers || []), ...stickerIds])]
          }
        : transaction
    );
    saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  removeStickerFromTransaction: (transactionId: string, stickerId: string): Transaction[] => {
    const transactions = loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === transactionId
        ? {
            ...transaction,
            stickers: (transaction.stickers || []).filter(id => id !== stickerId)
          }
        : transaction
    );
    saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  searchTransactions: (searchTerm: string): Transaction[] => {
    const transactions = loadFromStorage();
    if (!searchTerm) return transactions;

    const lowercaseSearch = searchTerm.toLowerCase();
    return transactions.filter(transaction => 
      transaction.id.toLowerCase().includes(lowercaseSearch) ||
      (transaction.name || '').toLowerCase().includes(lowercaseSearch) ||
      (transaction.ipAddress || '').toLowerCase().includes(lowercaseSearch) ||
      transaction.type.toLowerCase().includes(lowercaseSearch) ||
      transaction.status.toLowerCase().includes(lowercaseSearch) ||
      transaction.date.toLowerCase().includes(lowercaseSearch) ||
      transaction.totalSale.toString().includes(searchTerm)
    );
  },

  deleteTransaction: (transactionId: string): Transaction[] => {
    const transactions = loadFromStorage();
    const updatedTransactions = transactions.filter(transaction => transaction.id !== transactionId);
    const reorderedTransactions = reorderIds(updatedTransactions);
    saveToStorage(reorderedTransactions);
    return reorderedTransactions;
  },

  addTransaction: (transaction: Omit<Transaction, 'id'>): Transaction[] => {
    const transactions = loadFromStorage();
    const newId = String(transactions.length + 1).padStart(3, '0');
    const newTransaction: Transaction = {
      ...transaction,
      id: newId,
      name: `Department ${newId}`,
      type: 'Department',
      frames: transaction.frames || [],
      stickers: transaction.stickers || [],
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    const updatedTransactions = [...transactions, newTransaction];
    saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  resetToDefault: (): Transaction[] => {
    saveToStorage(DEFAULT_DEPARTMENT_DATA);
    return DEFAULT_DEPARTMENT_DATA;
  },

  initialize: (): void => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        const existingData = localStorage.getItem(getStorageKey(email));
        if (!existingData) {
          saveToStorage(DEFAULT_DEPARTMENT_DATA);
        }
      }
    } catch (error) {
      console.error('Error initializing department data:', error);
    }
  },

  clearStorage: (): void => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        localStorage.removeItem(getStorageKey(email));
      }
    } catch (error) {
      console.error('Error clearing department storage:', error);
    }
  }
};

export default departmentAPI;