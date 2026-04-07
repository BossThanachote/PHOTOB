// utils/auth.ts
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// 1. ฟังก์ชันจัดการเมื่อ Login สำเร็จ (ใช้ในหน้า SignIn)
export const handleLoginSuccess = (token: string, userData?: any) => {
  // สำคัญ: ใส่ path: '/' เพื่อให้ทุกหน้าอ่าน Cookie ตัวเดียวกันได้
  Cookies.set(TOKEN_KEY, token, { expires: 7, path: '/' }); 
  if (userData) {
    Cookies.set(USER_KEY, JSON.stringify(userData), { expires: 7, path: '/' });
  }
};


export const getAuthHeaders = () => {
  const token = Cookies.get(TOKEN_KEY);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const auth = {
  getToken: () => Cookies.get(TOKEN_KEY),
  getUser: () => {
    const user = Cookies.get(USER_KEY);
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  isAuthenticated: () => {
    const token = Cookies.get(TOKEN_KEY);
    return !!token; // คืนค่า true ถ้ามี token
  }
}