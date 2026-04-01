// utils/auth.ts

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
const TOKEN_KEY = 'auth_token';

export const auth = {
  // เก็บ Token ลงใน Cookie
  setToken: (token: string) => {
    Cookies.set(TOKEN_KEY, token, { 
      expires: 7, // หมดอายุใน 7 วันs
      secure: true, 
      sameSite: 'strict' 
    });
  },

  // ดึง Token ออกมาใช้งาน
  getToken: () => {
    return Cookies.get(TOKEN_KEY);
  },

  // ลบ Token (Logout)
  removeToken: () => {
    Cookies.remove(TOKEN_KEY);
  },

  // ตรวจสอบว่า User ล็อกอินอยู่หรือไม่
  isAuthenticated: (): boolean => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return false;

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      // ตรวจสอบว่า Token หมดอายุหรือยัง
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // ดึงข้อมูล User จาก Token
  getUser: () => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  
};