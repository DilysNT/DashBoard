import React, { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2, Upload, XCircle, Eye, X, ChevronDown } from "lucide-react";
import { uploadToCloudinary } from '../../utils/cloudinary';
import Pagination from '../../components/Pagination';

const DestinationManagementPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [newDestination, setNewDestination] = useState({
    name: "",
    location_id: "",
    image: "", // Changed back to 'image' to match backend schema
  });

  // State cho quản lý ảnh
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/destinations";
  const LOCATIONS_API_URL = "http://localhost:5000/api/locations";

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(LOCATIONS_API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint /api/locations không tồn tại. Vui lòng liên hệ admin để cấu hình backend.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setError(error.message);
    }
  };

  // Fetch destinations from API
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint /api/destinations không tồn tại. Vui lòng liên hệ admin để cấu hình backend.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Destinations data:", data);
      setDestinations(data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load destinations and locations on component mount
  useEffect(() => {
    const initializeData = async () => {
      fetchDestinations();
      fetchLocations();
    };
    
    initializeData();
  }, []);

  // Filter destinations based on search term and location
  const filteredDestinations = useMemo(() => {
    return destinations.filter(destination => {
      const searchMatch = destination.name.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = selectedLocation === "all" || destination.location_id === selectedLocation;
      return searchMatch && locationMatch;
    });
  }, [destinations, searchTerm, selectedLocation]);

  // Create new destination
  const createDestination = async (destinationData) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Creating destination with data:', destinationData);
      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(destinationData),
      });

      console.log('Create response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Create error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}. Response: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const newDestination = await response.json();
      console.log('Created destination:', newDestination);
      setDestinations(prev => [...prev, newDestination]);
      alert("Thêm điểm đến thành công!");
      return true;
    } catch (error) {
      console.error("Error creating destination:", error);
      setError(error.message);
      return false;
    }
  };

  // Update existing destination
  const updateDestination = async (id, destinationData) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Updating destination with ID:', id);
      console.log('Destination data:', destinationData);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(destinationData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}. Response: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const updatedDestination = await response.json();
      console.log('Updated destination:', updatedDestination);
      
      setDestinations(prev =>
        prev.map(destination =>
          destination.id === id ? updatedDestination : destination
        )
      );
      alert("Cập nhật điểm đến thành công!");
      return true;
    } catch (error) {
      console.error("Error updating destination:", error);
      setError(error.message);
      return false;
    }
  };

  // Delete destination
  const deleteDestination = async (id) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting destination with ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Delete error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
        } catch {
          errorMessage = `HTTP error! status: ${response.status}. Response: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      setDestinations(prev => prev.filter(destination => destination.id !== id));
      alert("Xóa điểm đến thành công!");
      return true;
    } catch (error) {
      console.error("Error deleting destination:", error);
      setError(error.message);
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa điểm đến này?")) {
      await deleteDestination(id);
    }
  };

  // Handle save destination (create or update)
  const handleSaveDestination = async () => {
    if (!newDestination.name.trim()) {
      alert("Vui lòng điền tên điểm đến!");
      return;
    }

    if (!newDestination.location_id) {
      alert("Vui lòng chọn địa điểm!");
      return;
    }

    setSubmitting(true);
    let success = false;

    // Prepare data according to API schema
    const destinationData = {
      name: newDestination.name,
      location_id: newDestination.location_id,
      image: newDestination.image || null // Send null if empty string
    };

    if (editingDestination) {
      success = await updateDestination(editingDestination.id, destinationData);
    } else {
      success = await createDestination(destinationData);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingDestination(null);
      resetForm();
    }
    
    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewDestination({
      name: "",
      location_id: "",
      image: "", // Changed back to 'image'
    });
    setImagePreview("");
    setUploadingImage(false);
  };

  // Handle edit button click
  const handleEdit = (destination) => {
    setEditingDestination(destination);
    setNewDestination({
      name: destination.name,
      location_id: destination.location_id || "",
      image: destination.image || destination.image_url || "", // Handle both field names for compatibility
    });
    setImagePreview(destination.image || destination.image_url || "");
    setIsModalOpen(true);
    setDropdownOpenId(null);
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingDestination(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
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
      setNewDestination(prev => ({ ...prev, image: imageUrl })); // Changed back to 'image'
      
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
    setNewDestination(prev => ({ ...prev, image: "" }));
    setImagePreview("");
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDestination(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách điểm đến...</span>
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
                  onClick={() => {
                    setError(null);
                    fetchDestinations();
                  }}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Điểm Đến</h1>
          <p className="text-slate-600 mt-1">Quản lý các điểm đến du lịch</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Điểm đến
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm điểm đến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc theo địa điểm"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả địa điểm</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedLocation === "all" ? (
              <span>Tổng cộng <strong>{filteredDestinations.length}</strong> điểm đến từ tất cả địa điểm</span>
            ) : (
              <span>
                <strong>{filteredDestinations.length}</strong> điểm đến từ địa điểm "
                <strong>{locations.find(loc => loc.id === selectedLocation)?.name}</strong>"
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Tổng: {destinations.length} điểm đến
          </div>
        </div>
      </div>

      {/* Destinations Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Điểm đến</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Địa điểm</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình ảnh</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredDestinations.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-sm text-slate-500">
                  {destinations.length === 0 
                    ? 'Không có điểm đến nào' 
                    : 'Không tìm thấy điểm đến phù hợp.'
                  }
                </td>
              </tr>
            ) : (
              filteredDestinations.map((destination) => {
                const location = locations.find(loc => loc.id === destination.location_id);
                // Handle both image and image_url fields for display
                const imageUrl = destination.image || destination.image_url;
                return (
                  <tr key={destination.id} className="hover:bg-slate-100">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {destination.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        ID: {destination.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-900">
                        {location ? location.name : 'Không xác định'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={destination.name}
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
                          onClick={() => handleEdit(destination)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <Edit size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(destination.id)}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingDestination ? "Sửa Điểm đến" : "Thêm Điểm đến mới"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveDestination(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Điểm đến <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDestination.name}
                  onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập tên điểm đến"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <select
                  value={newDestination.location_id}
                  onChange={(e) => setNewDestination({ ...newDestination, location_id: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Chọn địa điểm</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
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
                    editingDestination ? "Cập nhật" : "Thêm mới"
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

export default DestinationManagementPage;