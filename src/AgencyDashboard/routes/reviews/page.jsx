import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Edit, Check, X, ChevronDown, RefreshCw } from "lucide-react";
import ReviewService from '../../../services/ReviewService';
import TourService from '../../../services/TourService';
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';

const ReviewManagementPage = () => {
  const navigate = useNavigate();

  // State management
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVisibility, setSelectedVisibility] = useState("all");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [pagination, setPagination] = useState(null);

  // Fetch reviews for agency (phân trang)
  const fetchReviews = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const result = await ReviewService.getAgencyReviews(page, limit);
      setReviews(result.reviews);
      setPagination(result.pagination);
      setLoading(false);
    } catch (error) {
      setError('Không thể tải đánh giá. Vui lòng thử lại.');
      setReviews([]);
      setLoading(false);
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const searchMatch = (review.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.content?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.rating.toString().includes(searchTerm)) ||
        (review.booking_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (review.user_id?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const visibilityMatch = selectedVisibility === "all" || 
        (selectedVisibility === "visible" ? review.is_visible === 1 : review.is_visible === 0);
      
      return searchMatch && visibilityMatch;
    });
  }, [reviews, searchTerm, selectedVisibility]);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = pagination?.totalReviews || reviews.length;
  const totalPages = pagination?.totalPages || 1;
  const currentReviews = reviews;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchReviews(page, pageSize);
  };
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchReviews(1, size);
  };

  const handleUpdateVisibility = async (id, newVisibility) => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;
    
    if (!confirm(`Bạn có chắc chắn muốn ${newVisibility ? "phê duyệt" : "từ chối"} đánh giá này?`)) return;
    
    try {
      await ReviewService.updateReviewVisibility(id, newVisibility);
      
      setReviews(reviews.map(review =>
        review.id === id ? { ...review, is_visible: newVisibility ? 1 : 0, updated_at: new Date().toISOString() } : review
      ));
      
      // Close dropdown
      setDropdownOpenId(null);
      
      if (newVisibility) {
        console.log(`✅ Đánh giá ${id} từ tour ${review.tour_id} đã được phê duyệt`);
      }
    } catch (error) {
      console.error('Error updating review visibility:', error);
      alert('Không thể cập nhật trạng thái đánh giá. Vui lòng thử lại.');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá đánh giá này?")) return;
    
    try {
      await ReviewService.deleteReview(id);
      setReviews(reviews.filter(review => review.id !== id));
      setDropdownOpenId(null);
      console.log(`✅ Đánh giá ${id} đã được xóa`);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Không thể xóa đánh giá. Vui lòng thử lại.');
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Đánh giá</h1>
          <p className="text-slate-600 mt-1">Quản lý các đánh giá từ khách hàng cho tours của agency</p>
        </div>
        <button
          onClick={fetchReviews}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm email user, nội dung, rating hoặc booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc trạng thái hiển thị"
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="visible">Đã hiển thị</option>
            <option value="invisible">Chờ duyệt</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Statistics */}
      {!loading && !error && reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-600 text-sm font-medium">Tổng đánh giá</div>
            <div className="text-2xl font-bold text-blue-900">{totalItems}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-green-600 text-sm font-medium">Đã hiển thị</div>
            <div className="text-2xl font-bold text-green-900">
              {reviews.filter(r => r.is_visible === 1).length}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-600 text-sm font-medium">Điểm trung bình</div>
            <div className="text-2xl font-bold text-yellow-900">
              {totalItems > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalItems).toFixed(1) : '0'} ★
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  onClick={fetchReviews}
                  className="rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Booking ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Email User</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tour ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Điểm đánh giá</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Nội dung</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày đánh giá</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-sm text-slate-500">
                  <RefreshCw className="animate-spin h-5 w-5 mx-auto mb-2" />
                  Đang tải đánh giá...
                </td>
              </tr>
            ) : currentReviews.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-sm text-slate-500">
                  {reviews.length === 0 ? 'Chưa có đánh giá nào cho tours của agency.' : 'Không tìm thấy đánh giá phù hợp.'}
                </td>
              </tr>
            ) : (
              currentReviews.map((review) => (
                <tr key={review.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {String(review.id).slice(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {String(review.booking_id).slice(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {review.user?.email || 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{review.tour_id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="flex items-center">
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                      <span className="text-gray-300">{'★'.repeat(5 - review.rating)}</span>
                      <span className="ml-1 text-sm">({review.rating})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-xs">
                    <div className="truncate" title={review.content}>
                      {review.content || "Không có nội dung"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        review.is_visible ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.is_visible ? "Đã hiển thị" : "Chờ duyệt"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative">
                    <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === review.id}
                      onClick={() => toggleDropdown(review.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {dropdownOpenId === review.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg"
                      >
                        {!review.is_visible && (
                          <li>
                            <button
                              role="menuitem"
                              onClick={() => handleUpdateVisibility(review.id, 1)}
                              className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-slate-100 flex items-center"
                            >
                              <Check size={16} className="mr-2" /> Phê duyệt
                            </button>
                          </li>
                        )}
                        {review.is_visible && (
                          <li>
                            <button
                              role="menuitem"
                              onClick={() => handleUpdateVisibility(review.id, 0)}
                              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                            >
                              <X size={16} className="mr-2" /> Ẩn đánh giá
                            </button>
                          </li>
                        )}
                        <li>
                          <hr className="border-slate-200" />
                        </li>
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleDeleteReview(review.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                          >
                            <X size={16} className="mr-2" /> Xóa
                          </button>
                        </li>
                      </ul>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        showQuickJumper={true}
        showSizeChanger={true}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    </div>
  );
};

export default ReviewManagementPage