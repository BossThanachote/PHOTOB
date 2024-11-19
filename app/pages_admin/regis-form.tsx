'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Mail, Lock, ChevronLeft, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ปุ่ม Social Login
const SocialButton = ({ icon, text }: { icon: string; text: string }) => (
  <button className="flex items-center justify-center w-[26.5rem] h-[4rem] border-[1px] border-[#C6C6C980] rounded-2xl bg-transparent cursor-pointer hover:bg-gray-50 transition-colors">
    <Image src={`/${icon}`} alt="" width={24} height={24} className="mr-[0.5rem]" />
    <span className="text-[#8E8E93] font-ibm-thai-400 text-[1rem]">{text}</span>
  </button>
);

// Input Field Component
const InputField = ({
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  showPassword,
  togglePassword,
  disabled,
  onKeyDown,
}: {
  type: string;
  placeholder: string;
  icon: any;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword?: boolean;
  togglePassword?: () => void;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex items-center w-[26.5rem] h-[4rem] border-2 border-[#F7F7F7] bg-[#F7F7F7] pl-[2rem] rounded-2xl focus-within:border-[#9B1C27] transition-colors">
    <Icon size={16} />
    <input
      type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
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

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // ฟังก์ชันตรวจสอบอีเมล
  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch('https://watt-photo-booth-api-production.up.railway.app/api/v1/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: 'temporary_password', 
        }),
      });

      if (response.ok) {
        return true; 
      }

      const data = await response.json();
      if (data.message?.toLowerCase().includes('invalid credentials')) {
        return true; 
      }

      return false; 
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };


  const validateForm = () => {
    if (!firstName || !lastName || !email || !password) {
      return 'Please fill in all fields';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    return null; // Validation ผ่าน
  };

  // ฟังก์ชัน Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setMessage({ text: validationError, type: 'error' });
      return;
    }

    setIsLoading(true);

    // ตรวจสอบว่าอีเมลมีอยู่ในระบบหรือไม่
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      setMessage({ text: 'This email address is already registered', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://watt-photo-booth-api-production.up.railway.app/api/v1/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ text: data.message || 'Registration failed', type: 'error' });
        return;
      }

      setMessage({ text: 'Registration successful! Please log in.', type: 'success' });
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setTimeout(() => router.replace('/admin/signin'), 2000);
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again later.', type: 'error' });
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
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-center">
        <div className="w-[31rem] px-[2rem]">
          <header className="font-ibm-thai-500 text-[1.5rem] text-[#35353F]">Sign Up</header>
          <p className="font-ibm-thai-400 text-[1.2rem] text-[#8E8E93]">Sign Up to your account</p>

          <div className="flex flex-col items-center gap-[1rem] mt-10">
            <InputField 
              type="text" 
              placeholder="Enter your firstname" 
              icon={User}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <InputField 
              type="text" 
              placeholder="Enter your lastname" 
              icon={User}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
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
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {message && (
              <div 
                className={`w-full text-center ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {message.text}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className={`w-[26.5rem] h-[4rem] bg-[#9B1C27] text-white rounded-2xl font-ibm-thai-400 text-[1.3rem] transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#8B1922]'
              }`}
            >
              {isLoading ? 'Signing up...' : 'Continue'}
            </button>

            <div className="relative w-full flex items-center my-4">
              <div className="border-t border-[#D1D1D6] w-full"></div>
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-4 text-[#8E8E93] font-ibm-thai-400">
                Or login with
              </span>
            </div>

            <SocialButton icon="appleicon.png" text="Sign up with Apple" />
            <SocialButton icon="googleicon.png" text="Sign up with Google" />

            <p className="mt-8 text-[1rem] text-[#8E8E93] font-ibm-thai-500">
              Already have an account?{' '}
              <Link href="/admin/signin">
                <button className="font-ibm-thai-500 text-[#35353F] hover:underline">
                  Sign In
                </button>
              </Link>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
