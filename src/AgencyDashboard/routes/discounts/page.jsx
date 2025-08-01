import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Edit, Trash, Loader2, X, Calendar, Percent, Tag } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";

const PromotionManagementPage = () => {
  const { user } = useAuth();
  const agencyId = user?.agency_id || user?.id;
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [newPromotion, setNewPromotion] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    max_usage: "",
    is_active: true
  });

  const API_BASE_URL = "http://localhost:5000/api/promotions/active";

  // Fetch promotions from API (chỉ lấy của agency hiện tại)
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const res = await response.json();
      const allPromos = Array.isArray(res) ? res : (res.data || []);
      setPromotions(
        allPromos
          .filter(promo => promo.agency_id === agencyId)
          .map(promo => ({
            ...promo,
            is_active: promo.is_active === true || promo.is_active === 'true' || promo.is_active === 1 || promo.is_active === '1'
          }))
      );
    } catch (error) {
      console.error("Error fetching promotions:", error);
      alert("Không thể tải danh sách mã giảm giá.\n" + (error.message || "Vui lòng thử lại!"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [agencyId]);

  // Filter promotions based on search term
  const filteredPromotions = useMemo(() => {
    return promotions.filter(promotion =>
      (promotion.code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (promotion.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (promotion.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [promotions, searchTerm]);

  // Create new promotion (gán agency_id)
  const createPromotion = async (promotionData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...promotionData, agency_id: agencyId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const res = await response.json();
      const newPromotion = res.data || res;
      setPromotions(prev => [...prev, newPromotion]);
      alert("Thêm mã giảm giá thành công!");
      return true;
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Không thể tạo mã giảm giá mới.\n" + (error.message || "Vui lòng thử lại!"));
      return false;
    }
  };

  // Update existing promotion (gán agency_id)
  const updatePromotion = async (id, promotionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...promotionData, agency_id: agencyId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const res = await response.json();
      const updatedPromotion = res.data || res;
      setPromotions(prev =>
        prev.map(promotion =>
          promotion.id === id ? updatedPromotion : promotion
        )
      );
      alert("Cập nhật mã giảm giá thành công!");
      return true;
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert("Không thể cập nhật mã giảm giá.\n" + (error.message || "Vui lòng thử lại!"));
      return false;
    }
  };

  // Delete promotion
  const deletePromotion = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      setPromotions(prev => prev.filter(promotion => promotion.id !== id));
      alert("Xóa mã giảm giá thành công!");
      return true;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Không thể xóa mã giảm giá. Vui lòng thử lại!");
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      await deletePromotion(id);
    }
  };

  // Handle save promotion (create or update)
  const handleSavePromotion = async () => {
    if (!newPromotion.code.trim()) {
      alert("Vui lòng điền mã giảm giá!");
      return;
    }
    if (!newPromotion.name.trim()) {
      alert("Vui lòng điền tên mã giảm giá!");
      return;
    }
    if (!newPromotion.discount_value || parseFloat(newPromotion.discount_value) <= 0) {
      alert("Vui lòng điền giá trị giảm giá hợp lệ!");
      return;
    }
    if (!newPromotion.start_date) {
      alert("Vui lòng chọn ngày bắt đầu!");
      return;
    }
    if (!newPromotion.end_date) {
      alert("Vui lòng chọn ngày kết thúc!");
      return;
    }
    if (new Date(newPromotion.start_date) >= new Date(newPromotion.end_date)) {
      alert("Ngày kết thúc phải sau ngày bắt đầu!");
      return;
    }
    setSubmitting(true);
    let success = false;
    // Prepare data
    const promotionData = {
      code: newPromotion.code.toUpperCase(),
      name: newPromotion.name,
      description: newPromotion.description || null,
      discount_type: newPromotion.discount_type,
      discount_value: parseFloat(newPromotion.discount_value),
      min_order_amount: newPromotion.min_order_amount ? parseFloat(newPromotion.min_order_amount) : null,
      max_discount_amount: newPromotion.max_discount_amount ? parseFloat(newPromotion.max_discount_amount) : null,
      start_date: newPromotion.start_date,
      end_date: newPromotion.end_date,
      max_usage: newPromotion.max_usage ? parseInt(newPromotion.max_usage) : null,
      is_active: newPromotion.is_active
    };
    if (promotionData.discount_type === 'fixed_amount') {
      promotionData.discount_amount = promotionData.discount_value;
    }
    if (editingPromotion) {
      success = await updatePromotion(editingPromotion.id, promotionData);
    } else {
      success = await createPromotion(promotionData);
    }
    if (success) {
      setIsModalOpen(false);
      setEditingPromotion(null);
      resetForm();
    }
    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewPromotion({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_discount_amount: "",
      start_date: "",
      end_date: "",
      max_usage: "",
      is_active: true
    });
  };

  // Handle edit button click
  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setNewPromotion({
      code: promotion.code || "",
      name: promotion.name || "",
      description: promotion.description || "",
      discount_type: promotion.discount_type || "percentage",
      discount_value: promotion.discount_value != null ? promotion.discount_value.toString() : "",
      min_order_amount: promotion.min_order_amount != null ? promotion.min_order_amount.toString() : "",
      max_discount_amount: promotion.max_discount_amount != null ? promotion.max_discount_amount.toString() : "",
      start_date: promotion.start_date ? promotion.start_date.split('T')[0] : "",
      end_date: promotion.end_date ? promotion.end_date.split('T')[0] : "",
      max_usage: promotion.max_usage != null ? promotion.max_usage.toString() : "",
      is_active: promotion.is_active === true || promotion.is_active === 'true' || promotion.is_active === 1 || promotion.is_active === '1'
    });
    setIsModalOpen(true);
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingPromotion(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromotion(null);
    resetForm();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return 'Invalid Date';
    }
  };

  // Get status info
  const getStatusInfo = (promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = new Date(promotion.end_date);
    if (!promotion.is_active || promotion.is_active === false || promotion.is_active === "false") {
      return { text: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' };
    }
    if (now < startDate) {
      return { text: 'Chưa bắt đầu', color: 'bg-blue-100 text-blue-800' };
    }
    if (now > endDate) {
      return { text: 'Đã hết hạn', color: 'bg-red-100 text-red-800' };
    }
    return { text: 'Đang hoạt động', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách mã giảm giá...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Mã Giảm Giá</h1>
          <p className="text-slate-600 mt-1">Quản lý các mã giảm giá và khuyến mãi</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Mã Giảm Giá
        </button>
      </div>
      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm mã, tên, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      {/* Promotions Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Mã Giảm Giá</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Giảm Giá</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời Gian</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng Thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành Động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredPromotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  {promotions.length === 0 
                    ? 'Không có mã giảm giá nào' 
                    : 'Không tìm thấy mã giảm giá phù hợp.'
                  }
                </td>
              </tr>
            ) : (
              filteredPromotions.map((promotion) => {
                const statusInfo = getStatusInfo(promotion);
                return (
                  <tr key={promotion.id} className="hover:bg-slate-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-slate-900 font-mono">
                            {promotion.code}
                          </div>
                          <div className="text-xs text-slate-500">
                            ID: {promotion.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {promotion.name}
                      </div>
                      <div className="text-xs text-slate-500 max-w-xs truncate">
                        {promotion.description || "Không có mô tả"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-900">
                        {promotion.discount_type === 'percentage' ? (
                          <span className="flex items-center gap-1">
                            <Percent className="h-4 w-4" />
                            {promotion.discount_value != null ? promotion.discount_value : 0}%
                          </span>
                        ) : (
                          <span>{formatCurrency(promotion.discount_value != null ? promotion.discount_value : 0)}</span>
                        )}
                      </div>
                      {promotion.min_order_amount && (
                        <div className="text-xs text-slate-500">
                          Tối thiểu: {formatCurrency(promotion.min_order_amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-slate-700">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div>{formatDate(promotion.start_date)}</div>
                          <div className="text-xs text-slate-500">đến {formatDate(promotion.end_date)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(promotion)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <Trash size={16} />
                          Xóa
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
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl transform transition-all duration-300 ease-in-out max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingPromotion ? "Sửa Mã Giảm Giá" : "Thêm Mã Giảm Giá Mới"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSavePromotion(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã Giảm Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPromotion.code}
                    onChange={(e) => setNewPromotion({ ...newPromotion, code: e.target.value.toUpperCase() })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    placeholder="Ví dụ: SUMMER2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Mã Giảm Giá <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPromotion.name}
                    onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Ví dụ: Giảm giá mùa hè"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newPromotion.description}
                  onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Mô tả chi tiết về mã giảm giá"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại Giảm Giá <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newPromotion.discount_type}
                    onChange={(e) => setNewPromotion({ ...newPromotion, discount_type: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá Trị Giảm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newPromotion.discount_value}
                    onChange={(e) => setNewPromotion({ ...newPromotion, discount_value: e.target.value })}
                    required
                    min="0"
                    step={newPromotion.discount_type === 'percentage' ? "1" : "1000"}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder={newPromotion.discount_type === 'percentage' ? "10" : "50000"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giảm Tối Đa
                  </label>
                  <input
                    type="number"
                    value={newPromotion.max_discount_amount}
                    onChange={(e) => setNewPromotion({ ...newPromotion, max_discount_amount: e.target.value })}
                    min="0"
                    step="1000"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="100000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn Hàng Tối Thiểu
                  </label>
                  <input
                    type="number"
                    value={newPromotion.min_order_amount}
                    onChange={(e) => setNewPromotion({ ...newPromotion, min_order_amount: e.target.value })}
                    min="0"
                    step="1000"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Lần Sử Dụng Tối Đa
                  </label>
                  <input
                    type="number"
                    value={newPromotion.max_usage}
                    onChange={(e) => setNewPromotion({ ...newPromotion, max_usage: e.target.value })}
                    min="1"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Bắt Đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newPromotion.start_date}
                    onChange={(e) => setNewPromotion({ ...newPromotion, start_date: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày Kết Thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newPromotion.end_date}
                    onChange={(e) => setNewPromotion({ ...newPromotion, end_date: e.target.value })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={newPromotion.is_active}
                  onChange={(e) => setNewPromotion({ ...newPromotion, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Kích hoạt mã giảm giá
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Đang lưu...
                    </div>
                  ) : (
                    editingPromotion ? "Cập nhật" : "Thêm mới"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagementPage; 