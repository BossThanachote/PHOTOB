'use client'
import { useState } from 'react'
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'

interface Transaction {
  id: string
  status: 'Active' | 'Disable'
  totalSale: number
  date: string
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'Event' | 'Department'>('Event')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) {
      setOpenDropdownId(null)
    } else {
      setOpenDropdownId(id)
    }
  }

  const handleStatusChange = (transactionId: string, newStatus: 'Active' | 'Disable') => {
    // อัพเดท transactions state
    setTransactions(prevTransactions => 
      prevTransactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: newStatus }
          : transaction
      )
    )
    setOpenDropdownId(null) // ปิด dropdown หลังเปลี่ยนสถานะ
  }

  // Mock data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '001',
      status: 'Active',
      totalSale: 1002500,
      date: '2023-04-05, 00:05PM',
    },
    {
      id: '002',
      status: 'Active',
      totalSale: 1002500,
      date: '2023-04-05, 00:05PM',
    },
  ])

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Navbar */}
      <div className="h-[4rem] bg-white flex justify-between items-center px-6 shadow-sm">
        <h1 className="text-xl font-medium">Dashboard</h1>
        <button 
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          + ADD MACHINE
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 h-[calc(100vh-4rem)]">
        <div className="bg-white rounded-lg shadow-sm h-[53rem]  ">
          {/* Tab and Filter Section */}
          <div className="p-6 border-b">
            <div className="flex gap-1">
              <button
                type="button"
                className={`px-6 py-2 rounded-lg ${
                  activeTab === 'Event'
                    ? 'bg-pink-100 text-pink-600'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('Event')}
              >
                Event
              </button>
              <button
                type="button"
                className={`px-6 py-2 rounded-lg ${
                  activeTab === 'Department'
                    ? 'bg-pink-100 text-pink-600'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('Department')}
              >
                Department
              </button>
            </div>
          </div>

          {/* Table Controls */}
          <div className="px-6 pt-6 pb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border rounded px-2 py-1"
                aria-label="Number of entries per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500">Entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-3 py-1 w-[240px]"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table */}
          <div className="px-6 flex flex-col flex-grow h-[39rem]">
          <div className="flex-grow">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">No.</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Total sale ฿</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Photo</th>
                  <th className="py-3 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
      {transactions.map((transaction) => (
        <tr key={transaction.id} className="border-b">
          <td className="py-3 px-4">{transaction.id}</td>
          <td className="py-3 px-4 relative">
            <button
              type="button"
              className="flex items-center gap-2 min-w-[120px] px-3 py-1 rounded hover:bg-gray-50"
              onClick={() => toggleDropdown(transaction.id)}
              aria-label={`Change status of transaction ${transaction.id}`}
            >
              <div 
                className={`w-2 h-2 rounded-full ${
                  transaction.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span>{transaction.status}</span>
              {openDropdownId === transaction.id ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>
            
            {/* Dropdown Menu */}
            {openDropdownId === transaction.id && (
              <div className="absolute left-0 mt-1 w-[120px] bg-white border rounded-md shadow-lg z-10">
                <button
                  type="button"
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                  onClick={() => handleStatusChange(
                    transaction.id, 
                    transaction.status === 'Active' ? 'Disable' : 'Active'
                  )}
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      transaction.status === 'Active' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                  {transaction.status === 'Active' ? 'Disable' : 'Active'}
                </button>
              </div>
            )}
          </td>
          <td className="py-3 px-4">{transaction.totalSale.toLocaleString()}</td>
          <td className="py-3 px-4">{transaction.date}</td>
          <td className="py-3 px-4">
            <button 
              type="button" 
              className="text-blue-600 hover:underline"
            >
              View
            </button>
          </td>
          <td className="py-3 px-4">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
            </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 flex justify-between items-center">
            <div className="text-gray-500">
              Showing 1 to 10 of 11 entries
            </div>
            <div className="flex gap-1">
              <button 
                className="p-2 border rounded hover:bg-gray-50"
                aria-label="Previous page"
                type="button"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="px-4 py-2 border rounded bg-[#4F46E5] text-white"
                type="button"
              >
                1
              </button>
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-50"
                type="button"
              >
                2
              </button>
              <button 
                className="p-2 border rounded hover:bg-gray-50"
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