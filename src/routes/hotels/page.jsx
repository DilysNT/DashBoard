import React, { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash, X, Loader2, ChevronDown, RotateCcw } from "lucide-react";
import usePagination from "../../hooks/usePagination";

const roomTypes = ["Standard", "Deluxe", "Suite", "Presidential"];

const HotelManagementPage = () => {
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]); // Thêm state lưu danh sách location
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    ten_khach_san: "",
    ten_phong: "",
    star_rating: 3,
    location_id: ""
  });
  const [selectedLocation, setSelectedLocation] = useState("all");

  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const searchMatch =
        hotel.ten_khach_san.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.ten_phong.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (hotel.loai_phong && hotel.loai_phong.toLowerCase().includes(searchTerm.toLowerCase()));
      const locationMatch =
        selectedLocation === "all" ||
        hotel.location_id === selectedLocation ||
        (hotel.location && hotel.location.id === selectedLocation);
      return searchMatch && locationMatch;
    });
  }, [hotels, searchTerm, selectedLocation]);

  // Pagination hook
  const {
    currentData: pagedHotels,
    currentPage,
    totalPages,
    handlePageChange
  } = usePagination(filteredHotels, 10);

  // API calls
  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/hotel-locations');
      if (response.ok) {
        const data = await response.json();
        setHotels(Array.isArray(data) ? data : (data.data || []));
      } else {
        setHotels([]);
      }
    } catch (error) {
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const createHotel = async (hotelData) => {
    try {
      const response = await fetch('http://localhost:5000/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });
      if (response.ok) {
        const newHotel = await response.json();
        const createdHotel = newHotel.data || newHotel;
        setHotels(prev => [...prev, createdHotel]);
        // Sau khi tạo, nếu có location_id thì gọi PUT để gán location
        if (hotelData.location_id) {
          await updateHotelLocation(createdHotel.id, hotelData.location_id);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const updateHotel = async (id, hotelData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hotels/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });
      if (response.ok) {
        const updatedHotel = await response.json();
        setHotels(hotels => hotels.map(hotel => hotel.id_hotel === id ? (updatedHotel.data || updatedHotel) : hotel));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const deleteHotel = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hotels/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHotels(hotels.filter(hotel => hotel.id_hotel !== id));
        return true;
      } else {
        console.error('Failed to delete hotel');
        alert('Không thể xóa khách sạn');
        return false;
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Lỗi kết nối server');
      return false;
    }
  };

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(Array.isArray(data) ? data : (data.data || []));
      } else {
        setLocations([]);
      }
    } catch (error) {
      setLocations([]);
    }
  };

  // Gán lại location cho hotel (nếu sửa location)
  const updateHotelLocation = async (id, location_id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hotel-locations/${id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location_id }),
      });
      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Load hotels on component mount
  useEffect(() => {
    fetchHotels();
  }, []);

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const openModal = (hotel = null) => {
    setEditingHotel(hotel);
    setFormData(hotel ? {
      ten_khach_san: hotel.ten_khach_san,
      ten_phong: hotel.ten_phong,
      star_rating: hotel.star_rating || 3,
      location_id: hotel.location_id || ""
    } : {
      ten_khach_san: "",
      ten_phong: "",
      star_rating: 3,
      location_id: ""
    });
    fetchLocations();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHotel(null);
    setFormData({
      ten_khach_san: "",
      ten_phong: "",
      star_rating: 3,
      location_id: ""
    });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.ten_khach_san.trim() || !formData.ten_phong.trim() || !formData.star_rating || !formData.location_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc và chọn địa điểm');
      return;
    }
    setSubmitting(true);
    let success = false;
    if (editingHotel) {
      const updateId = editingHotel.id || editingHotel.id_hotel;
      console.log('Update hotel with id:', updateId);
      success = await updateHotel(updateId, formData);
    } else {
      success = await createHotel(formData);
    }
    setSubmitting(false);
    if (success) {
      alert(editingHotel ? 'Cập nhật khách sạn thành công!' : 'Thêm khách sạn thành công!');
      closeModal();
    } else {
      alert('Có lỗi khi thêm/cập nhật khách sạn!');
    }
  };

  const handleDelete = async (id_hotel) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá khách sạn này?")) {
      await deleteHotel(id_hotel);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Khách sạn</h1>
          <p className="text-slate-600 mt-1">Quản lý các khách sạn trong tour</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchHotels}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <RotateCcw size={20} />}
            Làm mới
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus size={20} />
            Thêm Khách sạn
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {editingHotel ? 'Sửa khách sạn' : 'Thêm khách sạn mới'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách sạn *
                </label>
                <input
                  type="text"
                  value={formData.ten_khach_san}
                  onChange={(e) => setFormData({ ...formData, ten_khach_san: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên khách sạn"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên phòng *
                </label>
                <input
                  type="text"
                  value={formData.ten_phong}
                  onChange={(e) => setFormData({ ...formData, ten_phong: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập tên phòng"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số sao (1-5) *
                </label>
                <select
                  value={formData.star_rating}
                  onChange={e => setFormData({ ...formData, star_rating: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {[1,2,3,4,5].map(star => (
                    <option key={star} value={star}>{star} sao</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm *
                </label>
                <select
                  value={formData.location_id}
                  onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Chọn địa điểm</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {editingHotel ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <RotateCcw className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tên khách sạn, phòng hoặc loại phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả địa điểm</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên khách sạn</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên phòng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số sao</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Địa điểm</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pagedHotels.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy khách sạn phù hợp.
                </td>
              </tr>
            ) : (
              pagedHotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-mono">
                    {hotel.id ? hotel.id.substring(0, 8) + "..." : "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium">
                    {hotel.ten_khach_san}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {hotel.ten_phong}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      hotel.star_rating === 5 ? 'bg-purple-100 text-purple-800' :
                      hotel.star_rating === 4 ? 'bg-blue-100 text-blue-800' :
                      hotel.star_rating === 3 ? 'bg-green-100 text-green-800' :
                      hotel.star_rating === 2 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {hotel.star_rating} sao
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {hotel.location && hotel.location.name ? hotel.location.name : 'Chưa có'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(hotel)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hotel.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Xóa"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white disabled:opacity-50">&gt;</button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default HotelManagementPage;