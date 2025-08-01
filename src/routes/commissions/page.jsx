import React, { useEffect, useState } from "react";
import CommissionService from "../../services/CommissionService";
import { 
  Download, Settings, Plus, Edit, Trash2, BarChart3, 
  Search, Filter, Eye, DollarSign, TrendingUp, Calendar,
  CheckCircle, XCircle, Clock, RotateCcw, X
} from "lucide-react";

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

const CommissionAdminPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ agency_id: "", status: "", from_date: "", to_date: "" });
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // New states for additional features
  const [showReport, setShowReport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateCommission, setShowCreateCommission] = useState(false);
  const [report, setReport] = useState(null);
  const [settings, setSettings] = useState([]);
  const [newSetting, setNewSetting] = useState({ agency_id: '', rate: '', type: 'fixed' });
  const [editingSetting, setEditingSetting] = useState(null);
  const [newCommission, setNewCommission] = useState({
    booking_id: '',
    agency_id: '',
    amount: '',
    rate: '',
    note: ''
  });

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await CommissionService.getCommissions(filter);
      setCommissions(Array.isArray(res) ? res : (res.data || []));
    } catch (e) {
      alert("Không thể tải danh sách hoa hồng");
    }
    setLoading(false);
  };

  useEffect(() => { fetchCommissions(); }, [filter]);

  const handleViewDetail = async (commission) => {
    setSelected(commission);
    setDetail(null);
    try {
      const res = await CommissionService.getCommissionById(commission.id);
      setDetail(res.data || res);
    } catch (e) {
      alert("Không thể tải chi tiết hoa hồng");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await CommissionService.updateCommission(id, { status });
      fetchCommissions();
      setSelected(null);
      setDetail(null);
    } catch (e) {
      alert("Không thể cập nhật trạng thái hoa hồng");
    }
    setActionLoading(false);
  };

  const handleCreateReversal = async (commission) => {
    setActionLoading(true);
    try {
      await CommissionService.createReversal({ commission_id: commission.id });
      fetchCommissions();
      setSelected(null);
      setDetail(null);
    } catch (e) {
      alert("Không thể tạo reversal");
    }
    setActionLoading(false);
  };

  // New functions for additional features
  const fetchReport = async () => {
    try {
      const res = await CommissionService.getReport(filter);
      setReport(res.data || res);
      setShowReport(true);
    } catch (e) {
      alert("Không thể tải báo cáo hoa hồng");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await CommissionService.getSettings();
      setSettings(Array.isArray(res) ? res : (res.data || []));
    } catch (e) {
      alert("Không thể tải cấu hình hoa hồng");
    }
  };

  const handleCreateSetting = async () => {
    try {
      await CommissionService.createSetting(newSetting);
      setNewSetting({ agency_id: '', rate: '', type: 'fixed' });
      fetchSettings();
      alert("Tạo cấu hình thành công");
    } catch (e) {
      alert("Không thể tạo cấu hình");
    }
  };

  const handleUpdateSetting = async (id, data) => {
    try {
      await CommissionService.updateSetting(id, data);
      setEditingSetting(null);
      fetchSettings();
      alert("Cập nhật cấu hình thành công");
    } catch (e) {
      alert("Không thể cập nhật cấu hình");
    }
  };

  const handleDeleteSetting = async (id) => {
    if (confirm("Bạn có chắc muốn xóa cấu hình này?")) {
      try {
        await CommissionService.deleteSetting(id);
        fetchSettings();
        alert("Xóa cấu hình thành công");
      } catch (e) {
        alert("Không thể xóa cấu hình");
      }
    }
  };

  const handleCreateCommission = async () => {
    try {
      await CommissionService.createCommission(newCommission);
      setNewCommission({ booking_id: '', agency_id: '', amount: '', rate: '', note: '' });
      setShowCreateCommission(false);
      fetchCommissions();
      alert("Tạo hoa hồng thành công");
    } catch (e) {
      alert("Không thể tạo hoa hồng");
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
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý Hoa hồng</h1>
                <p className="text-slate-600 mt-1">Theo dõi và quản lý hoa hồng cho các agency</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchReport}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <BarChart3 size={18} />
                Báo cáo
              </button>
              <button
                onClick={() => {
                  setShowSettings(true);
                  fetchSettings();
                }}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Settings size={18} />
                Cấu hình
              </button>
              <button
                onClick={() => setShowCreateCommission(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={18} />
                Tạo hoa hồng
              </button>
            </div>
          </div>
        </div>

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
                placeholder="ID Agency" 
                value={filter.agency_id} 
                onChange={e => setFilter(f => ({ ...f, agency_id: e.target.value }))} 
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
              onClick={fetchCommissions} 
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Agency</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Tiền thanh toán</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Hoa hồng</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Tỷ lệ (%)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Agency nhận</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Ngày tạo</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-slate-600">Đang tải...</span>
                      </div>
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <DollarSign className="text-slate-300" size={48} />
                        <span>Không có dữ liệu hoa hồng</span>
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
                            <br/>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded mt-1 inline-block">
                              KM: {c.booking.promotion_id}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {c.agency?.name || c.agency?.email || c.agency_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-slate-700">{formatVND(c.booking?.total_price)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-blue-600 text-lg">{formatVND(c.amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                        {c.rate || c.booking?.commission_rate || "-"}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-emerald-600 text-lg">{formatVND(c.booking?.agency_amount)}</span>
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
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-slate-600">Mã hoa hồng</label>
                      <div className="font-mono font-bold text-lg text-slate-800 mt-1">{detail.id}</div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-slate-600">Booking ID</label>
                      <div className="font-mono font-bold text-lg text-slate-800 mt-1">{detail.booking_id}</div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-slate-600">Agency</label>
                      <div className="font-bold text-lg text-slate-800 mt-1">
                        {detail.agency?.name || detail.agency?.email || detail.agency_id}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-slate-600">Trạng thái</label>
                      <div className="mt-2">{getStatusBadge(detail.status)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-blue-700">Tiền thanh toán</label>
                      <div className="font-bold text-2xl text-blue-800 mt-1">
                        {formatVND(detail.booking?.total_price)}
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-emerald-700">Hoa hồng</label>
                      <div className="font-bold text-2xl text-emerald-800 mt-1">
                        {formatVND(detail.amount)}
                      </div>
                      <div className="text-sm text-emerald-600 mt-1">
                        Tỷ lệ: {detail.rate || detail.booking?.commission_rate || "-"}%
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-green-700">Agency nhận</label>
                      <div className="font-bold text-2xl text-green-800 mt-1">
                        {formatVND(detail.booking?.agency_amount)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-slate-600">Ngày tạo</label>
                    <div className="font-medium text-slate-800 mt-1">
                      {detail.created_at ? new Date(detail.created_at).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-slate-600">Ngày thanh toán</label>
                    <div className="font-medium text-slate-800 mt-1">
                      {detail.paid_at ? new Date(detail.paid_at).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl mt-4">
                  <label className="text-sm font-medium text-slate-600">Ghi chú</label>
                  <div className="text-slate-800 mt-1">{detail.note || 'Không có ghi chú'}</div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200">
                  {detail.status === 'pending' && (
                    <button 
                      disabled={actionLoading} 
                      onClick={() => handleUpdateStatus(detail.id, 'paid')} 
                      className="bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Xác nhận thanh toán
                    </button>
                  )}
                  {detail.status === 'paid' && (
                    <button 
                      disabled={actionLoading} 
                      onClick={() => handleCreateReversal(detail)} 
                      className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Tạo reversal
                    </button>
                  )}
                  {detail.status !== 'paid' && detail.status !== 'reversal' && (
                    <button 
                      disabled={actionLoading} 
                      onClick={() => handleUpdateStatus(detail.id, 'cancelled')} 
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <XCircle size={18} />
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReport && report && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Báo cáo hoa hồng tổng quan</h2>
                  <button 
                    onClick={() => setShowReport(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-blue-100 text-sm font-medium">Tổng hoa hồng</h3>
                        <p className="text-3xl font-bold mt-2">{formatVND(report.total_commission)}</p>
                      </div>
                      <DollarSign size={32} className="text-blue-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-emerald-100 text-sm font-medium">Đã thanh toán</h3>
                        <p className="text-3xl font-bold mt-2">{formatVND(report.paid_commission)}</p>
                      </div>
                      <CheckCircle size={32} className="text-emerald-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-amber-100 text-sm font-medium">Chờ duyệt</h3>
                        <p className="text-3xl font-bold mt-2">{formatVND(report.pending_commission)}</p>
                      </div>
                      <Clock size={32} className="text-amber-200" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-red-100 text-sm font-medium">Đã hủy</h3>
                        <p className="text-3xl font-bold mt-2">{formatVND(report.cancelled_commission)}</p>
                      </div>
                      <XCircle size={32} className="text-red-200" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} />
                    Thống kê theo agency
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {report.agency_stats?.map(stat => (
                      <div key={stat.agency_id} className="flex justify-between items-center py-3 px-4 bg-white rounded-xl">
                        <span className="font-medium text-slate-700">{stat.agency_name || stat.agency_id}</span>
                        <span className="font-bold text-slate-900">{formatVND(stat.total_commission)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Cấu hình tỷ lệ hoa hồng</h2>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Create New Setting */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-2xl mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Tạo cấu hình mới</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Agency ID"
                      value={newSetting.agency_id}
                      onChange={e => setNewSetting(s => ({ ...s, agency_id: e.target.value }))}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Tỷ lệ (%)"
                      value={newSetting.rate}
                      onChange={e => setNewSetting(s => ({ ...s, rate: e.target.value }))}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <select
                      value={newSetting.type}
                      onChange={e => setNewSetting(s => ({ ...s, type: e.target.value }))}
                      className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="fixed">Cố định</option>
                      <option value="percentage">Phần trăm</option>
                    </select>
                    <button
                      onClick={handleCreateSetting}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                    >
                      Tạo
                    </button>
                  </div>
                </div>

                {/* Settings List */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Agency ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tỷ lệ</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Loại</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {settings.map(setting => (
                        <tr key={setting.id} className="hover:bg-slate-50 transition-colors">
                          {editingSetting === setting.id ? (
                            <>
                              <td className="px-6 py-4 font-mono">{setting.agency_id}</td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  defaultValue={setting.rate}
                                  onChange={e => setting.rate = e.target.value}
                                  className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  defaultValue={setting.type}
                                  onChange={e => setting.type = e.target.value}
                                  className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="fixed">Cố định</option>
                                  <option value="percentage">Phần trăm</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleUpdateSetting(setting.id, { rate: setting.rate, type: setting.type })}
                                    className="bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingSetting(null)}
                                    className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 font-mono font-medium">{setting.agency_id}</td>
                              <td className="px-6 py-4">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                  {setting.rate}%
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded">
                                  {setting.type === 'fixed' ? 'Cố định' : 'Phần trăm'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setEditingSetting(setting.id)}
                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSetting(setting.id)}
                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Commission Modal */}
        {showCreateCommission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-800">Tạo hoa hồng mới</h2>
                  <button 
                    onClick={() => setShowCreateCommission(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Booking ID"
                    value={newCommission.booking_id}
                    onChange={e => setNewCommission(c => ({ ...c, booking_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Agency ID"
                    value={newCommission.agency_id}
                    onChange={e => setNewCommission(c => ({ ...c, agency_id: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Số tiền hoa hồng"
                    value={newCommission.amount}
                    onChange={e => setNewCommission(c => ({ ...c, amount: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Tỷ lệ (%)"
                    value={newCommission.rate}
                    onChange={e => setNewCommission(c => ({ ...c, rate: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <textarea
                    placeholder="Ghi chú"
                    value={newCommission.note}
                    onChange={e => setNewCommission(c => ({ ...c, note: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24 resize-none"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateCommission}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                  >
                    Tạo hoa hồng
                  </button>
                  <button
                    onClick={() => setShowCreateCommission(false)}
                    className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommissionAdminPage;