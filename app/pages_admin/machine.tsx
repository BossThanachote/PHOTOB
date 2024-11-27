'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';
import machineService from '../services/machineService';
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
import { StatusType } from '@/types/types';

interface MachineData {
  id: string;
  code: string;
  name: string;
  image_url: string;
  status: StatusType;
}

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

export default function Machine() {
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Data State
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch machines function
  const fetchMachines = async () => {
    try {
      setIsLoading(true);
      const data = await machineService.getTransactions();
      setMachines(data);
      setTotalItems(data.length);
      setError(null);
    } catch (err) {
      console.error('Failed to load machines:', err);
      setError(err instanceof Error ? err.message : 'Failed to load machines');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and search
  useEffect(() => {
    const searchMachines = async () => {
      try {
        setIsLoading(true);
        const results = await machineService.searchTransactions(searchTerm);
        setMachines(results);
        setTotalItems(results.length);
        setError(null);
      } catch (err) {
        console.error('Failed to search machines:', err);
        setError(err instanceof Error ? err.message : 'Failed to search machines');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(
      searchTerm ? searchMachines : fetchMachines,
      300
    );
    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  // Handlers
  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleStatusChange = async (machineId: string, newStatus: StatusType) => {
    try {
      // Optimistic update
      setMachines(prevMachines =>
        prevMachines.map(machine =>
          machine.id === machineId
            ? { ...machine, status: newStatus }
            : machine
        )
      );
      
      setOpenDropdownId(null);
      
      // API call in background
      await machineService.updateTransactionStatus(machineId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Refresh data on error
      fetchMachines().catch(console.error);
    }
  };

  const handleAction = async (action: string, machineId: string) => {
    try {
      setIsActionLoading(true);
      switch (action) {
        case 'information':
          router.push(`/admin/machine/information/${machineId}`);
          break;
        case 'edit':
          router.push(`/admin/machine/edit/${machineId}`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this machine?')) {
            await machineService.deleteTransaction(machineId);
            await fetchMachines();
          }
          break;
        default:
          console.warn('Unknown action:', action);
      }
      setOpenDropdownId(null);
      setError(null);
    } catch (error) {
      console.error(`Failed to ${action} machine:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${action} machine`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setOpenDropdownId(null);
  };

  const handleEntriesChange = (value: number) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
    setOpenDropdownId(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setOpenDropdownId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-orange-500';
      case 'declined':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, totalItems);
  const currentMachines = machines.slice(startIndex, endIndex);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchMachines}
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
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-medium">Management</h1>
          <span className="text-[#61616A]">|</span>
          <span className="text-[#61616A]">Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#8E8E93]">Machine Management</span>
        </div>
        <button 
          onClick={() => router.push('/admin/machine/addmachine')}
          type="button"
          className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium justify-center hover:bg-[#4338CA] transition-colors disabled:opacity-50"
          disabled={isActionLoading}
        >
          + ADD MACHINE
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
                      Code
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">
                    <div className="flex items-center gap-1">
                      Name
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">Status</th>
                  <th className="py-4 text-left font-medium">Photo</th>
                  <th className="py-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentMachines.length > 0 ? (
                  currentMachines.map((machine) => (
                    <tr key={machine.id} className="border-b">
                      <td className="py-4 px-4">{machine.code}</td>
                      <td className="py-4">{machine.name}</td>
                      <td className="py-4 relative">
                      <button
  type="button"
  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 min-w-[120px]"
  onClick={() => toggleDropdown(machine.id)}
  disabled={isActionLoading}
>
  <div className={`w-2 h-2 rounded-full ${getStatusColor(machine.status)}`} />
  <span>{machine.status}</span>
  {openDropdownId === machine.id ? (
    <ChevronUp size={16} className="text-gray-400" />
  ) : (
    <ChevronDown size={16} className="text-gray-400" />
  )}
</button>

{openDropdownId === machine.id && (
  <div className="absolute z-10 mt-1 w-[120px] bg-white border rounded-md shadow-lg">
    {(['Active', 'Inactive', 'Declined'] as StatusType[])
      .filter((s) => s !== machine.status)
      .map((status) => (
        <button
          key={status}
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          onClick={() => handleStatusChange(machine.id, status)}
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
                        <button 
                          type="button"
                          onClick={() => router.push(`/admin/machine/photo/${machine.id}`)}
                          className="text-blue-600 hover:underline disabled:opacity-50"
                          disabled={isActionLoading}
                        >
                          View
                        </button>
                      </td>
                      <td className="py-4 relative">
                        <button
                          type="button"
                          className="hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50"
                          onClick={() => toggleDropdown(`action_${machine.id}`)}
                          disabled={isActionLoading}
                        >
                          <MoreHorizontal size={20} className="text-gray-400" />
                        </button>

                        {openDropdownId === `action_${machine.id}` && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction('information', machine.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                disabled={isActionLoading}
                              >
                                <Info size={16} className="mr-3 text-gray-400" />
                                Information
                              </button>
                              <button
                                onClick={() => handleAction('edit', machine.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                disabled={isActionLoading}
                              >
                                <Edit size={16} className="mr-3 text-gray-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleAction('delete', machine.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No machines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-10 gap-4 border-t">
            <div className="text-gray-500 text-sm md:text-base">
              Showing {machines.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems} entries
            </div>
            <div className="flex gap-1">
              <button
                aria-label="Previous page"
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
                aria-label="Next page"
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
  );
}