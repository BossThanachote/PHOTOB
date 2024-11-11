// types/api.ts
import { Transaction, StatusType } from './types';
import { Profile } from './types';
export interface TransactionAPI {
  getTransactions: () => Transaction[];
  updateTransactionStatus: (transactionId: string, newStatus: StatusType) => Transaction[];
  searchTransactions: (searchTerm: string) => Transaction[];
  deleteTransaction: (transactionId: string) => Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction[];
  initialize: () => void;
  clearStorage: () => void;
}

export interface ProfileAPI {
  getProfile: () => Profile | null;
  initializeProfile: (email: string, token: string) => Profile;
  updateProfileName: (name: string) => Promise<Profile | null>;
  updateProfileImage: (image: string) => Promise<Profile | null>;
  isAuthenticated: () => boolean;
  clearSession: () => void;
  resetAllData: () => void;
  hasProfile: () => boolean;
  getCurrentEmail: () => string | null;
}