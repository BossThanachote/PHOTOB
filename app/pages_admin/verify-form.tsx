'use client'
import { Suspense } from 'react'
import { useState, useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function Verify() {
 return (
   <Suspense fallback={<div>Loading...</div>}>
     <VerifyContent />
   </Suspense>
 )
}

function VerifyContent() {

 // Mock API function for verifying code
 const mockVerifyCode = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
   await new Promise(resolve => setTimeout(resolve, 1000));
   
   if (code === '1234') {
     return { 
       success: true, 
       message: 'Verification successful' 
     };
   }
   
   return { 
     success: false, 
     message: 'Invalid verification code' 
   };
 };

 // Mock API function for resending code
 const mockResendCode = async (email: string): Promise<{ success: boolean; message: string }> => {
   await new Promise(resolve => setTimeout(resolve, 1000));
   return { 
     success: true, 
     message: 'New verification code has been sent' 
   };
 };

 const router = useRouter();
 const searchParams = useSearchParams();
 const email = searchParams.get('email') || '';
 
 const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
 const [isLoading, setIsLoading] = useState(false);
 const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
 const [timer, setTimer] = useState(12);
 const [canResend, setCanResend] = useState(false);
 const [isResending, setIsResending] = useState(false);
 
 const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
                   useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

 const handleCodeChange = (index: number, value: string) => {
   if (!/^\d*$/.test(value)) return;

   const newCode = [...verificationCode];
   newCode[index] = value;
   setVerificationCode(newCode);

   if (value !== '' && index < 3) {
     inputRefs[index + 1].current?.focus();
   }
 };

 const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
   if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
     inputRefs[index - 1].current?.focus();
   }
 };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   const code = verificationCode.join('');
   if (code.length !== 4) {
     setMessage({ text: 'Please enter all 4 digits', type: 'error' });
     return;
   }

   setIsLoading(true);
   setMessage(null);

   try {
     const response = await mockVerifyCode(email, code);
     if (response.success) {
       setMessage({ text: response.message, type: 'success' });
       setTimeout(() => {
         router.push('/admin/reset-password');
       }, 1000);
     } else {
       setMessage({ text: response.message, type: 'error' });
     }
   } catch (error) {
     setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
   } finally {
     setIsLoading(false);
   }
 };

 const startTimer = () => {
   setTimer(12);
   setCanResend(false);
   
   const countdown = setInterval(() => {
     setTimer((prevTimer) => {
       if (prevTimer <= 1) {
         clearInterval(countdown);
         setCanResend(true);
         return 0;
       }
       return prevTimer - 1;
     });
   }, 1000);

   return countdown;
 };

 useEffect(() => {
   const countdown = startTimer();
   return () => clearInterval(countdown);
 }, []);

 const handleResendCode = async () => {
   if (!canResend || isResending) return;
   
   setIsResending(true);
   setMessage(null);
   
   try {
     const response = await mockResendCode(email);
     if (response.success) {
       setMessage({ text: response.message, type: 'success' });
       const countdown = startTimer();
       return () => clearInterval(countdown);
     } else {
       setMessage({ text: response.message, type: 'error' });
     }
   } catch (error) {
     setMessage({ text: 'Failed to resend code', type: 'error' });
   } finally {
     setIsResending(false);
   }
 };

 return (
   <div className="min-h-screen bg-white select-none">
     <div className="h-[8rem] flex items-center">
       <Link href="/admin/forgot-password">
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
           Verification code
         </header>
         <p className="font-ibm-thai-400 text-[1.2rem] text-[#8E8E93]">
           Verify your account by entering the 4 digits code we sent to : {email}
         </p>
         
         <div className="flex flex-col items-center gap-[1rem] mt-10">
           <div className="flex gap-4">
             {verificationCode.map((digit, index) => (
               <div key={index}>
                 <label className="sr-only">
                   Digit {index + 1}
                 </label>
                 <input
                   ref={inputRefs[index]}
                   type="text"
                   maxLength={1}
                   value={digit}
                   onChange={(e) => handleCodeChange(index, e.target.value)}
                   onKeyDown={(e) => handleKeyDown(index, e)}
                   className="w-16 h-16 text-center text-2xl border-2 rounded-lg focus:border-[#1C264C] focus:bg-[#1C264C] bg-[#F7F7F7] border-[#F7F7F7] focus:text-white outline-none"
                   disabled={isLoading}
                   aria-label={`Digit ${index + 1} of verification code`}
                   title={`Digit ${index + 1}`}
                   inputMode="numeric"
                   pattern="[0-9]*"
                 />
               </div>
             ))}
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
             {isLoading ? 'Verifying...' : 'Verify'}
           </button>

           <div className="text-center mt-4">
             {canResend ? (
               <button
                 type="button"
                 onClick={handleResendCode}
                 className="text-[#9B1C27] hover:underline"
                 disabled={isResending}
               >
                 Resend code click
               </button>
             ) : (
               <span className="text-[#8E8E93]">
                 Resend Code In {timer}
               </span>
             )}
           </div>
         </div>
       </div>
     </form>
   </div>
 );
}