'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';

import { MoreHorizontal, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from 'lucide-react'

type StatusType = 'Active' | 'Inactive' | 'Declined';

interface Status {
  value: StatusType;
  color: string;
}

interface ActionMenuItem {
  label: string;
  icon: JSX.Element;
  path: string;
  onClick?: (id: string) => void;  
}

interface Transaction {
  id: string;
  status: StatusType;
  totalSale: number;
  date: string;
  actionDropdownId?: string;
}

const isTransaction = (item: any): item is Transaction => {
  return item && typeof item.id === 'string';
};

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



export default function MachineEvent() {
  const router = useRouter();
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

  const handleTabChange = (tab: 'Event' | 'Department') => {
    setActiveTab(tab);
    if (tab === 'Event') {
      router.push('/admin/machine/event');
    } else {
      router.push('/admin/machine/department');
    }
  };

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

  const actionMenuItems = (transactions: Transaction[]) => [ // เปลี่ยนเป็น function ที่รับ transactions
    {
      label: 'Information',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <path strokeWidth="2" d="M12 16v-4M12 8h.01"/>
      </svg>,
      path: '/admin/machine/information',
      onClick: (id: string) => {
        // ใส่ type ให้ชัดเจน
        const machineData = transactions.find((t: Transaction) => t.id === id);
        if (machineData) {
          localStorage.setItem('selectedMachineData', JSON.stringify(machineData));
          router.push(`/admin/machine/information/${id}`);
        }
      }
    },
    {
      label: 'Edit',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
      </svg>,
      path: '/admin/machine/edit'
    },
    {
      label: 'Delete',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>,
      path: '/admin/machine/delete'
    }
  ];

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/event')) {
      setActiveTab('Event');
    } else if (path.includes('/department')) {
      setActiveTab('Department');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Navbar */}
      <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
        <h1 className="text-xl font-medium font-ibm-thai-600">Machine</h1>
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
              onClick={() => handleTabChange('Event')}
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
              onClick={() => handleTabChange('Department')}
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

                          {/* Status Dropdown Menu */}
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
                        <td className="py-3 px-4 relative">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
                            aria-label="More options"
                            onClick={() => toggleDropdown(`action_${transaction.id}`)}
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        
                          {/* Action Dropdown Menu */}
                          {openDropdownId === `action_${transaction.id}` && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                            <div className="py-1">
                              {actionMenuItems(transactions).map((item) => ( // เรียกใช้ function แทน
                                <button
                                  key={item.label}
                                  type="button"
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  onClick={() => {
                                    if (item.onClick) {
                                      item.onClick(transaction.id);
                                    } else {
                                      router.push(`${item.path}/${transaction.id}`);
                                    }
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <span className="mr-3 text-gray-400">{item.icon}</span>
                                  {item.label}
                                </button>
                              ))}
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