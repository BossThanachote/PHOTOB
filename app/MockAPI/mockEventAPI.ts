import { Transaction, StatusType, TransactionAPI } from '@/types/types';

const EVENT_STORAGE_KEY = 'event_data';

// Default event data
const DEFAULT_EVENTS: Transaction[] = [
  {
    id: '001',
    name: 'Event 001',
    ipAddress: '172.16.254.1',
    type: 'Event',
    status: 'Active',
    totalSale: 50000,
    date: '2023-04-05, 00:05PM',
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
    date: '2023-04-05, 00:05PM',
    frames: [],
    stickers: []
  }
];

// Helper function to get storage key with email prefix
const getStorageKey = (email: string) => `${email}_${EVENT_STORAGE_KEY}`;

// Helper function to reorder IDs
const reorderIds = (transactions: Transaction[]): Transaction[] => {
  return transactions.map((transaction, index) => ({
    ...transaction,
    id: String(index + 1).padStart(3, '0'),
    name: `${transaction.type} ${String(index + 1).padStart(3, '0')}`
  }));
};

// Helper function to save to localStorage
const saveToStorage = (events: Transaction[]) => {
  try {
    const currentProfile = localStorage.getItem('adminProfile');
    if (currentProfile) {
      const { email } = JSON.parse(currentProfile);
      localStorage.setItem(getStorageKey(email), JSON.stringify(events));
    }
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

// Helper function to load from localStorage
const loadFromStorage = (): Transaction[] => {
  try {
    const currentProfile = localStorage.getItem('adminProfile');
    if (currentProfile) {
      const { email } = JSON.parse(currentProfile);
      const savedEvents = localStorage.getItem(getStorageKey(email));
      if (savedEvents) {
        return JSON.parse(savedEvents);
      }
    }
  } catch (error) {
    console.error('Error loading events:', error);
  }
  return DEFAULT_EVENTS;
};

// Event API implementation
export const eventAPI: TransactionAPI = {
  getTransactions: (): Transaction[] => {
    return loadFromStorage();
  },

  getTransactionById: (transactionId: string): Transaction | null => {
    const events = loadFromStorage();
    return events.find(event => event.id === transactionId) || null;
  },

  updateTransactionStatus: (transactionId: string, newStatus: StatusType): Transaction[] => {
    const events = loadFromStorage();
    const updatedEvents = events.map(event => 
      event.id === transactionId
        ? { ...event, status: newStatus }
        : event
    );
    saveToStorage(updatedEvents);
    return updatedEvents;
  },

  updateTransaction: (transactionId: string, data: Partial<Transaction>): Transaction[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const events = loadFromStorage();
      const currentTransaction = events.find(event => event.id === transactionId);

      // ถ้ามีการเปลี่ยน Type จาก Event เป็น Department
      if (data.type && data.type === 'Department' && currentTransaction?.type === 'Event') {
        // 1. ลบข้อมูลออกจาก Event
        const remainingEvents = events.filter(event => event.id !== transactionId);
        const reorderedEvents = reorderIds(remainingEvents);
        saveToStorage(reorderedEvents);

        // 2. เพิ่มข้อมูลไปยัง Department
        const departmentAPI = require('./mockDepartmentAPI').departmentAPI;
        const departmentTransactions = departmentAPI.getTransactions();
        const newDepartmentId = String(departmentTransactions.length + 1).padStart(3, '0');

        const movedTransaction: Transaction = {
          ...currentTransaction,
          ...data,
          id: newDepartmentId,
          name: `Department ${newDepartmentId}`,
          type: 'Department',
          date: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        };

        departmentTransactions.push(movedTransaction);
        localStorage.setItem(
          `${email}_department_transactions`,
          JSON.stringify(departmentTransactions)
        );

        return reorderedEvents;
      }

      // ถ้าไม่มีการเปลี่ยน Type ให้ทำงานปกติ
      const updatedEvents = events.map(event =>
        event.id === transactionId
          ? {
              ...event,
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
          : event
      );
      
      saveToStorage(updatedEvents);
      return updatedEvents;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return [];
    }
  },

  addFramesToTransaction: (transactionId: string, frameIds: string[]): Transaction[] => {
    const events = loadFromStorage();
    const updatedEvents = events.map(event =>
      event.id === transactionId
        ? {
            ...event,
            frames: [...new Set([...event.frames, ...frameIds])]
          }
        : event
    );
    saveToStorage(updatedEvents);
    return updatedEvents;
  },

  removeFrameFromTransaction: (transactionId: string, frameId: string): Transaction[] => {
    const events = loadFromStorage();
    const updatedEvents = events.map(event =>
      event.id === transactionId
        ? {
            ...event,
            frames: event.frames.filter(id => id !== frameId)
          }
        : event
    );
    saveToStorage(updatedEvents);
    return updatedEvents;
  },

  addStickersToTransaction: (transactionId: string, stickerIds: string[]): Transaction[] => {
    const events = loadFromStorage();
    const updatedEvents = events.map(event =>
      event.id === transactionId
        ? {
            ...event,
            stickers: [...new Set([...event.stickers, ...stickerIds])]
          }
        : event
    );
    saveToStorage(updatedEvents);
    return updatedEvents;
  },

  removeStickerFromTransaction: (transactionId: string, stickerId: string): Transaction[] => {
    const events = loadFromStorage();
    const updatedEvents = events.map(event =>
      event.id === transactionId
        ? {
            ...event,
            stickers: event.stickers.filter(id => id !== stickerId)
          }
        : event
    );
    saveToStorage(updatedEvents);
    return updatedEvents;
  },

  searchTransactions: (searchTerm: string): Transaction[] => {
    const events = loadFromStorage();
    if (!searchTerm) return events;

    const lowercaseSearch = searchTerm.toLowerCase();
    return events.filter(event => 
      event.id.toLowerCase().includes(lowercaseSearch) ||
      event.name.toLowerCase().includes(lowercaseSearch) ||
      event.ipAddress.toLowerCase().includes(lowercaseSearch) ||
      event.type.toLowerCase().includes(lowercaseSearch) ||
      event.status.toLowerCase().includes(lowercaseSearch) ||
      event.date.toLowerCase().includes(lowercaseSearch)
    );
  },

  deleteTransaction: (transactionId: string): Transaction[] => {
    const events = loadFromStorage();
    const updatedEvents = events.filter(event => event.id !== transactionId);
    const reorderedEvents = reorderIds(updatedEvents);
    saveToStorage(reorderedEvents);
    return reorderedEvents;
  },

  addTransaction: (transaction: Omit<Transaction, 'id'>): Transaction[] => {
    const events = loadFromStorage();
    const newId = String(events.length + 1).padStart(3, '0');
    const newTransaction: Transaction = {
      ...transaction,
      id: newId,
      name: `Event ${newId}`,
      type: 'Event',
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
    const updatedEvents = [...events, newTransaction];
    saveToStorage(updatedEvents);
    return updatedEvents;
  },

  resetToDefault: (): Transaction[] => {
    saveToStorage(DEFAULT_EVENTS);
    return DEFAULT_EVENTS;
  },

  initialize: (): void => {
    const currentProfile = localStorage.getItem('adminProfile');
    if (currentProfile) {
      const { email } = JSON.parse(currentProfile);
      const existingData = localStorage.getItem(getStorageKey(email));
      if (!existingData) {
        saveToStorage(DEFAULT_EVENTS);
      }
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
      console.error('Error clearing events:', error);
    }
  }

  
};

export default eventAPI;