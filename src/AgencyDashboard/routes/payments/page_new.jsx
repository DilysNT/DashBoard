import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, RefreshCw, Eye, X } from "lucide-react";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PaymentService from '../../../services/PaymentService';

const PaymentManagementPage = () => {
  const navigate = useNavigate();

  // State for API data
  const [payments, setPayments] = useState([]);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching agency payments via PaymentService...');
      const result = await PaymentService.getPayments(true);
      
      if (result.success) {
        setPayments(result.data || []);
        setAgencyInfo(result.agency);
        setPagination(result.pagination);
        setSummary(result.summary);
        console.log('✅ Agency payments loaded successfully:', result.data?.length, 'payments');
      } else {
        throw new Error(result.error || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('❌ Error fetching payments:', err);
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'Không hợp lệ';
    }
  };

  // Get status text and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Hoàn tất', color: 'bg-green-100 text-green-800' };
      case 'pending':
        return { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' };
      case 'failed':
        return { text: 'Thất bại', color: 'bg-red-100 text-red-800' };
      default:
        return { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'VNPay':
        return '💳';
      case 'MoMo':
        return '📱';
      case 'Bank_Transfer':
        return '🏦';
      case 'Credit_Card':
        return '💳';
      case 'E_Wallet':
        return '💰';
      default:
        return '💰';
    }
  };

  const showPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const searchMatch = 
        payment.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.tour?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.booking?.guests?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount?.toString().includes(searchTerm);
      
      const statusMatch = selectedStatus === "all" || payment.status === selectedStatus;
      return searchMatch && statusMatch;
    });
  }, [payments, searchTerm, selectedStatus]);

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
          {agencyInfo && (
            <p className="text-sm text-blue-600 mt-1">
              🏢 {agencyInfo.name} | 📧 {agencyInfo.email}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
          {pagination && (
            <span className="text-sm text-gray-500">
              Trang {pagination.currentPage}/{pagination.totalPages} ({pagination.totalItems} giao dịch)
            </span>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-gray-500">Tổng giao dịch</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
            <div className="text-sm text-gray-500">Hoàn tất</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <div className="text-sm text-gray-500">Chờ xử lý</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-sm text-gray-500">Thất bại</div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm order ID, booking ID, tour, khách hàng..."
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
      </div>

      {/* Payments Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Giao dịch</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tour</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Khách hàng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số tiền</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Phương thức</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày thanh toán</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-slate-500">
                  {payments.length === 0 
                    ? 'Không có giao dịch thanh toán nào' 
                    : 'Không tìm thấy thanh toán phù hợp.'
                  }
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const statusInfo = getStatusInfo(payment.status);
                return (
                  <tr key={payment.id} className="hover:bg-slate-100">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.order_id || 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        #{payment.id.slice(0, 8)}...
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-slate-400">
                          TXN: {payment.transaction_id}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.booking?.tour?.name || 'Không xác định'}
                      </div>
                      <div className="text-xs text-slate-500">
                        #{payment.booking_id?.slice(0, 8)}...
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {payment.booking?.guests?.[0]?.name || payment.booking?.user?.name || 'Chưa có thông tin'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {payment.booking?.guests?.[0]?.email || payment.booking?.user?.email || ''}
                      </div>
                    </td>
                    
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">
                          {getPaymentMethodIcon(payment.payment_method)}
                        </span>
                        <div className="text-sm text-slate-900">
                          {payment.payment_method}
                        </div>
                      </div>
                    </td>
                    
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      {formatDate(payment.payment_date)}
                    </td>
                    
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showPaymentDetails(payment)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Eye size={16} />
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Chi tiết thanh toán
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
                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin thanh toán</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Order ID</label>
                      <div className="text-sm text-gray-900">{selectedPayment.order_id || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ID thanh toán</label>
                      <div className="text-sm text-gray-900 font-mono">{selectedPayment.id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số tiền</label>
                      <div className="text-lg font-semibold text-green-600">{formatCurrency(selectedPayment.amount)}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phương thức thanh toán</label>
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">{getPaymentMethodIcon(selectedPayment.payment_method)}</span>
                        <span className="text-sm text-gray-900">{selectedPayment.payment_method}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusInfo(selectedPayment.status).color}`}>
                          {getStatusInfo(selectedPayment.status).text}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Ngày thanh toán</label>
                      <div className="text-sm text-gray-900">{formatDate(selectedPayment.payment_date)}</div>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin đơn hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Mã booking</label>
                      <div className="text-sm text-gray-900">#{selectedPayment.booking_id?.slice(0, 8)}...</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tour</label>
                      <div className="text-sm text-gray-900">{selectedPayment.booking?.tour?.name || 'Không xác định'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                      <div className="text-sm text-gray-900">{selectedPayment.booking?.guests?.[0]?.name || selectedPayment.booking?.user?.name || 'Chưa có thông tin'}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <div className="text-sm text-gray-900">
                        {selectedPayment.booking?.guests?.[0]?.email || selectedPayment.booking?.user?.email || 'Chưa có'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Số lượng khách</label>
                      <div className="text-sm text-gray-900">
                        {selectedPayment.booking?.number_of_adults || 0} người lớn, {selectedPayment.booking?.number_of_children || 0} trẻ em
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tổng tiền booking</label>
                      <div className="text-sm text-gray-900">{formatCurrency(selectedPayment.booking?.total_price)}</div>
                    </div>
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
    </div>
  );
};

export default PaymentManagementPage;
