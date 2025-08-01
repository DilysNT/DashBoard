import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash, Loader2, X, MapPin, ChevronDown } from "lucide-react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import usePagination from "../../hooks/usePagination";
import Pagination from '../../components/Pagination';

const LocationManagementPage = () => {
  const [locations, setLocations] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    description: "",
    image_url: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/locations";
  const DESTINATIONS_API_URL = "http://localhost:5000/api/destinations";

  // Fetch destinations from API
  const fetchDestinations = async () => {
    try {
      const response = await fetch(DESTINATIONS_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDestinations(data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      // Don't show alert for destinations fetch error as it's not critical
    }
  };

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      alert("Không thể tải danh sách địa điểm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Load locations and destinations on component mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchLocations(), fetchDestinations()]);
    };
    
    initializeData();
  }, []);

  // Filter locations based on search term and selected destination
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const searchMatch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by destination if selected
      let destinationMatch = true;
      if (selectedDestination !== "all") {
        // Check if this location has any destinations that match the selected destination
        const locationDestinations = destinations.filter(dest => dest.location_id === location.id);
        if (selectedDestination === "with_destinations") {
          destinationMatch = locationDestinations.length > 0;
        } else if (selectedDestination === "without_destinations") {
          destinationMatch = locationDestinations.length === 0;
        }
      }
      
      return searchMatch && destinationMatch;
    });
  }, [locations, searchTerm, selectedDestination, destinations]);

  // Pagination hook
  const {
    currentData: pagedLocations,
    currentPage,
    totalPages,
    handlePageChange
  } = usePagination(
    filteredLocations,
    10
  );

  // Helper function to get destination count for a location
  const getDestinationCount = (locationId) => {
    return destinations.filter(dest => dest.location_id === locationId).length;
  };

  // Create new location
  const createLocation = async (locationData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newLocation = await response.json();
      setLocations(prev => [...prev, newLocation]);
      return true;
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Không thể tạo địa điểm mới. Vui lòng thử lại!");
      return false;
    }
  };

  // Update existing location
  const updateLocation = async (id, locationData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedLocation = await response.json();
      setLocations(prev => prev.map(location => 
        location.id === id ? updatedLocation : location
      ));
      return true;
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Không thể cập nhật địa điểm. Vui lòng thử lại!");
      return false;
    }
  };

  // Delete location
  const deleteLocation = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setLocations(prev => prev.filter(location => location.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Không thể xóa địa điểm. Vui lòng thử lại!");
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa điểm này?")) {
      await deleteLocation(id);
    }
  };

  // Handle save location (create or update)
  const handleSaveLocation = async () => {
    if (!newLocation.name.trim()) {
      alert("Vui lòng điền tên địa điểm!");
      return;
    }

    setSubmitting(true);
    let success = false;

    // Prepare data according to API schema
    const locationData = {
      name: newLocation.name,
      description: newLocation.description || null, // Send null if empty string
      image_url: newLocation.image_url || null // Send null if empty string
    };

    if (editingLocation) {
      success = await updateLocation(editingLocation.id, locationData);
    } else {
      success = await createLocation(locationData);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingLocation(null);
      resetForm();
    }
    
    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewLocation({
      name: "",
      description: "",
      image_url: "",
    });
    setImagePreview("");
    setUploadingImage(false);
  };

  // Handle edit button click
  const handleEdit = (location) => {
    setEditingLocation(location);
    setNewLocation({
      name: location.name,
      description: location.description || "",
      image_url: location.image_url || "",
    });
    setImagePreview(location.image_url || "");
    setIsModalOpen(true);
    setDropdownOpenId(null);
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingLocation(null);
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
    setEditingLocation(null);
    resetForm();
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB!");
      return;
    }

    setUploadingImage(true);
    try {
      // Create a preview first
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);
      setNewLocation(prev => ({ ...prev, image_url: imageUrl }));
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      setImagePreview(imageUrl);
      
      console.log('Image uploaded successfully:', imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Không thể tải ảnh lên. Vui lòng thử lại!");
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setNewLocation(prev => ({ ...prev, image_url: "" }));
    setImagePreview("");
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách địa điểm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Điểm đến</h1>
          <p className="text-slate-600 mt-1">Quản lý các điểm đến lịch</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Địa điểm
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tên hoặc mô tả địa điểm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={selectedDestination}
            onChange={(e) => setSelectedDestination(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả điểm đến</option>
            <option value="with_destinations">Có điểm đến</option>
            <option value="without_destinations">Không có điểm đến</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin" size={32} />
            <span className="ml-2 text-slate-600">Đang tải...</span>
          </div>
        ) : (
          <>
          <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên địa điểm</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Mô tả</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số điểm đến</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình ảnh</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pagedLocations.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy địa điểm phù hợp.
                </td>
              </tr>
            ) : (
              pagedLocations.map((location) => {
                const destinationCount = getDestinationCount(location.id);
                return (
                  <tr key={location.id} className="hover:bg-slate-100">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {location.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {location.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-700 max-w-xs">
                        <div className="truncate" title={location.description}>
                          {location.description || "Không có mô tả"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <div className="text-sm text-slate-900">
                          {destinationCount} điểm đến
                        </div>
                        {destinationCount === 0 && (
                          <span className="text-xs text-slate-500">(Chưa có)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {location.image_url ? (
                        <img 
                          src={location.image_url} 
                          alt={location.name}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-md flex items-center justify-center">
                          <span className="text-slate-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(location)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
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
        {/* Pagination controls */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingLocation ? "Sửa Địa điểm" : "Thêm Địa điểm mới"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveLocation(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập tên địa điểm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({ ...newLocation, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập mô tả về địa điểm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {uploadingImage && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="animate-spin" size={16} />
                    Đang tải ảnh...
                  </div>
                )}
                {imagePreview && (
                  <div className="mt-2 relative inline-block">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
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
                    editingLocation ? "Cập nhật" : "Thêm mới"
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

export default LocationManagementPage;