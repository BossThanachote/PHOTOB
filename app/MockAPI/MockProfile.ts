import Cookies from 'js-cookie';
import { 
  Profile, 
  AuthService,
  ServiceResponse,
  ApiError 
} from '@/types/types';

// Constants
const PROFILE_KEY = 'user_profile';
const AUTH_TOKEN_KEY = 'auth_token';
const SESSION_KEY = 'currentSession';
const TOKEN_EXPIRY_DAYS = 7;

// Types
interface SessionData {
  email: string;
  expiresAt: number;
}

const DEFAULT_PROFILE: Profile = {
  id: '',
  name: 'Admin name',
  email: '',
  image: ''
};

// Helper Functions
const saveProfile = (profile: Profile): void => {
  try {
    Cookies.set(PROFILE_KEY, JSON.stringify(profile), {
      path: '/',
      secure: true,
      sameSite: 'lax',
      expires: TOKEN_EXPIRY_DAYS
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    throw new Error('Failed to save profile');
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

const setAuthToken = (token: string): void => {
  try {
    Cookies.set(AUTH_TOKEN_KEY, token, {
      path: '/',
      secure: true,
      sameSite: 'lax',
      expires: TOKEN_EXPIRY_DAYS
    });
  } catch (error) {
    console.error('Error setting auth token:', error);
    throw new Error('Failed to set authentication token');
  }
};

const setSession = (email: string): void => {
  try {
    const sessionData: SessionData = {
      email,
      expiresAt: Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    };
    
    Cookies.set(SESSION_KEY, JSON.stringify(sessionData), {
      path: '/',
      secure: true,
      sameSite: 'lax',
      expires: TOKEN_EXPIRY_DAYS
    });
  } catch (error) {
    console.error('Error setting session:', error);
    throw new Error('Failed to set session');
  }
};

const checkSession = (): boolean => {
  try {
    const session = Cookies.get(SESSION_KEY);
    if (!session) return false;

    const sessionData: SessionData = JSON.parse(session);
    return sessionData.expiresAt > Date.now();
  } catch {
    return false;
  }
};

export const profileService: AuthService = {
  // Login
  login: async (email: string, password: string): Promise<{ token: string; user: Profile }> => {
    try {
      // Here you would normally make an API call
      // Mock successful login
      const token = 'mock_token_' + Date.now();
      
      setAuthToken(token);
      setSession(email);
      
      const profile = {
        ...DEFAULT_PROFILE,
        id: 'mock_id_' + Date.now(),
        email
      };
      
      saveProfile(profile);

      return { token, user: profile };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
      Cookies.remove(SESSION_KEY, { path: '/' });
      Cookies.remove(PROFILE_KEY, { path: '/' });
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  // Register
  register: async (email: string, password: string): Promise<{ token: string; user: Profile }> => {
    try {
      // Mock registration
      const token = 'mock_token_' + Date.now();
      
      setAuthToken(token);
      setSession(email);
      
      const profile = {
        ...DEFAULT_PROFILE,
        id: 'mock_id_' + Date.now(),
        email
      };
      
      saveProfile(profile);

      return { token, user: profile };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  },

  // Refresh Token
  refreshToken: async (): Promise<string> => {
    try {
      if (!checkSession()) {
        throw new Error('Session expired');
      }

      const newToken = 'mock_refresh_token_' + Date.now();
      setAuthToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Token refresh failed');
    }
  },

  // Get Profile
  getProfile: async (): Promise<Profile> => {
    try {
      if (!checkSession()) {
        throw new Error('Not authenticated');
      }

      const profile = loadProfile();
      if (!profile) {
        throw new Error('Profile not found');
      }

      return profile;
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error('Failed to get profile');
    }
  },

  // Update Profile
  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    try {
      if (!checkSession()) {
        throw new Error('Not authenticated');
      }

      const currentProfile = await profileService.getProfile();
      const updatedProfile = {
        ...currentProfile,
        ...data
      };

      saveProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  },
};

// Utility Functions
export const isAuthenticated = (): boolean => {
  try {
    return checkSession() && !!Cookies.get(AUTH_TOKEN_KEY);
  } catch {
    return false;
  }
};

export const getAuthToken = (): string | null => {
  try {
    return Cookies.get(AUTH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const getCurrentEmail = (): string | null => {
  try {
    const session = Cookies.get(SESSION_KEY);
    if (session) {
      const { email } = JSON.parse(session);
      return email;
    }
    return null;
  } catch {
    return null;
  }
};

export default profileService;