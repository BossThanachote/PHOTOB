'use client'
import { useState, useEffect } from 'react'
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'

type StatusType = 'Active' | 'Inactive' | 'Declined';

interface Status {
  value: StatusType;
  color: string;
}

interface Transaction {
  id: string;
  status: StatusType;
  totalSale: number;
  date: string;
}

const statusConfig: Record<StatusType, Status> = {
  Active: {
    value: 'Active',
    color: 'bg-green-500',
  },
  Inactive: {
    value: 'Inactive',
    color: 'bg-orange-500',
  },
  Declined: {
    value: 'Declined',
    color: 'bg-red-500',
  },
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'Event' | 'Department'>('Event')
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

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

  // โหลดข้อมูลเมื่อ component mount
  useEffect(() => {
    try {
      const currentProfile = localStorage.getItem('adminProfile');
      if (currentProfile) {
        const { email } = JSON.parse(currentProfile);
        const savedTransactions = localStorage.getItem(`${email}_transactions`);
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  }

  const handleStatusChange = (transactionId: string, newStatus: StatusType) => {
    setTransactions(prevTransactions => {
      const updatedTransactions = prevTransactions.map(transaction => 
        transaction.id === transactionId 
          ? { ...transaction, status: newStatus }
          : transaction
      );
      
      // บันทึกลง localStorage
      try {
        const currentProfile = localStorage.getItem('adminProfile');
        if (currentProfile) {
          const { email } = JSON.parse(currentProfile);
          localStorage.setItem(`${email}_transactions`, JSON.stringify(updatedTransactions));
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      return updatedTransactions;
    });
    setOpenDropdownId(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Navbar */}
      <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
        <h1 className="text-xl font-medium font-ibm-thai-600">Dashboard</h1>
        <button 
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium w-full md:w-auto justify-center"
        >
          + ADD MACHINE
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab and Filter Section */}
          <div className="p-4 md:p-6 border-b">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`px-4 md:px-6 py-2 rounded-lg flex-1 md:flex-none text-center ${
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
                className={`px-4 md:px-6 py-2 rounded-lg flex-1 md:flex-none text-center ${
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
          <div className="px-4 md:px-6 pt-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-gray-500 whitespace-nowrap">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="border rounded px-2 py-1 cursor-pointer w-20"
                aria-label="Number of entries per page"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-gray-500">Entries</span>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-gray-500 whitespace-nowrap">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-3 py-1 w-full md:w-[240px]"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full h-[36.5rem] overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="px-4 md:px-6">
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
                              className={`w-2 h-2 rounded-full ${statusConfig[transaction.status].color}`}
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
                              {Object.entries(statusConfig)
                                .filter(([key]) => key !== transaction.status)
                                .map(([key, status]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50"
                                    onClick={() => handleStatusChange(transaction.id, key as StatusType)}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                    {status.value}
                                  </button>
                                ))}
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
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
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
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-6 gap-4 border-t">
            <div className="text-gray-500 text-center md:text-left text-sm md:text-base">
              Showing 1 to {entriesPerPage} of {transactions.length} entries
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