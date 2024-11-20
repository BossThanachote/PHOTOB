import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { stickerService} from '../services/stickerService';
import type { Sticker, StatusType } from '@/types/types';
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
} from 'lucide-react';
import UploadStickerModal from '../components/UploadSticker';

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const StickerManagement = () => {
  // Router
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Data State
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // UI State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get status color based on status
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

  // Error handler
  const handleError = (error: unknown, message: string) => {
    console.error(`${message}:`, error);
    setError(error instanceof Error ? error.message : message);
    setIsLoading(false);
    setIsActionLoading(false);
  };

  // Fetch stickers
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        setIsLoading(true);
        const response = await stickerService.getStickers({
          page: currentPage,
          limit: entriesPerPage
        });
        
        // Apply search filter if searchTerm exists
        const filteredStickers = searchTerm
          ? response.items.filter(
              (sticker) =>
                sticker.stickerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sticker.no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sticker.status?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : response.items;

        setStickers(filteredStickers);
        setTotalItems(response.total);
        setError(null);
      } catch (err) {
        handleError(err, 'Failed to load stickers');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchStickers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [currentPage, entriesPerPage, searchTerm]);

  // Pagination handlers
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setOpenDropdownId(null);
  };

  const handleEntriesChange = (value: number) => {
    setEntriesPerPage(value);
    setCurrentPage(1);
    setOpenDropdownId(null);
  };

  // Dropdown toggle handler
  const toggleDropdown = (id: string) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Status change handler
  const handleStatusChange = async (stickerId: string, newStatus: StatusType) => {
    try {
      setIsActionLoading(true);
      await stickerService.updateStickerStatus(stickerId, newStatus);
      const response = await stickerService.getStickers({
        page: currentPage,
        limit: entriesPerPage
      });
      setStickers(response.items);
      setTotalItems(response.total);
      setOpenDropdownId(null);
      setError(null);
    } catch (error) {
      handleError(error, 'Failed to update status');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Upload handler
  const handleUpload = async (stickersData: any[]) => {
    try {
      setIsActionLoading(true);
      for (const stickerData of stickersData) {
        await stickerService.createSticker(stickerData);
      }
      const response = await stickerService.getStickers({
        page: currentPage,
        limit: entriesPerPage
      });
      setStickers(response.items);
      setTotalItems(response.total);
      setIsUploadModalOpen(false);
      setError(null);
    } catch (error) {
      handleError(error, 'Failed to upload stickers');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Search handler with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setOpenDropdownId(null);
  };

  // Action handler (Info, Edit, Delete)
  const handleAction = async (action: string, stickerId: string) => {
    try {
      setIsActionLoading(true);
      switch (action) {
        case 'information':
          router.push(`/admin/management/sticker/information/${stickerId}`);
          break;
        case 'edit':
          router.push(`/admin/management/sticker/edit/${stickerId}`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this sticker?')) {
            await stickerService.deleteSticker(stickerId);
            const response = await stickerService.getStickers({
              page: currentPage,
              limit: entriesPerPage
            });
            setStickers(response.items);
            setTotalItems(response.total);
          }
          break;
        default:
          console.warn('Unknown action:', action);
      }
      setOpenDropdownId(null);
      setError(null);
    } catch (error) {
      handleError(error, `Failed to ${action} sticker`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / entriesPerPage);

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
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-medium">Management</h1>
          <span className="text-[#61616A]">|</span>
          <span className="text-[#61616A]">Management</span>
          <span className="text-gray-400">/</span>
          <span className="text-[#8E8E93]">Sticker Management</span>
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
                      Sticker name
                      <ChevronUp size={16} className="text-gray-400" />
                    </div>
                  </th>
                  <th className="py-4 text-left font-medium">Sticker</th>
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
                {stickers.length > 0 ? (
                  stickers.map((sticker) => (
                    <tr key={sticker.id} className="border-b">
                      <td className="py-4 px-4">{sticker.no}</td>
                      <td className="py-4">{sticker.stickerName}</td>
                      <td className="py-4">
                        <div className="w-12 h-12">
                          <img 
                            src={sticker.sticker || '/placeholder-sticker.png'} 
                            alt={sticker.stickerName} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </td>
                      <td className="py-4 relative">
                        <button
                          type="button"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 min-w-[120px]"
                          onClick={() => toggleDropdown(sticker.id)}
                          disabled={isActionLoading}
                        >
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(sticker.status)}`} />
                          <span>{sticker.status}</span>
                          {openDropdownId === sticker.id ? (
                            <ChevronUp size={16} className="text-gray-400" />
                          ) : (
                            <ChevronDown size={16} className="text-gray-400" />
                          )}
                        </button>
                        {openDropdownId === sticker.id && (
                          <div className="absolute z-10 mt-1 w-[120px] bg-white border rounded-md shadow-lg">
                            {(['Active', 'Inactive', 'Declined'] as StatusType[])
                              .filter((s) => s !== sticker.status)
                              .map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
                                  onClick={() => handleStatusChange(sticker.id, status)}
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
                        {formatDate(sticker.date)}
                      </td>
                      <td className="py-4 relative">
                        <button
                          type="button"
                          className="hover:bg-gray-100 p-2 rounded-lg transition-colors disabled:opacity-50"
                          onClick={() => toggleDropdown(`action_${sticker.id}`)}
                          disabled={isActionLoading}
                        >
                          <MoreHorizontal size={20} className="text-gray-400" />
                        </button>

                        {openDropdownId === `action_${sticker.id}` && (
                          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-20">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction('information', sticker.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                disabled={isActionLoading}
                              >
                                <Info size={16} className="mr-3 text-gray-400" />
                                Information
                              </button>
                              <button
                                onClick={() => handleAction('edit', sticker.id)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                disabled={isActionLoading}
                              >
                                <Edit size={16} className="mr-3 text-gray-400" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleAction('delete', sticker.id)}
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
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No stickers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center p-4 md:px-10 gap-4 border-t">
            <div className="text-gray-500 text-sm md:text-base">
              Showing {stickers.length > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems} entries
            </div>
            <div className="flex gap-1">
              <button
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
      <UploadStickerModal
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
  );
};

export default StickerManagement;