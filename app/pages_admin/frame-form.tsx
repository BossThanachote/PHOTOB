'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Info, Edit, Trash2 } from 'lucide-react'
import { Frame, frameAPI, StatusType } from '../MockAPI/mockFrameApi'
import UploadFrameModal from '../components/UploadFrame'

export default function FrameManagement() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Calculate paginated data
  const paginatedFrames = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * entriesPerPage
    const lastPageIndex = firstPageIndex + entriesPerPage
    return frames.slice(firstPageIndex, lastPageIndex)
  }, [currentPage, entriesPerPage, frames])

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(frames.length / entriesPerPage)
  }, [frames.length, entriesPerPage])

  // Load frames when component mounts
  useEffect(() => {
    const loadedFrames = frameAPI.getFrames()
    setFrames(loadedFrames)
  }, [])

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleEntriesChange = (value: number) => {
    setEntriesPerPage(value)
    setCurrentPage(1) // Reset to first page when changing entries per page
  }

  // Get color for status
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500'
      case 'Inactive':
        return 'bg-orange-500'
      case 'Declined':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBgColor = (status: StatusType) => {
    switch (status) {
      case 'Active':
        return 'border-[1px] py-2 px-[1.5rem]'
      case 'Inactive':
        return 'border-[1px] py-2 px-[1.5rem]'
      case 'Declined':
        return 'border-[1px] py-2 px-[1.5rem]'
      default:
        return 'border-[1px] py-2 px-[1.5rem]'
    }
  }

  const handleStatusChange = (frameId: string, newStatus: StatusType) => {
    const updatedFrame = frameAPI.updateFrameStatus(frameId, newStatus)
    if (updatedFrame) {
      setFrames(prevFrames =>
        prevFrames.map(frame =>
          frame.no === frameId ? updatedFrame : frame
        )
      )
    }
    setOpenDropdownId(null)
  }

  const handleUpload = (frameData: { frame: string; status: StatusType; shot: number }) => {
    const newFrame = frameAPI.addFrame({
      frameName: `${frameData.shot} Cut`,
      ...frameData
    })
    setFrames(prev => [...prev, newFrame])
  }

  const handleAction = (action: string, frameNo: string) => {
    switch (action) {
      case 'information':
        router.push(`/admin/management/frame/information/${frameNo}`)
        break
      case 'edit':
        router.push(`/admin/management/frame/edit/${frameNo}`)
        break
      case 'delete':
        if (window.confirm('Are you sure you want to delete this frame?')) {
          const success = frameAPI.deleteFrame(frameNo)
          if (success) {
            setFrames(prev => 
              prev.filter(frame => frame.no !== frameNo)
                .map((frame, index) => ({
                  ...frame,
                  no: String(index + 1).padStart(3, '0')
                }))
            )
          }
        }
        break
    }
    setOpenDropdownId(null)
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Header */}
      <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-medium font-ibm-thai-600">Management</h1>
          <span className="text-[#61616A] font-ibm-thai-500">|</span>
          <span className="text-[#61616A] font-ibm-thai-500">Management</span>
          <span className="text-gray-400">/</span>
          <span className='font-ibm-thai-400 text-[#8E8E93]'>Frame Management</span>
        </div>
  
        <button
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center"
          onClick={() => setIsUploadModalOpen(true)}
        >
          + UPLOAD
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-6rem)]">
          {/* Top Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-10 gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-gray-500 whitespace-nowrap">Show</span>
              <select
                aria-label='entries'
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-full md:w-[240px]"
                placeholder="Search:"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full h-[43rem] overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="border-y">
                    <th className="py-4 px-4 md:px-10 text-left font-medium">
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
                    <th className="py-4 px-4 text-left font-medium">Frame</th>
                    <th className="py-4 px-4 text-left font-medium">Status</th>
                    <th className="py-4 px-4 text-left font-medium">Shot</th>
                    <th className="py-4 px-4 text-left font-medium">
                      <div className="flex items-center gap-1">
                        Date
                        <ChevronUp size={16} className="text-gray-400" />
                      </div>
                    </th>
                    <th className="py-4 px-4 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFrames.map((frame) => (
                    <tr key={frame.no} className="border-b">
                      <td className="py-4 px-4 md:px-11">{frame.no}</td>
                      <td className="py-4 px-4">{frame.frameName}</td>
                      <td className="py-4 px-4">
                        <div className="w-12 h-12 border rounded-lg overflow-hidden">
                          <img 
                            src={frame.frame} 
                            alt={`Frame ${frame.frameName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 relative">
                        <button
                          type="button"
                          className={`flex items-center gap-2 min-w-[120px] px-3 py-1 rounded-lg ${getStatusBgColor(frame.status)}`}
                          onClick={() => toggleDropdown(frame.no)}
                        >
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(frame.status)}`} />
                          <span>{frame.status}</span>
                          {openDropdownId === frame.no ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </button>
                        {openDropdownId === frame.no && (
                          <div className="absolute z-10 mt-1 w-[120px] bg-white border rounded-md shadow-lg">
                            {(['Active', 'Inactive', 'Declined'] as StatusType[]).map((status) => (
                              status !== frame.status && (
                                <button
                                  key={status}
                                  type="button"
                                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                                  onClick={() => handleStatusChange(frame.no, status)}
                                >
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                                  {status}
                                </button>
                              )
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-orange-50 text-orange-800 w-8 h-8 rounded-lg flex items-center justify-center">
                          {frame.shot}
                        </div>
                      </td>
                      <td className="py-4 px-4">{frame.date}</td>
                      <td className="py-4 px-4 relative">
                        <button 
                          aria-label='button'
                          type="button" 
                          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                          onClick={() => toggleDropdown(`action_${frame.no}`)}
                        >
                          <MoreHorizontal size={20} className="text-gray-400" />
                        </button>

                        {/* Action Dropdown */}
                        {openDropdownId === `action_${frame.no}` && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction('information', frame.no)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Info size={16} className="mr-3 text-gray-400" />
                                Information
                              </button>
                              <button
                                onClick={() => handleAction('edit', frame.no)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Edit size={16} className="mr-3 text-gray-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleAction('delete', frame.no)}
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
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-10 gap-4 border-t">
            <div className="text-gray-500 text-center md:text-left text-sm md:text-base">
              Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, frames.length)} of {frames.length} entries
            </div>
            <div className="flex gap-1">
              <button 
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="Previous page"
                type="button"
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
                  type="button"
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button 
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="Next page"
                type="button"
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
      <UploadFrameModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  )
}