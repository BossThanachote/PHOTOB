'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken, isAuthenticated, UserData, getUserData } from '../utils/auth'

interface AuthGuardProps {
  children: React.ReactNode
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9B1C27]"></div>
      <span className="text-gray-500">Loading...</span>
    </div>
  </div>
)

const AccessDenied = ({ onSignIn }: { onSignIn: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl text-red-600">Access Denied</div>
      <p className="text-gray-600 mb-2">Please sign in to continue</p>
      <button
        onClick={onSignIn}
        className="px-4 py-2 bg-[#9B1C27] text-white rounded-lg hover:bg-[#8B1922] transition-colors"
      >
        Go to Sign In
      </button>
    </div>
  </div>
)

const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl text-red-600">Something went wrong</div>
      <p className="text-gray-600 mb-2">An error occurred while loading the page</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-[#9B1C27] text-white rounded-lg hover:bg-[#8B1922] transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
)

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  const handleAuthCheck = async () => {
    try {
      setIsLoading(true)
      setHasError(false)

      const token = getAuthToken()
      const authed = isAuthenticated()

      if (!token || !authed) {
        console.log('Authentication failed: No token or not authenticated')
        router.replace('/admin/signin')
        return
      }

      const userInfo = getUserData()
      if (!userInfo) {
        console.log('Authentication failed: No user data')
        router.replace('/admin/signin')
        return
      }

      // Optional: Check for admin role if needed
      if (userInfo.role !== 'admin') {
        console.log('Authentication failed: User is not an admin')
        router.replace('/admin/signin')
        return
      }

      setUserData(userInfo)
      setIsAuthed(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleAuthCheck()
  }, [router])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (hasError) {
    return <ErrorFallback onRetry={handleAuthCheck} />
  }

  if (!isAuthed) {
    return <AccessDenied onSignIn={() => router.push('/admin/signin')} />
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}