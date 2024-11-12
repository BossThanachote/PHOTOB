// mockApi/frameApi.ts

// Interface สำหรับข้อมูล Frame
export interface Frame {
  no: string
  frameName: string
  frame: string // URL ของรูปภาพ
  status: 'Active' | 'Disable'
  shot: number
  date: string
}

const STORAGE_KEY = 'frames_data'

// ข้อมูล Default เริ่มต้น
const DEFAULT_FRAMES: Frame[] = [
  {
    no: '001',
    frameName: '3 Cut',
    frame: '/frame1.png',
    status: 'Active',
    shot: 3,
    date: '2023-04-05, 00:05PM'
  },
  {
    no: '002',
    frameName: '6 Cut',
    frame: '/frame2.png',
    status: 'Active',
    shot: 6,
    date: '2023-04-05, 00:05PM'
  }
]

// Helper functions สำหรับจัดการ localStorage
const saveToStorage = (frames: Frame[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(frames))
  } catch (error) {
    console.error('Error saving frames to storage:', error)
  }
}

const loadFromStorage = (): Frame[] => {
  try {
    const savedFrames = localStorage.getItem(STORAGE_KEY)
    if (savedFrames) {
      return JSON.parse(savedFrames)
    }
  } catch (error) {
    console.error('Error loading frames from storage:', error)
  }
  return DEFAULT_FRAMES
}

// API Functions
export const frameAPI = {
  // ดึงข้อมูล Frames ทั้งหมด
  getFrames: (): Frame[] => {
    return loadFromStorage()
  },

  // เพิ่ม Frame ใหม่
  addFrame: (frameData: { frame: string; status: 'Active' | 'Disable'; shot: number; frameName: string }): Frame => {
    const frames = loadFromStorage()
    const lastNo = frames.length > 0 ? 
      parseInt(frames[frames.length - 1].no) : 0
    
    const newFrame: Frame = {
      no: String(lastNo + 1).padStart(3, '0'),
      frameName: frameData.frameName,
      frame: frameData.frame,
      status: frameData.status,
      shot: frameData.shot,
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    frames.push(newFrame)
    saveToStorage(frames)
    return newFrame
  },

  // อัพเดทข้อมูล Frame
  updateFrame: (frameNo: string, updateData: Partial<Omit<Frame, 'no' | 'date'>>): Frame | null => {
    const frames = loadFromStorage()
    const frameIndex = frames.findIndex(f => f.no === frameNo)
    
    if (frameIndex === -1) return null
    
    frames[frameIndex] = {
      ...frames[frameIndex],
      ...updateData,
      date: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    saveToStorage(frames)
    return frames[frameIndex]
  },

  // อัพเดทสถานะ Frame
  updateFrameStatus: (frameNo: string, newStatus: 'Active' | 'Disable'): Frame | null => {
    const frames = loadFromStorage()
    const frameIndex = frames.findIndex(f => f.no === frameNo)
    
    if (frameIndex === -1) return null
    
    frames[frameIndex] = {
      ...frames[frameIndex],
      status: newStatus
    }
    
    saveToStorage(frames)
    return frames[frameIndex]
  },

  // ลบ Frame
  deleteFrame: (frameNo: string): boolean => {
    const frames = loadFromStorage()
    const newFrames = frames.filter(f => f.no !== frameNo)
    
    if (newFrames.length === frames.length) return false
    
    saveToStorage(newFrames)
    return true
  },

  // ดึงข้อมูล Frame ตาม ID
  getFrameById: (frameNo: string): Frame | null => {
    const frames = loadFromStorage()
    return frames.find(f => f.no === frameNo) || null
  },

  // เคลียร์ข้อมูลทั้งหมด
  clearFrames: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing frames:', error)
    }
  },

  // รีเซ็ตข้อมูลเป็นค่าเริ่มต้น
  resetToDefault: (): void => {
    try {
      saveToStorage(DEFAULT_FRAMES)
    } catch (error) {
      console.error('Error resetting frames to default:', error)
    }
  },

  // นับจำนวน Frame ทั้งหมด
  getFrameCount: (): number => {
    const frames = loadFromStorage()
    return frames.length
  },

  // ค้นหา Frame
  searchFrames: (searchTerm: string): Frame[] => {
    const frames = loadFromStorage()
    return frames.filter(frame => 
      frame.frameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      frame.no.includes(searchTerm)
    )
  },

  // กรอง Frame ตามสถานะ
  filterByStatus: (status: 'Active' | 'Disable'): Frame[] => {
    const frames = loadFromStorage()
    return frames.filter(frame => frame.status === status)
  }
}