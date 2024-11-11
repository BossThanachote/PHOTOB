// mockApi/frameApi.ts

export interface Frame {
    no: string
    frameName: string
    frame: string
    status: 'Active' | 'Disable'
    shot: number
    date: string
  }
  
  const STORAGE_KEY = 'frames_data'
  
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
  
  // Helper functions
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
  
  export const frameAPI = {
    getFrames: (): Frame[] => {
      return loadFromStorage()
    },
  
    addFrame: (frameData: Omit<Frame, 'no' | 'date'>): Frame => {
      const frames = loadFromStorage()
      const lastNo = frames.length > 0 ? 
        parseInt(frames[frames.length - 1].no) : 0
      
      const newFrame: Frame = {
        no: String(lastNo + 1).padStart(3, '0'),
        ...frameData,
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
  
    deleteFrame: (frameNo: string): boolean => {
      const frames = loadFromStorage()
      const newFrames = frames.filter(f => f.no !== frameNo)
      
      if (newFrames.length === frames.length) return false
      
      saveToStorage(newFrames)
      return true
    }
  }