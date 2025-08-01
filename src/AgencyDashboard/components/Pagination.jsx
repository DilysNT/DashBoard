import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage = 10,
  onPageChange,
  showQuickJumper = true,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50, 100],
  onPageSizeChange,
  className = ""
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    
    // Always show first page
    if (currentPage === 1) {
      range.push(1);
    } else {
      range.push(1);
      if (rangeStart > 2) {
        range.push('...');
      }
    }
    
    // Add pages around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i);
      }
    }
    
    // Always show last page
    if (totalPages > 1) {
      if (rangeEnd < totalPages - 1) {
        range.push('...');
      }
      if (currentPage !== totalPages) {
        range.push(totalPages);
      }
    }
    
    return range;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Debug: Always show pagination for now
  // if (totalPages <= 1) return null;

  console.log('🎯 Pagination Component Rendering:', {
    currentPage,
    totalPages, 
    totalItems,
    itemsPerPage,
    startItem,
    endItem
  });

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t ${className}`}>
      
      {/* Items info */}
      <div className="text-sm text-gray-500">
        Hiển thị {startItem}-{endItem} trong tổng số {totalItems} mục
      </div>
      
      <div className="flex items-center gap-4">
        {/* Page size selector */}
        {showSizeChanger && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">/ trang</span>
          </div>
        )}

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang đầu"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Trang cuối"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {/* Quick jumper */}
        {showQuickJumper && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Đến trang:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    onPageChange(page);
                    e.target.value = '';
                  }
                }
              }}
              placeholder={currentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
