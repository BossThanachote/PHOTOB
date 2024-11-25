'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import frameService from '@/app/services/frameService'
import type { Frame, StatusType } from '@/types/types'
import { Loader2 } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

export default function FrameInformation() {
  const router = useRouter()
  const params = useParams()
  const frameId = decodeURIComponent(params.id as string)
  
  // States
  const [frameInfo, setFrameInfo] = useState<Frame | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Helper function for status colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-orange-500'
      case 'declined':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Fetch frame data
  useEffect(() => {
    const fetchFrameData = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching frame with ID:', frameId)
          
        const response = await frameService.getFrames({
          page: 1,
          limit: 100
        })
        console.log('All frames:', response)
          
        const targetFrame = response.items.find(frame => 
          frame.id === frameId
        )
        console.log('Found frame:', targetFrame)
  
        if (targetFrame) {
          setFrameInfo(targetFrame)
        }
      } catch (err) {
        console.error('Error fetching frame:', err)
      } finally {
        setIsLoading(false)
      }
    }
  
    if (frameId) {
      fetchFrameData()
    }
  }, [frameId])

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500">Loading frame information...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="grid grid-cols-10 w-full h-screen">   
        <div className="col-span-10 sm:col-span-3 xl:col-span-2 col-span-0">
          <SideBar />
        </div>
        <div className="sm:col-span-7 xl:col-span-8 col-span-10">  
          <div className="min-h-screen bg-[#F7F7F7]">
            {/* Header */} 
            <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-medium">Management</h1>
                <span className="text-[#61616A]">|</span>
                <span className="text-[#61616A]">Frame management</span>
                <span className="text-gray-400">/</span>
                <span className="text-[#8E8E93]">Information</span>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/admin/management/frame/edit/${frameId}`)}
                className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                EDIT
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-2">Information</h2>
                  <p className="text-gray-600">
                    View your frame information below.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Frame Name */}
                  <div>
                    <label className="block font-medium mb-2">
                      Frame Name
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      {frameInfo?.frameName}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-medium mb-2">
                      Status
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(frameInfo?.status || '')}`} />
                        {frameInfo?.status}
                      </div>
                    </div>
                  </div>

                  {/* Shot */}
                  <div>
                    <label className="block font-medium mb-2">
                      Shot
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      <div className="bg-orange-50 text-orange-800 w-8 h-8 rounded-lg flex items-center justify-center">
                        {frameInfo?.shot}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-medium mb-2">
                      Date
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      {frameInfo?.date}
                    </div>
                  </div>

                  {/* Frame Image */}
                  <div>
                    <label className="block font-medium mb-2">Frame</label>
                    <div className="space-y-4">
                      <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {frameInfo?.frame ? (
                          <img 
                            src={frameInfo.frame}
                            alt={frameInfo.frameName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}