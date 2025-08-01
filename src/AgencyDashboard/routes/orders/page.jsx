import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link, useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Edit, Trash, Check, X, ChevronDown, Eye } from "lucide-react";
import BookingService from "../../../services/BookingService";
import { useAuth } from "../../../contexts/auth-context";
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';

const BookingManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Check if user is agency
  const isAgency = user?.role === 'agency' || user?.user_type === 'agency';

  // Fetch bookings on component mount
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      // Sử dụng hàm getBookings mới
      const response = await BookingService.getMyAgencyBookings();
      console.log("Bookings from API (DEBUG):", response);
      // Mapping thông minh: lấy đúng key chứa mảng bookings
      let bookingsArr = [];
      if (Array.isArray(response.data)) {
        bookingsArr = response.data;
      } else if (Array.isArray(response.data?.bookings)) {
        bookingsArr = response.data.bookings;
      } else if (Array.isArray(response.bookings)) {
        bookingsArr = response.bookings;
      } else if (Array.isArray(response.data?.data)) {
        bookingsArr = response.data.data;
      } else if (Array.isArray(response.data?.results)) {
        bookingsArr = response.data.results;
      } else {
        bookingsArr = [];
      }
      setBookings(bookingsArr);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const searchMatch = 
      booking.tour?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
      
    const statusMatch = selectedStatus === "all" || booking.status === selectedStatus || 
      (selectedStatus === "pending" && (!booking.status || booking.status === ""));
      
    const paymentMatch = selectedPaymentStatus === "all" || 
      booking.payment?.status === selectedPaymentStatus ||
      (selectedPaymentStatus === "unpaid" && (!booking.payment || booking.payment.status === "failed")) ||
      (selectedPaymentStatus === "paid" && booking.payment?.status === "completed");

    return searchMatch && statusMatch && paymentMatch;
  });

  // Pagination logic
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentData: currentBookings,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination(filteredBookings, 10);

  // Reset pagination when filter changes
  useEffect(() => {
    resetPagination();
  }, [searchTerm, selectedStatus, selectedPaymentStatus]);  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng ${id} thành "${newStatus}"?`)) return;
    
    try {
      const result = await BookingService.updateBookingStatus(id, newStatus);
      
      if (result.success) {
        // Refresh bookings list
        fetchBookings();
        alert('Cập nhật trạng thái thành công!');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Lỗi khi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleUpdatePaymentStatus = async (id, newPaymentStatus) => {
    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái thanh toán của đơn hàng ${id} thành "${newPaymentStatus}"?`)) return;
    
    try {
      // This would need a separate API endpoint for payment status updates
      alert('Chức năng cập nhật trạng thái thanh toán đang được phát triển');
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Lỗi khi cập nhật trạng thái thanh toán: ' + err.message);
    }
  };

  const handleShowDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'Không hợp lệ';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case '':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
      case '':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Chờ xử lý';
    }
  };

  const getPaymentStatusColor = (payment) => {
    if (!payment) return 'bg-gray-100 text-gray-800';
    
    switch (payment.status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (payment) => {
    if (!payment) return 'Chưa thanh toán';
    
    switch (payment.status) {
      case 'completed':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'failed':
        return 'Thanh toán thất bại';
      default:
        return 'Chưa thanh toán';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 m-6">
        <div className="flex">
          <div className="text-red-800">
            <h3 className="text-sm font-medium">Lỗi khi tải dữ liệu</h3>
            <div className="mt-2 text-sm">
              <p><strong>Chi tiết lỗi:</strong> {error}</p>
            </div>
            <div className="mt-4">
              <button 
                onClick={fetchBookings}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Đơn Hàng</h1>
          <p className="text-slate-600 mt-1">
            {agencyInfo ? `${agencyInfo.name} - Quản lý các đơn đặt tour` : 'Quản lý các đơn đặt tour'}
          </p>
          {pagination && (
            <p className="text-sm text-slate-500 mt-1">
              Trang {pagination.currentPage}/{pagination.totalPages} • {pagination.totalItems} đơn hàng
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm theo tour, khách hàng hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc trạng thái"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="canceled">Đã hủy</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc trạng thái thanh toán"
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả thanh toán</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã đơn</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tour</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Khách hàng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày khởi hành</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số khách</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tổng tiền</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Thanh toán</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày đặt</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentBookings.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-sm text-slate-500">
                  {bookings.length === 0 
                    ? 'Không có đơn hàng nào trong hệ thống' 
                    : 'Không tìm thấy đơn hàng nào phù hợp với bộ lọc'
                  }
                </td>
              </tr>
            ) : (
              currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium">#{booking.id.slice(0, 8)}...</div>
                    <div className="text-xs text-slate-500">{formatDate(booking.created_at)}</div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium">{booking.tour?.name || 'Không xác định'}</div>
                    <div className="text-xs text-slate-500">ID: {booking.tour_id}</div>
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium">{booking.user?.name || 'Chưa có thông tin'}</div>
                    <div className="text-xs text-slate-500">{booking.user?.email || 'Chưa có email'}</div>
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {booking.departureDate?.departure_date 
                      ? format(new Date(booking.departureDate.departure_date), 'dd/MM/yyyy', { locale: vi })
                      : 'Chưa xác định'
                    }
                    {booking.departureDate && (
                      <div className="text-xs text-slate-500">
                        {booking.departureDate.number_of_days}N{booking.departureDate.number_of_nights}Đ
                      </div>
                    )}
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {(booking.number_of_adults || 0) + (booking.number_of_children || 0)} khách
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium">
                    {formatCurrency(booking.total_price)}
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusColor(booking.payment)}`}>
                      {getPaymentStatusText(booking.payment)}
                    </span>
                    {booking.payment?.payment_method && (
                      <div className="text-xs text-slate-500 mt-1">{booking.payment.payment_method}</div>
                    )}
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(booking.booking_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{booking.special_requests || "Không có"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{new Date(booking.booked_at).toLocaleString()}</td>
                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <button
                        title="Xem chi tiết"
                        onClick={() => handleShowDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-blue-50"
                      >
                        <Eye size={16} />
                        Chi tiết
                      </button>

                      {(!booking.status || booking.status === '' || booking.status === 'pending') && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900 text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                        >
                          Hoàn thành
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Tổng đơn hàng</div>
          <div className="text-2xl font-bold text-blue-600">
            {summary?.total || bookings.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Đã xác nhận</div>
          <div className="text-2xl font-bold text-green-600">
            {summary?.confirmed || bookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Chờ xử lý</div>
          <div className="text-2xl font-bold text-yellow-600">
            {summary?.pending || bookings.filter(b => !b.status || b.status === '' || b.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm font-medium text-gray-500">Đã hủy</div>
          <div className="text-2xl font-bold text-red-600">
            {summary?.cancelled || bookings.filter(b => b.status === 'cancelled').length}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã đơn hàng</label>
                      <div className="text-sm text-gray-900 font-mono">{selectedBooking.id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tour</label>
                      <div className="text-sm text-gray-900">{selectedBooking.tour?.name || 'Không xác định'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số lượng khách</label>
                      <div className="text-sm text-gray-900">
                        {selectedBooking.number_of_adults || 0} người lớn, {selectedBooking.number_of_children || 0} trẻ em
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(selectedBooking.total_price)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedBooking.status)}`}>
                          {getStatusText(selectedBooking.status)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày đặt</label>
                      <div className="text-sm text-gray-900">{formatDate(selectedBooking.created_at)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tên khách hàng</label>
                      <div className="text-sm text-gray-900">
                        {selectedBooking.guests?.[0]?.name || selectedBooking.user?.name || 'Chưa có thông tin'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="text-sm text-gray-900">
                        {selectedBooking.guests?.[0]?.email || selectedBooking.user?.email || 'Chưa có'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                      <div className="text-sm text-gray-900">
                        {selectedBooking.guests?.[0]?.phone || selectedBooking.user?.phone || 'Chưa có'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái thanh toán</label>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedBooking.payment)}`}>
                          {getPaymentStatusText(selectedBooking.payment)}
                        </span>
                      </div>
                    </div>
                    {selectedBooking.payment && (
                      <>
                      <div>
                          <label className="text-sm font-medium text-gray-500">Phương thức thanh toán</label>
                          <div className="text-sm text-gray-900">{selectedBooking.payment.payment_method}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày thanh toán</label>
                          <div className="text-sm text-gray-900">{formatDate(selectedBooking.payment.payment_date)}</div>
                      </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default BookingManagementPage;