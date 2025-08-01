import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Check, ChevronDown, Upload, XCircle, Eye } from "lucide-react";
import Pagination from '../../components/Pagination';
import TourService from '../../../services/TourService';
import axios from 'axios'; // Import axios

// Function upload ảnh lên Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default'); // Thay bằng upload preset của bạn
  
  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return {
      url: data.secure_url,
      public_id: data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Không thể upload ảnh lên Cloudinary');
  }
};

const ToursPageManagement = () => {
  // State giống admin
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [newTour, setNewTour] = useState({
    id: 1,
    agency_id: localStorage.getItem('agency_id') || "",
    name: "",
    description: "",
    destination_id: "",
    duration_days: 1,
    duration_nights: 0,
    departure_location: "",
    price: 0,
    max_participants: 10,
    min_participants: 1,
    status: "draft",
    selectedCategories: [],
    selectedHotels: [],
    selectedIncludedServices: [],
    selectedExcludedServices: [],
    departure_date_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [hotelsByLocation, setHotelsByLocation] = useState([]); // Thêm state lưu khách sạn theo location
  const [includedServices, setIncludedServices] = useState([]);
  const [excludedServices, setExcludedServices] = useState([]);
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [departureDates, setDepartureDates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedTourImages, setSelectedTourImages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  // Fetch options data (categories, hotels, services, destinations, departure dates) chỉ chạy 1 lần khi mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [inc, exc, htl, cat, dest, dep] = await Promise.all([
          fetch('http://localhost:5000/api/included-services').then(r => r.json()).catch(() => []),
          fetch('http://localhost:5000/api/excluded-services').then(r => r.json()).catch(() => []),
          fetch('http://localhost:5000/api/hotels').then(r => r.json()).catch(() => []),
          fetch('http://localhost:5000/api/tour-categories').then(r => r.json()).catch(() => []),
          fetch('http://localhost:5000/api/destinations').then(r => r.json()).catch(() => []),
          fetch('http://localhost:5000/api/departure-dates').then(r => r.json()).catch(() => []),
        ]);
        setIncludedServices(inc);
        setExcludedServices(exc);
        setHotels(htl);
        setCategories(cat);
        setDestinations(dest);
        setDepartureDates(dep);
      } catch {}
    };
    fetchOptions();
  }, []);

  // Khi mở modal, fetch locations từ API
  useEffect(() => {
    if (isModalOpen) {
      fetch('http://localhost:5000/api/locations')
        .then(res => res.json())
        .then(data => setLocations(data))
        .catch(() => setLocations([]));
    }
  }, [isModalOpen]);

  // Fetch tours (endpoint agency)
  const fetchTours = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Sử dụng service layer cho agency
      const data = await TourService.getAllTours(true); // true = isAgency
      setTours(Array.isArray(data) ? data : (data.tours || data.data || []));
    } catch (error) {
      setApiError('Không thể tải danh sách tour.');
      setTours([]);
    }
    setLoading(false);
  };
  useEffect(() => { fetchTours(); }, [selectedStatus]);

  // Filter, search, pagination
  const filteredTours = useMemo(() => {
    if (!Array.isArray(tours)) return [];
    return tours.filter(tour => {
      const searchMatch = tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) || tour.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = selectedStatus === "all" || tour.status === selectedStatus;
      return searchMatch && statusMatch;
    });
  }, [tours, searchTerm, selectedStatus]);
  const TOURS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(() => Math.ceil(filteredTours.length / TOURS_PER_PAGE), [filteredTours.length, TOURS_PER_PAGE]);
  const currentTours = useMemo(() => {
    const start = (currentPage - 1) * TOURS_PER_PAGE;
    return filteredTours.slice(start, start + TOURS_PER_PAGE);
  }, [filteredTours, currentPage, TOURS_PER_PAGE]);

  // Modal multi-step logic, upload image, set main, remove image
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      const newImages = [];
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        newImages.push({ file, image_url: previewUrl, is_main: false, id: Date.now() + Math.random().toString(36).substring(2, 9) });
      }
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      alert('Có lỗi khi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };
  const handleRemoveImage = (id) => setImages(images.filter(img => img.id !== id));
  const handleSetMainImage = (id) => setImages(images.map(img => ({ ...img, is_main: img.id === id })));

  // Modal open/close, reset form
  const handleAddNew = () => {
    setEditingTour(null);
    setNewTour({
      id: 1,
      agency_id: localStorage.getItem('agency_id') || "",
      name: "",
      description: "",
      destination_id: "",
      duration_days: 1,
      duration_nights: 0,
      departure_location: "",
      price: 0,
      max_participants: 10,
      min_participants: 1,
      status: "draft",
      selectedCategories: [],
      selectedHotels: [],
      selectedIncludedServices: [],
      selectedExcludedServices: [],
      departure_date_id: "",
    });
    setImages([]);
    setCurrentStep(1);
    setSelectedLocationId('');
    setSelectedDestinations([]);
    setIsModalOpen(true);
  };
  const handleEditTour = async (tour) => {
    setEditingTour(tour);
    setLoading(true);
    try {
      // 1. Lấy thông tin tổng hợp tour
      const [complete, departures, categories, includedServices, hotels, itineraries] = await Promise.all([
        fetch(`http://localhost:5000/api/tours/${tour.id}/complete`).then(r => r.json()),
        fetch(`http://localhost:5000/api/tours/${tour.id}/departures`).then(r => r.json()),
        fetch(`http://localhost:5000/api/tours/${tour.id}/categories`).then(r => r.json()),
        fetch(`http://localhost:5000/api/tours/${tour.id}/included-services`).then(r => r.json()),
        fetch(`http://localhost:5000/api/tours/${tour.id}/hotels`).then(r => r.json()),
        fetch(`http://localhost:5000/api/tours/${tour.id}/itineraries`).then(r => r.json()),
      ]);
      setNewTour({
        ...complete,
        selectedCategories: Array.isArray(categories) ? categories.map(c => c.id || c.category_id) : [],
        selectedHotels: Array.isArray(hotels) ? hotels.map(h => h.id || h.hotel_id) : [],
        selectedIncludedServices: Array.isArray(includedServices) ? includedServices.map(s => s.id || s.included_service_id) : [],
        selectedExcludedServices: Array.isArray(complete.excluded_services) ? complete.excluded_services.map(s => s.id || s.excluded_service_id) : [],
        selectedDestinations: Array.isArray(complete.destinations) ? complete.destinations.map(d => d.id) : [],
        price: complete.price || 0,
      });
      setImages(complete.images || []);
      setSelectedLocationId(complete.location_id); // <-- Thêm dòng này
      setSelectedDestinations(Array.isArray(complete.destinations) ? complete.destinations.map(d => d.id) : []);
      setCurrentStep(1);
      setIsModalOpen(true);
    } catch (err) {
      alert('Không thể tải thông tin chi tiết tour. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => { 
    setIsModalOpen(false); 
    setEditingTour(null); 
    setCurrentStep(1); 
    setImages([]); 
    setSelectedLocationId('');
    setSelectedDestinations([]);
  };

  // Save tour (add/edit)
  const handleSaveTour = async () => {
      // Validate
      if (!newTour.name || !newTour.price) {
      alert("Vui lòng nhập đầy đủ tên tour và giá!");
        return;
      }
    try {
      let tourId;
      if (editingTour) {
        // Sửa tour
        await TourService.updateTour(editingTour.id, newTour);
        tourId = editingTour.id;
      } else {
        // Thêm tour mới
        const created = await TourService.createTour(newTour);
        tourId = created.id;
      }
      // Chỉ upload ảnh mới (có file, chưa có public_id)
      const uploadPromises = images.filter(img => img.file && !img.public_id).map(async (image) => {
        const cloudinaryResult = await uploadToCloudinary(image.file);
        return {
          ...image,
          url: cloudinaryResult.url,
          public_id: cloudinaryResult.public_id
        };
      });
      const uploadedImages = await Promise.all(uploadPromises);
      const savePromises = uploadedImages.map(image => {
        const payload = {
          tour_id: tourId,
          image_url: image.url,
          public_id: image.public_id,
          is_main: image.is_main,
          width: image.width,
          height: image.height
        };
        return axios.post('http://localhost:5000/api/tour-images', payload);
      });
      await Promise.all(savePromises);
      closeModal();
      fetchTours();
    } catch (err) {
      alert("Có lỗi xảy ra khi lưu tour!");
    }
  };

  // Delete tour
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa tour này?")) return;
    setLoading(true);
    try {
      await TourService.deleteTour(id);
      fetchTours();
    } catch (err) {
      alert("Xóa tour thất bại!");
    }
    setLoading(false);
  };

  // Gửi duyệt tour
  const handleSendForApproval = async (id) => {
    setLoading(true);
    try {
      await TourService.updateTourStatus(id, "Chờ duyệt");
      fetchTours();
    } catch (err) {
      alert("Gửi duyệt thất bại!");
    }
    setLoading(false);
  };

  // Dropdown
  const toggleDropdown = (id) => setDropdownOpenId(dropdownOpenId === id ? null : id);

  // Fetch hotels by location khi chọn location ở bước 1
  useEffect(() => {
    if (selectedLocationId) {
      fetch(`http://localhost:5000/api/hotel-locations/location/${selectedLocationId}`)
        .then(res => res.json())
        .then(data => {
          const hotelsArr = data?.data?.hotels || [];
          setHotelsByLocation(hotelsArr);
        })
        .catch(() => setHotelsByLocation([]));
    } else {
      setHotelsByLocation([]);
    }
    // Reset selectedHotels khi đổi location
    setNewTour(prev => ({ ...prev, selectedHotels: [] }));
  }, [selectedLocationId]);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Tour</h1>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={20} /> Thêm Tour
        </button>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tên hoặc mô tả..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc trạng thái"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Ngừng hoạt động">Ngừng hoạt động</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình ảnh</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên Tour</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Mô tả</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Điểm đến</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Đêm</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Điểm khởi hành</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Giá</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số lượng tối đa</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số lượng tối thiểu</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {currentTours.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy tour phù hợp.
                </td>
              </tr>
            ) : (
              currentTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {tour.images && tour.images.length > 0 ? (
                      <div className="w-16 h-16 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                           onClick={() => setShowImageGallery(true)}>
                        <img
                          src={tour.images.find(img => img.is_main)?.image_url || tour.images[0].image_url}
                          alt={tour.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.description}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{destinations.find(d => d.id === tour.destination_id)?.name || ''}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.duration_days}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.duration_nights}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.departure_location}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.price != null ? tour.price.toLocaleString('vi-VN') + ' VNĐ' : 'N/A'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.max_participants}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.min_participants}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tour.status === "Đang hoạt động" ? "bg-green-100 text-green-800" :
                        tour.status === "Chờ duyệt" ? "bg-yellow-100 text-yellow-800" :
                          tour.status === "Đã hủy" ? "bg-red-100 text-red-800" :
                            tour.status === "Ngừng hoạt động" ? "bg-gray-100 text-gray-800" :
                              "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {tour.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative">
                      <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === tour.id}
                        onClick={() => toggleDropdown(tour.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                      {dropdownOpenId === tour.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg"
                      >
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleEditTour(tour)}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                          >
                            <Edit size={16} className="mr-2" /> Sửa
                          </button>
                        </li>
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleDelete(tour.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                          >
                            <Trash size={16} className="mr-2" /> Xóa
                          </button>
                        </li>
                        {/* Chỉ hiển thị 'Gửi duyệt' nếu tour chưa hoạt động */}
                        {tour.status !== 'Đang hoạt động' && (
                          <li>
                            <button
                              role="menuitem"
                              onClick={() => handleSendForApproval(tour.id)}
                              className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-slate-100 flex items-center"
                            >
                              <Check size={16} className="mr-2" /> Gửi duyệt
                            </button>
                          </li>
                        )}
                      </ul>
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTours.length}
          itemsPerPage={TOURS_PER_PAGE}
          onPageChange={setCurrentPage}
          showQuickJumper={true}
          showSizeChanger={false}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>
      {/* Modal multi-step giữ nguyên như cũ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              {editingTour ? "Sửa Tour" : "Thêm Tour"}
            </h2>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-700">Bước {currentStep} / 2</span>
                <div className="h-1 bg-slate-200 w-16 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${(currentStep - 1) * 100}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Tour</label>
                    <input type="text" value={newTour.name} onChange={e => setNewTour({ ...newTour, name: e.target.value })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                    <textarea value={newTour.description} onChange={e => setNewTour({ ...newTour, description: e.target.value })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Điểm đến</label>
                    <select
                      value={selectedLocationId}
                      onChange={e => {
                        setSelectedLocationId(e.target.value);
                        setNewTour(prev => ({ ...prev, destination_id: e.target.value, location_id: e.target.value }));
                        setSelectedDestinations([]); // reset khi đổi location
                      }}
                      className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn điểm đến --</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số ngày</label>
                    <input type="number" value={newTour.duration_days} onChange={e => setNewTour({ ...newTour, duration_days: parseInt(e.target.value) || 1 })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số đêm</label>
                    <input type="number" value={newTour.duration_nights} onChange={e => setNewTour({ ...newTour, duration_nights: parseInt(e.target.value) || 0 })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Điểm khởi hành</label>
                    <input type="text" value={newTour.departure_location} onChange={e => setNewTour({ ...newTour, departure_location: e.target.value })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Giá</label>
                    <input type="number" value={newTour.price} onChange={e => setNewTour({ ...newTour, price: parseFloat(e.target.value) || 0 })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng tối đa</label>
                    <input type="number" value={newTour.max_participants} onChange={e => setNewTour({ ...newTour, max_participants: parseInt(e.target.value) || 1 })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng tối thiểu</label>
                    <input type="number" value={newTour.min_participants} onChange={e => setNewTour({ ...newTour, min_participants: parseInt(e.target.value) || 1 })} className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hình ảnh Tour</label>
                    <div className="flex items-center gap-2">
                      {images.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          {[...images].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0)).map((img, idx) => (
                            <div key={img.id} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 flex flex-col items-center justify-center">
                              <img src={img.image_url} alt={img.file?.name || 'Ảnh tour'} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleSetMainImage(img.id)}
                                className={`absolute bottom-1 left-1 right-1 px-2 py-1 text-xs rounded-full ${img.is_main ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 border border-gray-300'}`}
                              >
                                {img.is_main ? 'Ảnh chính' : 'Đặt làm ảnh chính'}
                              </button>
                              <button
                                onClick={() => handleRemoveImage(img.id)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                title="Xóa ảnh"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label htmlFor="imageUpload" className="inline-flex items-center px-3 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <Upload size={16} className="mr-2" /> Chọn ảnh
                        <input
                          type="file"
                          id="imageUpload"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button
                    onClick={closeModal}
                    className="inline-flex items-center rounded-md bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!newTour.name || !newTour.description || !selectedLocationId || !newTour.duration_days || !newTour.duration_nights || !newTour.departure_location || !newTour.price || !newTour.max_participants || !newTour.min_participants || images.length === 0) {
                        alert('Vui lòng nhập đầy đủ thông tin và upload ít nhất 1 ảnh!');
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Tiếp theo
                  </button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                {/* Danh mục Tour */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Danh mục Tour</label>
                  <div className="flex flex-wrap gap-4">
                    {categories.map(category => (
                      <label key={category.id} className="inline-flex items-center gap-1 text-sm">
                        <input type="checkbox" value={category.id} checked={Array.isArray(newTour.selectedCategories) && newTour.selectedCategories.includes(category.id)} onChange={e => {
                          const checked = e.target.checked;
                          setNewTour(prev => ({
                            ...prev,
                            selectedCategories: checked ? [...prev.selectedCategories, category.id] : prev.selectedCategories.filter(id => id !== category.id)
                          }));
                        }} />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Khách sạn */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Khách sạn</label>
                  <div className="flex flex-wrap gap-4">
                    {(hotelsByLocation.length > 0 ? hotelsByLocation : []).map(hotel => (
                      <label key={hotel.id_hotel} className="inline-flex items-center gap-1 text-sm">
                        <input type="checkbox" value={hotel.id_hotel} checked={Array.isArray(newTour.selectedHotels) && newTour.selectedHotels.includes(hotel.id_hotel)} onChange={e => {
                          const checked = e.target.checked;
                          setNewTour(prev => ({
                            ...prev,
                            selectedHotels: checked ? [...prev.selectedHotels, hotel.id_hotel] : prev.selectedHotels.filter(id => id !== hotel.id_hotel)
                          }));
                        }} />
                        {hotel.ten_khach_san}
                      </label>
                    ))}
                    {selectedLocationId && hotelsByLocation.length === 0 && (
                      <span className="text-xs text-gray-500">Không có khách sạn nào cho địa điểm này.</span>
                    )}
                  </div>
                </div>
                {/* Dịch vụ bao gồm */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dịch vụ bao gồm</label>
                  <div className="flex flex-wrap gap-4">
                    {includedServices.map(service => (
                      <label key={service.id} className="inline-flex items-center gap-1 text-sm">
                        <input type="checkbox" value={service.id} checked={Array.isArray(newTour.selectedIncludedServices) && newTour.selectedIncludedServices.includes(service.id)} onChange={e => {
                          const checked = e.target.checked;
                          setNewTour(prev => ({
                            ...prev,
                            selectedIncludedServices: checked ? [...prev.selectedIncludedServices, service.id] : prev.selectedIncludedServices.filter(id => id !== service.id)
                          }));
                        }} />
                        {service.name}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Dịch vụ loại trừ */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dịch vụ loại trừ</label>
                  <div className="flex flex-wrap gap-4">
                    {excludedServices.map(service => (
                      <label key={service.id} className="inline-flex items-center gap-1 text-sm">
                        <input type="checkbox" value={service.id} checked={Array.isArray(newTour.selectedExcludedServices) && newTour.selectedExcludedServices.includes(service.id)} onChange={e => {
                          const checked = e.target.checked;
                          setNewTour(prev => ({
                            ...prev,
                            selectedExcludedServices: checked ? [...prev.selectedExcludedServices, service.id] : prev.selectedExcludedServices.filter(id => id !== service.id)
                          }));
                        }} />
                        {service.service_name}
                      </label>
                    ))}
                  </div>
                </div>
                {/* Địa điểm thuộc điểm đến đã chọn */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Địa điểm thuộc điểm đến đã chọn</label>
                  {selectedLocationId ? (
                    <div className="flex flex-wrap gap-4">
                      {locations.find(loc => loc.id === selectedLocationId)?.destinations.map(dest => (
                        <label key={dest.id} className="inline-flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            value={dest.id}
                            checked={selectedDestinations.includes(dest.id)}
                            onChange={e => {
                              const checked = e.target.checked;
                              setSelectedDestinations(prev =>
                                checked ? [...prev, dest.id] : prev.filter(id => id !== dest.id)
                              );
                            }}
                          />
                          {dest.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">Hãy chọn điểm đến ở bước 1 để hiện địa điểm.</div>
                  )}
                </div>
                <div className="flex justify-end mt-6 gap-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center rounded-md bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    Trở lại
                  </button>
                  <button
                    onClick={handleSaveTour}
                    className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Ảnh Tour</h2>
            <div className="grid grid-cols-4 gap-2">
              {selectedTourImages.length === 0 ? (
                <p className="text-center text-slate-500">Không có ảnh nào để hiển thị.</p>
              ) : (
                selectedTourImages.map(img => (
                  <div key={img.id} className="relative w-full h-32 rounded-md overflow-hidden">
                    <img
                      src={img.image_url}
                      alt={img.file.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSelectedTourImages(prev => prev.filter(i => i.id !== img.id))}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      title="Xóa ảnh"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowImageGallery(false)}
                className="inline-flex items-center rounded-md bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500"
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
export default ToursPageManagement;