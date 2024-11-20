// Status type definition
export type StatusType = 'Active' | 'Inactive' | 'Declined';

// Base interfaces for Profile
export interface Profile {
  id?: string;
  name: string;
  email: string;
  image: string;
}

// API Response interfaces
export interface APIResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: string;
  message: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Sticker interfaces
export interface APISticker {
  id: string;
  code: string;
  name: string;
  image_url: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sticker {
  id: string;
  no: string;
  stickerName: string;
  sticker: string;
  status: StatusType;
  date: string;
}

export interface StickerResponse {
  items: Sticker[];
  total: number;
  page: number;
  limit: number;
}

// Frame interfaces
export interface Frame {
  id: string;
  no: string;
  frameName: string;
  frame: string;
  status: StatusType;
  shot: number;
  date: string;
}

export interface FrameResponse {
  items: Frame[];
  total: number;
  page: number;
  limit: number;
}

// Upload Data Interfaces
export interface FrameUploadData {
  frameName: string;
  frame: File | Blob | string;
  status: StatusType;
  shot: number;
}

export interface StickerUploadData {
  stickerName: string;
  sticker: File | Blob | string;
  status: StatusType;
}

// Update Data Interfaces
export interface FrameUpdateData {
  frameName?: string;
  frame?: File | Blob | string;
  status?: StatusType;
  shot?: number;
}

export interface StickerUpdateData {
  stickerName?: string;
  sticker?: File | Blob | string;
  status?: StatusType;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StatusType;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}

// Service Response Types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface TransactionService {
  getTransactions: () => Promise<Transaction[]>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
  updateTransactionStatus: (id: string, status: StatusType) => Promise<Transaction[]>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction[]>;
  addFramesToTransaction: (id: string, frameIds: string[]) => Promise<Transaction[]>;
  removeFrameFromTransaction: (id: string, frameId: string) => Promise<Transaction[]>;
  addStickersToTransaction: (id: string, stickerIds: string[]) => Promise<Transaction[]>;
  removeStickerFromTransaction: (id: string, stickerId: string) => Promise<Transaction[]>;
  searchTransactions: (searchTerm: string) => Promise<Transaction[]>;
  deleteTransaction: (id: string) => Promise<Transaction[]>;
  addTransaction: (data: TransactionUploadData) => Promise<Transaction[]>;
  resetToDefault: () => Promise<Transaction[]>;
  initialize: () => Promise<void>;
  clearStorage: () => Promise<void>;
}

// Transaction interfaces
export interface Transaction {
  id: string;
  name: string;
  ipAddress: string;
  type: 'Event' | 'Department';
  status: StatusType;
  totalSale: number;
  date: string;
  frames: string[];    // Store frame IDs
  stickers: string[];  // Store sticker IDs
}

export interface TransactionUploadData {
  name: string;
  ipAddress: string;
  type: 'Event' | 'Department';
  status: StatusType;
  totalSale: number;  
  frames: string[];
  stickers: string[];
}

// Error Types
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// Service Interfaces
export interface StickerService {
  getStickers: (params?: QueryParams) => Promise<StickerResponse>;
  getStickerById: (id: string) => Promise<Sticker>;
  createSticker: (data: StickerUploadData) => Promise<Sticker>;
  updateSticker: (id: string, data: StickerUpdateData) => Promise<Sticker>;
  updateStickerStatus: (id: string, status: StatusType) => Promise<Sticker>;
  updateStickerImage: (id: string, image: File | Blob | string) => Promise<Sticker>;
  deleteSticker: (id: string) => Promise<void>;
}

export interface AuthService {
  login: (email: string, password: string) => Promise<{ token: string; user: Profile }>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<{ token: string; user: Profile }>;
  refreshToken: () => Promise<string>;
  getProfile: () => Promise<Profile>;
  updateProfile: (data: Partial<Profile>) => Promise<Profile>;
}

// Utility Types
export type UUID = string;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QueryResult<T> {
  data: T[];
  pagination: Pagination;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  direction: SortDirection;
}

export interface FilterOptions {
  field: string;
  value: string | number | boolean | null;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
}

// Form Data Types
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
}

export type FormData<T> = {
  [K in keyof T]: FormField<T[K]>;
};