import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);
    range.push(1);
    if (rangeStart > 2) range.push('...');
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) range.push(i);
    }
    if (rangeEnd < totalPages - 1) range.push('...');
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {/* Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 bg-white transition-colors duration-150 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        aria-label="Trang trước"
      >
        <ChevronLeft size={20} className="text-gray-500" />
      </button>
      {/* Page numbers */}
      <div className="flex items-center gap-2">
        {pageNumbers.map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="px-2 text-gray-400 text-lg">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                disabled={page === currentPage}
                className={`w-8 h-8 flex items-center justify-center rounded text-base font-semibold transition-colors duration-150 ${
                  page === currentPage
                    ? 'text-blue-600 bg-transparent'
                    : 'text-gray-400 bg-transparent hover:text-blue-600'
                }`}
                style={{ minWidth: 32 }}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-12 h-12 flex items-center justify-center rounded-full border border-gray-300 bg-white transition-colors duration-150 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        aria-label="Trang sau"
      >
        <ChevronRight size={20} className="text-gray-500" />
      </button>
    </div>
  );
};

export default Pagination;
