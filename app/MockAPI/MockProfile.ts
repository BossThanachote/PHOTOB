// mockApi.ts
import Cookies from "js-cookie";

// MockAPI/MockProfile.ts
export interface Profile {
  name: string;
  email: string;
  image: string;
}

const STORAGE_KEY = 'user_profile';

const DEFAULT_PROFILE: Profile = {
  name: 'Admin name',
  email: 'loginkoakod@hotmail.com',
  image: '/default-profile.png'
};

// เพิ่มฟังก์ชันสำหรับจัดการ localStorage
const saveToStorage = (profile: Profile) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving profile to storage:', error);
  }
};

const loadFromStorage = (): Profile | null => {
  try {
    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      return JSON.parse(savedProfile);
    }
  } catch (error) {
    console.error('Error loading profile from storage:', error);
  }
  return null;
};

export const profileAPI = {
  getProfile: (): Profile | null => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }

    // โหลดข้อมูลจาก localStorage ก่อน
    const savedProfile = loadFromStorage();
    if (savedProfile && savedProfile.email === 'loginkoakod@hotmail.com') {
      return savedProfile;
    }

    return DEFAULT_PROFILE;
  },

  initializeProfile: (email: string, token: string): Profile => {
    if (email !== 'loginkoakod@hotmail.com') {
      throw new Error('Invalid email');
    }

    // โหลดข้อมูลที่บันทึกไว้ (ถ้ามี)
    const savedProfile = loadFromStorage();
    const profile = savedProfile || DEFAULT_PROFILE;

    // บันทึกลง localStorage
    saveToStorage(profile);
    
    return profile;
  },

  updateProfileName: async (name: string): Promise<Profile | null> => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }

    const currentProfile = profileAPI.getProfile();
    if (!currentProfile) return null;

    const updatedProfile = { ...currentProfile, name };
    saveToStorage(updatedProfile);
    
    return updatedProfile;
  },

  updateProfileImage: async (image: string): Promise<Profile | null> => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }

    const currentProfile = profileAPI.getProfile();
    if (!currentProfile) return null;

    const updatedProfile = { ...currentProfile, image };
    saveToStorage(updatedProfile);
    
    return updatedProfile;
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('auth_token');
    const session = localStorage.getItem('currentSession');

    if (!token || !session) return false;

    try {
      const { email } = JSON.parse(session);
      return email === 'loginkoakod@hotmail.com' && token === 'mock_jwt_token';
    } catch {
      return false;
    }
  },

  clearSession: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentSession');
    // ไม่ต้องลบ profile จาก localStorage เพื่อให้เก็บการตั้งค่าไว้สำหรับการ login ครั้งต่อไป
  }
};