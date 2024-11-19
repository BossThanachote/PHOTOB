'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Frame, frameAPI } from '@/app/MockAPI/mockFrameApi'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

export default function FrameInformation() {
  const router = useRouter()
  const params = useParams()
  const frameId = params.id as string
  const [frameInfo, setFrameInfo] = useState<Frame | null>(null)

  useEffect(() => {
    const frame = frameAPI.getFrameById(frameId)
    if (frame) {
      setFrameInfo(frame)
    }
  }, [frameId])

  if (!frameInfo) {
    return <div>Loading...</div>
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
      <div className="h-[4rem] bg-white flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Management</h1>
          <span className="text-[#61616A]">|</span>
          <span className="text-[#61616A]">Frame management</span>
          <span className="text-[#8E8E93]">/</span>
          <span className="text-[#8E8E93]">Information</span>
        </div>
        <button
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg"
          onClick={() => router.push(`/admin/management/frame/edit/${frameId}`)}
        >
          EDIT
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl ">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Information Section */}
          <div className="p-6">
            <h2 className="text-xl font-medium mb-4">Information</h2>
            <p className="text-gray-600 mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Frame Name</div>
                <div className="col-span-2">{frameInfo.frameName}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Shot</div>
                <div className="col-span-2">
                  <div className="bg-orange-50 text-orange-800 w-8 h-8 rounded-lg flex items-center justify-center">
                    {frameInfo.shot}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Date</div>
                <div className="col-span-2">{frameInfo.date}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Status</div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    frameInfo.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {frameInfo.status}
                </div>
              </div>
            </div>
          </div>

          {/* Frame Section */}
          <div className="border-t">
            <div className="p-6">
              <h2 className="text-xl font-medium mb-4">Frame</h2>
              <p className="text-gray-600 mb-6">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
              
              <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                <img 
                  src={frameInfo.frame}
                  alt={frameInfo.frameName}
                  className="max-w-full h-auto"
                />
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