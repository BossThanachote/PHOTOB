'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { stickerAPI } from '@/app/MockAPI/mockStickerApi'
import type { Sticker } from '@/types/types'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

export default function StickerInformation() {
  const router = useRouter()
  const params = useParams()
  const stickerId = params.id as string
  const [stickerInfo, setStickerInfo] = useState<Sticker | null>(null)

  useEffect(() => {
    // ดึงข้อมูล sticker จาก ID
    const stickers = stickerAPI.getStickers()
    const sticker = stickers.find(s => s.no === stickerId)
    if (sticker) {
      setStickerInfo(sticker)
    }
  }, [stickerId])

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
          <span className="text-gray-400">Information</span>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/admin/management/sticker/edit/${stickerId}`)}
          className="bg-[#3454D1] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          EDIT
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          {/* Information Section */}
          <div>
            <h2 className="text-xl font-medium mb-4">Information</h2>
            <p className="text-gray-600 mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium">Sticker Name</div>
                <div className="col-span-3">{stickerInfo.stickerName}</div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium">Date</div>
                <div className="col-span-3">{stickerInfo.date}</div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="font-medium">Status</div>
                <div className="col-span-3 flex items-center gap-2">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      stickerInfo.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`} 
                  />
                  {stickerInfo.status}
                </div>
              </div>
            </div>
          </div>

          {/* Sticker Image Section */}
          <div>
            <h2 className="text-xl font-medium mb-4">Sticker</h2>
            <p className="text-gray-600 mb-6">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <div className="mt-4">
              <img 
                src={stickerInfo.sticker}
                alt={stickerInfo.stickerName}
                className="max-w-full h-auto rounded-lg"
              />
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