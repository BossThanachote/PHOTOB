'use server'

import { prisma } from '@/app/lib/prisma' // Import จากที่เราแยกไว้
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation' // เพิ่มเติมสำหรับเปลี่ยนหน้า

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string               
  const password = formData.get('password') as string

  try {
    const admin = await prisma.admin.findUnique({
      where: { email }
    })

    if (admin && admin.password === password) {
      const cookieStore = await cookies()
      
      cookieStore.set('admin_session', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // ใช้ Secure ใน Production
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 
      })

      return { 
        success: true, 
        user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } 
      }
    }

    return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
  } catch (error) {
    console.error(error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล' }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  // redirect('/login') // ปกติ logout มักจะทำ redirect ไปด้วยเลย
}