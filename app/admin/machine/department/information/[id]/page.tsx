'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import SideBar from '@/app/pages_admin/sidebar-form'
import AuthGuard from '@/app/components/AuthGuard'
import Image from 'next/image'
import { eventAPI } from '@/app/MockAPI/mockEventAPI'
import { departmentAPI } from '@/app/MockAPI/mockDepartmentAPI'

interface MachineInfo {
  id: string
  name: string
  ipAddress: string
  type: 'Event' | 'Department'
  status: 'Active' | 'Inactive' | 'Declined'
  photo: string
  totalUsage: number
  totalSales: number
  frames: Array<{ id: string; image: string }>
  stickers: Array<{ id: string; image: string }>
}

export default function MachineInformation() {
  const params = useParams()
  const searchParams = useSearchParams()
  const machineId = params.id as string
  const machineType = searchParams.get('type') as 'Event' | 'Department'
  const [machineInfo, setMachineInfo] = useState<MachineInfo | null>(null)

  useEffect(() => {
    const fetchMachineInfo = () => {
      let machine;

      // ค้นหาข้อมูลตาม type ที่ส่งมา
      if (machineType === 'Event') {
        machine = eventAPI.getTransactions().find(t => t.id === machineId);
      } else if (machineType === 'Department') {
        machine = departmentAPI.getTransactions().find(t => t.id === machineId);
      }

      if (machine) {
        setMachineInfo({
          id: machine.id,
          name: `${machineType} ${machine.id}`, // เพิ่ม prefix ตาม type
          ipAddress: '172.16.254.1',
          type: machineType,
          status: machine.status,
          photo: '/path/to/photo',
          totalUsage: 5020,
          totalSales: machine.totalSale,
          frames: [
            { id: '1', image: '/frame1.png' },
            { id: '2', image: '/frame2.png' }
          ],
          stickers: [
            { id: '1', image: '/sticker1.png' },
            { id: '2', image: '/sticker2.png' }
          ]
        });
      }
    };

    if (machineId && machineType) {
      fetchMachineInfo();
    }
  }, [machineId, machineType]);

  if (!machineInfo || !machineType) {
    return <div>Loading...</div>;
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
                <span className="text-[#61616A]">Machine management</span>
                <span className="text-[#8E8E93]">/</span>
                <span className="text-[#8E8E93]">Information</span>
              </div>
              <button
                type="button"
                className="bg-[#3454D1] text-white font-ibm-thai-400 px-4 py-2 rounded-lg flex gap-2 items-center"
              >
                <Image src="/editicon.png" alt="" width={10000} height={10000} className="w-5 h-5" />
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
                            machineInfo.status === 'Active' ? 'bg-green-500' : 
                            machineInfo.status === 'Inactive' ? 'bg-orange-500' : 'bg-red-500'
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
                    <div className="grid grid-cols-6 gap-[9rem] xl:gap-[1rem]">
                      {machineInfo.frames.map(frame => (
                        <div key={frame.id} className="w-[8rem] h-[11rem] bg-gray-100">
                          <img 
                            src="/api/placeholder/160/220"
                            alt={`Frame ${frame.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                    
                  {/* Sticker Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-xl font-medium mb-4">Sticker</h2>
                    <p className="text-gray-600 mb-6">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>
                    <div className="grid grid-cols-9 gap-[6rem] xl:gap-[0.5rem]">
                      {machineInfo.stickers.map(sticker => (
                        <div key={sticker.id} className="w-[5rem] h-[5rem] bg-gray-100">
                          <img 
                            src="/api/placeholder/80/80"
                            alt={`Sticker ${sticker.id}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                    
                {/* Side Stats */}
                <div className="space-y-6">
                  <div className="bg-[#EBD2D4] rounded-lg p-6">
                    <div className="w-12 h-12 bg-[#9B1C2733] text-[#9B1C27] rounded-full flex items-center justify-center mb-4 font-ibm-thai-600">
                      B
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-ibm-thai-400">
                        <span className="text-[#61616A]">Total usage :</span>
                        <span className='text-[#61616A]'>{machineInfo.totalUsage.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-ibm-thai-600">
                        <span className="text-[#9B1C27]">Total Sales :</span>
                        <span className='text-[#61616A]'>{machineInfo.totalSales.toLocaleString()} ฿</span>
                      </div>
                    </div>
                  </div>
                    
                  <div className="bg-[#D8E9F3] rounded-lg p-6">
                    <div className="w-12 h-12 bg-[#9B1C2733] text-[#9B1C27] rounded-full flex items-center justify-center mb-4 font-ibm-thai-600">
                      B
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-ibm-thai-400">
                        <span className='text-[#61616A]'>Total usage :</span>
                        <span className='text-[#61616A]'>{machineInfo.totalUsage.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-ibm-thai-600">
                        <span className="text-[#9B1C27]">Total Sales :</span>
                        <span className='text-[#61616A]'>{machineInfo.totalSales.toLocaleString()} ฿</span>
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
  );
}