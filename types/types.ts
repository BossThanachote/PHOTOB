// types/types.ts
export interface Profile {
    name: string;
    email: string;
    image: string;
  }
  
  export type StatusType = 'Active' | 'Inactive' | 'Declined';
  
  export interface Transaction {
    id: string;
    status: StatusType;
    totalSale: number;
    date: string;
  }
  
  // เพิ่ม interface สำหรับ API
// types.ts
export interface TransactionAPI {
  getTransactions: () => Transaction[];
  updateTransactionStatus: (transactionId: string, newStatus: StatusType) => Transaction[];
  searchTransactions: (searchTerm: string) => Transaction[];
  deleteTransaction: (transactionId: string) => Transaction[];
  resetToDefault: () => Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction[];
  initialize: () => void;   // เพิ่ม method นี้
  clearStorage: () => void; // เพิ่ม method นี้
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