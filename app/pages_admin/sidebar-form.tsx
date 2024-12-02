'use client'
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Pencil, Camera, Check, X } from "lucide-react"
import Cookies from 'js-cookie'

type UserProfile = {
  name: string;
  email: string;
  image?: string;
}

export default function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedMenu, setSelectedMenu] = useState('')
  const [showManageSubmenu, setShowManageSubmenu] = useState(false)
  const [selectedSubmenu, setSelectedSubmenu] = useState('')
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = Cookies.get('auth_token')
    const userData = Cookies.get('user_data')

    if (!token || !userData) {
      router.push('/admin/signin')
      return
    }

    try {
      const parsedUserData = JSON.parse(userData)
      setProfile(parsedUserData)
      setEditName(parsedUserData.name)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/admin/signin')
    }
  }, [router])

  useEffect(() => {
    const path = pathname.split('/')
    const currentPath = path[path.length - 1]
    if (path.includes('machine')) {
      setSelectedMenu('machine')
      setShowManageSubmenu(false)
      return
    }

    switch(currentPath) {
      case 'dashboard':
        setSelectedMenu('dashboard')
        setShowManageSubmenu(false)
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
      default:
        if (path.includes('management')) {
          setSelectedMenu('management')
          setShowManageSubmenu(true)
          setSelectedSubmenu('frame')
        }
    }
  }, [pathname])

  const handleEditName = () => {
    setIsEditing(true)
  }

  const handleSaveName = () => {
    if (!profile) return
    
    const updatedProfile = { ...profile, name: editName }
    setProfile(updatedProfile)
    
    // Update in cookies
    Cookies.set('user_data', JSON.stringify(updatedProfile), {
      path: '/',
      secure: true,
      sameSite: 'lax'
    })
    
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    if (profile) {
      setEditName(profile.name)
    }
    setIsEditing(false)
  }

  const handleMenuClick = (menu: string) => {
    if (menu === 'management') {
      setShowManageSubmenu(true)
      setSelectedMenu(menu)
      setSelectedSubmenu('frame')
      router.push('/admin/management/frame')
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

  // ถ้ายังไม่มีข้อมูล profile ให้แสดง loading หรือ return null
  if (!profile) {
    return null
  }

  return(
    <div className="bg-black h-[60rem] w-full text-white select-none font-ibm-thai-400 sticky top-0">
      <div className="flex flex-col 2xl:flex-row justify-start xl:pl-10 items-center w-full h-[10rem] 2xl:pt-0 pt-5">
        <div className="relative group">
          <img 
            src={profile.image} 
            alt="Profile" 
            className="w-[5rem] h-[5rem] rounded-md object-cover bg-gray-200"
          />
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-md cursor-pointer transition-opacity"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={24} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            aria-label="Upload profile image"
          />
        </div>

        <div className="flex flex-col ml-4 text-[#F7F7F7]">
          <div className="flex items-center justify-center 2xl:justify-start gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  aria-label="button"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-transparent border-b border-gray-400 outline-none px-1 text-white"
                  autoFocus
                />
                <button
                  aria-label="button" 
                  type="button"
                  onClick={handleSaveName}
                  className="text-green-500 hover:text-green-400"
                >
                  <Check size={16} />
                </button>
                <button
                  aria-label="button" 
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-red-500 hover:text-red-400"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <span>{profile.name}</span>
                <button
                  aria-label="button"
                  type="button"
                  onClick={handleEditName}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
          <div>{profile.email}</div>
        </div>    
      </div>

      <div className="flex flex-col justify-start pl-7 w-full h-auto gap-4">
        <div 
          className={getMenuStyle('dashboard')}
          onClick={() => handleMenuClick('dashboard')}
          role="button"
          tabIndex={0}
        >
          <Image src="/Dashicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
          Dashboard
        </div>
        
        <div>
          <div 
            className={`${getMenuStyle('management')} ${showManageSubmenu ? 'text-[#F7F7F7]' : ''}`}
            onClick={() => handleMenuClick('management')}
            role="button"
            tabIndex={0}
          >
            <Image src="/Manageicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
            Management
          </div>
          
          {showManageSubmenu && (
            <div className="ml-8 mt-2 flex flex-col gap-2">
              <div 
                className={getSubmenuStyle('frame')}
                onClick={() => handleSubmenuClick('frame')}
                role="button"
                tabIndex={0}
              >
                Frame management
              </div>
              <div 
                className={getSubmenuStyle('sticker')}
                onClick={() => handleSubmenuClick('sticker')}
                role="button"
                tabIndex={0}
              >
                Sticker management
              </div>
              <div 
                className={getSubmenuStyle('filter')}
                onClick={() => handleSubmenuClick('filter')}
                role="button"
                tabIndex={0}
              >
                Filter management
              </div>
            </div>
          )}
        </div>

        <div 
          className={getMenuStyle('machine')}
          onClick={() => handleMenuClick('machine')}
          role="button"
          tabIndex={0}
        >
          <Image src="/Machineicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
          Machine Management
        </div>
        
        <div 
          className={getMenuStyle('photo')}
          onClick={() => handleMenuClick('photo')}
          role="button"
          tabIndex={0}
        >
          <Image src="/Photoicon.png" alt="" width={24} height={24} className="w-[1.5rem] h-[1.5rem]" />
          Photo
        </div>
      </div>

      <div className="absolute bottom-0 w-[24rem] pl-7 pb-6">
      <button
        type="button"
        onClick={() => {
          // ลบ cookies ทั้งหมด
          Object.keys(Cookies.get()).forEach(cookieName => {
            Cookies.remove(cookieName, { path: '/' });
          });
          
          // redirect ไปหน้า signin
          router.replace('/admin/signin');  // ใช้ replace แทน push
        }}
        className="flex gap-2 w-[90%] sm:w-[9rem] md:w-[13rem] lg:w-[13rem] 3xl:w-[20rem] h-[2.5rem] rounded-md items-center pl-4 cursor-pointer transition-colors text-[#8E8E93] hover:bg-[#1E293B] hover:text-[#F7F7F7]"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-[1.5rem] h-[1.5rem]"
          >
            <path 
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M16 17L21 12L16 7" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M21 12H9" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          Log out
        </button>
      </div>
    </div>
  )
}