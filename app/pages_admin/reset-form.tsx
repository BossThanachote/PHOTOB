'use client'
import { useState } from "react";
import { Lock, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock API function
const mockResetPassword = async (password: string): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (password.length < 6) {
    return { 
      success: false, 
      message: 'Password must be at least 6 characters' 
    };
  }
  
  return { 
    success: true, 
    message: 'Password has been reset successfully' 
  };
};

// Input field component
const InputField = ({ 
  type, 
  placeholder, 
  icon: Icon,
  value,
  onChange,
  showPassword,
  togglePassword,
  disabled
}: { 
  type: string, 
  placeholder: string, 
  icon: any,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  showPassword?: boolean,
  togglePassword?: () => void,
  disabled?: boolean
}) => (
  <div className="flex items-center w-[26.5rem] h-[4rem] border-2 border-[#F7F7F7] bg-[#F7F7F7] pl-[2rem] rounded-2xl focus-within:border-[#9B1C27] transition-colors">
    <Icon size={16} />
    <input
      type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
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

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await mockResetPassword(password);
      
      if (response.success) {
        setMessage({ text: response.message, type: 'success' });
        // Redirect to login page after successful password reset
        setTimeout(() => {
          router.push('/admin/login');
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
          <header className="font-ibm-thai-500 text-[1.5rem] text-[#35353F]">
            Reset password
          </header>
          <p className="font-ibm-thai-400 text-[1.2rem] text-[#8E8E93]">
            Password must be same in both password and confirm password
          </p>
          
          <div className="flex flex-col items-center gap-[1rem] mt-10">
            <InputField 
              type="password" 
              placeholder="Password" 
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              togglePassword={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            />
            <InputField 
              type="password" 
              placeholder="Confirm Password" 
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPassword={showConfirmPassword}
              togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
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
              {isLoading ? 'Resetting...' : 'Continue'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}