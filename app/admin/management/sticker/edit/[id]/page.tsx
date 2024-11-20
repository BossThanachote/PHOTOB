'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import stickerService from '@/app/services/stickerService'
import type { Sticker, StatusType } from '@/types/types'
import { Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

interface APISticker {
  ID: string
  Code: string
  Name: string
  ImageUrl: string
  Status: string
}

export default function StickerEdit() {
  const router = useRouter()
  const params = useParams()
  const stickerId = decodeURIComponent(params.id as string)
  
  // States
  const [stickerInfo, setStickerInfo] = useState<Sticker | null>(null)
  const [stickerName, setStickerName] = useState('')
  const [status, setStatus] = useState<StatusType>('Active')
  const [newImage, setNewImage] = useState<string | null>(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModified, setIsModified] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Helper function for status colors
  const getStatusColor = (status: StatusType) => {
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

  // Fetch sticker data
  useEffect(() => {
    const fetchStickerData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('Fetching sticker with ID:', stickerId)
        
        // ดึงข้อมูลทั้งหมดจาก GET list
        const response = await stickerService.getStickers()
        console.log('All stickers:', response)
        
        // กรองเอาเฉพาะ sticker ที่ต้องการจาก id จาก items array
        const targetSticker = response.items.find(sticker => 
          sticker.id === stickerId
        )
        console.log('Found sticker:', targetSticker)
  
        if (targetSticker) {
          setStickerInfo({
            id: targetSticker.id,
            no: targetSticker.no,
            stickerName: targetSticker.stickerName,
            sticker: targetSticker.sticker,
            status: targetSticker.status,
            date: targetSticker.date  // เพิ่ม date
          })
          setStickerName(targetSticker.stickerName)
          setStatus(targetSticker.status)
        } else {
          setError('Sticker not found')
        }
      } catch (err) {
        console.error('Error fetching sticker:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch sticker data')
      } finally {
        setIsLoading(false)
      }
    }
  
    if (stickerId) {
      fetchStickerData()
    }
  }, [stickerId])
  // Event Handlers
  const handleNameChange = (value: string) => {
    setStickerName(value)
    setIsModified(true)
  }

  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus)
    setIsStatusDropdownOpen(false)
    setIsModified(true)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !stickerInfo) return

    try {
      setIsLoading(true)
      setError(null)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImage(reader.result as string)
        setIsModified(true)
      }
      reader.readAsDataURL(file)

      // Update image on server
      await stickerService.updateStickerImage(stickerInfo.id, file)
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload image')
      // Reset preview if upload fails
      setNewImage(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!stickerInfo || !isModified) return

    try {
      setIsSaving(true)
      setError(null)

      await stickerService.updateSticker(stickerInfo.id, {
        stickerName,
        status: status.toLowerCase() as StatusType
      })

      router.push('/admin/management/sticker')
    } catch (err) {
      console.error('Error saving sticker:', err)
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!stickerInfo) return

    if (window.confirm('Are you sure you want to delete this sticker?')) {
      try {
        setIsLoading(true)
        setError(null)
        
        await stickerService.deleteSticker(stickerInfo.id)
        router.push('/admin/management/sticker')
      } catch (err) {
        console.error('Error deleting sticker:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete sticker')
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Loading, Error และ Not Found States
  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500">Loading sticker information...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => router.push('/admin/management/sticker')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (!stickerInfo && !isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500 mb-4">Sticker not found</p>
            <button
              onClick={() => router.push('/admin/management/sticker')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Back to Sticker List
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  // Main UI Render
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
                <span className="text-[#61616A]">Sticker management</span>
                <span className="text-gray-400">/</span>
                <span className="text-[#8E8E93]">Information</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-400">Edit Sticker</span>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isModified || isSaving || isLoading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isModified && !isSaving && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                SAVE
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-medium">Information</h2>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading || isSaving}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Edit your sticker information below.
                </p>

                <div className="space-y-6">
                  {/* Sticker Name */}
                  <div>
                    <label className="block font-medium mb-2">
                      Sticker Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={stickerName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      disabled={isLoading || isSaving}
                      className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-medium mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        disabled={isLoading || isSaving}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                          {status}
                        </div>
                        {isStatusDropdownOpen ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </button>

                      {isStatusDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                          {(['Active', 'Inactive', 'Declined'] as StatusType[])
                            .filter(s => s !== status)
                            .map((statusOption) => (
                              <button
                                key={statusOption}
                                type="button"
                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                                onClick={() => handleStatusChange(statusOption)}
                                disabled={isLoading || isSaving}
                              >
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(statusOption)}`} />
                                {statusOption}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticker Image */}
                  <div>
                    <label className="block font-medium mb-2">Sticker</label>
                    <div className="space-y-4">
                      <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {(newImage || stickerInfo?.sticker) ? (
                          <img 
                            src={newImage || stickerInfo?.sticker}
                            alt={stickerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isLoading || isSaving}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isSaving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        UPLOAD
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
  