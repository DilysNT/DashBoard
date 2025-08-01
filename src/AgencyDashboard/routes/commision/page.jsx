import React, { useEffect, useState } from "react";
import {
    Download, Eye, DollarSign, TrendingUp, Calendar,
    CheckCircle, XCircle, Clock, RotateCcw, Search, Filter,
    FileText, AlertCircle, Wallet
} from "lucide-react";
import Pagination from "../../components/Pagination";
const statusMap = {
    pending: "Chờ duyệt",
    paid: "Đã thanh toán",
    cancelled: "Đã hủy",
    reversal: "Thu hồi"
};

const formatVND = (value) => {
    if (value == null) return "-";
    return Number(value).toLocaleString('vi-VN') + ' ₫';
};

const AgencyCommissionPage = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({ status: "", from_date: "", to_date: "", booking_id: "" });
    const [selected, setSelected] = useState(null);
    const [detail, setDetail] = useState(null);
    const [stats, setStats] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchCommissions = async (page = currentPage, limit = itemsPerPage) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            // Thêm pagination params
            queryParams.append('page', page);
            queryParams.append('limit', limit);

            Object.keys(filter).forEach(key => {
                if (filter[key]) queryParams.append(key, filter[key]);
            });

            const response = await fetch(`http://localhost:5000/api/agency/commissions?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Không thể tải dữ liệu');

            const data = await response.json();

            // Xử lý response có pagination
            if (data.data && Array.isArray(data.data)) {
                setCommissions(data.data);
                setTotalPages(data.totalPages || Math.ceil((data.total || data.data.length) / limit));
                setTotalItems(data.total || data.data.length);
                setCurrentPage(data.currentPage || page);
            } else {
                // Fallback cho API không có pagination
                const commissionsArray = Array.isArray(data) ? data : (data.data || []);
                setCommissions(commissionsArray);
                setTotalPages(Math.ceil(commissionsArray.length / limit));
                setTotalItems(commissionsArray.length);
                setCurrentPage(1);
            }

            console.log('Commissions loaded:', data);
        } catch (e) {
            console.error('Error fetching commissions:', e);
            alert("Không thể tải danh sách hoa hồng");
        }
        setLoading(false);
    };
    // Thêm các hàm sau vào component:
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchCommissions(page, itemsPerPage);
    };

    const handlePageSizeChange = (size) => {
        setItemsPerPage(size);
        setCurrentPage(1);
        fetchCommissions(1, size);
    };
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/agency/commissions/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Không thể tải thống kê');

            const data = await response.json();
            setStats(data);
        } catch (e) {
            console.error('Error fetching stats:', e);
            // Tạm thời tính stats từ commission data
            calculateStatsFromCommissions();
        }
    };

    const calculateStatsFromCommissions = () => {
        if (commissions.length > 0) {
            const totalCommission = commissions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
            const paidCommission = commissions
                .filter(c => c.status === 'paid')
                .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
            const pendingCommission = commissions
                .filter(c => c.status === 'pending')
                .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

            setStats({
                totalCommission,
                paidCommission,
                pendingCommission,
                totalCommissions: commissions.length
            });
        }
    };

    useEffect(() => {
        setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
        fetchCommissions(1, itemsPerPage);
    }, [filter]);

    useEffect(() => {
        if (commissions.length > 0) {
            calculateStatsFromCommissions();
        } else {
            fetchStats();
        }
    }, [commissions]);

    const handleViewDetail = async (commission) => {
        setSelected(commission);
        setDetail(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/agency/commissions/${commission.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Không thể tải chi tiết');

            const data = await response.json();
            setDetail(data.data || data);
        } catch (e) {
            console.error('Error fetching commission detail:', e);
            // Fallback to using the commission data we already have
            setDetail(commission);
        }
    };

    const exportCommissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            Object.keys(filter).forEach(key => {
                if (filter[key]) queryParams.append(key, filter[key]);
            });

            const response = await fetch(`http://localhost:5000/api/agency/commissions/export?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Không thể xuất báo cáo');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `commission-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error exporting:', e);
            alert("Tính năng xuất báo cáo chưa được hỗ trợ");
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle },
            pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
            reversal: { bg: 'bg-purple-100', text: 'text-purple-800', icon: RotateCcw }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                <Icon size={14} />
                {statusMap[status] || status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                <Wallet className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800">Quản lý Hoa hồng</h1>
                                <p className="text-slate-600 mt-1">Theo dõi và quản lý hoa hồng từ các booking</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={exportCommissions}
                                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <Download size={18} />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-green-100 p-3 rounded-xl">
                                    <DollarSign className="text-green-600" size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatVND(stats.totalCommission)}
                                    </div>
                                    <div className="text-sm text-gray-500">Tổng hoa hồng</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-emerald-100 p-3 rounded-xl">
                                    <CheckCircle className="text-emerald-600" size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatVND(stats.paidCommission)}
                                    </div>
                                    <div className="text-sm text-gray-500">Đã nhận</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-amber-100 p-3 rounded-xl">
                                    <Clock className="text-amber-600" size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatVND(stats.pendingCommission)}
                                    </div>
                                    <div className="text-sm text-gray-500">Chờ duyệt</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-blue-100 p-3 rounded-xl">
                                    <TrendingUp className="text-blue-600" size={24} />
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {stats.totalCommissions || 0}
                                    </div>
                                    <div className="text-sm text-gray-500">Tổng giao dịch</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="text-slate-600" size={20} />
                        <h3 className="text-lg font-semibold text-slate-800">Bộ lọc</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Mã booking"
                                value={filter.booking_id}
                                onChange={e => setFilter(f => ({ ...f, booking_id: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <select
                            value={filter.status}
                            onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="cancelled">Đã hủy</option>
                            <option value="reversal">Thu hồi</option>
                        </select>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={filter.from_date}
                                onChange={e => setFilter(f => ({ ...f, from_date: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="date"
                                value={filter.to_date}
                                onChange={e => setFilter(f => ({ ...f, to_date: e.target.value }))}
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <button
                            onClick={() => {
                                setCurrentPage(1);
                                fetchCommissions(1, itemsPerPage);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                        >
                            Áp dụng
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Mã hoa hồng</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Booking</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tên tour</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Giá trị booking</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Hoa hồng</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Tỷ lệ (%)</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Ngày tạo</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                                <span className="text-slate-600">Đang tải...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : commissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Wallet className="text-slate-300" size={48} />
                                                <span>Chưa có hoa hồng nào</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : commissions.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors duration-150">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{c.id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-sm">
                                                {c.booking_id}
                                                {c.booking?.promotion_id && (
                                                    <>
                                                        <br />
                                                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded mt-1 inline-block">
                                                            KM: {c.booking.promotion_id}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 max-w-xs truncate">
                                                {c.booking?.tour?.name ||
                                                    c.booking?.tour_name ||
                                                    `Tour ID: ${c.booking?.tour_id || 'N/A'}`}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {c.booking?.user?.name ||
                                                    c.booking?.customer_name ||
                                                    `User ID: ${c.booking?.user_id?.slice(0, 8)}...`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-medium text-slate-700">{formatVND(c.booking?.total_price)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`font-bold text-lg ${parseFloat(c.amount) < 0
                                                ? 'text-red-600'
                                                : 'text-emerald-600'
                                                }`}>
                                                {formatVND(Math.abs(parseFloat(c.amount)))}
                                                {parseFloat(c.amount) < 0 && ' (Thu hồi)'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                                {c.rate || c.booking?.commission_rate || "-"}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(c.status)}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-600">
                                            {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleViewDetail(c)}
                                                className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                            >
                                                <Eye size={14} />
                                                Chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Thêm Pagination component */}
                {!loading && commissions.length > 0 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </div>
                )}
                {/* Commission Detail Modal */}
                {selected && detail && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-800">Chi tiết hoa hồng</h2>
                                    <button
                                        onClick={() => { setSelected(null); setDetail(null); }}
                                        className="text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Commission Info */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                                <DollarSign size={18} />
                                                Thông tin hoa hồng
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Mã hoa hồng:</span>
                                                    <span className="font-mono bg-slate-200 px-2 py-1 rounded">{detail.id}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Số tiền:</span>
                                                    <span className={`font-bold ${parseFloat(detail.amount) < 0
                                                        ? 'text-red-600'
                                                        : 'text-emerald-600'
                                                        }`}>
                                                        {formatVND(Math.abs(parseFloat(detail.amount)))}
                                                        {parseFloat(detail.amount) < 0 && ' (Thu hồi)'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Tỷ lệ:</span>
                                                    <span className="font-medium">{detail.rate || detail.booking?.commission_rate || "-"}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Trạng thái:</span>
                                                    {getStatusBadge(detail.status)}
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Ngày tạo:</span>
                                                    <span>{detail.created_at ? new Date(detail.created_at).toLocaleDateString('vi-VN') : '-'}</span>
                                                </div>
                                                {detail.paid_at && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Ngày thanh toán:</span>
                                                        <span>{new Date(detail.paid_at).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {detail.note && (
                                            <div className="bg-amber-50 p-4 rounded-xl">
                                                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                                    <AlertCircle size={16} />
                                                    Ghi chú
                                                </h4>
                                                <p className="text-amber-700 text-sm">{detail.note}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Booking Info */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 p-4 rounded-xl">
                                            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                                <FileText size={18} />
                                                Thông tin booking
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-blue-600">Mã booking:</span>
                                                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">{detail.booking_id}</span>
                                                </div>
                                                {detail.booking && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600">Tên tour:</span>
                                                            <span className="font-medium text-right max-w-xs truncate">
                                                                {detail.booking?.tour?.name ||
                                                                    detail.booking?.tour_name ||
                                                                    `Tour ID: ${detail.booking?.tour_id || 'N/A'}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600">Khách hàng:</span>
                                                            <span className="font-medium">
                                                                {detail.booking?.user?.name ||
                                                                    detail.booking?.customer_name ||
                                                                    `User ID: ${detail.booking?.user_id?.slice(0, 8)}...`}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600">Tổng tiền:</span>
                                                            <span className="font-bold text-blue-700">{formatVND(detail.booking.total_price)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-blue-600">Ngày booking:</span>
                                                            <span>{detail.booking.created_at ? new Date(detail.booking.created_at).toLocaleDateString('vi-VN') : '-'}</span>
                                                        </div>
                                                        {detail.booking.promotion_id && (
                                                            <div className="flex justify-between">
                                                                <span className="text-blue-600">Khuyến mãi:</span>
                                                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
                                                                    {detail.booking.promotion_id}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment History */}
                                {detail.payment_history && detail.payment_history.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold text-slate-800 mb-3">Lịch sử thanh toán</h3>
                                        <div className="space-y-2">
                                            {detail.payment_history.map((payment, index) => (
                                                <div key={index} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                                                    <div>
                                                        <span className="text-sm text-slate-600">
                                                            {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                                                        </span>
                                                        <p className="text-sm font-medium">{payment.note || payment.action}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        {getStatusBadge(payment.status)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgencyCommissionPage;