'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase'
import { Plus, Trash2, Loader2, Search, MonitorPlay, Layers, X, CheckSquare, Square } from 'lucide-react'

export default function MachineManagement() {
  // States
  const [machines, setMachines] = useState<any[]>([])
  const [allFrames, setAllFrames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal States
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false)
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false)
  const [selectedMachine, setSelectedMachine] = useState<any>(null)
  
  // Form State
  const [newMachineName, setNewMachineName] = useState('')
  const [selectedFrameIds, setSelectedFrameIds] = useState<string[]>([])

  // 1. ดึงข้อมูลตู้และเฟรมทั้งหมด
  const fetchData = async () => {
    try {
      setIsLoading(true)
      // ดึงตู้
      const { data: machinesData } = await supabase
        .from('machine')
        .select('*')
        .order('last_active', 
        { ascending: false })
      // ดึงเฟรม
      const { data: framesData } = await supabase.from('frame').select('*')
      
      setMachines(machinesData || [])
      setAllFrames(framesData || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // 2. สร้างตู้ใหม่
  const handleCreateMachine = async () => {
    if (!newMachineName) return alert('กรุณาใส่ชื่อตู้')
    try {
      await supabase.from('machine').insert([{ 
        name: newMachineName, 
        status: 'online',
        selected_frames: [] // เริ่มต้นเป็นตู้เปล่า
      }])
      setNewMachineName('')
      setIsMachineModalOpen(false)
      fetchData()
    } catch (err) {
      alert('สร้างตู้ไม่สำเร็จ')
    }
  }

  // 3. เปิดหน้าจอจัดการเฟรมให้ตู้นั้นๆ
  const openFrameManager = (machine: any) => {
    setSelectedMachine(machine)
    // ดึงเฟรมเดิมที่มีอยู่ในตู้ออกมาติ๊กถูกรอไว้
    setSelectedFrameIds(machine.selected_frames || [])
    setIsFrameModalOpen(true)
  }

  // 4. บันทึกเฟรมเข้าตู้
  const handleSaveFramesToMachine = async () => {
    try {
      await supabase
        .from('machine')
        .update({ selected_frames: selectedFrameIds })
        .eq('id', selectedMachine.id)
      
      setIsFrameModalOpen(false)
      fetchData()
    } catch (err) {
      alert('บันทึกเฟรมเข้าตู้ล้มเหลว')
    }
  }

  const toggleFrameSelection = (frameId: string) => {
    setSelectedFrameIds(prev => 
      prev.includes(frameId) 
        ? prev.filter(id => id !== frameId) // เอาออก
        : [...prev, frameId] // เพิ่มเข้า
    )
  }

  const handleDelete = async (id: string) => {
    if(!window.confirm('ยืนยันการลบตู้นี้?')) return
    await supabase.from('machine').delete().eq('id', id)
    fetchData()
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#9B1C27] w-10 h-10" /></div>

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-ibm-thai select-none p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Machine Management</h1>
        <button 
          onClick={() => setIsMachineModalOpen(true)}
          className="bg-[#4F46E5] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#4338CA] shadow-lg transition-all"
        >
          <Plus size={20} /> CREATE MACHINE
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-5 text-gray-500 font-medium">ชื่อตู้ (Machine Name)</th>
              <th className="px-6 py-5 text-gray-500 font-medium">สถานะ (Status)</th>
              <th className="px-6 py-5 text-gray-500 font-medium text-center">เฟรมในตู้</th>
              <th className="px-6 py-5 text-center text-gray-500 font-medium">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {machines.map((machine) => (
              <tr key={machine.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5 font-bold flex items-center gap-3">
                  <MonitorPlay className="text-gray-400" />
                  {machine.name}
                </td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${machine.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                    {machine.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => openFrameManager(machine)}
                    className="bg-purple-50 text-purple-600 px-4 py-2 rounded-xl font-bold hover:bg-purple-100 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Layers size={16} />
                    {machine.selected_frames?.length || 0} เฟรม
                  </button>
                </td>
                <td className="px-6 py-5 flex justify-center gap-2">
                  <button onClick={() => handleDelete(machine.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 1. Modal: สร้างตู้ */}
      {isMachineModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">สร้างตู้ Photobooth ใหม่</h2>
            <input 
              type="text" placeholder="ชื่อตู้ เช่น Booth A - Siam"
              className="w-full h-12 border-2 border-gray-100 rounded-xl px-4 mb-6 outline-none focus:border-[#4F46E5]"
              value={newMachineName} onChange={(e) => setNewMachineName(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setIsMachineModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">ยกเลิก</button>
              <button onClick={handleCreateMachine} className="flex-1 py-3 bg-[#4F46E5] rounded-xl font-bold text-white">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: จัดการเฟรมเข้าตู้ (ทีเด็ดอยู่ตรงนี้ Boss!) */}
      {isFrameModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold">เลือกเฟรมให้ตู้: {selectedMachine?.name}</h2>
                <p className="text-sm text-gray-500 mt-1">ติ๊กเลือกเฟรมที่ต้องการให้แสดงในตู้นี้</p>
              </div>
              <button onClick={() => setIsFrameModalOpen(false)} className="p-2 bg-white rounded-full shadow-sm"><X size={20}/></button>
            </div>
            
            {/* รายชื่อเฟรมให้เลือก */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 gap-4 bg-gray-100/50">
              {allFrames.map(frame => {
                const isSelected = selectedFrameIds.includes(frame.id)
                return (
                  <div 
                    key={frame.id} 
                    onClick={() => toggleFrameSelection(frame.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 bg-white ${isSelected ? 'border-[#4F46E5] shadow-md' : 'border-transparent hover:border-gray-200'}`}
                  >
                    {isSelected ? <CheckSquare className="text-[#4F46E5]" /> : <Square className="text-gray-300" />}
                    <div>
                      <p className="font-bold text-gray-800">{frame.name}</p>
                      <p className="text-xs text-gray-500">{frame.cols}x{frame.rows} Layout • {frame.shots_count} Shots</p>
                    </div>
                  </div>
                )
              })}
              {allFrames.length === 0 && <p className="col-span-2 text-center text-gray-400 py-10">ยังไม่มีเฟรมในระบบ กรุณาไปสร้างที่ Frame Management ก่อน</p>}
            </div>

            <div className="p-6 border-t bg-white">
              <button 
                onClick={handleSaveFramesToMachine}
                className="w-full py-4 bg-[#4F46E5] text-white rounded-xl font-bold hover:bg-[#4338CA] transition-all"
              >
                บันทึกเฟรมที่เลือก ({selectedFrameIds.length} เฟรม)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}