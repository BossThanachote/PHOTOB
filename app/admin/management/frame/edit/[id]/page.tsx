'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Frame, frameAPI } from '@/app/MockAPI/mockFrameApi'
import { X } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

export default function FrameEdit() {
  const router = useRouter()
  const params = useParams()
  const frameId = params.id as string
  const [frameInfo, setFrameInfo] = useState<Frame | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [formData, setFormData] = useState({
    frameName: '',
    shot: 3,
    status: 'Active' as 'Active' | 'Disable',
    frame: ''
  })

  useEffect(() => {
    const frame = frameAPI.getFrameById(frameId)
    if (frame) {
      setFrameInfo(frame)
      setFormData({
        frameName: frame.frameName,
        shot: frame.shot,
        status: frame.status,
        frame: frame.frame
      })
    }
  }, [frameId])

  const handleFileUpload = (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          // Create URL for preview
          const fileUrl = URL.createObjectURL(file)
          setFormData(prev => ({ ...prev, frame: fileUrl }))
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSave = () => {
    if (!frameInfo) return

    // Update frame data
    const updatedFrame = frameAPI.updateFrame(frameId, {
      frameName: formData.frameName,
      shot: formData.shot,
      status: formData.status,
      frame: formData.frame
    })

    if (updatedFrame) {
      router.push(`/admin/management/frame/information/${frameId}`)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this frame?')) {
      const success = frameAPI.deleteFrame(frameId)
      if (success) {
        router.push('/admin/management/frame')
      }
    }
  }

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
          <span className="text-[#8E8E93]">Edit Frame</span>
        </div>
        <button
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg"
          onClick={handleSave}
        >
          SAVE
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl ">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Information Section */}
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Information</h2>
              <button
                type="button"
                className="text-red-500 hover:text-red-600 flex items-center gap-2"
                onClick={handleDelete}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Frame Name *</div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={formData.frameName}
                    onChange={(e) => setFormData(prev => ({ ...prev, frameName: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter frame name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Shot *</div>
                <div className="col-span-2">
                  <select
                    aria-label='button'
                    value={formData.shot}
                    onChange={(e) => setFormData(prev => ({ ...prev, shot: Number(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value={3}>3 Shot</option>
                    <option value={6}>6 Shot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium">Status *</div>
                <div className="col-span-2">
                  <select
                    aria-label='button'
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Disable' }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Active">Active</option>
                    <option value="Disable">Disable</option>
                  </select>
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
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full max-w-md">
                  <img 
                    src={formData.frame}
                    alt={formData.frameName}
                    className="w-full h-auto rounded-lg"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <div className="w-full max-w-[80%] bg-white rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  aria-label='button'
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file)
                    }
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  + UPLOAD
                </button>
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