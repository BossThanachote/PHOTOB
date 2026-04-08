'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/app/utils/auth' 

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [hasError, setHasError] = useState(false)

const handleAuthCheck = async () => {
  try {
    const authed = auth.isAuthenticated();
    const userInfo = auth.getUser();

    console.log("🛡️ Auth Status:", authed);
    console.log("👤 User Info:", userInfo);

    if (!authed) {
      console.log("❌ No Token: Redirecting...");
      router.replace('/admin/signin');
      return;
    }

    if (userInfo?.role !== 'admin') {
      console.log("❌ Not Admin: Role is", userInfo?.role);
      router.replace('/admin/signin');
      return;
    }

    setIsAuthed(true);
  } catch (error) {
    setHasError(true);
  } finally {
    setIsLoading(false);
  }
}

  //  ตอนกำลังเช็คว่า Login หรือยัง
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9B1C27]"></div>
      <span className="text-gray-500 font-ibm-thai">กำลังตรวจสอบสิทธิ์...</span>
    </div>
  </div>
)

//  หน้าจอที่โชว์ Error
const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4 text-center p-6">
      <div className="text-xl text-red-600 font-bold">Something went wrong</div>
      <p className="text-gray-600 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูลหน้าเว็บ</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-[#9B1C27] text-white rounded-lg hover:bg-[#8B1922] transition-colors"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  </div>
)

  useEffect(() => {
    handleAuthCheck()
  }, []) 

  if (isLoading) return <LoadingSpinner />
  if (hasError) return <ErrorFallback onRetry={handleAuthCheck} />
  
  // ถ้าไม่ Authed และไม่ Loading เดี๋ยว useEffect จะพาไปหน้า Signin 
  if (!isAuthed) return null 

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}