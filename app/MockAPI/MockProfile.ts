// services/profile.ts
import Cookies from 'js-cookie';
import { Profile, ProfileAPI } from '@/types/types';

const PROFILE_KEY = 'user_profile';
const AUTH_TOKEN_KEY = 'auth_token';
const SESSION_KEY = 'currentSession';

const DEFAULT_PROFILE: Profile = {
  name: 'Admin name',
  email: '',  // จะถูกเติมจากข้อมูลที่ได้จาก API
  image: ''
};

const saveProfile = (profile: Profile) => {
  try {
    Cookies.set(PROFILE_KEY, JSON.stringify(profile), {
      path: '/',
      secure: true,
      sameSite: 'lax'
    });
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

const loadProfile = (): Profile | null => {
  try {
    const savedProfile = Cookies.get(PROFILE_KEY);
    return savedProfile ? JSON.parse(savedProfile) : null;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
};

export const profileAPI: ProfileAPI = {
  getProfile: (): Profile | null => {
    if (!profileAPI.isAuthenticated()) {
      return null;
    }
    return loadProfile() || DEFAULT_PROFILE;
  },

  initializeProfile: (email: string, token: string): Profile => {
    try {
      // Set authentication
      Cookies.set(AUTH_TOKEN_KEY, token, {
        path: '/',
        secure: true,
        sameSite: 'lax'
      });
      
      Cookies.set(SESSION_KEY, JSON.stringify({ email }), {
        path: '/',
        secure: true,
        sameSite: 'lax'
      });

      // Create and save profile
      const profile = {
        ...DEFAULT_PROFILE,
        email
      };
      saveProfile(profile);

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
      saveProfile(updatedProfile);

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
      saveProfile(updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile image:', error);
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    try {
      const token = Cookies.get(AUTH_TOKEN_KEY);
      const session = Cookies.get(SESSION_KEY);

      if (!token || !session) return false;

      const { email } = JSON.parse(session);
      return !!email && !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  clearSession: () => {
    try {
      Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
      Cookies.remove(SESSION_KEY, { path: '/' });
      Cookies.remove(PROFILE_KEY, { path: '/' });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  resetAllData: () => {
    try {
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });
      window.location.reload();
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  },

  hasProfile: (): boolean => {
    try {
      return loadProfile() !== null;
    } catch (error) {
      console.error('Error checking profile existence:', error);
      return false;
    }
  },

  getCurrentEmail: (): string | null => {
    try {
      const session = Cookies.get(SESSION_KEY);
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