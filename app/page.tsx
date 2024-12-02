// app/page.tsx
'use client'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import state from "@/app/valtio_config"; // เพิ่ม import state

export default function Home() {
  useEffect(() => {
    const selectedMachineId = localStorage.getItem('selectedMachineId');
    
    if (selectedMachineId) {
      // ตั้งค่า state.intro เป็น 1 ก่อน redirect
      state.intro = 1;
      localStorage.setItem('currentIntro', '1');
      window.location.href = `/booth/${selectedMachineId}`;
    } else {
      window.location.href = '/dashboard';
    }
  }, []);

  return null;
}