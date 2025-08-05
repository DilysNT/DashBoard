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
    itinerary_id: "",
    departure_date: "",
    number_of_days: 1,
    number_of_nights: 0,
    note: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ open: false, departure: null });
  const [showRefundInfo, setShowRefundInfo] = useState(false);
  const [resultDialog, setResultDialog] = useState({ open: false, message: "", type: "success" });

  const API_BASE_URL = "http://localhost:5000/api/departure-dates";

  // Fetch departures from API
  const fetchDepartures = async () => {
    try {
      setLoading(true);
      console.log("Fetching departures...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const headers = {
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      };

      // Thêm agency token nếu có
      const agencyToken = localStorage.getItem('agency_token');
      if (agencyToken) {
        headers["X-Agency-Token"] = agencyToken;
      }

      const response = await fetch(API_BASE_URL, {
        headers: headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const departures = Array.isArray(data.data) ? data.data : [];
      console.log(`Fetched ${departures.length} departures`);

      // Hiển thị departures ngay lập tức, sau đó fetch bookings
      setDepartures(departures.map(d => ({ ...d, bookings: [] })));

      // Fetch bookings song song với giới hạn concurrency
      const BATCH_SIZE = 5; // Fetch tối đa 5 requests cùng lúc
      const batches = [];
      for (let i = 0; i < departures.length; i += BATCH_SIZE) {
        batches.push(departures.slice(i, i + BATCH_SIZE));
      }

      let processedCount = 0;
      for (const batch of batches) {
        const batchPromises = batch.map(async (departure) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout cho mỗi booking request

            const headers = {
              "Authorization": `Bearer ${localStorage.getItem('token')}`,
            };

            // Thêm agency token nếu có
            const agencyToken = localStorage.getItem('agency_token');
            if (agencyToken) {
              headers["X-Agency-Token"] = agencyToken;
            }

            const res = await fetch(`${API_BASE_URL}/${departure.id}/bookings`, {
              headers: headers,
              signal: controller.signal,
            });

            clearTimeout(timeoutId);
            if (!res.ok) return { ...departure, bookings: [] };

            const bookings = await res.json();
            const confirmedBookings = Array.isArray(bookings)
              ? bookings.filter(b => b.status === "confirmed" && b.departure_date_id === departure.id)
              : [];

            console.log(`Departure ${departure.id} - confirmed bookings: ${confirmedBookings.length}`);
            return { ...departure, bookings: confirmedBookings };
          } catch (error) {
            console.warn(`Failed to fetch bookings for departure ${departure.id}:`, error.message);
            return { ...departure, bookings: [] };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        const updatedDepartures = batchResults.map(result =>
          result.status === 'fulfilled' ? result.value : result.reason
        ).filter(Boolean);

        // Cập nhật UI sau mỗi batch
        setDepartures(prev => {
          const newDepartures = [...prev];
          updatedDepartures.forEach(updated => {
            const index = newDepartures.findIndex(d => d.id === updated.id);
            if (index !== -1) {
              newDepartures[index] = updated;
            }
          });
          return newDepartures;
        });

        processedCount += batch.length;
        console.log(`Processed ${processedCount}/${departures.length} departures`);
      }

    } catch (error) {
      console.error("Error fetching departures:", error);
      if (error.name === 'AbortError') {
        setErrorMessage("Tải dữ liệu quá lâu, vui lòng thử lại!");
      } else {
        setErrorMessage("Không thể tải danh sách ngày khởi hành. Vui lòng thử lại!");
      }
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
      console.log("Creating departure with data:", departureData);
      console.log("Authorization token:", localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log("Agency token:", localStorage.getItem('agency_token') ? 'Present' : 'Missing');

      const token = localStorage.getItem('token');
      const agencyToken = localStorage.getItem('agency_token');

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      if (agencyToken) {
        headers["X-Agency-Token"] = agencyToken;
      }

      const response = await fetch("http://localhost:5000/api/departure-dates", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          tour_id: departureData.tour_id,
          itinerary_id: departureData.itinerary_id,
          departure_date: departureData.departure_date,
          number_of_days: departureData.number_of_days,
          number_of_nights: departureData.number_of_nights,
          note: departureData.note
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.log("Error response data:", errorData);
        } catch (jsonError) {
          console.log("Could not parse error response as JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const newDeparture = await response.json();
      console.log("Created departure successfully:", newDeparture);
      setDepartures(prev => [...prev, { ...newDeparture, bookings: [] }]);
      setResultDialog({ open: true, message: "Thêm ngày khởi hành thành công!", type: "success" });
      return true;
    } catch (error) {
      console.error("Error creating departure:", error);
      let msg = error.message || "Không thể tạo ngày khởi hành mới. Vui lòng thử lại!";

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        msg = "Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng và thử lại!";
      } else if (error.message.includes('401')) {
        msg = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!";
      } else if (error.message.includes('403')) {
        msg = "Bạn không có quyền tạo ngày khởi hành cho tour này!";
      }

      setResultDialog({ open: true, message: msg, type: "error" });
      return false;
    }
  };

  // Update existing departure
  const updateDeparture = async (id, departureData) => {
    try {
      console.log("Updating departure:", id, "with data:", departureData);
      console.log("Authorization token:", localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log("Agency token:", localStorage.getItem('agency_token') ? 'Present' : 'Missing');

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      };

      // Thêm agency token nếu có
      const agencyToken = localStorage.getItem('agency_token');
      if (agencyToken) {
        headers["X-Agency-Token"] = agencyToken;
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({
          tour_id: departureData.tour_id,
          itinerary_id: departureData.itinerary_id,
          departure_date: departureData.departure_date,
          number_of_days: departureData.number_of_days,
          number_of_nights: departureData.number_of_nights,
          note: departureData.note
        }),
      });

      console.log("Update response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.log("Update error response data:", errorData);
        } catch (jsonError) {
          console.log("Could not parse error response as JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const updatedDeparture = await response.json();
      console.log("Updated departure successfully:", updatedDeparture);
      setDepartures(prev => prev.map(departure =>
        departure.id === id ? { ...updatedDeparture, bookings: departure.bookings || [] } : departure
      ));
      setResultDialog({ open: true, message: "Cập nhật ngày khởi hành thành công!", type: "success" });
      return true;
    } catch (error) {
      console.error("Error updating departure:", error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setErrorMessage("Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng và thử lại!");
      } else if (error.message.includes('401')) {
        setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      } else if (error.message.includes('403')) {
        setErrorMessage("Bạn không có quyền sửa ngày khởi hành này!");
      } else {
        setErrorMessage(error.message || "Không thể cập nhật ngày khởi hành. Vui lòng thử lại!");
      }
      return false;
    }
  };

  // Delete departure
  const deleteDeparture = async (id) => {
    try {
      console.log("Deleting departure:", id);
      console.log("Authorization token:", localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log("Agency token:", localStorage.getItem('agency_token') ? 'Present' : 'Missing');

      const headers = {
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      };

      // Thêm agency token nếu có
      const agencyToken = localStorage.getItem('agency_token');
      if (agencyToken) {
        headers["X-Agency-Token"] = agencyToken;
      }

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: headers,
      });

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.log("Delete error response data:", errorData);
        } catch (jsonError) {
          console.log("Could not parse error response as JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      console.log("Deleted departure successfully");
      setDepartures(prev => prev.filter(departure => departure.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting departure:", error);

      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setErrorMessage("Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng và thử lại!");
      } else if (error.message.includes('401')) {
        setErrorMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      } else if (error.message.includes('403')) {
        setErrorMessage("Bạn không có quyền xóa ngày khởi hành này!");
      } else {
        setErrorMessage(error.message || "Không thể xóa ngày khởi hành. Vui lòng thử lại!");
      }
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = (id) => {
    console.log(`HandleDelete - Departure ID: ${id}`);
    const departure = departures.find(d => d.id === id);
    console.log(`HandleDelete - Departure ID: ${id}, Bookings count: ${departure?.bookings?.length || 0}`);
    if (departure && Array.isArray(departure.bookings) && departure.bookings.length > 0) {
      setConfirmDelete({ open: true, departure });
    } else {
      setConfirmDelete({ open: true, departure });
    }
  };

  // Confirm delete departure
  const confirmDeleteDeparture = () => {
    setShowRefundInfo(true);
  };

  const handleRefundAndDelete = async () => {
    const departure = confirmDelete.departure;
    if (departure && Array.isArray(departure.bookings) && departure.bookings.length > 0) {
      for (const booking of departure.bookings) {
        try {
          await fetch(`/api/bookings/${booking.id}/cancel`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ reason: "Agency xóa ngày khởi hành, hoàn tiền cho user." })
          });
        } catch (err) { }
      }
    }
    await deleteDeparture(departure.id);
    setShowRefundInfo(false);
    setConfirmDelete({ open: false, departure: null });
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
      itinerary_id: "",
      departure_date: "",
      number_of_days: 1,
      number_of_nights: 0,
      note: "",
    });
    setErrorMessage("");
  };

  // Handle edit button click
  const handleEdit = (departure) => {
    setEditingDeparture(departure);
    setNewDeparture({
      tour_id: departure.tour_id || "",
      itinerary_id: departure.itinerary_id || "",
      departure_date: departure.departure_date || "",
      number_of_days: departure.number_of_days || 1,
      number_of_nights: departure.number_of_nights || 0,
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

  // Handle cancel departure
  const handleCancelDeparture = async (departure) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy tour này?")) return;
    try {
      // Gọi API cancel booking (cần có booking_id trong departure)
      const bookingId = departure.booking_id;
      if (!bookingId) {
        setErrorMessage("Không tìm thấy booking liên quan để hủy.");
        return;
      }
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason: "Ngày khởi hành không đủ số lượng tối thiểu, cần hủy booking." })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hủy booking thất bại.");
      }
      // Xóa ngày khởi hành khỏi danh sách
      setDepartures(prev => prev.filter(d => d.id !== departure.id));
      alert("Đã hủy tour và xóa ngày khởi hành thành công!");
    } catch (error) {
      setErrorMessage(error.message || "Hủy tour thất bại.");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin" size={32} />
          <div className="text-center">
            <div className="text-lg font-medium">Đang tải danh sách ngày khởi hành...</div>
            <div className="text-sm text-gray-500 mt-1">Vui lòng đợi trong giây lát</div>
          </div>
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
              <path d="M14.348 14.849a1 1 0 01-1.414 0L10 11.414l-2.934 2.935a1 1 0 11-1.414-1.414l2.935-2.934-2.935-2.934a1 1 0 011.414-1.414L10 8.586l2.934-2.935a1 1 0 011.414 1.414L11.414 10l2.934 2.935a1 1 0 010 1.414z" />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary ID</label>
                <input
                  type="text"
                  value={newDeparture.itinerary_id}
                  onChange={e => setNewDeparture({ ...newDeparture, itinerary_id: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập ID hành trình (nếu có)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số ngày <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={1}
                    value={newDeparture.number_of_days}
                    onChange={e => setNewDeparture({ ...newDeparture, number_of_days: parseInt(e.target.value) || 1 })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số đêm <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    value={newDeparture.number_of_nights}
                    onChange={e => setNewDeparture({ ...newDeparture, number_of_nights: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
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
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Bookings</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentDepartures.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-sm text-slate-500">
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
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {departure.bookings ? (
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${departure.bookings.length > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {departure.bookings.length} booking{departure.bookings.length !== 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Đang tải...</span>
                    )}
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

      {/* Confirmation Delete Modal */}
      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-red-700 mb-4">Cảnh báo xóa ngày khởi hành</h2>
            <p className="mb-4">
              {confirmDelete.departure && Array.isArray(confirmDelete.departure.bookings) && confirmDelete.departure.bookings.length > 0
                ? `Ngày khởi hành này đang có ${confirmDelete.departure.bookings.length} booking đã đặt. Nếu xóa, agency phải hoàn tất cả tiền cho user. Bạn có chắc chắn muốn tiếp tục?`
                : "Bạn có chắc chắn muốn xóa ngày khởi hành này?"}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete({ open: false, departure: null })}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteDeparture}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Refund Info Modal */}
      {showRefundInfo && confirmDelete.departure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-green-700 mb-4">Thông báo hoàn tiền</h2>
            <p className="mb-4">
              Hệ thống sẽ tự động hoàn tiền cho {confirmDelete.departure.bookings?.length || 0} user đã đặt tour với ngày khởi hành này.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowRefundInfo(false); setConfirmDelete({ open: false, departure: null }); }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleRefundAndDelete}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Tiếp tục xóa và hoàn tiền
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Result Dialog */}
      {resultDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">
              {resultDialog.type === "success" ? "Thành công" : "Lỗi"}
            </h2>
            <p className="mb-4 text-gray-700">{resultDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResultDialog({ open: false, message: "", type: "success" })}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartureManagementPage;