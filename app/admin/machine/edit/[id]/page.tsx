'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import machineService from '@/app/services/machineService'
import frameService from '@/app/services/frameService'
import stickerService from '@/app/services/stickerService'
import type { StatusType } from '@/types/types'
import { Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import SideBar from '@/app/pages_admin/sidebar-form'

const getMachineNameFromStorage = (machineId: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`machine_name_${machineId}`);
};

const setMachineNameToStorage = (machineId: string, name: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`machine_name_${machineId}`, name);
};

const getMachineFramesFromStorage = (machineId: string): any[] => {
  if (typeof window === 'undefined') return [];
  const storedFrames = localStorage.getItem(`machine_frames_${machineId}`);
  return storedFrames ? JSON.parse(storedFrames) : [];
};

const setMachineFramesToStorage = (machineId: string, frames: any[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`machine_frames_${machineId}`, JSON.stringify(frames));
};

const getMachineStickersFromStorage = (machineId: string): any[] => {
  if (typeof window === 'undefined') return [];
  const storedStickers = localStorage.getItem(`machine_stickers_${machineId}`);
  return storedStickers ? JSON.parse(storedStickers) : [];
};

const setMachineStickersToStorage = (machineId: string, stickers: any[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`machine_stickers_${machineId}`, JSON.stringify(stickers));
};


