'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'

// Interface สำหรับข้อมูลเครื่อง
interface MachineInfo {
  id: string
  name: string
  ipAddress: string
  type: 'Event' | 'Department'
  status: 'Active' | 'Inactive'
  photo: string
  totalUsage: number
  totalSales: number
  frames: Array<{ id: string; image: string }>
  stickers: Array<{ id: string; image: string }>
}

export default function MachineInformation() {
  const params = useParams()
  const machineId = params.id as string

  // Mock data (ในการใช้งานจริงควรดึงจาก API)
  const [machineInfo] = useState<MachineInfo>({
    id: machineId,
    name: '001',
    ipAddress: '172.16.254.1',
    type: 'Event',
    status: 'Active',
    photo: '/path/to/photo',
    totalUsage: 5020,
    totalSales: 1002500,
    frames: [
      { id: '1', image: '/frame1.png' },
      { id: '2', image: '/frame2.png' }
    ],
    stickers: [
      { id: '1', image: '/sticker1.png' },
      { id: '2', image: '/sticker2.png' }
    ]
  })

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Header */}
      <div className="h-[4rem] bg-white flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Management</h1>
          <span className="text-[#61616A]">|</span>
          <span className="text-[#61616A]">Machine management</span>
          <span className="text-[#8E8E93]">/</span>
          <span className="text-[#8E8E93]">Information</span>
        </div>
        <button
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg"
        >
          EDIT
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium mb-4">Information</h2>
              <p className="text-gray-600 mb-6">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Name</div>
                  <div className="col-span-2">{machineInfo.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">IP Address</div>
                  <div className="col-span-2">{machineInfo.ipAddress}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Type</div>
                  <div className="col-span-2">{machineInfo.type}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Status</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      machineInfo.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    {machineInfo.status}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="font-medium">Photo</div>
                  <div className="col-span-2">
                    <button className="text-blue-600 hover:underline">View</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-medium mb-4">Frame</h2>
              <p className="text-gray-600 mb-6">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {machineInfo.frames.map(frame => (
                  <div key={frame.id} className="aspect-square bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>

            {/* Sticker Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-xl font-medium mb-4">Sticker</h2>
              <p className="text-gray-600 mb-6">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
              <div className="grid grid-cols-4 gap-4">
                {machineInfo.stickers.map(sticker => (
                  <div key={sticker.id} className="aspect-square bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Stats */}
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                B
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total usage :</span>
                  <span>{machineInfo.totalUsage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales :</span>
                  <span>{machineInfo.totalSales.toLocaleString()} ฿</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                B
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total usage :</span>
                  <span>{machineInfo.totalUsage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales :</span>
                  <span>{machineInfo.totalSales.toLocaleString()} ฿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}