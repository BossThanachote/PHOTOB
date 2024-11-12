'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { stickerAPI } from '@/app/MockAPI/mockStickerApi'
import type { Sticker, StatusType } from '@/types/types'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

export default function StickerEdit() {
  const router = useRouter()
  const params = useParams()
  const stickerId = params.id as string
  
  const [stickerInfo, setStickerInfo] = useState<Sticker | null>(null)
  const [stickerName, setStickerName] = useState('')
  const [status, setStatus] = useState<StatusType>('Active')
  const [newImage, setNewImage] = useState<string | null>(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isModified, setIsModified] = useState(false)

  // Helper function for status colors
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Inactive':
        return 'bg-orange-500';
      case 'Declined':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  useEffect(() => {
    const stickers = stickerAPI.getStickers()
    const sticker = stickers.find(s => s.no === stickerId)
    if (sticker) {
      setStickerInfo(sticker)
      setStickerName(sticker.stickerName)
      setStatus(sticker.status)
    }
  }, [stickerId])

  const handleNameChange = (value: string) => {
    setStickerName(value)
    setIsModified(true)
  }

  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus)
    setIsStatusDropdownOpen(false)
    setIsModified(true)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImage(reader.result as string)
        setIsModified(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    if (!stickerInfo || !isModified) return

    const updatedSticker: Sticker = {
      ...stickerInfo,
      stickerName,
      status,
      sticker: newImage || stickerInfo.sticker
    }

    const stickers = stickerAPI.getStickers()
    const updatedStickers = stickers.map(s => 
      s.no === stickerId ? updatedSticker : s
    )

    // Save to localStorage
    const currentProfile = localStorage.getItem('adminProfile')
    if (currentProfile) {
      const { email } = JSON.parse(currentProfile)
      localStorage.setItem(`${email}_sticker_data`, JSON.stringify(updatedStickers))
    }

    router.push('/admin/management/sticker')
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this sticker?')) {
      stickerAPI.deleteSticker(stickerId)
      router.push('/admin/management/sticker')
    }
  }

  if (!stickerInfo) {
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
          disabled={!isModified}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isModified 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
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
              className="text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>

          <div className="space-y-6">
            {/* Sticker Name */}
            <div>
              <label className="block font-medium mb-2">
                Sticker Name <span className="text-red-500">*</span>
              </label>
              <input
                aria-label='button'
                type="text"
                value={stickerName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
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
                  className="w-full flex items-center justify-between border rounded-lg px-3 py-2"
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
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
                  <img 
                    src={newImage || stickerInfo.sticker}
                    alt={stickerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  aria-label='button'
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
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