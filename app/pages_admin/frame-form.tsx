'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { 
  Plus,
  LayoutGrid,
  Trash2,
  Loader2,
  X,
  Search,
  Tag,
  Edit2 // <-- เพิ่มไอคอน Edit2
} from 'lucide-react'

const FrameManagement = () => {
  const router = useRouter()

  // Data State
  const [frames, setFrames] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State (รวม Add และ Edit ไว้ในตัวเดียว)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) // <-- เก็บ ID ตัวที่กำลังจะแก้ (ถ้าเป็น null คือสร้างใหม่)
  
  const [formData, setFormData] = useState({
    name: '',
    cols: 2,
    rows: 3,
    price: 120
  })

  // 1. Fetch Frames จาก Supabase
  const fetchFrames = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('frame')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFrames(data || [])
    } catch (err) {
      console.error('Failed to load frames:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchFrames() }, [])

  // 2. ฟังก์ชันเปิด Modal สำหรับสร้างใหม่
  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name: '', cols: 2, rows: 3, price: 120 })
    setIsModalOpen(true)
  }

  // 3. ฟังก์ชันเปิด Modal สำหรับแก้ไข
  const handleOpenEdit = (frame: any) => {
    setEditingId(frame.id)
    setFormData({ 
      name: frame.name, 
      cols: frame.cols || 2, 
      rows: frame.rows || 3, 
      price: frame.price || 120 
    })
    setIsModalOpen(true)
  }

  // 4. ฟังก์ชันบันทึกเฟรม (จัดการทั้ง Add และ Edit)
  const handleSaveFrame = async () => {
    if (!formData.name) return alert('กรุณาใส่ชื่อเฟรม')
    if (formData.price < 0) return alert('ราคาต้องไม่ติดลบ')
    
    try {
      setIsActionLoading(true)
      
      // เตรียมข้อมูลที่จะบันทึก
      const payload = {
        name: formData.name,
        cols: formData.cols,
        rows: formData.rows,
        shots_count: formData.cols * formData.rows,
        price: formData.price
      }

      if (editingId) {
        // กรณี: มี editingId แปลว่ากด Edit มา -> ใช้วิธี Update
        const { error } = await supabase.from('frame').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        // กรณี: ไม่มี editingId แปลว่ากด Add มา -> ใช้วิธี Insert
        const { error } = await supabase.from('frame').insert([payload])
        if (error) throw error
      }
      
      setIsModalOpen(false)
      fetchFrames()
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาดในการบันทึก')
    } finally {
      setIsActionLoading(false)
    }
  }

  // 5. ฟังก์ชันลบเฟรม
  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบเฟรมนี้?')) return
    try {
      setIsActionLoading(true)
      await supabase.from('frame').delete().eq('id', id)
      fetchFrames()
    } catch (err) {
      console.error(err)
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F7F7F7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#9B1C27]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-ibm-thai select-none">
      {/* Header */}
      <div className="h-20 bg-white flex justify-between items-center px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Management</h1>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">Frame Management</span>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#9B1C27] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-[#8B1922] transition-all shadow-lg"
        >
          <Plus size={20} />
          ADD FRAME
        </button>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
          {/* Search Bar */}
          <div className="p-6 border-b border-gray-50 flex justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาชื่อเฟรม..."
                className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#9B1C27] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-5 px-8 text-left text-gray-400 font-medium">ชื่อเฟรม</th>
                  <th className="py-5 px-8 text-left text-gray-400 font-medium">รูปแบบ (หลัก x แถว)</th>
                  <th className="py-5 px-8 text-left text-gray-400 font-medium">จำนวนภาพรวม</th>
                  <th className="py-5 px-8 text-left text-gray-400 font-medium">ราคา (Price)</th>
                  <th className="py-5 px-8 text-center text-gray-400 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {frames.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((frame) => (
                  <tr key={frame.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-5 px-8 font-bold text-gray-800">{frame.name}</td>
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-2 text-gray-600">
                        <LayoutGrid size={18} className="text-gray-300" />
                        {frame.cols} x {frame.rows}
                      </div>
                    </td>
                    <td className="py-5 px-8">
                      <span className="px-4 py-1.5 bg-red-50 text-[#9B1C27] rounded-full font-bold text-sm">
                        {frame.shots_count} SHOTS
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <span className="flex items-center gap-2 font-bold text-gray-700">
                        <Tag size={16} className="text-gray-400"/>
                        {frame.price || 120} บาท
                      </span>
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex justify-center items-center gap-2">
                        {/* ปุ่ม Edit */}
                        <button 
                          onClick={() => handleOpenEdit(frame)}
                          className="p-3 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        >
                          <Edit2 size={20} />
                        </button>
                        {/* ปุ่มลบ */}
                        <button 
                          onClick={() => handleDelete(frame.id)}
                          className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Frame Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'แก้ไขเฟรมถ่ายรูป' : 'สร้างเฟรมถ่ายรูป'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อรูปแบบเฟรม</label>
                <input
                  type="text"
                  placeholder="เช่น 3 แถว ยาว"
                  className="w-full h-14 bg-gray-50 rounded-2xl px-5 outline-none border-2 border-transparent focus:border-[#9B1C27] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">จำนวนหลัก (Cols)</label>
                  <select 
                    className="w-full h-14 bg-gray-50 rounded-2xl px-4 font-bold outline-none"
                    value={formData.cols}
                    onChange={(e) => setFormData({...formData, cols: Number(e.target.value)})}
                  >
                    {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} คอลัมน์</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">จำนวนแถว (Rows)</label>
                  <select 
                    className="w-full h-14 bg-gray-50 rounded-2xl px-4 font-bold outline-none"
                    value={formData.rows}
                    onChange={(e) => setFormData({...formData, rows: Number(e.target.value)})}
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} แถว</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ราคา (บาท)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">฿</span>
                  <input
                    type="number"
                    min="0"
                    className="w-full h-14 bg-gray-50 rounded-2xl pl-10 pr-5 font-bold outline-none border-2 border-transparent focus:border-[#9B1C27] transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="bg-gray-900 rounded-[2rem] p-8 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest">Total Photos</p>
                  <p className="text-6xl font-black">{formData.cols * formData.rows}</p>
                  <p className="text-gray-400 mt-1">จะถูกถ่ายในเซสชันนี้</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <LayoutGrid size={80} />
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveFrame}
              disabled={isActionLoading}
              className="w-full h-16 bg-[#9B1C27] text-white rounded-2xl font-bold text-xl mt-10 hover:bg-[#8B1922] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-900/20"
            >
              {isActionLoading ? <Loader2 className="animate-spin" /> : (editingId ? 'UPDATE FRAME' : 'CREATE FRAME')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FrameManagement