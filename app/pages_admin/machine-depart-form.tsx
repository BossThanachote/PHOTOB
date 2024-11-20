'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { departmentService } from '../MockAPI';
import { 
  MoreHorizontal, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft,
  Loader2 
} from 'lucide-react'
import { Transaction, StatusType } from '@/types/types';

const statusConfig = {
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
} as const;

export default function MachineDepart() {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<'Event' | 'Department'>('Department');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Reset Data Handler
  const handleResetData = async () => {
    try {
      setIsLoading(true);
      const resetData = await departmentService.resetToDefault();
      setTransactions(resetData);
      setTotalItems(resetData.length);
      setError(null);
    } catch (error) {
      console.error('Error resetting data:', error);
      setError('Failed to reset data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await departmentService.getTransactions();
        setTransactions(data);
        setTotalItems(data.length);
        setError(null);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setError('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Search Handler
  useEffect(() => {
    const searchTransactions = async () => {
      try {
        setIsLoading(true);
        const results = await departmentService.searchTransactions(searchTerm);
        setTransactions(results);
        setTotalItems(results.length);
        setCurrentPage(1);
        setError(null);
      } catch (error) {
        console.error('Error searching transactions:', error);
        setError('Failed to search transactions');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(searchTransactions, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleTabChange = (tab: 'Event' | 'Department') => {
    setActiveTab(tab);
    if (tab === 'Event') {
      router.push('/admin/machine/event');
    } else {
      router.push('/admin/machine/department');
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: StatusType) => {
    try {
      setIsLoading(true);
      const updatedTransactions = await departmentService.updateTransactionStatus(transactionId, newStatus);
      setTransactions(updatedTransactions);
      setOpenDropdownId(null);
      setError(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  const actionMenuItems = [
    {
      label: 'Information',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <path strokeWidth="2" d="M12 16v-4M12 8h.01"/>
      </svg>,
      onClick: async (id: string) => {
        try {
          const transaction = await departmentService.getTransactionById(id);
          if (transaction) {
            localStorage.setItem('selectedMachineData', JSON.stringify(transaction));
            router.push(`/admin/machine/${activeTab.toLowerCase()}/information/${id}?type=${activeTab}`);
          }
        } catch (error) {
          console.error('Error getting transaction:', error);
          setError('Failed to get transaction details');
        }
      }
    },
    {
      label: 'Edit',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
      </svg>,
      onClick: (id: string) => {
        router.push(`/admin/machine/department/edit/${id}`);
      }
    },
    {
      label: 'Delete',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
      </svg>,
      onClick: async (id: string) => {
        try {
          setIsLoading(true);
          if (window.confirm('Are you sure you want to delete this transaction?')) {
            const updatedTransactions = await departmentService.deleteTransaction(id);
            setTransactions(updatedTransactions);
            setTotalItems(updatedTransactions.length);
            setOpenDropdownId(null);
            setError(null);
          }
        } catch (error) {
          console.error('Error deleting transaction:', error);
          setError('Failed to delete transaction');
        } finally {
          setIsLoading(false);
        }
      }
    }
  ];

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalItems);
  const currentTransactions = transactions.slice(startIndex, endIndex);

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] select-none">
      {/* Header */}
      <div className="h-auto min-h-[4rem] bg-white flex flex-col md:flex-row justify-between items-start md:items-center p-4 md:px-6 shadow-sm gap-4">
        <h1 className="text-xl font-medium">Machine</h1>
        <button 
          type="button"
          onClick={handleResetData}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-yellow-600 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Reset to Default
        </button>
        <button 
          onClick={() => router.push('/admin/machine/addmachine')}
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium w-full md:w-auto justify-center disabled:opacity-50"
          disabled={isLoading}
        >
          + ADD MACHINE
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                Department
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 md:px-6 pt-6 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-gray-500 whitespace-nowrap">Show</span>
              <select
                aria-label="select"
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1 cursor-pointer w-20"
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Table */}
          <div className="w-full h-[36.5rem] overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="px-4 md:px-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
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
                      {currentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="py-3 px-4">{transaction.id}</td>
                          <td className="py-3 px-4 relative">
                            <button
                              type="button"
                              className="flex items-center gap-2 min-w-[120px] px-3 py-1 rounded hover:bg-gray-50 disabled:opacity-50"
                              onClick={() => toggleDropdown(transaction.id)}
                              disabled={isLoading}
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

                            {openDropdownId === transaction.id && (
                              <div className="absolute left-0 mt-1 w-[120px] bg-white border rounded-md shadow-lg z-10">
                                {Object.entries(statusConfig)
                                  .filter(([key]) => key !== transaction.status)
                                  .map(([key, status]) => (
                                    <button
                                      key={key}
                                      type="button"
                                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                                      onClick={() => handleStatusChange(transaction.id, key as StatusType)}
                                      disabled={isLoading}
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
                              className="text-blue-600 hover:underline disabled:opacity-50"
                              disabled={isLoading}
                            >
                              View
                            </button>
                          </td>
                          <td className="py-3 px-4 relative">
                            <button
                              aria-label="actions"
                              type="button"
                              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors disabled:opacity-50"
                              onClick={() => toggleDropdown(`action_${transaction.id}`)}
                              disabled={isLoading}
                            >
                              <MoreHorizontal size={20} />
                            </button>
                          
                            {openDropdownId === `action_${transaction.id}` && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                                <div className="py-1">
                                  {actionMenuItems.map((item) => (
                                    <button
                                      key={item.label}
                                      type="button"
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                      onClick={() => {
                                        item.onClick(transaction.id);
                                        setOpenDropdownId(null);
                                      }}
                                      disabled={isLoading}
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
                      {currentTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-6 gap-4 border-t">
            <div className="text-gray-500 text-center md:text-left text-sm md:text-base">
              {totalItems > 0 ? (
                `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`
              ) : (
                'No entries to show'
              )}
            </div>
            <div className="flex gap-1">
              <button
                aria-label="Previous page"
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
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
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-4 py-2 text-gray-400">...</span>
                      )}
                      <button 
                        className={`px-4 py-2 border rounded transition-colors disabled:opacity-50 ${
                          page === currentPage
                            ? 'bg-[#4F46E5] text-white hover:bg-[#4338CA]'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(page)}
                        disabled={isLoading}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
              <button
                aria-label="Next page"
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}