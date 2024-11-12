'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { stickerAPI } from '../MockAPI/mockStickerApi'
import UploadStickerModal from '../components/UploadSticker'
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Info, Edit, Trash2 } from 'lucide-react'
import type { Sticker } from '@/types/types'

export default function StickerManagement() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Load stickers when component mounts
  useEffect(() => {
    const loadedStickers = stickerAPI.getStickers()
    setStickers(loadedStickers)
  }, [])

  // Calculate paginated data
  const paginatedStickers: Sticker[] = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * entriesPerPage
    const lastPageIndex = firstPageIndex + entriesPerPage
    return stickers.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, entriesPerPage, stickers])

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages: number = useMemo(() => {
    return Math.ceil(stickers.length / entriesPerPage)
  }, [stickers.length, entriesPerPage])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleEntriesChange = (value: number) => {
    setEntriesPerPage(value)
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  const handleStatusChange = (stickerId: string, newStatus: 'Active' | 'Disable') => {
    const updatedStickers = stickerAPI.updateStickerStatus(stickerId, newStatus)
    setStickers(updatedStickers)
    setOpenDropdownId(null)
  }

  const handleUpload = (stickersData: { stickerName: string; sticker: string; status: 'Active' | 'Disable' }[]) => {
    const updatedStickers = stickerAPI.addStickers(stickersData)
    setStickers(updatedStickers)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    const searchResults = stickerAPI.searchStickers(value)
    setStickers(searchResults)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleAction = (action: string, stickerId: string) => {
    switch (action) {
      case 'information':
        router.push(`/admin/management/sticker/information/${stickerId}`);
        break;
      case 'edit':
        router.push(`/admin/management/sticker/edit/${stickerId}`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this sticker?')) {
          const updatedStickers = stickerAPI.deleteSticker(stickerId);
          setStickers(updatedStickers);
        }
        break;
    }
    setOpenDropdownId(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Header */}
      <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-medium font-ibm-thai-600">Management</h1>
          <span className="font-ibm-thai-500 text-[#61616A]">|</span>
          <span className="text-[#61616A] font-ibm-thai-500">Management</span>
          <span className="text-gray-400">/</span>
          <span className='font-ibm-thai-400 text-[#8E8E93]'>Sticker Management</span>
        </div>
  
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center"
        >
          + UPLOAD
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-10 gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-gray-500 whitespace-nowrap">Show</span>
              <select
                aria-label='button'
                value={entriesPerPage}
                onChange={(e) => handleEntriesChange(Number(e.target.value))}
                className="border rounded px-2 py-1 w-20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500">Entries</span>
            </div>
            <div className="w-full md:w-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="border rounded px-3 py-1 w-full md:w-[240px]"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto h-[43rem]">
            <table className="w-full">
              <thead>
                <tr className="border-y">
                  <th className="py-4 px-4 text-left font-medium">No.</th>
                  <th className="py-4 text-left font-medium">Sticker name</th>
                  <th className="py-4 text-left font-medium">Sticker</th>
                  <th className="py-4 text-left font-medium">Status</th>
                  <th className="py-4 text-left font-medium">Date</th>
                  <th className="py-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStickers.map((sticker) => (
                  <tr key={sticker.no} className="border-b">
                    <td className="py-4 px-4">{sticker.no}</td>
                    <td className="py-4">{sticker.stickerName}</td>
                    <td className="py-4">
                      <div className="w-12 h-12">
                        <img 
                          src={sticker.sticker}
                          alt={sticker.stickerName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </td>
                    <td className="py-4 relative">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 min-w-[120px]"
                        onClick={() => toggleDropdown(sticker.no)}
                      >
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            sticker.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{sticker.status}</span>
                        {openDropdownId === sticker.no ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </button>
                      {openDropdownId === sticker.no && (
                        <div className="absolute z-10 mt-1 w-[120px] bg-white border rounded-md shadow-lg">
                          <button
                            type="button"
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                            onClick={() => handleStatusChange(
                              sticker.no,
                              sticker.status === 'Active' ? 'Disable' : 'Active'
                            )}
                          >
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                sticker.status === 'Active' ? 'bg-red-500' : 'bg-green-500'
                              }`}
                            />
                            {sticker.status === 'Active' ? 'Disable' : 'Active'}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4">{sticker.date}</td>
                    <td className="py-4 relative">
                      <button 
                        aria-label='button'
                        type="button"
                        className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        onClick={() => toggleDropdown(`action_${sticker.no}`)}
                      >
                        <MoreHorizontal size={20} className="text-gray-400" />
                      </button>

                      {/* Action Dropdown Menu */}
                      {openDropdownId === `action_${sticker.no}` && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20">
                          <div className="py-1">
                            <button
                              onClick={() => handleAction('information', sticker.no)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Info size={16} className="mr-3 text-gray-400" />
                              Information
                            </button>
                            <button
                              onClick={() => handleAction('edit', sticker.no)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Edit size={16} className="mr-3 text-gray-400" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleAction('delete', sticker.no)}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Trash2 size={16} className="mr-3 text-gray-400" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-10 gap-4 border-t">
            <div className="text-gray-500 text-center md:text-left text-sm md:text-base">
              Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, stickers.length)} of {stickers.length} entries
            </div>
            <div className="flex gap-1">
              <button
                aria-label='button' 
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button 
                  key={pageNumber}
                  className={`px-4 py-2 border rounded transition-colors ${
                    pageNumber === currentPage 
                      ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                aria-label='button' 
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadStickerModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}