'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import machineService from '@/app/services/machineService'
import type { StatusType } from '@/types/types'
import { Loader2 } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

interface MachineInfo {
  id: string
  name: string
  code: string
  status: StatusType
  frames?: Array<{ id: string; image?: string; frame?: string; frameName?: string }>
  stickers?: Array<{ id: string; image?: string; sticker?: string; stickerName?: string }>
}

// Helper functions for localStorage
const getMachineNameFromStorage = (machineId: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`machine_name_${machineId}`);
};

const getMachineFramesFromStorage = (machineId: string): any[] => {
  if (typeof window === 'undefined') return [];
  const storedFrames = localStorage.getItem(`machine_frames_${machineId}`);
  return storedFrames ? JSON.parse(storedFrames) : [];
};

const getMachineStickersFromStorage = (machineId: string): any[] => {
  if (typeof window === 'undefined') return [];
  const storedStickers = localStorage.getItem(`machine_stickers_${machineId}`);
  return storedStickers ? JSON.parse(storedStickers) : [];
};

export default function MachineInformation() {
  const router = useRouter()
  const params = useParams()
  const machineId = decodeURIComponent(params.id as string)
  
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    const fetchMachineData = async () => {
      try {
        setIsLoading(true)
        setError(null)
          
        const response = await machineService.getTransactions()
        const targetMachine = response.find(machine => machine.id === machineId)
  
        if (targetMachine) {
          // Get data from localStorage
          const storedName = getMachineNameFromStorage(machineId)
          const storedFrames = getMachineFramesFromStorage(machineId)
          const storedStickers = getMachineStickersFromStorage(machineId)

          // Create updated machine info
          setMachineInfo({
            ...targetMachine,
            name: storedName || targetMachine.name,
            frames: storedFrames.length > 0 ? storedFrames : targetMachine.frames || [],
            stickers: storedStickers.length > 0 ? storedStickers : targetMachine.stickers || []
          })
        } else {
          setError('Machine not found')
        }
      } catch (err) {
        console.error('Error fetching machine:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch machine data')
      } finally {
        setIsLoading(false)
      }
    }
  
    if (machineId) {
      fetchMachineData()
    }
  }, [machineId])

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500">Loading machine information...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="grid grid-cols-10 w-full h-screen">   
        <div className="col-span-10 sm:col-span-3 xl:col-span-2">
          <SideBar />
        </div>
        <div className="sm:col-span-7 xl:col-span-8 col-span-10">  
          <div className="min-h-screen bg-[#F7F7F7]">
            {/* Header */} 
            <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-medium">Management</h1>
                <span className="text-[#61616A]">|</span>
                <span className="text-[#61616A]">Machine management</span>
                <span className="text-gray-400">/</span>
                <span className="text-[#8E8E93]">Information</span>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/admin/machine/edit/${machineId}`)}
                className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg hover:bg-[#4338CA] transition-colors"
              >
                EDIT
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Main Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-2">Information</h2>
                  <p className="text-gray-600">
                    View your machine information below.
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block font-medium mb-2">
                      Name
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      {machineInfo?.name || '-'}
                    </div>
                  </div>

                  {/* IP Address (Code) */}
                  <div>
                    <label className="block font-medium mb-2">
                      IP Address
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      {machineInfo?.code || '-'}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-medium mb-2">
                      Status
                    </label>
                    <div className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(machineInfo?.status || '')}`} />
                        {machineInfo?.status || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Frame Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-2">Frames</h2>
                  <p className="text-gray-600">
                    View frames for this machine.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {machineInfo?.frames && machineInfo.frames.length > 0 ? (
                    machineInfo.frames.map(frame => (
                      <div key={frame.id} className="relative">
                        <img 
                          src={frame.frame || frame.image}
                          alt={frame.frameName || `Frame ${frame.id}`}
                          className="w-full aspect-[3/4] object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      No frames available
                    </div>
                  )}
                </div>
              </div>

              {/* Sticker Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <div className="mb-6">
                  <h2 className="text-xl font-medium mb-2">Stickers</h2>
                  <p className="text-gray-600">
                    View stickers for this machine.
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-4">
                  {machineInfo?.stickers && machineInfo.stickers.length > 0 ? (
                    machineInfo.stickers.map(sticker => (
                      <div key={sticker.id} className="relative">
                        <img 
                          src={sticker.sticker || sticker.image}
                          alt={sticker.stickerName || `Sticker ${sticker.id}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-5 text-center py-8 text-gray-500">
                      No stickers available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}