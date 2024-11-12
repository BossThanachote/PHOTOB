import { Sticker } from '@/types/types';

const STICKER_STORAGE_KEY = 'sticker_data';

export type StatusType = 'Active' | 'Inactive' | 'Declined';

const DEFAULT_STICKER_DATA: Sticker[] = [
  {
    no: '001',
    stickerName: 'Futuristic',
    sticker: '/sticker1.png',
    status: 'Active' as StatusType,
    date: '2023-04-05, 00:05PM'
  },
  {
    no: '002',
    stickerName: 'Futuristic',
    sticker: '/sticker2.png',
    status: 'Active' as StatusType,
    date: '2023-04-05, 00:05PM'
  }
];

export interface StickerUploadData {
  stickerName: string;
  sticker: string;
  status: StatusType;
}

const getStorageKey = (email: string) => `${email}_${STICKER_STORAGE_KEY}`;

export const stickerAPI = {
  getStickers: (): Sticker[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        const savedStickers = localStorage.getItem(getStorageKey(email));
        if (savedStickers) {
          return JSON.parse(savedStickers);
        }
      }
      return DEFAULT_STICKER_DATA;
    } catch (error) {
      console.error('Error loading stickers:', error);
      return DEFAULT_STICKER_DATA;
    }
  },

  addStickers: (newStickers: StickerUploadData[]): Sticker[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const currentStickers = stickerAPI.getStickers();
      
      const startId = currentStickers.length;
      
      const stickerEntries: Sticker[] = newStickers.map((sticker, index) => ({
        ...sticker,
        no: String(startId + index + 1).padStart(3, '0'),
        date: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }));

      const updatedStickers = [...currentStickers, ...stickerEntries];
      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedStickers));
      return updatedStickers;
    } catch (error) {
      console.error('Error adding stickers:', error);
      return [];
    }
  },

  updateStickerStatus: (stickerId: string, newStatus: StatusType): Sticker[] => {
    try {   
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const stickers = stickerAPI.getStickers();
      
      const updatedStickers = stickers.map(sticker => 
        sticker.no === stickerId 
          ? { ...sticker, status: newStatus }
          : sticker
      );

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedStickers));
      return updatedStickers;
    } catch (error) {
      console.error('Error updating sticker status:', error);
      return [];
    }
  },

  updateSticker: (stickerId: string, updatedData: Partial<Sticker>): Sticker[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const stickers = stickerAPI.getStickers();
      
      const updatedStickers = stickers.map(sticker => 
        sticker.no === stickerId 
          ? { ...sticker, ...updatedData }
          : sticker
      );

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedStickers));
      return updatedStickers;
    } catch (error) {
      console.error('Error updating sticker:', error);
      return [];
    }
  },

  deleteSticker: (stickerId: string): Sticker[] => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (!currentProfile) return [];

      const { email } = JSON.parse(currentProfile);
      const currentStickers = stickerAPI.getStickers();
      
      const filteredStickers = currentStickers.filter(
        sticker => sticker.no !== stickerId
      );

      const updatedStickers = filteredStickers.map((sticker, index) => ({
        ...sticker,
        no: String(index + 1).padStart(3, '0')
      }));

      localStorage.setItem(getStorageKey(email), JSON.stringify(updatedStickers));
      return updatedStickers;
    } catch (error) {
      console.error('Error deleting sticker:', error);
      return [];
    }
  },

  searchStickers: (searchTerm: string): Sticker[] => {
    try {
      const stickers = stickerAPI.getStickers();
      if (!searchTerm) return stickers;

      return stickers.filter(sticker => 
        sticker.no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.stickerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sticker.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching stickers:', error);
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
          localStorage.setItem(getStorageKey(email), JSON.stringify(DEFAULT_STICKER_DATA));
        }
      }
    } catch (error) {
      console.error('Error initializing sticker data:', error);
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
      console.error('Error clearing sticker storage:', error);
    }
  }
};