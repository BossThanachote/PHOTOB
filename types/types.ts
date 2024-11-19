// types/types.ts

export interface Profile {
  name: string;
  email: string;
  image: string;
}

export interface Frame {
  no: string;
  frameName: string;
  frame: string;
  status: StatusType;
  shot: number;
  date: string;
}

export interface Sticker {
  no: string;
  stickerName: string;
  sticker: string;
  status: StatusType;
  date: string;
}

export type StatusType = 'Active' | 'Inactive' | 'Declined';

// Updated Transaction interface
export interface Transaction {
  id: string;
  name: string;
  ipAddress: string;
  type: 'Event' | 'Department';
  status: StatusType;
  totalSale: number;
  date: string;
  frames: string[]; // Store frame IDs
  stickers: string[]; // Store sticker IDs
}

// Interface for frame uploads
export interface FrameUploadData {
  frameName: string;
  frame: string;
  status: StatusType;
  shot: number;
}

// Interface for sticker uploads
export interface StickerUploadData {
  stickerName: string;
  sticker: string;
  status: StatusType;
}

// Interface for event/machine uploads
export interface EventUploadData {
  name: string;
  ipAddress: string;
  type: 'Event' | 'Department';
  status: StatusType;
  frames: string[];
  stickers: string[];
}

// API Interfaces
export interface TransactionAPI {
  getTransactions: () => Transaction[];
  updateTransactionStatus: (transactionId: string, newStatus: StatusType) => Transaction[];
  searchTransactions: (searchTerm: string) => Transaction[];
  deleteTransaction: (transactionId: string) => Transaction[];
  resetToDefault: () => Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Transaction[];
  initialize: () => void;
  clearStorage: () => void;
  // New methods for frame and sticker management
  updateTransaction: (transactionId: string, data: Partial<Transaction>) => Transaction[];
  addFramesToTransaction: (transactionId: string, frameIds: string[]) => Transaction[];
  removeFrameFromTransaction: (transactionId: string, frameId: string) => Transaction[];
  addStickersToTransaction: (transactionId: string, stickerIds: string[]) => Transaction[];
  removeStickerFromTransaction: (transactionId: string, stickerId: string) => Transaction[];
  getTransactionById: (transactionId: string) => Transaction | null;
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

export interface FrameAPI {
  getFrames: () => Frame[];
  addFrame: (frameData: FrameUploadData) => Frame;
  updateFrame: (frameNo: string, updateData: Partial<Omit<Frame, 'no' | 'date'>>) => Frame | null;
  updateFrameStatus: (frameNo: string, newStatus: StatusType) => Frame | null;
  deleteFrame: (frameNo: string) => boolean;
  getFrameById: (frameNo: string) => Frame | null;
  clearFrames: () => void;
  resetToDefault: () => void;
  getFrameCount: () => number;
  searchFrames: (searchTerm: string) => Frame[];
  filterByStatus: (status: StatusType) => Frame[];
}

export interface StickerAPI {
  getStickers: () => Sticker[];
  addSticker: (stickerData: StickerUploadData) => Sticker;
  updateSticker: (stickerId: string, updateData: Partial<Omit<Sticker, 'no' | 'date'>>) => Sticker | null;
  updateStickerStatus: (stickerId: string, newStatus: StatusType) => Sticker | null;
  deleteSticker: (stickerId: string) => boolean;
  getStickerById: (stickerId: string) => Sticker | null;
  clearStickers: () => void;
  resetToDefault: () => void;
  getStickerCount: () => number;
  searchStickers: (searchTerm: string) => Sticker[];
  filterByStatus: (status: StatusType) => Sticker[];
}