'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Transaction, Frame, Sticker, StatusType } from '@/types/types'
import { departmentAPI } from '@/app/MockAPI/mockDepartmentAPI'
import { eventAPI } from '@/app/MockAPI/mockEventAPI'
import { frameAPI } from '@/app/MockAPI/mockFrameApi'
import { stickerAPI } from '@/app/MockAPI/mockStickerApi'
import SideBar from '@/app/pages_admin/sidebar-form'
import AuthGuard from '@/app/components/AuthGuard'
import { X } from 'lucide-react'

export default function DepartmentEdit() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;

  // State for form data
  const [formData, setFormData] = useState<{
    name: string;
    ipAddress: string;
    type: 'Event' | 'Department';
    status: StatusType;
  }>({
    name: '',
    ipAddress: '',
    type: 'Department',
    status: 'Active'
  });

  // State for frames and stickers
  const [selectedFrames, setSelectedFrames] = useState<Frame[]>([]);
  const [selectedStickers, setSelectedStickers] = useState<Sticker[]>([]);
  const [availableFrames, setAvailableFrames] = useState<Frame[]>([]);
  const [availableStickers, setAvailableStickers] = useState<Sticker[]>([]);
  
  // Modal states
  const [showFrameModal, setShowFrameModal] = useState(false);
  const [showStickerModal, setShowStickerModal] = useState(false);

  // Get status color
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

  // Load department data
  useEffect(() => {
    const department = departmentAPI.getTransactionById(departmentId);
    if (department) {
      setFormData({
        name: department.name || `Department ${department.id}`,
        ipAddress: department.ipAddress || '',
        type: department.type || 'Department',
        status: department.status
      });

      // Load selected frames if they exist
      if (department.frames?.length > 0) {
        const frames = department.frames
          .map(frameId => frameAPI.getFrameById(frameId))
          .filter((frame): frame is Frame => frame !== null);
        setSelectedFrames(frames);
      } else {
        setSelectedFrames([]);
      }

      // Load selected stickers if they exist
      if (department.stickers?.length > 0) {
        const stickers = department.stickers
          .map(stickerId => stickerAPI.getStickerById(stickerId))
          .filter((sticker): sticker is Sticker => sticker !== null);
        setSelectedStickers(stickers);
      } else {
        setSelectedStickers([]);
      }
    }

    // Load available frames and stickers
    setAvailableFrames(frameAPI.getFrames());
    setAvailableStickers(stickerAPI.getStickers());
  }, [departmentId]);

  // Handle form submission
  const handleSubmit = () => {
    try {
      // If type changed to Event
      if (formData.type === 'Event') {
        // 1. Add as new event
        const existingDepartment = departmentAPI.getTransactionById(departmentId);
        if (!existingDepartment) return;
  
        eventAPI.addTransaction({
          ...formData,
          frames: selectedFrames.map(frame => frame.no),
          stickers: selectedStickers.map(sticker => sticker.no),
          totalSale: existingDepartment.totalSale,
          date: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        });
  
        // 2. Delete from departments
        departmentAPI.deleteTransaction(departmentId);
        
        // 3. Redirect to event page
        router.push('/admin/machine/event');
      } else {
        // If staying as Department, just update
        departmentAPI.updateTransaction(departmentId, {
          ...formData,
          frames: selectedFrames.map(frame => frame.no),
          stickers: selectedStickers.map(sticker => sticker.no)
        });
        router.push(`/admin/machine/department/information/${departmentId}`);
      }
    } catch (error) {
      console.error('Error during submission:', error);
    }
  };

  // Handle frame selection
  const handleFrameSelect = (frame: Frame) => {
    if (!selectedFrames.find(f => f.no === frame.no)) {
      setSelectedFrames([...selectedFrames, frame]);
    }
    setShowFrameModal(false);
  };

  // Handle frame removal
  const handleFrameRemove = (frameNo: string) => {
    setSelectedFrames(selectedFrames.filter(frame => frame.no !== frameNo));
  };

  // Handle sticker selection
  const handleStickerSelect = (sticker: Sticker) => {
    if (!selectedStickers.find(s => s.no === sticker.no)) {
      setSelectedStickers([...selectedStickers, sticker]);
    }
    setShowStickerModal(false);
  };

  // Handle sticker removal
  const handleStickerRemove = (stickerNo: string) => {
    setSelectedStickers(selectedStickers.filter(sticker => sticker.no !== stickerNo));
  };

  return (
    <AuthGuard>
      <div className="grid grid-cols-10 w-full h-screen">
        <div className="col-span-10 sm:col-span-3 xl:col-span-2">
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
                <span className="text-[#8E8E93]">Edit</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                SAVE
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Basic Information */}
                <div className="p-6">
                  <h2 className="text-xl font-medium mb-4">Information</h2>
                  <p className="text-gray-600 mb-6">
                    Edit machine information and configuration.
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Name *</div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Enter name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">IP Address *</div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={formData.ipAddress}
                          onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="Enter IP address"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4"> 
                      <div className="font-medium">Type *</div>
                      <div className="col-span-2">
                        <select
                          aria-label='button'
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Event' | 'Department' })}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="Event">Event</option>
                          <option value="Department">Department </option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium">Status *</div>
                      <div className="col-span-2">
                        <select
                          aria-label='button'
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Declined">Declined</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frames Section */}
                <div className="border-t">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium">Frames</h2>
                      <button
                        type="button"
                        onClick={() => setShowFrameModal(true)}
                        className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg"
                      >
                        + Add Frame
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Select frames for this machine.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {selectedFrames.map((frame) => (
                        <div key={frame.no} className="border rounded-lg overflow-hidden relative group">
                          <button
                            aria-label='button'
                            type="button"
                            onClick={() => handleFrameRemove(frame.no)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
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
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(frame.status)}`} />
                              <span className="text-gray-500 text-sm">{frame.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stickers Section */}
                <div className="border-t">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-medium">Stickers</h2>
                      <button
                        type="button"
                        onClick={() => setShowStickerModal(true)}
                        className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg"
                      >
                        + Add Sticker
                      </button>
                    </div>
                    <p className="text-gray-600 mb-6">
                      Select stickers for this machine.
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {selectedStickers.map((sticker) => (
                        <div key={sticker.no} className="border rounded-lg overflow-hidden relative group">
                          <button
                            aria-label='button'
                            type="button"
                            onClick={() => handleStickerRemove(sticker.no)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
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
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(sticker.status)}`} />
                              <span className="text-gray-500 text-sm">{sticker.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Frame Selection Modal */}
            {showFrameModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Select Frames</h3>
                    <button
                      aria-label='button'
                      type="button"
                      onClick={() => setShowFrameModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableFrames.map((frame) => (
                      <button
                        key={frame.no}
                        type="button"
                        onClick={() => handleFrameSelect(frame)}
                        className={`border rounded-lg overflow-hidden ${
                          selectedFrames.some(f => f.no === frame.no) ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div className="aspect-w-4 aspect-h-3">
                          <img 
                            src={frame.frame}
                            alt={frame.frameName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-sm font-medium">{frame.frameName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(frame.status)}`} />
                            <span className="text-xs text-gray-500">{frame.status}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              )}

              {/* Sticker Selection Modal */}
              {showStickerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-[90vw] max-w-4xl max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Select Stickers</h3>
                      <button
                        aria-label='button'
                        type="button"
                        onClick={() => setShowStickerModal(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {availableStickers.map((sticker) => (
                        <button
                          key={sticker.no}
                          type="button"
                          onClick={() => handleStickerSelect(sticker)}
                          className={`border rounded-lg overflow-hidden ${
                            selectedStickers.some(s => s.no === sticker.no) ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <div className="aspect-square">
                            <img 
                              src={sticker.sticker}
                              alt={sticker.stickerName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-sm font-medium truncate">{sticker.stickerName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(sticker.status)}`} />
                              <span className="text-xs text-gray-500">{sticker.status}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }