// mockApi.ts
import Cookies from "js-cookie";

export interface Profile {
  name: string;
  email: string;
  image: string;
}

interface ProfileStore {
  [email: string]: Profile;
}

// Default profile data
const getDefaultProfile = (email: string): Profile => ({
  name: 'Admin name',
  email: email,
  image: '/api/placeholder/80/80'
});

// Mock API functions
export const profileAPI = {
  // Get profile data for specific email
  getProfile: (): Profile => {
    try {
      // ตรวจสอบทั้ง session และ token
      const currentSession = localStorage.getItem('currentSession');
      const token = localStorage.getItem('token');

      if (!currentSession || !token) {
        return getDefaultProfile('admin@email.com');
      }

      const { email } = JSON.parse(currentSession);
      
      const profileStore = localStorage.getItem('profileStore');
      if (profileStore) {
        const profiles: ProfileStore = JSON.parse(profileStore);
        if (profiles[email]) {
          return profiles[email];
        }
      }
      
      return getDefaultProfile(email);
    } catch (error) {
      console.error('Error getting profile:', error);
      return getDefaultProfile('admin@email.com');
    }
  },

  // Initialize profile when logging in
  initializeProfile: (email: string, token: string) => {
    try {
      // เก็บทั้ง session และ token
      localStorage.setItem('currentSession', JSON.stringify({ email }));
      localStorage.setItem('token', token);

      const profileStore = localStorage.getItem('profileStore');
      const profiles: ProfileStore = profileStore ? JSON.parse(profileStore) : {};

      if (!profiles[email]) {
        profiles[email] = getDefaultProfile(email);
        localStorage.setItem('profileStore', JSON.stringify(profiles));
      }

      return profiles[email];
    } catch (error) {
      console.error('Error initializing profile:', error);
      return getDefaultProfile(email);
    }
  },

  // Update profile data
  updateProfile: (newProfile: Profile): Profile => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (!currentSession) {
        throw new Error('No active session');
      }

      const { email } = JSON.parse(currentSession);
      const profiles: ProfileStore = JSON.parse(localStorage.getItem('profileStore') || '{}');
      
      // อัพเดทข้อมูลสำหรับอีเมลนั้นๆ
      profiles[email] = { ...profiles[email], ...newProfile, email };
      localStorage.setItem('profileStore', JSON.stringify(profiles));
      
      return profiles[email];
    } catch (error) {
      console.error('Error updating profile:', error);
      return newProfile;
    }
  },

  // Update profile image
  updateProfileImage: (imageUrl: string): Profile => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (!currentSession) {
        throw new Error('No active session');
      }

      const { email } = JSON.parse(currentSession);
      const profiles: ProfileStore = JSON.parse(localStorage.getItem('profileStore') || '{}');
      
      // อัพเดทรูปภาพสำหรับอีเมลนั้นๆ
      profiles[email] = { ...profiles[email], image: imageUrl };
      localStorage.setItem('profileStore', JSON.stringify(profiles));
      
      return profiles[email];
    } catch (error) {
      console.error('Error updating profile image:', error);
      return getDefaultProfile('admin@email.com');
    }
  },

  // Update profile name
  updateProfileName: (name: string): Profile => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (!currentSession) {
        throw new Error('No active session');
      }

      const { email } = JSON.parse(currentSession);
      const profiles: ProfileStore = JSON.parse(localStorage.getItem('profileStore') || '{}');
      
      // อัพเดทชื่อสำหรับอีเมลนั้นๆ
      profiles[email] = { ...profiles[email], name };
      localStorage.setItem('profileStore', JSON.stringify(profiles));
      
      return profiles[email];
    } catch (error) {
      console.error('Error updating profile name:', error);
      return getDefaultProfile('admin@email.com');
    }
  },

  // Check if user is logged in
  isLoggedIn: (): boolean => {
    try {
      const token = localStorage.getItem('token');
      const currentSession = localStorage.getItem('currentSession');
      return !!(token && currentSession);
    } catch {
      return false;
    }
  },

  // Get current user's email
  getCurrentEmail: (): string | null => {
    try {
      const currentSession = localStorage.getItem('currentSession');
      if (currentSession) {
        const { email } = JSON.parse(currentSession);
        return email;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Clear session when logging out
  clearSession: () => {
    try {
      // ลบข้อมูลทั้งหมดที่เกี่ยวข้องกับ session
      localStorage.removeItem('currentSession');
      localStorage.removeItem('token');
      
      // ลบ cookies
      Cookies.remove('auth_token', { path: '/' });
      Cookies.remove('currentSession', { path: '/' });
  
      // ลบข้อมูลอื่นๆ
      const itemsToRemove = [
        '_items',
        '_transactions',
        '_filters',
        '_frames',
        '_stickers'
      ];
  
      Object.keys(localStorage).forEach(key => {
        if (itemsToRemove.some(item => key.includes(item))) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  // Set auth token
  setAuthToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  // Get auth token
  getAuthToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Remove auth token
  removeAuthToken: (): void => {
    localStorage.removeItem('token');
  }
};