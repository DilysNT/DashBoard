import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react";
import Pagination from '../../components/Pagination';
import usePagination from '../../hooks/usePagination';

const ItineraryManagementPage = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [newItinerary, setNewItinerary] = useState({
    tour_id: "",
    day_number: 1,
    title: "",
    description: "",
    location_ids: [],
  });
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [allLocations, setAllLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/itineraries";

  // Fetch itineraries from API
  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const itineraries = Array.isArray(data.data) ? data.data : [];
      setItineraries(itineraries);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      setErrorMessage("Không thể tải danh sách hành trình. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Load itineraries on component mount
  useEffect(() => {
    fetchItineraries();
    // Fetch all locations for dropdown
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/locations", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setAllLocations(Array.isArray(data.data) ? data.data : []);
        setFilteredLocations(Array.isArray(data.data) ? data.data : []);
      } catch (err) {}
    };
    fetchLocations();
  }, []);

  // Filter itineraries based on search term
  const filteredItineraries = useMemo(() => {
    return Array.isArray(itineraries) ? itineraries.filter(itinerary => {
      const searchMatch =
        itinerary.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.tour_id?.toString().includes(searchTerm) ||
        itinerary.day_number?.toString().includes(searchTerm) ||
        itinerary.tour?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(itinerary.locations) && itinerary.locations.some(loc => loc.name?.toLowerCase().includes(searchTerm.toLowerCase())));
      return searchMatch;
    }) : [];
  }, [itineraries, searchTerm]);

  // Pagination logic
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    currentData: currentItineraries,
    handlePageChange,
    handlePageSizeChange,
    resetPagination
  } = usePagination(filteredItineraries, 10);

  // Reset pagination when filter changes
  useEffect(() => {
    resetPagination();
  }, [searchTerm]);

  // Create new itinerary
  const createItinerary = async (itineraryData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...itineraryData,
          location_ids: itineraryData.location_ids || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newItinerary = await response.json();
      setItineraries(prev => [...prev, newItinerary]);
      return true;
    } catch (error) {
      console.error("Error creating itinerary:", error);
      setErrorMessage(error.message || "Không thể tạo hành trình mới. Vui lòng thử lại!");
      return false;
    }
  };

  // Update existing itinerary
  const updateItinerary = async (id, itineraryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...itineraryData,
          location_ids: itineraryData.location_ids || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedItinerary = await response.json();
      setItineraries(prev => prev.map(itinerary =>
        itinerary.id === id ? updatedItinerary : itinerary
      ));
      return true;
    } catch (error) {
      console.error("Error updating itinerary:", error);
      setErrorMessage(error.message || "Không thể cập nhật hành trình. Vui lòng thử lại!");
      return false;
    }
  };

  // Delete itinerary
  const deleteItinerary = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setItineraries(prev => prev.filter(itinerary => itinerary.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      setErrorMessage(error.message || "Không thể xóa hành trình. Vui lòng thử lại!");
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hành trình này?")) {
      await deleteItinerary(id);
    }
  };

  // Handle save itinerary (create or update)
  const handleSaveItinerary = async () => {
    if (!newItinerary.tour_id.trim() || !newItinerary.title.trim()) {
      setErrorMessage("Vui lòng điền Tour ID và Tiêu đề!");
      return;
    }

    if (newItinerary.day_number < 1) {
      setErrorMessage("Số ngày phải lớn hơn 0!");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    let success = false;

    if (editingItinerary) {
      success = await updateItinerary(editingItinerary.id, newItinerary);
    } else {
      success = await createItinerary(newItinerary);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingItinerary(null);
      resetForm();
    }
    
    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewItinerary({
      tour_id: "",
      day_number: 1,
      title: "",
      description: "",
      location_ids: [],
    });
    setLocationInput("");
  };

  // Handle edit button click
  const handleEdit = (itinerary) => {
    setEditingItinerary(itinerary);
    setNewItinerary({
      tour_id: itinerary.tour_id || "",
      day_number: itinerary.day_number || 1,
      title: itinerary.title || "",
      description: itinerary.description || "",
      location_ids: Array.isArray(itinerary.locations) ? itinerary.locations.map(loc => loc.id) : [],
    });
    setSelectedLocations(Array.isArray(itinerary.locations) ? itinerary.locations.map(loc => loc.id) : []);
    setIsModalOpen(true);
    setDropdownOpenId(null);
    setErrorMessage("");
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingItinerary(null);
    resetForm();
    setSelectedLocations([]);
    setIsModalOpen(true);
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItinerary(null);
    resetForm();
  };

  // Thêm location vào lịch trình
  const addLocationsToItinerary = async (id, locationIds) => {
    const response = await fetch(`${API_BASE_URL}/${id}/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ location_ids: locationIds }),
    });
    // ...handle response...
  }

  // Xóa location khỏi lịch trình
  const removeLocationsFromItinerary = async (id, locationIds) => {
    const response = await fetch(`${API_BASE_URL}/${id}/locations`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ location_ids: locationIds }),
    });
    // ...handle response...
  }

  // Khi nhập tour_id, tự động lọc location
  useEffect(() => {
    if (!newItinerary.tour_id) {
      setFilteredLocations(allLocations);
      return;
    }
    // Giả sử bạn có danh sách tour hoặc API lấy tour theo id
    const fetchTour = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tours/${newItinerary.tour_id}`);
        if (!res.ok) return setFilteredLocations(allLocations);
        const data = await res.json();
        const tour = data.data || {};
        // Lọc location theo tour.location (ví dụ: Quảng Ninh)
        const matched = allLocations.filter(loc =>
          loc.name?.toLowerCase().includes((tour.location || '').toLowerCase())
        );
        setFilteredLocations(matched.length > 0 ? matched : allLocations);
      } catch {
        setFilteredLocations(allLocations);
      }
    };
    fetchTour();
  }, [newItinerary.tour_id, allLocations]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách hành trình...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Hành trình</h1>
          <p className="text-slate-600 mt-1">Quản lý chi tiết hành trình cho từng tour</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Hành trình
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
              {editingItinerary ? "Sửa Hành trình" : "Thêm Hành trình mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tour ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItinerary.tour_id}
                  onChange={(e) => setNewItinerary({ ...newItinerary, tour_id: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập ID của tour"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày thứ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newItinerary.day_number}
                  onChange={(e) => setNewItinerary({ ...newItinerary, day_number: parseInt(e.target.value) || 1 })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItinerary.title}
                  onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ví dụ: Ngày 1: Hà Nội - Hà Giang"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={newItinerary.description}
                  onChange={(e) => setNewItinerary({ ...newItinerary, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Mô tả chi tiết hoạt động trong ngày"
                />
              </div>

              {/* Locations Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chọn địa điểm</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value=""
                  onChange={e => {
                    const locId = e.target.value;
                    if (locId && !selectedLocations.includes(locId)) {
                      setSelectedLocations([...selectedLocations, locId]);
                      setNewItinerary({ ...newItinerary, location_ids: [...selectedLocations, locId] });
                    }
                  }}
                >
                  <option value="">-- Chọn địa điểm --</option>
                  {filteredLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name || loc.id}</option>
                  ))}
                </select>
                {/* Hiển thị danh sách location đã chọn */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedLocations.map((locId, idx) => {
                    const locObj = allLocations.find(l => l.id === locId);
                    return (
                      <span key={locId} className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                        {locObj ? locObj.name : locId}
                        <button type="button" className="ml-1 text-red-500" onClick={() => {
                          const updated = selectedLocations.filter(id => id !== locId);
                          setSelectedLocations(updated);
                          setNewItinerary({ ...newItinerary, location_ids: updated });
                        }}>×</button>
                      </span>
                    );
                  })}
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
                  onClick={handleSaveItinerary}
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
            placeholder="Tìm kiếm tour ID, tiêu đề, mô tả..."
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
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tiêu đề</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Mô tả</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentItineraries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  {searchTerm ? "Không tìm thấy hành trình phù hợp." : "Chưa có hành trình nào."}
                </td>
              </tr>
            ) : (
              currentItineraries.map((itinerary) => (
                <tr key={itinerary.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                      {typeof itinerary.id === 'string' ? itinerary.id.substring(0, 8) + '...' : itinerary.id}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {itinerary.tour_id}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Ngày {itinerary.day_number}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-xs">
                    <div className="truncate" title={itinerary.title}>
                      {itinerary.title}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 max-w-sm">
                    <div className="truncate" title={itinerary.description}>
                      {itinerary.description || "Không có mô tả"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 relative">
                    <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === itinerary.id}
                      onClick={() => toggleDropdown(itinerary.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {dropdownOpenId === itinerary.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg"
                      >
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleEdit(itinerary)}
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
                            onClick={() => handleDelete(itinerary.id)}
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

      {showToast && (
        <div style={{position: 'fixed', bottom: 32, right: 32, zIndex: 9999}} className="bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ItineraryManagementPage;