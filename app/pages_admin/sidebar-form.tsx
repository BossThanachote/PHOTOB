'use client'
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedMenu, setSelectedMenu] = useState('')
  const [showManageSubmenu, setShowManageSubmenu] = useState(false)
  const [selectedSubmenu, setSelectedSubmenu] = useState('')

  // อัพเดท selected menu ตาม pathname
  useEffect(() => {
    const path = pathname.split('/')
    const currentPath = path[path.length - 1]
    
    switch(currentPath) {
      case 'dashboard':
        setSelectedMenu('dashboard')
        setShowManageSubmenu(false)
        break
      case 'management':
        setSelectedMenu('management')
        setShowManageSubmenu(true)
        break
      case 'machine':
        setSelectedMenu('machine')
        setShowManageSubmenu(false)
        break
      case 'photo':
        setSelectedMenu('photo')
        setShowManageSubmenu(false)
        break
      case 'frame':
      case 'sticker':
      case 'filter':
        setSelectedMenu('management')
        setShowManageSubmenu(true)
        setSelectedSubmenu(currentPath)
        break
    }
  }, [pathname])

  const handleMenuClick = (menu: string) => {
    if (menu === 'management') {
      setShowManageSubmenu(!showManageSubmenu)
      router.push('/admin/management')
    } else {
      setSelectedMenu(menu)
      setShowManageSubmenu(false)
      setSelectedSubmenu('')
      
      switch(menu) {
        case 'dashboard':
          router.push('/admin/dashboard')
          break
        case 'machine':
          router.push('/admin/machine')
          break
        case 'photo':
          router.push('/admin/photo')
          break
      }
    }
  }

  const handleSubmenuClick = (submenu: string) => {
    setSelectedSubmenu(submenu)
    setSelectedMenu('management')
    
    switch(submenu) {
      case 'frame':
        router.push('/admin/management/frame')
        break
      case 'sticker':
        router.push('/admin/management/sticker')
        break
      case 'filter':
        router.push('/admin/management/filter')
        break
    }
  }

  const getMenuStyle = (menu: string) => {
    return `flex gap-2 w-[90%] h-[2.5rem] rounded-md justify-start items-center pl-4 cursor-pointer transition-colors ${
      selectedMenu === menu ? 'bg-[#1E293B] text-[#F7F7F7]' : 'text-[#8E8E93] hover:bg-[#1E293B] hover:text-[#F7F7F7]'
    }`
  }

  const getSubmenuStyle = (submenu: string) => {
    return `flex w-[85%] h-[2.5rem] rounded-md justify-start items-center pl-4 cursor-pointer transition-colors ${
      selectedSubmenu === submenu ? 'bg-[#1E293B] text-[#F7F7F7]' : 'text-[#8E8E93] hover:bg-[#1E293B] hover:text-[#F7F7F7]'
    }`
  }
  return(
    <>
      <div className="bg-black h-[59rem] w-full text-white">
        <div className="flex justify-start pl-10 items-center w-full h-[10rem]">
          <div className="w-[5rem] h-[5rem] bg-gray-200 rounded-md"></div>
          <div className="flex flex-col ml-4 text-[#F7F7F7]">
            <div>Admin name</div>
            <div>admin@email.com</div>
          </div>    
        </div>
        <div className="flex flex-col justify-start pl-7 w-full h-auto gap-4">
          <div 
            className={getMenuStyle('dashboard')}
            onClick={() => handleMenuClick('dashboard')}
          >
            <Image src="/Dashicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
            Dashboard
          </div>
          
          <div>
            <div 
              className={`${getMenuStyle('management')} ${showManageSubmenu ? 'text-[#F7F7F7]' : ''}`}
              onClick={() => handleMenuClick('management')}
            >
              <Image src="/Manageicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
              Management
            </div>
            
            {showManageSubmenu && (
              <div className="ml-8 mt-2 flex flex-col gap-2">
                <div 
                  className={getSubmenuStyle('frame')}
                  onClick={() => handleSubmenuClick('frame')}
                >
                  Frame management
                </div>
                <div 
                  className={getSubmenuStyle('sticker')}
                  onClick={() => handleSubmenuClick('sticker')}
                >
                  Sticker management
                </div>
                <div 
                  className={getSubmenuStyle('filter')}
                  onClick={() => handleSubmenuClick('filter')}
                >
                  Filter management
                </div>
              </div>
            )}
          </div>

          <div 
            className={getMenuStyle('machine')}
            onClick={() => handleMenuClick('machine')}
          >
            <Image src="/Machineicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
            Machine Management
          </div>
          
          <div 
            className={getMenuStyle('photo')}
            onClick={() => handleMenuClick('photo')}
          >
            <Image src="/Photoicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
            Photo
          </div>
        </div>
      </div>
    </>
  )
}