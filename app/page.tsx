'use client'
import { useEffect } from 'react'
import state from "@/app/valtio_config";

export default function Home() {
  useEffect(() => {
    // ตั้งค่าเริ่มต้นเป็น Intro 1 (หน้า Touch Screen)
    state.intro = 1;
    localStorage.setItem('currentIntro', '1');
    
    // บังคับวิ่งไปหน้า /booth โดยตรง
    window.location.href = '/booth'; 
  }, []);

  return null;
}