'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { frameService } from '../services/frameService'
import type { Frame, StatusType } from '@/types/types'
import { 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft, 
  Info, 
  Edit, 
  Trash2,
  Loader2 
} from 'lucide-react'
import UploadFrameModal from '../components/UploadFrame'

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const FrameManagement = () => {
  // Router
  const router = useRouter()

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)

  // Data State
  const [frames, setFrames] = useState<Frame[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // UI State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-orange-500'
      case 'declined':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Fetch frames function
  const fetchFrames = async () => {
    try {
      const response = await frameService.getFrames({
        page: currentPage,
        limit: entriesPerPage
      })
      
      // Apply search filter if searchTerm exists
      const filteredFrames = searchTerm
        ? response.items.filter(
            (frame) =>
              frame.frameName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              frame.no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              frame.status?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : response.items

      setFrames(filteredFrames)
      setTotalItems(response.total)
    } catch (err) {
      console.error('Failed to load frames:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    const debounceTimeout = setTimeout(fetchFrames, 300)
    return () => clearTimeout(debounceTimeout)
  }, [currentPage, entriesPerPage, searchTerm])

  // Status change handler
  const handleStatusChange = async (frameId: string, newStatus: StatusType) => {
    try {
      // Optimistic update
      setFrames(prevFrames =>
        prevFrames.map(frame =>
          frame.id === frameId
            ? { ...frame, status: newStatus }
            : frame
        )
      )
      
      // Close dropdown
      setOpenDropdownId(null)

      // Call API in background
      await frameService.updateFrameStatus(frameId, newStatus)
      
    } catch (error) {
      console.error('Failed to update status:', error)
      // Silently fetch fresh data if API call fails
      fetchFrames().catch(console.error)
    }
  }

  // Pagination handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    setOpenDropdownId(null)
  }

  const handleEntriesChange = (value: number) => {
    setEntriesPerPage(value)
    setCurrentPage(1)
    setOpenDropdownId(null)
  }

  // Dropdown toggle handler
  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  // Upload handler
  const handleUpload = async (frameData: any) => {
    try {
      setIsActionLoading(true)
      await frameService.createFrame({
        frameName: `${frameData.shot} Cut`,
        frame: frameData.frame,
        status: frameData.status,
        shot: frameData.shot
      })
      await fetchFrames()
      setIsUploadModalOpen(false)
    } catch (error) {
      console.error('Failed to upload frame:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  // Search handler with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
    setOpenDropdownId(null)
  }

  // Action handler (Info, Edit, Delete)
  const handleAction = async (action: string, frameId: string) => {
    try {
      setIsActionLoading(true)
      switch (action) {
        case 'information':
          router.push(`/admin/management/frame/information/${frameId}`)
          break
        case 'edit':
          router.push(`/admin/management/frame/edit/${frameId}`)
          break
        case 'delete':
          if (window.confirm('Are you sure you want to delete this frame?')) {
            await frameService.deleteFrame(frameId)
            await fetchFrames()
          }
          break
        default:
          console.warn('Unknown action:', action)
      }
      setOpenDropdownId(null)
    } catch (error) {
      console.error(`Failed to ${action} frame:`, error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / entriesPerPage)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Header */}
      <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-medium">Management</h1>
          <span className="text-[#61616A]">|</span>
          <span className="text-[#61616A]">Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#8E8E93]">Frame Management</span>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          disabled={isActionLoading}
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center hover:bg-[#4338CA] transition-colors disabled:opacity-50"
        >
          + UPLOAD
          {isActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
                disabled={isActionLoading}
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
                className="border rounded-lg px-4 py-2 w-full md:w-[240px]"
                placeholder="Search..."
                disabled={isActionLoading}
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y">
                  <th className="py-4 px-4 text-left font-medium">
                    <div className="flex items-center gap-1">
                      No.
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">
                    <div className="flex items-center gap-1">
                      Frame name
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">Frame</th>
                  <th className="py-4 text-left font-medium">Status</th>
                  <th className="py-4 text-left font-medium">Shot</th>
                  <th className="py-4 text-left font-medium">
                    <div className="flex items-center gap-1">
                      Date
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {frames.length > 0 ? (
                  frames.map((frame) => (
                    <tr key={frame.id} className="border-b">
                      <td className="py-4 px-4">{frame.no}</td>
                      <td className="py-4">{frame.frameName}</td>
                      <td className="py-4">
                        <div className="w-12 h-12">
                          <img 
                            src={frame.frame || '/placeholder-frame.png'} 
                            alt={frame.frameName} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </td>
                      <td className="py-4 relative">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 min-w-[120px]"
                          onClick={() => toggleDropdown(frame.id)}
                          disabled={isActionLoading}
                        >
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(frame.status)}`} />
                          <span>{frame.status}</span>
                          {openDropdownId === frame.id ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </button>
                        {openDropdownId === frame.id && (
                          <div className="absolute z-10 mt-1 w-[120px] bg-white border rounded-md shadow-lg">
                            {(['Active', 'Inactive', 'Declined'] as StatusType[])
                              .filter((s) => s !== frame.status)
                              .map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                                  onClick={() => handleStatusChange(frame.id, status)}
                                  disabled={isActionLoading}
                                >
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                                  {status}
                                </button>
                              ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="bg-orange-50 text-orange-800 w-8 h-8 rounded-lg flex items-center justify-center">
                          {frame.shot}
                        </div>
                      </td>
                      <td className="py-4">{formatDate(frame.date)}</td>
                      <td className="py-4 relative">
                        <button
                          aria-label='button'
                          type="button"
                          className="hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50"
                          onClick={() => toggleDropdown(`action_${frame.id}`)}
                          disabled={isActionLoading}
                        >
                          <MoreHorizontal size={20} className="text-gray-400" />
                        </button>

                        {openDropdownId === `action_${frame.id}` && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction('information', frame.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                disabled={isActionLoading}
                              >
                                <Info size={16} className="mr-3 text-gray-400" />
                                Information
                              </button>
                              <button
                                onClick={() => handleAction('edit', frame.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                disabled={isActionLoading}
                              >
                                <Edit size={16} className="mr-3 text-gray-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleAction('delete', frame.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                disabled={isActionLoading}
                              >
                                <Trash2 size={16} className="mr-3 text-gray-400" />
                                Delete
                              </button>
                            </div>
                            </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No frames found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-10 gap-4 border-t">
            <div className="text-gray-500 text-sm md:text-base">
              Showing {frames.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems} entries
            </div>
            <div className="flex gap-1">
              <button
                aria-label='button'
                type="button"
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isActionLoading}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const showAroundCurrent = Math.abs(page - currentPage) <= 1;
                  const isFirstOrLast = page === 1 || page === totalPages;
                  return showAroundCurrent || isFirstOrLast;
                })
                .map((page, index, array) => {
                  const shouldAddEllipsis = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {shouldAddEllipsis && (
                        <span className="px-4 py-2 text-gray-400">...</span>
                      )}
                      <button
                        className={`px-4 py-2 border rounded transition-colors ${
                          page === currentPage
                            ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                            : 'hover:bg-gray-50'
                        } disabled:opacity-50`}
                        onClick={() => handlePageChange(page)}
                        disabled={isActionLoading}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              <button
                aria-label='button'
                type="button"
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isActionLoading}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadFrameModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        isLoading={isActionLoading}
      />

      {/* Loading Overlay */}
      {isActionLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default FrameManagement