export default function MachineEdit() {
  const router = useRouter()
  const params = useParams()
  const machineId = decodeURIComponent(params.id as string)
  
  // States
  const [machineInfo, setMachineInfo] = useState<any>(null)
  const [machineName, setMachineName] = useState('')
  const [ipAddress, setIpAddress] = useState('')
  const [status, setStatus] = useState<StatusType>('Active')
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModified, setIsModified] = useState(false)

  // Frame & Sticker States
  const [availableFrames, setAvailableFrames] = useState<any[]>([])
  const [availableStickers, setAvailableStickers] = useState<any[]>([])
  const [selectedFrames, setSelectedFrames] = useState<any[]>([])
  const [selectedStickers, setSelectedStickers] = useState<any[]>([])
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  const [showStickerSelector, setShowStickerSelector] = useState(false)

  // Helper function for status colors
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

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [machineResponse, framesResponse, stickersResponse] = await Promise.all([
          machineService.getTransactions(),
          frameService.getFrames(),
          stickerService.getStickers()
        ]);

        const targetMachine = machineResponse.find(machine => machine.id === machineId);

        if (targetMachine) {
          // ดึงข้อมูลจาก localStorage ถ้ามี
          const storedName = getMachineNameFromStorage(machineId);
          const storedFrames = getMachineFramesFromStorage(machineId);
          const storedStickers = getMachineStickersFromStorage(machineId);

          setMachineName(storedName || targetMachine.name);
          setIpAddress(targetMachine.code);
          setStatus(targetMachine.status as StatusType);
          setMachineInfo(targetMachine);
          
          // ใช้ข้อมูลจาก localStorage ถ้ามี มิฉะนั้นใช้จาก API
          setSelectedFrames(storedFrames.length > 0 ? storedFrames : targetMachine.frames || []);
          setSelectedStickers(storedStickers.length > 0 ? storedStickers : targetMachine.stickers || []);
        }

        setAvailableFrames(framesResponse.items);
        setAvailableStickers(stickersResponse.items);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [machineId]);

  // Event Handlers
  const handleNameChange = (value: string) => {
    setMachineName(value);
    setIsModified(true);
  };

  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus)
    setIsStatusDropdownOpen(false)
    setIsModified(true)
  }

  const handleAddFrame = (frame: any) => {
    const newFrames = [...selectedFrames, frame];
    setSelectedFrames(newFrames);
    setShowFrameSelector(false);
    setIsModified(true);
    // บันทึกลง localStorage ทันทีที่เพิ่ม
    setMachineFramesToStorage(machineId, newFrames);
  };

  const handleRemoveFrame = (frameId: string) => {
    const newFrames = selectedFrames.filter(frame => frame.id !== frameId);
    setSelectedFrames(newFrames);
    setIsModified(true);
    // บันทึกลง localStorage ทันทีที่ลบ
    setMachineFramesToStorage(machineId, newFrames);
  };

  const handleAddSticker = (sticker: any) => {
    const newStickers = [...selectedStickers, sticker];
    setSelectedStickers(newStickers);
    setShowStickerSelector(false);
    setIsModified(true);
    // บันทึกลง localStorage ทันทีที่เพิ่ม
    setMachineStickersToStorage(machineId, newStickers);
  };

  const handleRemoveSticker = (stickerId: string) => {
    const newStickers = selectedStickers.filter(sticker => sticker.id !== stickerId);
    setSelectedStickers(newStickers);
    setIsModified(true);
    // บันทึกลง localStorage ทันทีที่ลบ
    setMachineStickersToStorage(machineId, newStickers);
  };

  const handleSave = async () => {
    if (!isModified) return;
  
    try {
      setIsSaving(true);
      
      // บันทึกทุกอย่างลง localStorage
      setMachineNameToStorage(machineId, machineName);
      setMachineFramesToStorage(machineId, selectedFrames);
      setMachineStickersToStorage(machineId, selectedStickers);
      
      // อัพเดทข้อมูลพื้นฐาน
      await machineService.updateMachine(machineId, {
        name: machineName,
        status: status
      });
  
      // อัพเดท frames
      await machineService.updateMachineFrames(machineId, selectedFrames);
  
      // อัพเดท stickers
      await machineService.updateMachineStickers(machineId, selectedStickers);
      
      router.push('/admin/machine');
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this machine?')) return
    
    try {
      await machineService.deleteTransaction(machineId)
      router.push('/admin/machine')
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
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
                <span className="text-[#8E8E93]">Edit Machine</span>
              </div>

              <button
                onClick={handleSave}
                disabled={!isModified || isSaving}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  isModified && !isSaving
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
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Machine Name */}
                  <div>
                    <label className="block font-medium mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={machineName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  {/* IP Address */}
                  <div>
                    <label className="block font-medium mb-2">
                      IP Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ipAddress}
                      disabled
                      className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-medium mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="w-full flex items-center justify-between border rounded-lg px-3 py-2"
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
                                onClick={() => handleStatusChange(statusOption)}
                                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                              >
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(statusOption)}`} />
                                {statusOption}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frames Section */}
                  <div>
                    <label className="block font-medium mb-4">Frames</label>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedFrames.map((frame) => (
                        <div key={frame.id} className="relative group">
                          <img 
                            src={frame.frame}
                            alt={frame.frameName}
                            className="w-full aspect-[3/4] object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveFrame(frame.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowFrameSelector(true)}
                        className="w-full aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                      >
                        <span className="text-4xl text-gray-400">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Frame Selector Modal */}
                  {showFrameSelector && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h3 className="text-lg font-medium mb-4">Select Frame</h3>
                        <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                          {availableFrames
                            .filter(frame => !selectedFrames.some(f => f.id === frame.id))
                            .map(frame => (
                              <button
                                key={frame.id}
                                onClick={() => handleAddFrame(frame)}
                                className="relative hover:ring-2 hover:ring-blue-500 rounded-lg"
                              >
                                <img 
                                  src={frame.frame}
                                  alt={frame.frameName}
                                  className="w-full aspect-[3/4] object-cover rounded-lg"
                                />
                              </button>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => setShowFrameSelector(false)}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Stickers Section */}
                  <div>
                    <label className="block font-medium mb-4">Stickers</label>
                    <div className="grid grid-cols-5 gap-4">
                      {selectedStickers.map((sticker) => (
                        <div key={sticker.id} className="relative group">
                          <img 
                            src={sticker.sticker}
                            alt={sticker.stickerName}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <button
                            onClick={() => handleRemoveSticker(sticker.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowStickerSelector(true)}
                        className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                      >
                        <span className="text-4xl text-gray-400">+</span>
                      </button>
                    </div>
                  </div>

                   {/* Sticker Selector Modal */}
                   {showStickerSelector && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                        <h3 className="text-lg font-medium mb-4">Select Sticker</h3>
                        <div className="grid grid-cols-5 gap-4 max-h-[60vh] overflow-y-auto">
                          {availableStickers
                            .filter(sticker => !selectedStickers.some(s => s.id === sticker.id))
                            .map(sticker => (
                              <button
                                key={sticker.id}
                                onClick={() => handleAddSticker(sticker)}
                                className="relative hover:ring-2 hover:ring-blue-500 rounded-lg"
                              >
                                <img 
                                  src={sticker.sticker}
                                  alt={sticker.stickerName}
                                  className="w-full aspect-square object-cover rounded-lg"
                                />
                              </button>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => setShowStickerSelector(false)}
                            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
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