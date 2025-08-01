import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react";
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';

const DepartureManagementPage = () => {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [newDeparture, setNewDeparture] = useState({
    tour_id: "",
    departure_date: "",
    note: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/departure-dates";

  // Fetch departures from API
  const fetchDepartures = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // API trả về mảng trực tiếp
      const departures = Array.isArray(data) ? data : [];
      setDepartures(departures);
    } catch (error) {
      console.error("Error fetching departures:", error);
      setErrorMessage("Không thể tải danh sách ngày khởi hành. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartures();
  }, []);

  // Filter departures based on search term
  const filteredDepartures = useMemo(() => {
    return Array.isArray(departures) ? departures.filter(departure => {
      const searchMatch =
        departure.tour_id?.toString().includes(searchTerm) ||
        departure.departure_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        departure.end_date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        departure.itinerary_id?.toLowerCase().includes(searchTerm.toLowerCase());
      return searchMatch;
    }) : [];
  }, [departures, searchTerm]);

  // Pagination logic
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentData: currentDepartures,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination(filteredDepartures, 10);

  // Reset pagination when filter changes
  useEffect(() => {
    resetPagination();
  }, [searchTerm]);

  // Create new departure
  const createDeparture = async (departureData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(departureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newDeparture = await response.json();
      setDepartures(prev => [...prev, newDeparture]);
      return true;
    } catch (error) {
      console.error("Error creating departure:", error);
      setErrorMessage(error.message || "Không thể tạo ngày khởi hành mới. Vui lòng thử lại!");
      return false;
    }
  };

  // Update existing departure
  const updateDeparture = async (id, departureData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(departureData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedDeparture = await response.json();
      setDepartures(prev => prev.map(departure =>
        departure.id === id ? updatedDeparture : departure
      ));
      return true;
    } catch (error) {
      console.error("Error updating departure:", error);
      setErrorMessage(error.message || "Không thể cập nhật ngày khởi hành. Vui lòng thử lại!");
      return false;
    }
  };

  // Delete departure
  const deleteDeparture = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setDepartures(prev => prev.filter(departure => departure.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting departure:", error);
      setErrorMessage(error.message || "Không thể xóa ngày khởi hành. Vui lòng thử lại!");
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ngày khởi hành này?")) {
      await deleteDeparture(id);
    }
  };

  // Handle save departure (create or update)
  const handleSaveDeparture = async () => {
    if (!newDeparture.tour_id.trim() || !newDeparture.departure_date.trim()) {
      setErrorMessage("Vui lòng điền Tour ID và Ngày khởi hành!");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    let success = false;

    if (editingDeparture) {
      success = await updateDeparture(editingDeparture.id, newDeparture);
    } else {
      success = await createDeparture(newDeparture);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingDeparture(null);
      resetForm();
    }
    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewDeparture({
      tour_id: "",
      departure_date: "",
      note: "",
    });
    setErrorMessage("");
  };

  // Handle edit button click
  const handleEdit = (departure) => {
    setEditingDeparture(departure);
    setNewDeparture({
      tour_id: departure.tour_id || "",
      departure_date: departure.departure_date || "",
      note: departure.note || "",
    });
    setIsModalOpen(true);
    setDropdownOpenId(null);
    setErrorMessage("");
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingDeparture(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeparture(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách ngày khởi hành...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Ngày khởi hành</h1>
          <p className="text-slate-600 mt-1">Quản lý ngày khởi hành cho từng tour</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Ngày khởi hành
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage("")}
            className="absolute top-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.414l-2.934 2.935a1 1 0 11-1.414-1.414l2.935-2.934-2.935-2.934a1 1 0 011.414-1.414L10 8.586l2.934-2.935a1 1 0 011.414 1.414L11.414 10l2.934 2.935a1 1 0 010 1.414z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingDeparture ? "Sửa Ngày khởi hành" : "Thêm Ngày khởi hành mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tour ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDeparture.tour_id}
                  onChange={(e) => setNewDeparture({ ...newDeparture, tour_id: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập ID của tour"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày khởi hành <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDeparture.departure_date}
                  onChange={(e) => setNewDeparture({ ...newDeparture, departure_date: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={newDeparture.note}
                  onChange={(e) => setNewDeparture({ ...newDeparture, note: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ghi chú thêm về ngày khởi hành"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveDeparture}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {submitting ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tour ID, ngày khởi hành, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tour ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Itinerary ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày khởi hành</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày kết thúc</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số ngày</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số đêm</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentDepartures.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-sm text-slate-500">
                  {searchTerm ? "Không tìm thấy ngày khởi hành phù hợp." : "Chưa có ngày khởi hành nào."}
                </td>
              </tr>
            ) : (
              currentDepartures.map((departure) => (
                <tr key={departure.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                      {typeof departure.id === 'string' ? departure.id.substring(0, 8) + '...' : departure.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {departure.tour_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {departure.itinerary_id || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {departure.departure_date}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {departure.end_date}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-cyan-100 text-cyan-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {departure.number_of_days}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {departure.number_of_nights}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 relative">
                    <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === departure.id}
                      onClick={() => toggleDropdown(departure.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {dropdownOpenId === departure.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg"
                      >
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleEdit(departure)}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center transition-colors"
                          >
                            <Edit size={16} className="mr-2" /> Sửa
                          </button>
                        </li>
                        <li>
                          <hr className="border-slate-200" />
                        </li>
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleDelete(departure.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center transition-colors"
                          >
                            <Trash size={16} className="mr-2" /> Xóa
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

export default DepartureManagementPage;