'use client'
import { useState } from "react";
import { Mail, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // เพิ่ม import useRouter

// Mock API function
const mockSendVerificationCode = async (email: string): Promise<{ success: boolean; message: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (!email || !email.includes('@')) {
    return { 
      success: false, 
      message: 'Please enter a valid email address' 
    };
  }
  
  // Mock success response
  return { 
    success: true, 
    message: 'Verification code has been sent to your email' 
  };
};

// Input field component
const InputField = ({ 
  type, 
  placeholder, 
  icon: Icon,
  value,
  onChange,
  disabled
}: { 
  type: string, 
  placeholder: string, 
  icon: any,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  disabled?: boolean
}) => (
  <div className="flex items-center w-[26.5rem] h-[4rem] border-2 border-[#F7F7F7] bg-[#F7F7F7] pl-[2rem] rounded-2xl focus-within:border-[#9B1C27] transition-colors">
    <Icon size={16} />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="ml-2 flex-1 bg-transparent outline-none text-[1rem] disabled:cursor-not-allowed"
    />
  </div>
);

export default function ForgotPassword() {
  const router = useRouter(); // เพิ่ม useRouter
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await mockSendVerificationCode(email);
      
      if (response.success) {
        setMessage({ text: response.message, type: 'success' });
        // เพิ่ม timeout เพื่อให้ user เห็น success message สักครู่ก่อน redirect
        setTimeout(() => {
          router.push(`/admin/verify?email=${encodeURIComponent(email)}`);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[8rem] flex items-center">
        <Link href="/login">
          <button
            type="button"
            className="w-10 h-10 bg-[#F7F7F7] ml-10 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Go back">
            <ChevronLeft size={20} />
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="flex justify-center">
        <div className="w-[31rem] px-[2rem]">
          <header className="font-ibm-thai-500 text-[1.5rem] text-[#35353F]">
            Forgot password
          </header>
          <p className="font-ibm-thai-400 text-[1.2rem] text-[#8E8E93]">
            Enter your email to get a verification code
          </p>
          
          <div className="flex flex-col items-center gap-[1rem] mt-10">
            <InputField 
              type="email" 
              placeholder="Enter your email" 
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            
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
              {isLoading ? 'Sending...' : 'Continue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}