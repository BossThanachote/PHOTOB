'use client'

import { useState } from "react"
import { Mail, Lock, ChevronLeft, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { loginAction } from "@/app/admin/actions/auth"
import { handleLoginSuccess } from "@/app/utils/auth" // Path ตามที่ Boss วางไว้

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)

    try {
      const result = await loginAction(formData)
      
      if (result.success && result.user) {
        // บันทึกสถานะลง Cookie/Local Storage ฝั่ง Client (ไฟล์ utils ของ Boss)
        handleLoginSuccess('session-active', {
          id: result.user.id,
          name: result.user.name || 'Admin',
          email: result.user.email,
          role: result.user.role as 'admin' | 'user'
        })
        
        router.push('/admin/dashboard')
      } else {
        setError(result.message || "เข้าสู่ระบบไม่สำเร็จ")
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-ibm-thai">
      <div className="p-10">
        <button onClick={() => router.back()} className="p-2 bg-gray-100 rounded-xl"><ChevronLeft /></button>
      </div>
      
      <main className="flex flex-col items-center px-6">
        <div className="w-full max-w-[26.5rem]">
          <h1 className="text-3xl font-bold mb-2">SignIn</h1>
          <p className="text-gray-500 mb-8">Sign In to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" placeholder="Email" required
                className="w-full h-16 pl-12 pr-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#9B1C27] outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} placeholder="Password" required
                className="w-full h-16 pl-12 pr-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#9B1C27] outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button 
              type="submit" disabled={isLoading}
              className="w-full h-16 bg-[#9B1C27] text-white rounded-2xl font-bold text-xl flex items-center justify-center disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}