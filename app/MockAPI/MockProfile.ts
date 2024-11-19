import { Profile, ProfileAPI, TransactionAPI } from '@/types/types';
import { eventAPI } from './mockEventAPI';
import { departmentAPI } from './mockDepartmentAPI';

const STORAGE_KEY = 'user_profile';
const AUTH_TOKEN_KEY = 'auth_token';
const SESSION_KEY = 'currentSession';

const DEFAULT_PROFILE: Profile = {
  name: 'Admin name',
  email: 'loginkoakod@hotmail.com',
  image: '/default-profile.png'
};

// Storage utilities
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

export const profileAPI: ProfileAPI = {
  getProfile: (): Profile | null => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }

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

    // Set authentication
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email }));

    try {
      // Load or create profile
      const savedProfile = loadFromStorage();
      const profile = savedProfile || DEFAULT_PROFILE;

      // Save profile
      saveToStorage(profile);

      // Initialize transaction data
      eventAPI.initialize();
      departmentAPI.initialize();

      return profile;
    } catch (error) {
      console.error('Error initializing profile:', error);
      throw new Error('Failed to initialize profile');
    }
  },

  updateProfileName: async (name: string): Promise<Profile | null> => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }

    try {
      const currentProfile = profileAPI.getProfile();
      if (!currentProfile) return null;

      const updatedProfile = { ...currentProfile, name };
      saveToStorage(updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile name:', error);
      return null;
    }
  },

  updateProfileImage: async (image: string): Promise<Profile | null> => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }

    try {
      const currentProfile = profileAPI.getProfile();
      if (!currentProfile) return null;

      const updatedProfile = { ...currentProfile, image };
      saveToStorage(updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile image:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const session = localStorage.getItem(SESSION_KEY);

      if (!token || !session) return false;

      const { email } = JSON.parse(session);
      return email === 'loginkoakod@hotmail.com' && token === 'mock_jwt_token';
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  clearSession: () => {
    try {
      // Clear authentication
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(SESSION_KEY);

      // Clear transactions data
      const profile = profileAPI.getProfile();
      if (profile) {
        eventAPI.clearStorage();
        departmentAPI.clearStorage();
      }
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  resetAllData: () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },

  hasProfile: (): boolean => {
    try {
      return loadFromStorage() !== null;
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  },

  getCurrentEmail: (): string | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const { email } = JSON.parse(session);
        return email;
      }
      return null;
    } catch (error) {
      console.error('Error getting current email:', error);
      return null;
    }
  }
};