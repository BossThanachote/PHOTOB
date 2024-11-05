'use client'
import { useState } from 'react'
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'

interface Filter {
  no: string
  filterName: string
  filter: string
  filterType: 'Original' | 'Mono'
  status: 'Active' | 'Disable'
  date: string
}

export default function FilterManagement() {
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [openFilterDropdownId, setOpenFilterDropdownId] = useState<string | null>(null)

  // Mock data
  const [filters, setFilters] = useState<Filter[]>([
    {
      no: '001',
      filterName: 'Color',
      filter: '/filter1.png',
      filterType: 'Original',
      status: 'Active',
      date: '2023-04-05, 00:05PM'
    },
    {
      no: '002',
      filterName: 'Gray',
      filter: '/filter2.png',
      filterType: 'Mono',
      status: 'Active',
      date: '2023-04-05, 00:05PM'
    }
  ])

  const toggleDropdown = (id: string, type: 'status' | 'filter') => {
    if (type === 'status') {
      setOpenDropdownId(openDropdownId === id ? null : id)
    } else {
      setOpenFilterDropdownId(openFilterDropdownId === id ? null : id)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Header */}
      <div className="h-[4rem] bg-white flex justify-between items-center px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Management</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">Management</span>
          <span className="text-gray-400">/</span>
          <span>Filter Management</span>
        </div>
  
        <button
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          + UPLOAD
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Top Controls */}
          <div className="flex justify-between items-center h-[5rem] px-10">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Show</span>
              <select
                aria-label='entriesperpage'
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border rounded-lg px-2 py-1 w-16"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500">Entries</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-[240px]"
                placeholder="Search:"
              />
            </div>
          </div>

          {/* Table */}
          <div className="px-10 h-[43.6rem]">
            <table className="w-full">
              <thead>
                <tr className="border-y">
                  <th className="py-4 text-left font-medium">
                    <div className="flex items-center gap-1">
                      No.
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">
                    <div className="flex items-center gap-1">
                      Filter name
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">Filter</th>
                  <th className="py-4 text-left font-medium">Status</th>
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
                {filters.map((filter) => (
                  <tr key={filter.no} className="border-b">
                    <td className="py-6">{filter.no}</td>
                    <td className="py-6">{filter.filterName}</td>
                    <td className="py-6">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 min-w-[120px]"
                        onClick={() => toggleDropdown(filter.no, 'filter')}
                      >
                        <span>{filter.filterType}</span>
                        {openFilterDropdownId === filter.no ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-6">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 min-w-[120px]"
                        onClick={() => toggleDropdown(filter.no, 'status')}
                      >
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            filter.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{filter.status}</span>
                        {openDropdownId === filter.no ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="py-6">{filter.date}</td>
                    <td className="py-6">
                      <button type="button" aria-label='button' className="hover:bg-gray-50 p-2 rounded-full">
                        <MoreHorizontal size={20} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center h-[4rem] px-10">
            <div className="text-gray-500">
              Showing 1 to {entriesPerPage} of {filters.length} entries
            </div>
            <div className="flex gap-1">
              <button 
                className="p-2 border rounded-lg hover:bg-gray-50"
                aria-label="Previous page"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="px-4 py-2 border rounded-lg bg-[#4F46E5] text-white"
                type="button"
              >
                1
              </button>
              <button 
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                type="button"
              >
                2
              </button>
              <button 
                className="p-2 border rounded-lg hover:bg-gray-50"
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