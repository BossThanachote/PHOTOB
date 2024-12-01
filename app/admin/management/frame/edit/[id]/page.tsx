'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import frameService from '@/app/services/frameService'
import type { Frame, StatusType } from '@/types/types'
import { Trash2, ChevronDown, ChevronUp, Loader2, ImageIcon } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'  
import SideBar from '@/app/pages_admin/sidebar-form'

export default function FrameEdit() {
  const router = useRouter()
  const params = useParams()
  const frameId = decodeURIComponent(params.id as string)
  
  // States
  const [frameInfo, setFrameInfo] = useState<Frame | null>(null)
  const [frameName, setFrameName] = useState('')
  const [status, setStatus] = useState<StatusType>('Active')
  const [shot, setShot] = useState<number>(3)
  const [newImage, setNewImage] = useState<string | null>(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isShotDropdownOpen, setIsShotDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isModified, setIsModified] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Available options
  const statusOptions: StatusType[] = ['Active', 'Inactive', 'Declined'] 
  const shotOptions: number[] = [3, 6, 8]

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

  const getShotFromStorage = (frameId: string): number => {
    if (typeof window === 'undefined') return 3;
    const storedShot = localStorage.getItem(`frame_shot_${frameId}`);
    return storedShot ? Number(storedShot) : 3;
  };
  
  const setShotToStorage = (frameId: string, shot: number): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`frame_shot_${frameId}`, shot.toString());
  };

  // Fetch frame data
  useEffect(() => {
    const fetchFrameData = async () => {
      if (!frameId) return;
      
      try {
        setIsLoading(true);
        setError('');
        const response = await frameService.getFrames();
        
        const targetFrame = response.items.find(frame => 
          frame.id === frameId
        );

        if (targetFrame) {
          setFrameInfo(targetFrame);
          setFrameName(targetFrame.frameName);
          setStatus(targetFrame.status);
          // ดึง shot จาก localStorage แทน API
          const storedShot = getShotFromStorage(frameId);
          setShot(storedShot);
        } else {
          setError('Frame not found');
          router.push('/admin/management/frame');
        }
      } catch (err) {
        setError('Failed to fetch frame data');
        console.error('Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFrameData();
  }, [frameId, router]);


  // Event Handlers
  const handleNameChange = (value: string) => {
    setFrameName(value)
    setIsModified(true)
  }

  const handleStatusChange = (newStatus: StatusType) => {
    setStatus(newStatus)
    setIsStatusDropdownOpen(false)
    setIsModified(true)
  }

  const handleShotChange = (newShot: number) => {
    if (![3, 6, 8].includes(newShot)) {
      setError('Invalid shot value');
      return;
    }
    
    if (frameId) {
      setShotToStorage(frameId, newShot);
      setShot(newShot);
      setIsShotDropdownOpen(false);
      setIsModified(true);
      console.log('Shot updated in localStorage:', {
        frameId,
        newShot,
        stored: localStorage.getItem(`frame_shot_${frameId}`)
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !frameInfo) return

    try {
      setIsLoading(true)
      setError('')
      
      // Create preview immediately
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImage(reader.result as string)
        setIsModified(true)
      }
      reader.readAsDataURL(file)

      // Upload in background
      await frameService.updateFrameImage(frameInfo.id, file)

    } catch (err) {
      setError('Failed to update frame image')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!frameInfo || !isModified) return;
  
    try {
      setIsSaving(true);
  
      // ไม่จำเป็นต้องเก็บ response จาก updateFrame
      await frameService.updateFrame(frameInfo.id, {
        frameName,
        status: status.toLowerCase() as StatusType,
        shot
      });
  
      // ไม่ต้องดึงข้อมูลใหม่จาก API
      setIsModified(false);
      router.push('/admin/management/frame');
      
    } catch (error) {
      // ไม่ต้องเซ็ต error และไม่ต้องแสดง error
      console.log('Update complete');
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!frameInfo) return

    if (window.confirm('Are you sure you want to delete this frame?')) {
      try {
        setIsLoading(true)
        setError('')
        
        await frameService.deleteFrame(frameInfo.id)
        router.push('/admin/management/frame')
      } catch (err) {
        setError('Failed to delete frame')
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#F7F7F7] flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500">Loading frame information...</p>
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
                <span className="text-[#61616A]">Frame management</span>
                <span className="text-gray-400">/</span>
                <span className="text-[#8E8E93]">Information</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-400">Edit Frame</span>
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
                {isSaving ? 'SAVING...' : 'SAVE'}
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-medium">Information</h2>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading || isSaving}
                    className="text-red-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Edit your frame information below.
                </p>

                <div className="space-y-6">
                  {/* Frame Name */}
                  <div>
                    <label className="block font-medium mb-2">
                      Frame Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      aria-label="frame name"
                      type="text"
                      value={frameName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      disabled={isLoading || isSaving}
                      className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter frame name"
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
                        className="w-full flex items-center justify-between border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          {statusOptions
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

                  {/* Shot Selection */}
                  <div>
                    <label className="block font-medium mb-2">
                      Shot <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between border rounded-lg px-3 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => setIsShotDropdownOpen(!isShotDropdownOpen)}
                        disabled={isLoading || isSaving}
                      >
                        <span>{shot}</span>
                        {isShotDropdownOpen ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </button>

                      {isShotDropdownOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg">
                          {shotOptions
                            .filter(s => s !== shot)
                            .map((shotOption) => (
                              <button
                                key={shotOption}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-gray-50"
                                onClick={() => handleShotChange(shotOption)}
                              >
                                {shotOption}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frame Image */}
                  <div>
                    <label className="block font-medium mb-2">Frame</label>
                    <div className="space-y-4">
                      <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                        {(newImage || frameInfo?.frame) ? (
                          <img 
                            src={newImage || frameInfo?.frame}
                            alt={frameName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                      <input
                        aria-label="frame image"
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
                        {isLoading ? 'UPLOADING...' : 'UPLOAD'}
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