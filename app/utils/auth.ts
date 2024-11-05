// utils/auth.ts
import Cookies from 'js-cookie';  // ต้องติดตั้ง js-cookie ก่อน: npm install js-cookie @types/js-cookie

export const AUTH_TOKEN_KEY = 'auth_token';

export const setAuthToken = (token: string, email: string) => {
  if (typeof window !== 'undefined') {
    // เก็บ token
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    Cookies.set('auth_token', token, { 
      path: '/',
      expires: 7,
      sameSite: 'strict'
    });

    // เก็บ session
    const session = JSON.stringify({ email });
    localStorage.setItem('currentSession', session);
    Cookies.set('currentSession', session, {
      path: '/',
      expires: 7,
      sameSite: 'strict'
    });
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY) || Cookies.get('auth_token');
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    // ลบทั้งจาก localStorage และ cookie
    localStorage.removeItem(AUTH_TOKEN_KEY);
    Cookies.remove('auth_token', { path: '/' });
  }
};