'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SideBar from '@/app/pages_admin/sidebar-form'
import AuthGuard from '@/app/components/AuthGuard'
import { departmentAPI } from '@/app/MockAPI/mockDepartmentAPI'
import { frameAPI } from '@/app/MockAPI/mockFrameApi'
import { stickerAPI } from '@/app/MockAPI/mockStickerApi'
import { Transaction, Frame, Sticker } from '@/types/types'

export default function DepartmentInformation() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;

  const [departmentInfo, setDepartmentInfo] = useState<Transaction | null>(null);
  const [selectedFrames, setSelectedFrames] = useState<Frame[]>([]);
  const [selectedStickers, setSelectedStickers] = useState<Sticker[]>([]);

  // Load all data whenever component mounts or departmentId changes
  useEffect(() => {
    loadDepartmentData();
  }, [departmentId]);

  // Function to load all department related data
  const loadDepartmentData = () => {
    const department = departmentAPI.getTransactionById(departmentId);
    if (department) {
      setDepartmentInfo(department);

      // Load frames using frame IDs from department
      if (department.frames && department.frames.length > 0) {
        const frames = department.frames
          .map(frameId => frameAPI.getFrameById(frameId))
          .filter((frame): frame is Frame => frame !== null);
        setSelectedFrames(frames);
      } else {
        setSelectedFrames([]);
      }

      // Load stickers using sticker IDs from department
      if (department.stickers && department.stickers.length > 0) {
        const stickers = department.stickers
          .map(stickerId => stickerAPI.getStickerById(stickerId))
          .filter((sticker): sticker is Sticker => sticker !== null);
        setSelectedStickers(stickers);
      } else {
        setSelectedStickers([]);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/admin/dashboard/department/edit/${departmentId}`);
  };

  if (!departmentInfo) {
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
                <h1 className="text-xl font-medium">Dashboard</h1>
                <span className="text-[#61616A]">|</span>
                <span className="text-[#61616A]">Dashboard department</span>
                <span className="text-[#8E8E93]">/</span> 
                <span className="text-[#8E8E93]">Information</span>
              </div>
              <button
                type="button"
                onClick={handleEdit}
                className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34l-3.75-3.75-2.53 2.54 3.75 3.75 2.53-2.54z" fill="currentColor"/>
                </svg>
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
                      Machine information and configuration details.
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium">Name</div>
                        <div className="col-span-2">{departmentInfo.name}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium">IP Address</div>
                        <div className="col-span-2">{departmentInfo.ipAddress}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium">Type</div>
                        <div className="col-span-2">{departmentInfo.type}</div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="font-medium">Status</div>
                        <div className="col-span-2 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            departmentInfo.status === 'Active' ? 'bg-green-500' :
                            departmentInfo.status === 'Inactive' ? 'bg-orange-500' : 
                            'bg-red-500'
                          }`} />
                          {departmentInfo.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Frame Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-xl font-medium mb-4">Frames</h2>
                    <p className="text-gray-600 mb-6">
                      Selected frames for this machine.
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                      {selectedFrames.length > 0 ? (
                        selectedFrames.map((frame) => (
                          <div key={frame.no} className="border rounded-lg overflow-hidden">
                            <div className="aspect-w-4 aspect-h-3">
                              <img
                                src={frame.frame}
                                alt={frame.frameName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <p className="font-medium text-sm">{frame.frameName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  frame.status === 'Active' ? 'bg-green-500' :
                                  frame.status === 'Inactive' ? 'bg-orange-500' : 
                                  'bg-red-500'
                                }`} />
                                <span className="text-gray-500 text-sm">{frame.status}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-500 py-8">
                          No frames selected
                        </div>
                      )}
                    </div>
                  </div>
                    
                  {/* Sticker Section */}
                  <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-xl font-medium mb-4">Stickers</h2>
                    <p className="text-gray-600 mb-6">
                      Selected stickers for this machine.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {selectedStickers.length > 0 ? (
                        selectedStickers.map((sticker) => (
                          <div key={sticker.no} className="border rounded-lg overflow-hidden">
                            <div className="aspect-square">
                              <img
                                src={sticker.sticker}
                                alt={sticker.stickerName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-2">
                              <p className="font-medium text-sm truncate">{sticker.stickerName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  sticker.status === 'Active' ? 'bg-green-500' :
                                  sticker.status === 'Inactive' ? 'bg-orange-500' : 
                                  'bg-red-500'
                                }`} />
                                <span className="text-gray-500 text-sm">{sticker.status}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-500 py-8">
                          No stickers selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                  <div className="bg-[#EBD2D4] rounded-lg p-6">
                    <div className="w-12 h-12 bg-[#9B1C2733] text-[#9B1C27] rounded-full flex items-center justify-center mb-4">
                      B
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[#61616A]">
                        <span>Total usage :</span>
                        <span>5,020</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-[#9B1C27]">Total Sales :</span>
                        <span>{departmentInfo.totalSale.toLocaleString()} ฿</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#D8E9F3] rounded-lg p-6">
                    <div className="w-12 h-12 bg-[#9B1C2733] text-[#9B1C27] rounded-full flex items-center justify-center mb-4">
                      B
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[#61616A]">
                        <span>Total usage :</span>
                        <span>5,020</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span className="text-[#9B1C27]">Total Sales :</span>
                        <span>{departmentInfo.totalSale.toLocaleString()} ฿</span>
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