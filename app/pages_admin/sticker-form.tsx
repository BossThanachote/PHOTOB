'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { 
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
  Edit2,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react'

export default function StickerManagement() {
  const router = useRouter()

  // Data State
  const [stickers, setStickers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) 
  
  const [formData, setFormData] = useState({
    name: '',
    image_url: '' 
  })

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchStickers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('sticker')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setStickers(data || [])
    } catch (err) {
      console.error('Failed to load stickers:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchStickers() }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name: '', image_url: '' })
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (sticker: any) => {
    setEditingId(sticker.id)
    setFormData({ 
      name: sticker.name, 
      image_url: sticker.image_url || ''
    })
    setSelectedFile(null)
    setPreviewUrl(sticker.image_url || null) // โชว์รูปเดิม
    setIsModalOpen(true)
  }

  // จัดการ Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.includes('image')) {
      return alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้นครับ')
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file)) // สร้าง URL ชั่วคราวเพื่อพรีวิว
  }

  // ฟังก์ชันบันทึก + อัปโหลดรูปเข้า Supabase Storage
  const handleSaveSticker = async () => {
    if (!formData.name) return alert('กรุณาใส่ชื่อสติ๊กเกอร์')
    if (!selectedFile && !formData.image_url) return alert('กรุณาอัปโหลดรูปภาพสติ๊กเกอร์')
    
    try {
      setIsActionLoading(true)
      let finalImageUrl = formData.image_url

      // ถ้ามีการเลือกไฟล์ใหม่ ให้อัปโหลดเข้า Storage ก่อน
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}` // สุ่มชื่อไฟล์ป้องกันซ้ำ
        
        // 🚀 อัปโหลดเข้า Bucket ชื่อ 'stickers'
        const { error: uploadError } = await supabase.storage
          .from('stickers')
          .upload(fileName, selectedFile, { cacheControl: '3600', upsert: false })

        if (uploadError) throw uploadError

        // 🚀 ดึง Public URL ของรูปที่เพิ่งอัปโหลด
        const { data: publicUrlData } = supabase.storage
          .from('stickers')
          .getPublicUrl(fileName)

        finalImageUrl = publicUrlData.publicUrl
      }
      
      const payload = {
        name: formData.name,
        image_url: finalImageUrl
      }

      if (editingId) {
        const { error } = await supabase.from('sticker').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('sticker').insert([payload])
        if (error) throw error
      }
      
      setIsModalOpen(false)
      fetchStickers()
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาดในการบันทึกหรืออัปโหลดรูปภาพ กรุณาตรวจสอบ Bucket ใน Supabase')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('ยืนยันการลบสติ๊กเกอร์นี้?')) return
    try {
      setIsActionLoading(true)
      // อนาคตสามารถเขียนลบไฟล์ใน Storage เพิ่มเติมตรงนี้ได้ครับ
      await supabase.from('sticker').delete().eq('id', id)
      fetchStickers()
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
          <span className="text-gray-500">Sticker Management</span>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#9B1C27] text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-[#8B1922] transition-all shadow-lg"
        >
          <Plus size={20} />
          ADD STICKER
        </button>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-50 flex justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="ค้นหาชื่อสติ๊กเกอร์..."
                className="w-full h-12 pl-12 pr-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#9B1C27] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-5 px-8 text-left text-gray-400 font-medium w-24">รูปภาพ</th>
                  <th className="py-5 px-8 text-left text-gray-400 font-medium">ชื่อสติ๊กเกอร์</th>
                  <th className="py-5 px-8 text-left text-gray-400 font-medium">URL</th>
                  <th className="py-5 px-8 text-center text-gray-400 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stickers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((sticker) => (
                  <tr key={sticker.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                        {sticker.image_url ? (
                          <img src={sticker.image_url} alt={sticker.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-8 font-bold text-gray-800">{sticker.name}</td>
                    <td className="py-5 px-8 text-gray-500 text-sm max-w-xs truncate">
                      {sticker.image_url || '-'}
                    </td>
                    <td className="py-5 px-8">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => handleOpenEdit(sticker)} className="p-3 text-blue-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                          <Edit2 size={20} />
                        </button>
                        <button onClick={() => handleDelete(sticker.id)} className="p-3 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {stickers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-400">ยังไม่มีสติ๊กเกอร์ในระบบ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingId ? 'แก้ไขสติ๊กเกอร์' : 'เพิ่มสติ๊กเกอร์'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              
              {/* 🚀 Drag & Drop Area */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพสติ๊กเกอร์</label>
                <div 
                  className={`w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-[#9B1C27] bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  {previewUrl ? (
                    <div className="relative w-full h-full p-2 flex justify-center items-center group">
                       <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                          <p className="text-white font-bold text-sm flex items-center gap-2"><Edit2 size={16}/> เปลี่ยนรูป</p>
                       </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={40} className="text-gray-400 mb-3" />
                      <p className="text-sm font-bold text-gray-600">ลากไฟล์มาวาง หรือ คลิกเพื่ออัปโหลด</p>
                      <p className="text-xs text-gray-400 mt-1">แนะนำไฟล์ PNG พื้นหลังโปร่งใส</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อสติ๊กเกอร์</label>
                <input
                  type="text"
                  placeholder="เช่น มงกุฎ, แว่นตา"
                  className="w-full h-14 bg-gray-50 rounded-2xl px-5 outline-none border-2 border-transparent focus:border-[#9B1C27] transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

            </div>

            <button
              onClick={handleSaveSticker}
              disabled={isActionLoading}
              className="w-full h-16 bg-[#9B1C27] text-white rounded-2xl font-bold text-xl mt-10 hover:bg-[#8B1922] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-900/20"
            >
              {isActionLoading ? <Loader2 className="animate-spin" /> : (editingId ? 'UPDATE STICKER' : 'UPLOAD STICKER')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}