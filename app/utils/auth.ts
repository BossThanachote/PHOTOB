// utils/auth.ts
import Cookies from 'js-cookie';

export const AUTH_TOKEN_KEY = 'auth_token';

export const setAuthToken = (token: string) => {
  Cookies.set(AUTH_TOKEN_KEY, token, {
    path: '/',
    secure: true,
    sameSite: 'lax'  // เปลี่ยนเป็น 'lax' เพื่อให้ทำงานกับ redirect ได้ดีขึ้น
  });
};

export const getAuthToken = () => {
  return Cookies.get(AUTH_TOKEN_KEY);
};

export const removeAuthToken = () => {
  Cookies.remove(AUTH_TOKEN_KEY, { path: '/' });
};