import Cookies from 'js-cookie'

// Constants
export const AUTH_TOKEN_KEY = 'auth_token'
export const USER_DATA_KEY = 'user_data'
export const TOKEN_EXPIRY_DAYS = 7

// Types
export interface UserData {
  id: string
  name: string
  email: string
  image?: string
  role: 'admin' | 'user'
}

export const getProfile = (): UserData | null => {
  return getUserData();
};

export interface AuthTokenInfo {
  token: string | null
  isValid: boolean
  error?: string
}

// Token Management
export const setAuthToken = (token: string): void => {
  try {
    Cookies.set(AUTH_TOKEN_KEY, token, {
      path: '/',
      secure: true,
      sameSite: 'lax',
      expires: TOKEN_EXPIRY_DAYS
    })
    console.log('Token set successfully')
  } catch (error) {
    console.error('Error setting auth token:', error)
    throw new Error('Failed to set authentication token')
  }
}

export const getAuthToken = (): string | null => {
  try {
    const token = Cookies.get(AUTH_TOKEN_KEY)
    return token || null
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

export const removeAuthToken = (): void => {
  try {
    Cookies.remove(AUTH_TOKEN_KEY, { path: '/' })
    console.log('Token removed successfully')
  } catch (error) {
    console.error('Error removing auth token:', error)
  }
}

// User Data Management
export const setUserData = (data: UserData): void => {
  try {
    Cookies.set(USER_DATA_KEY, JSON.stringify(data), {
      path: '/',
      secure: true,
      sameSite: 'lax',
      expires: TOKEN_EXPIRY_DAYS
    })
    console.log('User data set successfully')
  } catch (error) {
    console.error('Error setting user data:', error)
    throw new Error('Failed to set user data')
  }
}

export const getUserData = (): UserData | null => {
  try {
    const data = Cookies.get(USER_DATA_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error getting user data:', error)
    return null
  }
}

export const removeUserData = (): void => {
  try {
    Cookies.remove(USER_DATA_KEY, { path: '/' })
    console.log('User data removed successfully')
  } catch (error) {
    console.error('Error removing user data:', error)
  }
}

// Authentication Status
export const checkAuthStatus = (): AuthTokenInfo => {
  try {
    const token = getAuthToken()
    if (!token) {
      return { token: null, isValid: false, error: 'No token found' }
    }

    // Check if user data exists
    const userData = getUserData()
    if (!userData) {
      return { token, isValid: false, error: 'No user data found' }
    }

    // Add any additional token validation logic here if needed
    // For example, checking token expiration if stored in token payload

    return { token, isValid: true }
  } catch (error) {
    console.error('Error checking auth status:', error)
    return { 
      token: null, 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Authentication check failed' 
    }
  }
}

export const isAuthenticated = (): boolean => {
  const { isValid } = checkAuthStatus()
  return isValid
}

// Logout Function
export const logout = (): void => {
  try {
    removeAuthToken()
    removeUserData()
    console.log('Logout successful')
  } catch (error) {
    console.error('Error during logout:', error)
    throw new Error('Logout failed')
  }
}

// Helper Functions
export const clearAllAuthData = (): void => {
  try {
    logout()
    // Clear any additional auth-related data here
    localStorage.clear()
    sessionStorage.clear()
    console.log('All auth data cleared successfully')
  } catch (error) {
    console.error('Error clearing auth data:', error)
    throw new Error('Failed to clear authentication data')
  }
}

// Request Headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken()
  if (!token) {
    console.warn('No auth token found when generating headers')
    return {}
  }
  return {
    'Authorization': `Bearer ${token}`
  }
}

// Login Helper
export const handleLoginSuccess = (token: string, userData: UserData): void => {
  try {
    setAuthToken(token)
    setUserData(userData)
    console.log('Login data saved successfully')
  } catch (error) {
    console.error('Error handling login success:', error)
    throw new Error('Failed to save login data')
  }
}