import { 
  Transaction, 
  StatusType, 
  TransactionService,
  ServiceResponse,
  TransactionUploadData
} from '@/types/types';
import { getProfile } from '../utils/auth';

// Constants
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
    date: new Date().toISOString(),
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
    date: new Date().toISOString(),
    frames: [],
    stickers: []
  }
];

// Helper Types
interface StorageData {
  transactions: Transaction[];
  lastUpdated: string;
}

// Helper Functions
const getStorageKey = (email: string): string => {
  if (!email) throw new Error('Email is required for storage key');
  return `${email}_${DEPARTMENT_STORAGE_KEY}`;
};

const getCurrentEmail = async (): Promise<string> => {
  const profile = await getProfile();
  if (!profile?.email) throw new Error('No active profile found');
  return profile.email;
};

const formatDate = (): string => {
  return new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const reorderIds = (transactions: Transaction[]): Transaction[] => {
  return transactions.map((transaction, index) => ({
    ...transaction,
    id: String(index + 1).padStart(3, '0'),
    name: `${transaction.type} ${String(index + 1).padStart(3, '0')}`
  }));
};

const saveToStorage = async (transactions: Transaction[]): Promise<void> => {
  try {
    const email = await getCurrentEmail();
    const storageData: StorageData = {
      transactions,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(getStorageKey(email), JSON.stringify(storageData));
  } catch (error) {
    console.error('Error saving transactions:', error);
    throw error;
  }
};

const loadFromStorage = async (): Promise<Transaction[]> => {
  try {
    const email = await getCurrentEmail();
    const savedData = localStorage.getItem(getStorageKey(email));
    if (!savedData) return DEFAULT_DEPARTMENT_DATA;

    const { transactions } = JSON.parse(savedData) as StorageData;
    return transactions;
  } catch (error) {
    console.error('Error loading transactions:', error);
    return DEFAULT_DEPARTMENT_DATA;
  }
};

// Service Implementation
export const departmentService: TransactionService = {
  getTransactions: async () => {
    return await loadFromStorage();
  },

  getTransactionById: async (id: string) => {
    const transactions = await loadFromStorage();
    return transactions.find(transaction => transaction.id === id) || null;
  },

  updateTransactionStatus: async (id: string, status: StatusType) => {
    const transactions = await loadFromStorage();
    const updatedTransactions = transactions.map(transaction => 
      transaction.id === id ? { ...transaction, status } : transaction
    );
    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    const transactions = await loadFromStorage();
    const currentTransaction = transactions.find(transaction => transaction.id === id);

    if (!currentTransaction) {
      throw new Error('Transaction not found');
    }

    // Handle type change (Department -> Event)
    if (data.type === 'Event' && currentTransaction.type === 'Department') {
      throw new Error('Type change operation should be handled by the event service');
    }

    const updatedTransactions = transactions.map(transaction =>
      transaction.id === id
        ? {
            ...transaction,
            ...data,
            date: formatDate()
          }
        : transaction
    );

    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  addFramesToTransaction: async (id: string, frameIds: string[]) => {
    const transactions = await loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === id
        ? {
            ...transaction,
            frames: [...new Set([...transaction.frames, ...frameIds])]
          }
        : transaction
    );
    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  removeFrameFromTransaction: async (id: string, frameId: string) => {
    const transactions = await loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === id
        ? {
            ...transaction,
            frames: transaction.frames.filter(fId => fId !== frameId)
          }
        : transaction
    );
    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  addStickersToTransaction: async (id: string, stickerIds: string[]) => {
    const transactions = await loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === id
        ? {
            ...transaction,
            stickers: [...new Set([...transaction.stickers, ...stickerIds])]
          }
        : transaction
    );
    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  removeStickerFromTransaction: async (id: string, stickerId: string) => {
    const transactions = await loadFromStorage();
    const updatedTransactions = transactions.map(transaction =>
      transaction.id === id
        ? {
            ...transaction,
            stickers: transaction.stickers.filter(sId => sId !== stickerId)
          }
        : transaction
    );
    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  searchTransactions: async (searchTerm: string) => {
    const transactions = await loadFromStorage();
    if (!searchTerm) return transactions;

    const term = searchTerm.toLowerCase();
    return transactions.filter(transaction => 
      transaction.id.toLowerCase().includes(term) ||
      transaction.name.toLowerCase().includes(term) ||
      transaction.ipAddress.toLowerCase().includes(term) ||
      transaction.type.toLowerCase().includes(term) ||
      transaction.status.toLowerCase().includes(term) ||
      transaction.date.toLowerCase().includes(term) ||
      transaction.totalSale.toString().includes(term)
    );
  },

  deleteTransaction: async (id: string) => {
    const transactions = await loadFromStorage();
    const filteredTransactions = transactions.filter(transaction => transaction.id !== id);
    const reorderedTransactions = reorderIds(filteredTransactions);
    await saveToStorage(reorderedTransactions);
    return reorderedTransactions;
  },

  addTransaction: async (data: TransactionUploadData) => {
    const transactions = await loadFromStorage();
    const newId = String(transactions.length + 1).padStart(3, '0');
    const newTransaction: Transaction = {
      ...data,
      id: newId,
      name: `Department ${newId}`,
      type: 'Department',
      frames: data.frames || [],
      stickers: data.stickers || [],
      date: formatDate(),
      totalSale: data.totalSale || 0
    };
    const updatedTransactions = [...transactions, newTransaction];
    await saveToStorage(updatedTransactions);
    return updatedTransactions;
  },

  resetToDefault: async () => {
    await saveToStorage(DEFAULT_DEPARTMENT_DATA);
    return DEFAULT_DEPARTMENT_DATA;
  },

  initialize: async () => {
    const transactions = await loadFromStorage();
    if (!transactions.length) {
      await saveToStorage(DEFAULT_DEPARTMENT_DATA);
    }
  },

  clearStorage: async () => {
    const email = await getCurrentEmail();
    localStorage.removeItem(getStorageKey(email));
  }
};

export default departmentService;