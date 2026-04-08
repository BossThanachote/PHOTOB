'use server'

import { supabase } from '@/app/lib/supabase' 
import { cookies } from 'next/headers'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // ดึงข้อมูล Admin จาก Supabase
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .single()
    console.log("ผลการค้นหา:", admin); // ดูค่าใน Terminal
    console.log("Error :", error);

    if (error || !admin) {
      return { success: false, message: 'ไม่พบอีเมลนี้ในระบบ' }
    }

    // เช็ครหัสผ่าน (เทียบ Plain Text)
    if (admin.password === password) {
      const cookieStore = await cookies()

      // เก็บ Session เบื้องต้น
      cookieStore.set('admin_session', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
      })

      return {
        success: true,
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    }

    return { success: false, message: 'รหัสผ่านไม่ถูกต้อง' }
  } catch (error) {
    console.error("Login Error:", error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' }
  }
}