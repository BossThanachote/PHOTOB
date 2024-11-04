'use client'
import Image from "next/image";
import { useState } from "react";
import { Mail, Lock, ChevronLeft, Eye, EyeOff, User } from "lucide-react"; // เพิ่ม User icon
import Link from "next/link";

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
  showPassword, 
  togglePassword 
}: { 
  type: string, 
  placeholder: string, 
  icon: any,
  showPassword?: boolean,
  togglePassword?: () => void 
}) => (
  <div className="flex items-center w-[26.5rem] h-[4rem] border-2 border-[#F7F7F7] bg-[#F7F7F7] pl-[2rem] rounded-2xl focus-within:border-[#9B1C27] transition-colors">
    <Icon size={16} />
    <input
      type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      placeholder={placeholder}
      className="ml-2 flex-1 bg-transparent outline-none text-[1rem]"
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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[8rem] flex items-center">
          <button
            type="button"
            className="w-10 h-10 bg-[#F7F7F7] ml-10 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Go back">
            <ChevronLeft size={20} />
          </button>
      </div>

      <form className="flex justify-center">
        <div className="w-[31rem] px-[2rem]">
          <header className="font-ibm-thai-500 text-[1.5rem] text-[#35353F]">Sign Up</header>
          <p className="font-ibm-thai-400 text-[1.2rem] text-[#8E8E93]">Sign Up to your account</p>
          
          <div className="flex flex-col items-center gap-[1rem] mt-10">
            {/* เพิ่มช่อง Firstname */}
            <InputField 
              type="text" 
              placeholder="Enter your firstname" 
              icon={Mail} 
            />
            {/* เพิ่มช่อง Lastname */}
            <InputField 
              type="text" 
              placeholder="Enter your lastname" 
              icon={User} 
            />
            <InputField 
              type="email" 
              placeholder="Enter your email" 
              icon={Mail} 
            />
            <InputField 
              type="password" 
              placeholder="Password" 
              icon={Lock}
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
            />
            
            <div className="flex justify-end w-full">
              <Link href="/admin/forgot-password">
                <button className="text-[#981C27] font-ibm-thai-500 hover:underline">
                  Forgot password?
                </button>
              </Link>
            </div>
            
            <button 
              type="submit" 
              className="w-[26.5rem] h-[4rem] bg-[#9B1C27] text-white rounded-2xl font-ibm-thai-400 text-[1.3rem] hover:bg-[#8B1922] transition-colors"
            >
              Continue
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