'use client'
import { useState } from 'react'
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'

interface Frame {
  no: string
  frameName: string
  frame: string // URL of frame image
  status: 'Active' | 'Disable'
  shot: number
  date: string
}

export default function FrameManagement() {
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  // Mock data
  const [frames, setFrames] = useState<Frame[]>([
    {
      no: '001',
      frameName: '3 Cut',
      frame: '/frame1.png',
      status: 'Active',
      shot: 3,
      date: '2023-04-05, 00:05PM'
    },
    {
      no: '002',
      frameName: '6 Cut',
      frame: '/frame2.png',
      status: 'Active',
      shot: 6,
      date: '2023-04-05, 00:05PM'
    }
  ])

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id)
  }

  const handleStatusChange = (frameId: string, newStatus: 'Active' | 'Disable') => {
    setFrames(prevFrames => 
      prevFrames.map(frame => 
        frame.no === frameId 
          ? { ...frame, status: newStatus }
          : frame
      )
    )
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
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
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
                  {frames.map((frame) => (
                    <tr key={frame.no} className="border-b">
                      <td className="py-4 px-4 md:px-11">{frame.no}</td>
                      <td className="py-4 px-4">{frame.frameName}</td>
                      <td className="py-4 px-4">
                        {frame.frameName === '3 Cut' ? (
                          <div className="w-12 h-12 border grid grid-cols-2 grid-rows-2">
                            <div className="col-span-1 row-span-2 bg-black"></div>
                            <div className="border-b"></div>
                            <div></div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 border grid grid-rows-3 grid-cols-2">
                            <div className="border-b"></div>
                            <div className="border-b border-l"></div>
                            <div className="border-b"></div>
                            <div className="border-b border-l"></div>
                            <div></div>
                            <div className="border-l"></div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 relative">
                        <button
                          type="button"
                          className="flex items-center gap-2 min-w-[120px] px-3 py-1 rounded-lg bg-gray-50"
                          onClick={() => toggleDropdown(frame.no)}
                        >
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              frame.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <span>{frame.status}</span>
                          {openDropdownId === frame.no ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </button>
                        {openDropdownId === frame.no && (
                          <div className="absolute z-10 mt-1 w-[120px] bg-white border rounded-md shadow-lg">
                            <button
                              type="button"
                              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                              onClick={() => handleStatusChange(
                                frame.no, 
                                frame.status === 'Active' ? 'Disable' : 'Active'
                              )}
                            >
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  frame.status === 'Active' ? 'bg-red-500' : 'bg-green-500'
                                }`}
                              />
                              {frame.status === 'Active' ? 'Disable' : 'Active'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="bg-orange-50 text-orange-800 w-8 h-8 rounded-lg flex items-center justify-center">
                          {frame.shot}
                        </div>
                      </td>
                      <td className="py-4 px-4">{frame.date}</td>
                      <td className="py-4 px-4">
                        <button 
                          type="button" 
                          aria-label='button'
                          className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={20} className="text-gray-400" />
                        </button>
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
              Showing 1 to {entriesPerPage} of {frames.length} entries
            </div>
            <div className="flex gap-1">
              <button 
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                aria-label="Previous page"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="px-4 py-2 border rounded bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"
                type="button"
              >
                1
              </button>
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                type="button"
              >
                2
              </button>
              <button 
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                aria-label="Next page"
                type="button"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}