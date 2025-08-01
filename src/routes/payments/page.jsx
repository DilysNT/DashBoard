import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, MoreHorizontal, Eye, ChevronDown, RefreshCw, X } from "lucide-react";
import Pagination from "../../components/Pagination";
import usePagination from "../../hooks/usePagination";

const AdminPaymentManagementPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Payments API response:', data);
      setPayments(data.payments || data.data || (Array.isArray(data) ? data : []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const searchMatch =
      payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking?.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus === "all" || payment.status === selectedStatus;
    const methodMatch = selectedMethod === "all" || payment.payment_method === selectedMethod;
    return searchMatch && statusMatch && methodMatch;
  });

  // Pagination logic
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentData: currentPayments,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination(filteredPayments, 10);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, selectedStatus, selectedMethod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(amount));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu thanh toán...</p>
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
                  onClick={fetchPayments}
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
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Thanh toán</h1>
          <p className="text-slate-600 mt-1">Quản lý các giao dịch thanh toán</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm mã giao dịch, khách hàng, booking..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc trạng thái thanh toán"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Hoàn tất</option>
            <option value="failed">Thất bại</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc phương thức thanh toán"
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="VNPay">VNPay</option>
            <option value="MoMo">MoMo</option>
            <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã giao dịch</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Khách hàng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số tiền</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Phương thức</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày thanh toán</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-slate-500">
                  {payments.length === 0
                    ? 'Không có giao dịch nào'
                    : 'Không tìm thấy giao dịch phù hợp.'
                  }
                </td>
              </tr>
            ) : (
              currentPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-100">
                  <td className="px-4 py-3 font-mono text-sm text-slate-700">{payment.id.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {payment.booking?.user?.name || payment.booking?.user_id || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{payment.payment_method}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatDate(payment.payment_date)}
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600 hover:underline cursor-pointer">
                    <button onClick={() => { setSelectedPayment(payment); setShowDetails(true); }}>
                      <Eye size={16} /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết giao dịch
              </h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin giao dịch</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã giao dịch</label>
                      <div className="text-sm text-gray-900 font-mono">{selectedPayment.id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số tiền</label>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(selectedPayment.amount)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phương thức thanh toán</label>
                      <div className="text-sm text-gray-900">{selectedPayment.payment_method}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedPayment.status)}`}>
                          {selectedPayment.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày thanh toán</label>
                      <div className="text-sm text-gray-900">{formatDate(selectedPayment.payment_date)}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin booking</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã booking</label>
                      <div className="text-sm text-gray-900">{selectedPayment.booking_id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                      <div className="text-sm text-gray-900">{selectedPayment.booking?.user?.name || selectedPayment.booking?.user_id || "N/A"}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tour</label>
                      <div className="text-sm text-gray-900">{selectedPayment.booking?.tour_id || "N/A"}</div>
                    </div>
                  </div>
                </div>
              </div>
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

export default AdminPaymentManagementPage; 