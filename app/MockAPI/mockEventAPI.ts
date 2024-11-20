import { 
  Transaction, 
  StatusType, 
  TransactionService,
  ServiceResponse,
  TransactionUploadData
} from '@/types/types';
import { getProfile } from '../utils/auth';

// Constants
const EVENT_STORAGE_KEY = 'event_data';
const DEPARTMENT_STORAGE_KEY = 'department_data';

// Default event data
const DEFAULT_EVENTS: Transaction[] = [
  {
    id: '001',
    name: 'Event 001',
    ipAddress: '172.16.254.1',
    type: 'Event',
    status: 'Active',
    totalSale: 50000,
    date: new Date().toISOString(),
    frames: [],
    stickers: []
  },
  {
    id: '002',
    name: 'Event 002',
    ipAddress: '172.16.254.2',
    type: 'Event',
    status: 'Active',
    totalSale: 75000,
    date: new Date().toISOString(),
    frames: [],
    stickers: []
  }
];

// Helper Types
interface StorageData {
  events: Transaction[];
  lastUpdated: string;
}

// Helper Functions
const getStorageKey = (type: 'Event' | 'Department'): string => {
  const profile = getProfile();
  if (!profile) throw new Error('No active profile found');
  return `${profile.email}_${type === 'Event' ? EVENT_STORAGE_KEY : DEPARTMENT_STORAGE_KEY}`;
};

const formatDate = (date: Date = new Date()): string => {
  return date.toLocaleString('en-US', {
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

const saveToStorage = async (transactions: Transaction[], type: 'Event' | 'Department'): Promise<void> => {
  try {
    const storageData: StorageData = {
      events: transactions,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(getStorageKey(type), JSON.stringify(storageData));
  } catch (error) {
    console.error(`Error saving ${type.toLowerCase()}s:`, error);
    throw error;
  }
};

const loadFromStorage = async (type: 'Event' | 'Department'): Promise<Transaction[]> => {
  try {
    const storedData = localStorage.getItem(getStorageKey(type));
    if (!storedData) return type === 'Event' ? DEFAULT_EVENTS : [];

    const { events } = JSON.parse(storedData) as StorageData;
    return events;
  } catch (error) {
    console.error(`Error loading ${type.toLowerCase()}s:`, error);
    return type === 'Event' ? DEFAULT_EVENTS : [];
  }
};

// Service Implementation
export const transactionService: TransactionService = {
  getTransactions: async () => {
    try {
      return await loadFromStorage('Event');
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  getTransactionById: async (id: string) => {
    try {
      const events = await loadFromStorage('Event');
      return events.find(event => event.id === id) || null;
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      throw error;
    }
  },

  updateTransactionStatus: async (id: string, newStatus: StatusType) => {
    try {
      const events = await loadFromStorage('Event');
      const updatedEvents = events.map(event => 
        event.id === id ? { ...event, status: newStatus } : event
      );
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  updateTransaction: async (id: string, data: Partial<Transaction>) => {
    try {
      const events = await loadFromStorage('Event');
      const currentTransaction = events.find(event => event.id === id);
      
      if (!currentTransaction) {
        throw new Error('Transaction not found');
      }

      if (data.type && data.type !== currentTransaction.type) {
        // Handle type change (Event <-> Department)
        const remainingEvents = events.filter(event => event.id !== id);
        const reorderedEvents = reorderIds(remainingEvents);
        await saveToStorage(reorderedEvents, currentTransaction.type);

        const targetTypeEvents = await loadFromStorage(data.type);
        const newId = String(targetTypeEvents.length + 1).padStart(3, '0');

        const movedTransaction: Transaction = {
          ...currentTransaction,
          ...data,
          id: newId,
          name: `${data.type} ${newId}`,
          type: data.type,
          date: formatDate()
        };

        const updatedTargetEvents = [...targetTypeEvents, movedTransaction];
        await saveToStorage(updatedTargetEvents, data.type);

        return reorderedEvents;
      }

      // Regular update
      const updatedEvents = events.map(event =>
        event.id === id
          ? {
              ...event,
              ...data,
              date: formatDate()
            }
          : event
      );
      
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  addFramesToTransaction: async (id: string, frameIds: string[]) => {
    try {
      const events = await loadFromStorage('Event');
      const updatedEvents = events.map(event =>
        event.id === id
          ? {
              ...event,
              frames: [...new Set([...event.frames, ...frameIds])]
            }
          : event
      );
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error adding frames to transaction:', error);
      throw error;
    }
  },

  removeFrameFromTransaction: async (id: string, frameId: string) => {
    try {
      const events = await loadFromStorage('Event');
      const updatedEvents = events.map(event =>
        event.id === id
          ? {
              ...event,
              frames: event.frames.filter(fId => fId !== frameId)
            }
          : event
      );
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error removing frame from transaction:', error);
      throw error;
    }
  },

  addStickersToTransaction: async (id: string, stickerIds: string[]) => {
    try {
      const events = await loadFromStorage('Event');
      const updatedEvents = events.map(event =>
        event.id === id
          ? {
              ...event,
              stickers: [...new Set([...event.stickers, ...stickerIds])]
            }
          : event
      );
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error adding stickers to transaction:', error);
      throw error;
    }
  },

  removeStickerFromTransaction: async (id: string, stickerId: string) => {
    try {
      const events = await loadFromStorage('Event');
      const updatedEvents = events.map(event =>
        event.id === id
          ? {
              ...event,
              stickers: event.stickers.filter(sId => sId !== stickerId)
            }
          : event
      );
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error removing sticker from transaction:', error);
      throw error;
    }
  },

  searchTransactions: async (searchTerm: string) => {
    try {
      const events = await loadFromStorage('Event');
      if (!searchTerm) return events;

      const term = searchTerm.toLowerCase();
      return events.filter(event => 
        event.id.toLowerCase().includes(term) ||
        event.name.toLowerCase().includes(term) ||
        event.ipAddress.toLowerCase().includes(term) ||
        event.type.toLowerCase().includes(term) ||
        event.status.toLowerCase().includes(term) ||
        event.date.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching transactions:', error);
      throw error;
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      const events = await loadFromStorage('Event');
      const filteredEvents = events.filter(event => event.id !== id);
      const reorderedEvents = reorderIds(filteredEvents);
      await saveToStorage(reorderedEvents, 'Event');
      return reorderedEvents;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  addTransaction: async (data: TransactionUploadData) => {
    try {
      const events = await loadFromStorage('Event');
      const newId = String(events.length + 1).padStart(3, '0');
      const newTransaction: Transaction = {
        ...data,
        id: newId,
        name: `${data.type} ${newId}`,
        frames: data.frames || [],
        stickers: data.stickers || [],
        date: formatDate()
      };
      const updatedEvents = [...events, newTransaction];
      await saveToStorage(updatedEvents, 'Event');
      return updatedEvents;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  resetToDefault: async () => {
    try {
      await saveToStorage(DEFAULT_EVENTS, 'Event');
      return DEFAULT_EVENTS;
    } catch (error) {
      console.error('Error resetting to default:', error);
      throw error;
    }
  },

  initialize: async () => {
    try {
      const events = await loadFromStorage('Event');
      if (!events.length) {
        await saveToStorage(DEFAULT_EVENTS, 'Event');
      }
    } catch (error) {
      console.error('Error initializing transactions:', error);
      throw error;
    }
  },

  clearStorage: async () => {
    try {
      localStorage.removeItem(getStorageKey('Event'));
      localStorage.removeItem(getStorageKey('Department'));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
};

export default transactionService;