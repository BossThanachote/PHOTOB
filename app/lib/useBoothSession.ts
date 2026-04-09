'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface BoothSessionData {
  machineId: string;
  frame: {
    id: string;
    frameName: string;
    shot: number;
    cols: number;
    rows: number;
    price: number;
    frame: string;
  };
}

export function useBoothSession() {
  const router = useRouter()
  const [session, setSession] = useState<BoothSessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const machineId = localStorage.getItem('active_booth_id')
    const frameStr = localStorage.getItem('selectedFrame')

  
    if (!machineId || !frameStr) {
      alert("ไม่พบข้อมูลเซสชัน! กรุณาเริ่มทำรายการใหม่")
      router.push('/booth')
      return
    }

    try {
      setSession({
        machineId,
        frame: JSON.parse(frameStr)
      })
    } catch (error) {
      console.error("Error parsing frame data", error)
      router.push('/booth')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return { session, isLoading }
}