import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Link, useNavigate } from "react-router-dom";
import { Search, MoreHorizontal, Edit, Trash, Check, X, ChevronDown, RefreshCw, Eye, Building } from "lucide-react";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";

const AdminOrderManagementPage = () => {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch bookings on component mount
  useEffect(() => {
      fetchBookings();
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      setAgenciesLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agencies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        const agenciesData = Array.isArray(data) ? data : (data.data || data.agencies || []);
        setAgencies(agenciesData);
        console.log('✅ Agencies fetched:', agenciesData.length, 'agencies');
      } else {
        console.error('Failed to fetch agencies:', response.status);
        setAgencies([]);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      setAgencies([]);
    } finally {
      setAgenciesLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching all bookings for admin...');
      
      // Use direct API endpoint for admin
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
      }
      
      const response = await fetch('http://localhost:5000/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.');
            }
        throw new Error(`HTTP error! status: ${response.status}`);
        }
      
      const data = await response.json();
      console.log('📊 Booking result:', data);

      // Handle different response formats
      const bookingsData = Array.isArray(data) ? data : (data.data || data.bookings || []);
      const paginationData = data.pagination || null;
      const summaryData = data.summary || null;
      
      console.log('✅ All bookings fetched successfully:', bookingsData.length, 'bookings');
      setBookings(bookingsData);
      setPagination(paginationData);
      setSummary(summaryData);
      
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search, status, payment status, and agency
  const filteredBookings = bookings.filter(booking => {
    const searchMatch = 
      booking.tour?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guests?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guests?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tour?.agency?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const statusMatch = selectedStatus === "all" || booking.status === selectedStatus || 
      (selectedStatus === "pending" && (!booking.status || booking.status === ""));
      
    const paymentMatch = selectedPaymentStatus === "all" || 
      booking.payment?.status === selectedPaymentStatus ||
      (selectedPaymentStatus === "unpaid" && (!booking.payment || booking.payment.status === "failed")) ||
      (selectedPaymentStatus === "paid" && booking.payment?.status === "completed");

    const agencyMatch = selectedAgency === "all" || 
      booking.tour?.agency_id === selectedAgency;

    return searchMatch && statusMatch && paymentMatch && agencyMatch;
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
  }, [searchTerm, selectedStatus, selectedPaymentStatus, selectedAgency]);

  const handleUpdateStatus = async (id, newStatus) => {
    if (!confirm(`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng ${id} thành "${newStatus}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      // Refresh bookings list
      fetchBookings();
      alert('Cập nhật trạng thái thành công!');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Lỗi khi cập nhật trạng thái: ' + err.message);
    }
  };

  const showBookingDetails = (booking) => {
    setSelectedPayment(booking);
    setShowDetails(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Đơn Hàng</h1>
          <p className="text-slate-600 mt-1">Quản lý tất cả đơn hàng từ các đại lý</p>
          </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchBookings}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          {pagination && (
            <span className="text-sm text-gray-500">
              Trang {pagination.currentPage}/{pagination.totalPages} ({pagination.totalItems} đơn hàng)
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-gray-500">Tổng đơn hàng</div>
            </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{summary.confirmed}</div>
            <div className="text-sm text-gray-500">Đã xác nhận</div>
            </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <div className="text-sm text-gray-500">Chờ xử lý</div>
                </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-red-600">{summary.cancelled}</div>
            <div className="text-sm text-gray-500">Đã hủy</div>
                </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{summary.completed}</div>
            <div className="text-sm text-gray-500">Hoàn thành</div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
            type="search"
            placeholder="Tìm kiếm tour, khách hàng, đại lý..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
        <div className="relative">
              <select
            aria-label="Lọc trạng thái đơn hàng"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
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
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="failed">Thanh toán thất bại</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc theo đại lý"
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả đại lý</option>
            {agenciesLoading ? (
              <option disabled>Đang tải...</option>
            ) : (
              Array.isArray(agencies) && agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Đơn hàng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tour</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Đại lý</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Khách hàng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số tiền</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày đặt</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Thanh toán</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentBookings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-sm text-slate-500">
                  {bookings.length === 0 
                    ? 'Không có đơn hàng nào' 
                    : 'Không tìm thấy đơn hàng phù hợp.'
                  }
                </td>
              </tr>
            ) : (
              currentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-100">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">
                        #{booking.id.slice(0, 8)}...
                      </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(booking.created_at)}
                      </div>
                    </td>
                    
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">
                        {booking.tour?.name || 'Không xác định'}
                      </div>
                    <div className="text-xs text-slate-500">
                      {booking.number_of_adults || 0} người lớn, {booking.number_of_children || 0} trẻ em
                      </div>
                    </td>
                    
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <Building className="mr-2 text-slate-400" size={16} />
                      <div className="text-sm text-slate-900">
                        {booking.tour?.agency?.name || 'Không xác định'}
                      </div>
                      </div>
                    </td>
                    
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">
                      {booking.guests?.[0]?.name || booking.user?.name || 'Chưa có thông tin'}
                      </div>
                    <div className="text-xs text-slate-500">
                      {booking.guests?.[0]?.email || booking.user?.email || ''}
                        </div>
                    </td>
                    
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(booking.total_price)}
                      </div>
                    </td>
                    
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatDate(booking.created_at)}
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
                  </td>
                  
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative">
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => showBookingDetails(booking)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                        <Eye size={16} />
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
              ))
            )}
              </tbody>
            </table>
      </div>

      {/* Booking Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết đơn hàng
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã đơn hàng</label>
                      <div className="text-sm text-gray-900 font-mono">{selectedPayment.id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tour</label>
                      <div className="text-sm text-gray-900">{selectedPayment.tour?.name || 'Không xác định'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Đại lý</label>
                      <div className="text-sm text-gray-900">{selectedPayment.tour?.agency?.name || 'Không xác định'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số lượng khách</label>
                      <div className="text-sm text-gray-900">
                        {selectedPayment.number_of_adults || 0} người lớn, {selectedPayment.number_of_children || 0} trẻ em
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(selectedPayment.total_price)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedPayment.status)}`}>
                          {getStatusText(selectedPayment.status)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày đặt</label>
                      <div className="text-sm text-gray-900">{formatDate(selectedPayment.created_at)}</div>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tên khách hàng</label>
                      <div className="text-sm text-gray-900">
                        {selectedPayment.guests?.[0]?.name || selectedPayment.user?.name || 'Chưa có thông tin'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="text-sm text-gray-900">
                        {selectedPayment.guests?.[0]?.email || selectedPayment.user?.email || 'Chưa có'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                      <div className="text-sm text-gray-900">
                        {selectedPayment.guests?.[0]?.phone || selectedPayment.user?.phone || 'Chưa có'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái thanh toán</label>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedPayment.payment)}`}>
                          {getPaymentStatusText(selectedPayment.payment)}
                        </span>
                      </div>
                    </div>
                    {selectedPayment.payment && (
                      <>
                      <div>
                          <label className="text-sm font-medium text-gray-500">Phương thức thanh toán</label>
                          <div className="text-sm text-gray-900">{selectedPayment.payment.payment_method}</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày thanh toán</label>
                          <div className="text-sm text-gray-900">{formatDate(selectedPayment.payment.payment_date)}</div>
                      </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
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
      )}
    </div>
  );
};

export default AdminOrderManagementPage;
