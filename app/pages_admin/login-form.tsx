'use client'
import Image from "next/image";
import { useState } from "react";
import { Mail, Lock, ChevronLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setAuthToken } from "../utils/auth";
import { profileAPI } from "../MockAPI/MockProfile";

// Mock API function
const mockLogin = async (email: string, password: string): Promise<{ 
  success: boolean; 
  message: string; 
  token?: string;
  userData?: {
    email: string;
    name: string;
  }
}> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // ตรวจสอบว่าเป็น email และ password ที่ถูกต้อง
  if (email === 'loginkoakod@hotmail.com' && password === 'Bosshaha1122') {
    return { 
      success: true, 
      message: 'Login successful',
      token: 'mock_jwt_token',
      userData: {
        email: email,
        name: 'Admin name'
      }
    };
  }
  
  // กรณีที่ email หรือ password ไม่ถูกต้อง
  return { 
    success: false, 
    message: 'Invalid email or password. This email is not registered in the system.' 
  };
};


// Separate button component for reusability
const SocialButton = ({ icon, text }: { icon: string, text: string }) => (
  <button className="flex items-center justify-center w-[26.5rem] h-[4rem] border-[1px] border-[#C6C6C980] rounded-2xl bg-transparent cursor-pointer hover:bg-gray-50 transition-colors">
    <Image 
      src={`/${icon}`} 
      alt="" 
      width={24} 
      height={24} 
      className="mr-[0.5rem]" 
    />
    <span className="text-[#8E8E93] font-ibm-thai-400 text-[1rem]">{text}</span>
  </button>
);

// Input field component for reusability
const InputField = ({ 
  type, 
  placeholder, 
  icon: Icon,
  value,
  onChange, 
  showPassword, 
  togglePassword,
  disabled,
  onKeyDown  // เพิ่ม prop นี้
}: { 
  type: string, 
  placeholder: string, 
  icon: any,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  showPassword?: boolean,
  togglePassword?: () => void,
  disabled?: boolean,
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void  // เพิ่ม type นี้
}) => (
  <div className="flex items-center w-[26.5rem] h-[4rem] border-2 border-[#F7F7F7] bg-[#F7F7F7] pl-[2rem] rounded-2xl focus-within:border-[#9B1C27] transition-colors">
    <Icon size={16} />
    <input
      type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}  // เพิ่ม event handler นี้
      disabled={disabled}
      className="ml-2 flex-1 bg-transparent outline-none text-[1rem] disabled:cursor-not-allowed"
    />
    {type === 'password' && (
      <button
        type="button"
        onClick={togglePassword}
        className="px-4 text-gray-500 hover:text-gray-700"
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    )}
  </div>
);

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
  
    if (!email || !password) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await mockLogin(email, password);
      
      if (response.success && response.token && response.userData) {
        // เก็บ token และ email ใน cookie และ localStorage
        setAuthToken(response.token, response.userData.email);
        
        // Initialize profile
        profileAPI.initializeProfile(response.userData.email, response.token);
        
        setMessage({ text: response.message, type: 'success' });
        
        // redirect ไป dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1000);
      } else {
        setMessage({ text: response.message, type: 'error' });
      }
    } catch (error) {
      setMessage({ 
        text: 'An error occurred. Please try again later.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };
  return (
    <div className="min-h-screen bg-white select-none">
      <div className="h-[8rem] flex items-center">
        <button
          type="button"
          className="w-10 h-10 bg-[#F7F7F7] ml-10 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          onClick={() => router.back()}
          aria-label="Go back">
          <ChevronLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-center">
        <div className="w-[31rem] px-[2rem]">
          <header className="font-ibm-thai-500 text-[1.5rem] text-[#35353F]">SignIn</header>
          <p className="font-ibm-thai-400 text-[1.2rem] text-[#8E8E93]">Sign In to your account</p>
          
          <div className="flex flex-col items-center gap-[1rem] mt-10">
            <InputField 
              type="email" 
              placeholder="Enter your email" 
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <InputField 
              type="password" 
              placeholder="Password" 
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            />
            
            <div className="flex justify-end w-full">
              <Link href="/admin/forgot-password">
                <button className="text-[#981C27] font-ibm-thai-500 hover:underline">
                  Forgot password?
                </button>
              </Link>
            </div>
            
            {message && (
              <div className={`w-full text-center ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-[26.5rem] h-[4rem] bg-[#9B1C27] text-white rounded-2xl font-ibm-thai-400 text-[1.3rem] transition-colors
                ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#8B1922]'}`}
            >
              {isLoading ? 'Signing in...' : 'Continue'}
            </button>

            <div className="relative w-full flex items-center my-4">
              <div className="border-t border-[#D1D1D6] w-full"></div>
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-4 text-[#8E8E93] font-ibm-thai-400">
                Or login with
              </span>
            </div>
            
            <SocialButton icon="appleicon.png" text="Log In with Apple" />
            <SocialButton icon="googleicon.png" text="Log In with Google" />

            <p className="mt-8 text-[1rem] text-[#8E8E93] font-ibm-thai-500">
              Don't have any account?{' '}
              <Link href="/admin/signup">
                <button className="font-ibm-thai-500 text-[#F69052] hover:underline">
                  Sign Up
                </button>
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}