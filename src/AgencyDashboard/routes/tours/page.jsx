import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Check, ChevronDown, Upload, XCircle, Eye } from "lucide-react";
import Pagination from '../../components/Pagination';
import TourService from '../../../services/TourService';
import { uploadToCloudinary } from '../../../utils/cloudinary';

// Cloudinary config giống bên TourPage (admin)
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dilysnt/image/upload';
const UPLOAD_PRESET = 'unsigned';

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
    tour_type: "", // Thêm trường tour_type
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
  const [newDepartureDates, setNewDepartureDates] = useState(['']);
  const [pendingSave, setPendingSave] = useState(false);
  const userRole = localStorage.getItem('user_role') || 'agency'; // 'admin' hoặc 'agency'

  // Thêm state Toast ở đầu component
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
      } catch { }
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
    for (const file of files) {
      // ...upload lên Cloudinary...
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");
      const res = await fetch(`https://api.cloudinary.com/v1_1/dojbjbbjw/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setImages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(), // hoặc data.asset_id
            image_url: data.secure_url,
            is_main: prev.length === 0, // ảnh đầu tiên là chính
          }
        ]);
      }
    }
    setIsUploading(false);
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
      tour_type: "", // Thêm trường tour_type
    });
    setImages([]);
    setCurrentStep(1);
    setSelectedLocationId('');
    setSelectedDestinations([]);
    setNewDepartureDates(['']); // Reset ngày khởi hành
    setIsModalOpen(true);
  };
  const handleEditTour = async (tour) => {
    setEditingTour(tour);
    setLoading(true);
    try {
      // Chỉ cần gọi /complete, vì đã trả về đủ thông tin
      const complete = await fetch(`http://localhost:5000/api/tours/${tour.id}/complete`).then(r => r.json());
      // Kiểm tra booking xác nhận trong departureDates
      let hasConfirmedBooking = false;
      if (Array.isArray(complete.departureDates)) {
        for (const dep of complete.departureDates) {
          if (Array.isArray(dep.bookings) && dep.bookings.some(b => b.status === 'confirmed')) {
            hasConfirmedBooking = true;
            break;
          }
        }
      }
      setNewTour({
        id: complete.id,
        agency_id: complete.agency_id,
        name: complete.name || "",
        description: complete.description || "",
        destination_id: complete.destination_id || "",
        location_id: complete.location_id || "",
        departure_location: complete.departure_location || "",
        price: complete.price || 0,
        max_participants: complete.max_participants || 10,
        min_participants: complete.min_participants || 1,
        tour_type: complete.tour_type || "",
        included_service_ids: tourData.included_service_ids || [],
        excluded_service_ids: tourData.excluded_service_ids || [],
        category_ids: tourData.category_ids || [],
        hotel_ids: tourData.hotel_ids || [],
        selectedDestinations: Array.isArray(complete.destinations) ? complete.destinations.map(d => d.id) : [],
        images: complete.images || [],
        departureDates: complete.departureDates || [],
        hasConfirmedBooking,
      });
      setImages(complete.images || []);
      setSelectedLocationId(complete.location_id || "");
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
    setNewDepartureDates(['']); // Reset ngày khởi hành
  };

  // Save tour (add/edit)
  const handleSaveTour = async () => {
    // Nếu là admin tạo mới và newDepartureDates là mảng string, chuyển thành object rồi submit lại
    if (userRole === 'admin' && !editingTour && Array.isArray(newDepartureDates) && typeof newDepartureDates[0] === 'string') {
      setNewDepartureDates(newDepartureDates.map(date => ({ departure_date: date })));
      setPendingSave(true);
      return;
    }

    // Kiểm tra các trường bắt buộc
    const missingFields = [];
    if (!newTour.name) missingFields.push("Tên tour");
    if (!newTour.departure_location) missingFields.push("Điểm khởi hành");
    if (!newTour.destination_id) missingFields.push("Điểm đến");
    if (!newTour.tour_type) missingFields.push("Loại tour");
    if (images.length === 0) missingFields.push("Hình ảnh tour");
    if (userRole === 'admin' && (!newTour.agency_id || typeof newTour.agency_id !== 'string' || newTour.agency_id.trim() === '')) missingFields.push("Agency");

    // Kiểm tra ngày khởi hành hợp lệ chỉ với admin tạo mới
    let validDepartureDates = [];
    if (userRole === 'admin' && !editingTour) {
      validDepartureDates = newDepartureDates.filter(d => d && d.departure_date);
      if (validDepartureDates.length === 0) missingFields.push("Ngày khởi hành hợp lệ");
    }

    if (missingFields.length > 0) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc:\n" + missingFields.join(", "));
      return;
    }

    // Chuẩn bị dữ liệu gửi lên BE
    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    const locationName = selectedLocation ? selectedLocation.name : "";
    // Đảm bảo lấy đúng selectedDestinations và selectedHotels khi sửa hoặc tạo tour
    let selectedDestinationIds = [];
    let selectedHotelIds = [];
    if (Array.isArray(newTour.selectedDestinations) && newTour.selectedDestinations.length > 0) {
      selectedDestinationIds = newTour.selectedDestinations;
    } else if (Array.isArray(selectedDestinations) && selectedDestinations.length > 0) {
      selectedDestinationIds = selectedDestinations;
    }
    if (Array.isArray(newTour.selectedHotels) && newTour.selectedHotels.length > 0) {
      selectedHotelIds = newTour.selectedHotels;
    } else if (Array.isArray(hotelsByLocation) && hotelsByLocation.length > 0) {
      selectedHotelIds = hotelsByLocation.map(h => String(h.id_hotel || h.id));
    }
    const selectedDestinationNames = destinations
      .filter(dest => selectedDestinationIds.includes(dest.id))
      .map(dest => dest.name);
    const destinationString = selectedDestinationNames.join(', ');


    // Đảm bảo lấy đúng hotel_ids từ selectedHotels hoặc hotelsByLocation
    let hotelIds = [];
    if (Array.isArray(newTour.selectedHotels) && newTour.selectedHotels.length > 0) {
      hotelIds = newTour.selectedHotels;
    } else if (Array.isArray(hotelsByLocation) && hotelsByLocation.length > 0) {
      hotelIds = hotelsByLocation.map(h => String(h.id_hotel || h.id));
    }

    const body = {
      // Chỉ lấy các trường backend cần, KHÔNG spread ...newTour
      name: newTour.name,
      description: newTour.description,
      location: locationName,
      destination: destinationString,
      departure_location: newTour.departure_location,
      duration_days: newTour.duration_days,
      duration_nights: newTour.duration_nights,
      price: newTour.price,
      max_participants: newTour.max_participants,
      min_participants: newTour.min_participants,
      tour_type: newTour.tour_type,
      images: images.map(img => ({ image_url: img.image_url, is_main: img.is_main })),
      included_service_ids: newTour.selectedIncludedServices || [],
      category_ids: newTour.selectedCategories || [],
      hotel_ids: hotelIds,
      excluded_service_ids: Array.isArray(newTour.selectedExcludedServices) ? newTour.selectedExcludedServices : [],
      agency_id: userRole === 'admin' ? String(newTour.agency_id) : newTour.agency_id || localStorage.getItem('agency_id') || '1',
      departureDates: newTour.departure_date_ids || [],
    };
    if (editingTour) {
      body.status = typeof newTour.status === 'string' ? newTour.status : 'Chờ duyệt';
    }

    // DEBUG: In ra payload trước khi gửi để kiểm tra
    console.log('Payload gửi lên BE:', body);

    try {
      let newTourData;
      if (editingTour) {
        if (userRole === 'admin') {
          newTourData = await TourService.updateAdminTour(editingTour.id, body);
        } else {
          newTourData = await TourService.updateTour(editingTour.id, body);
        }
      } else {
        if (userRole === 'admin') {
          newTourData = await TourService.createAdminTour(body);
        } else {
          newTourData = await TourService.createTour(body);
        }
      }

      // Refresh tour list
      if (userRole === 'admin') {
        await fetchAdminTours(pagination.page, pagination.limit, filters);
      } else {
        await fetchTours();
      }

      // Thay alert bằng Toast
      setToastMessage(editingTour ? "Cập nhật tour thành công!" : "Tạo tour thành công!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      // Reset form
      setIsModalOpen(false);
      setCurrentStep(1);
      setImages([]);
      setSelectedLocationId('');
      setEditingTour(null);
      setNewTour({
        id: (Array.isArray(tours) ? tours.length : 0) + 1,
        agency_id: "1",
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
        departure_date_ids: [],
        tour_type: '',
        selectedDestinations: [],
      });
    } catch (error) {
      console.error('🔍 DEBUG: Error saving tour:', error);
      alert(error.message || "Có lỗi khi tạo/cập nhật tour!");
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
      await TourService.submitForApproval(id);
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
      {showToast && (
        <div style={{position: 'fixed', bottom: 32, right: 32, zIndex: 9999}} className="bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}
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
                              onClick={async () => {
                                // Kiểm tra thiếu ngày khởi hành hoặc hành trình
                                const missingFields = [];
                                // departureDates: mảng ngày khởi hành
                                if (!tour.departureDates || !Array.isArray(tour.departureDates) || tour.departureDates.length === 0) {
                                  missingFields.push('Ngày khởi hành');
                                }
                                // itinerary: trường mô tả hành trình, có thể là tour.itinerary hoặc tour.description
                                if (!tour.itinerary && !tour.description) {
                                  missingFields.push('Hành trình');
                                }
                                if (missingFields.length > 0) {
                                  setToastMessage('Vui lòng bổ sung: ' + missingFields.join(', '));
                                  setShowToast(true);
                                  setTimeout(() => setShowToast(false), 3000);
                                  return;
                                }
                                try {
                                  await TourService.submitForApproval(tour.id);
                                  fetchTours();
                                  setToastMessage('Đã gửi duyệt tour!');
                                  setShowToast(true);
                                  setTimeout(() => setShowToast(false), 3000);
                                } catch (err) {
                                  setToastMessage('Gửi duyệt thất bại!');
                                  setShowToast(true);
                                  setTimeout(() => setShowToast(false), 3000);
                                }
                              }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingTour ? "Sửa Tour" : "Tạo Tour mới"} - Bước {currentStep}
            </h2>
            <div className="flex-grow overflow-y-auto pr-4">
              <div>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loại tour</label>
                      <select
                        value={newTour.tour_type || ''}
                        onChange={e => setNewTour({ ...newTour, tour_type: e.target.value })}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">-- Chọn loại tour --</option>
                        <option value="Trong nước">Trong nước</option>
                        <option value="Nước ngoài">Nước ngoài</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Tour</label>
                        <input
                          type="text"
                          value={newTour.name}
                          onChange={e => setNewTour({ ...newTour, name: e.target.value })}
                          required
                          disabled={newTour.hasConfirmedBooking}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea
                          value={newTour.description}
                          onChange={e => setNewTour({ ...newTour, description: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Điểm đến</label>
                        <select
                          value={selectedLocationId}
                          onChange={e => {
                            setSelectedLocationId(e.target.value);
                            setNewTour(prev => ({ ...prev, destination_id: e.target.value, location_id: e.target.value }));
                          }}
                          required
                          className="w-full rounded-md border border-slate-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">-- Chọn điểm đến --</option>
                          {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700">Số ngày</label>
                        <input
                          type="number"
                          value={newTour.duration_days}
                          onChange={e => setNewTour({ ...newTour, duration_days: parseInt(e.target.value) || 1 })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div> */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700">Số đêm</label>
                        <input
                          type="number"
                          value={newTour.duration_nights}
                          onChange={e => setNewTour({ ...newTour, duration_nights: parseInt(e.target.value) || 0 })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div> */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Điểm khởi hành</label>
                        <input
                          type="text"
                          value={newTour.departure_location}
                          onChange={e => setNewTour({ ...newTour, departure_location: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Giá</label>
                        <input
                          type="number"
                          value={newTour.price}
                          onChange={e => setNewTour({ ...newTour, price: parseFloat(e.target.value) || 0 })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số lượng tối đa</label>
                        <input
                          type="number"
                          value={newTour.max_participants}
                          onChange={e => setNewTour({ ...newTour, max_participants: parseInt(e.target.value) || 1 })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số lượng tối thiểu</label>
                        <input
                          type="number"
                          value={newTour.min_participants}
                          onChange={e => setNewTour({ ...newTour, min_participants: parseInt(e.target.value) || 1 })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh Tour</label>
                      <div className="mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                        <div className="flex flex-col items-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-1 text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none hover:text-indigo-500"
                            >
                              <span>Upload ảnh</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                multiple
                                className="sr-only"
                                onChange={handleImageUpload}
                                accept="image/*"
                                ref={fileInputRef}
                              />
                            </label>
                            <span className="pl-1">hoặc kéo thả vào đây</span>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {images.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                              <img
                                src={image.image_url}
                                alt="Preview"
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100"
                              >
                                <XCircle size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(image.id)}
                                className={`px-2 py-1 text-xs rounded-full ${image.is_main ? 'bg-green-600 text-white' : 'bg-white text-gray-800 opacity-0 group-hover:opacity-100'}`}
                              >
                                {image.is_main ? 'Ảnh chính' : 'Đặt làm ảnh chính'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isUploading && (
                        <div className="mt-2 text-sm text-gray-500">
                          Đang upload ảnh, vui lòng chờ...
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* ...bước 2 giữ nguyên như cũ... */}
                {currentStep === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Danh mục Tour */}
                    <div className="bg-slate-50 rounded-lg p-4 shadow-sm">
                      <label className="block text-base font-semibold text-blue-700 mb-2">Danh mục Tour</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => setNewTour(prev => ({
                          ...prev,
                          selectedCategories: categories.map(c => c.id)
                        }))}
                      >
                        Chọn tất cả
                      </button>
                      <div className="flex flex-wrap gap-3">
                        {categories.map(category => (
                          <label key={category.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              value={category.id}
                              checked={Array.isArray(newTour.selectedCategories) && newTour.selectedCategories.includes(category.id)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setNewTour(prev => ({
                                  ...prev,
                                  selectedCategories: checked
                                    ? [...prev.selectedCategories, category.id]
                                    : prev.selectedCategories.filter(id => id !== category.id)
                                }));
                              }}
                              className="accent-blue-600 w-4 h-4 rounded"
                              disabled={newTour.hasConfirmedBooking}
                            />
                            <span>{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Khách sạn */}
                    <div className="bg-slate-50 rounded-lg p-4 shadow-sm">
                      <label className="block text-base font-semibold text-blue-700 mb-2">Khách sạn</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => setNewTour(prev => ({
                          ...prev,
                          selectedHotels: hotelsByLocation.map(h => String(h.id_hotel || h.id))
                        }))}
                      >
                        Chọn tất cả
                      </button>
                      <div className="flex flex-wrap gap-3">
                        {(hotelsByLocation.length > 0 ? hotelsByLocation : []).map(hotel => {
                          const value = String(hotel.id_hotel || hotel.id);
                          const checked = Array.isArray(newTour.selectedHotels) && newTour.selectedHotels.includes(value);
                          return (
                            <label key={value} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                value={value}
                                checked={checked}
                                onChange={e => {
                                  const { value, checked } = e.target;
                                  setNewTour(prev => ({
                                    ...prev,
                                    selectedHotels: checked
                                      ? [...prev.selectedHotels, value]
                                      : prev.selectedHotels.filter(id => id !== value)
                                  }));
                                }}
                                className="accent-blue-600 w-4 h-4 rounded"
                              />
                              <span>{hotel.ten_khach_san || hotel.hotel_name || hotel.name}</span>
                            </label>
                          );
                        })}
                        {selectedLocationId && hotelsByLocation.length === 0 && (
                          <span className="text-xs text-gray-500">Không có khách sạn nào cho địa điểm này.</span>
                        )}
                      </div>
                    </div>
                    {/* Dịch vụ bao gồm */}
                    <div className="bg-slate-50 rounded-lg p-4 shadow-sm">
                      <label className="block text-base font-semibold text-green-700 mb-2">Dịch vụ bao gồm</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200"
                        onClick={() => setNewTour(prev => ({
                          ...prev,
                          selectedIncludedServices: includedServices.map(s => s.id)
                        }))}
                      >
                        Chọn tất cả
                      </button>
                      <div className="flex flex-wrap gap-3">
                        {includedServices.map(service => (
                          <label key={service.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              value={service.id}
                              checked={Array.isArray(newTour.selectedIncludedServices) && newTour.selectedIncludedServices.includes(service.id)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setNewTour(prev => ({
                                  ...prev,
                                  selectedIncludedServices: checked
                                    ? [...prev.selectedIncludedServices, service.id]
                                    : prev.selectedIncludedServices.filter(id => id !== service.id)
                                }));
                              }}
                              className="accent-green-600 w-4 h-4 rounded"
                              disabled={newTour.hasConfirmedBooking}
                            />
                            <span>{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Dịch vụ loại trừ */}
                    <div className="bg-slate-50 rounded-lg p-4 shadow-sm">
                      <label className="block text-base font-semibold text-red-700 mb-2">Dịch vụ loại trừ</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                        onClick={() => setNewTour(prev => ({
                          ...prev,
                          selectedExcludedServices: excludedServices.map(s => s.id)
                        }))}
                      >
                        Chọn tất cả
                      </button>
                      <div className="flex flex-wrap gap-3">
                        {excludedServices.map(service => (
                          <label key={service.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              value={service.id}
                              checked={Array.isArray(newTour.selectedExcludedServices) && newTour.selectedExcludedServices.includes(service.id)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setNewTour(prev => ({
                                  ...prev,
                                  selectedExcludedServices: checked
                                    ? [...prev.selectedExcludedServices, service.id]
                                    : prev.selectedExcludedServices.filter(id => id !== service.id)
                                }));
                              }}
                              className="accent-red-600 w-4 h-4 rounded"
                              disabled={newTour.hasConfirmedBooking}
                            />
                            <span>{service.service_name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 shadow-sm col-span-2">
                      <label className="block text-base font-semibold text-indigo-700 mb-2">Địa điểm thuộc điểm đến đã chọn</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        onClick={() => {
                          const location = locations.find(loc => loc.id === selectedLocationId);
                          if (location && Array.isArray(location.destinations)) {
                            setSelectedDestinations(location.destinations.map(dest => dest.id));
                          }
                        }}
                      >
                        Chọn tất cả
                      </button>
                      {selectedLocationId ? (
                        <div className="flex flex-wrap gap-3">
                          {locations.find(loc => loc.id === selectedLocationId)?.destinations.map(dest => (
                            <label key={dest.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
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
                                className="accent-indigo-600 w-4 h-4 rounded"
                              />
                              <span>{dest.name}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">Hãy chọn điểm đến ở bước 1 để hiện địa điểm.</div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Quay lại
                </button>
              )}
              {currentStep < 2 && (
                <button
                  type="button"
                  onClick={() => {
                    // Validate các trường bắt buộc trước khi chuyển bước
                    const missingFields = [];
                    if (!newTour.name) missingFields.push("Tên tour");
                    if (!newTour.departure_location) missingFields.push("Điểm khởi hành");
                    if (!selectedLocationId) missingFields.push("Điểm đến");
                    if (!newTour.tour_type) missingFields.push("Loại tour");
                    if (images.length === 0) missingFields.push("Hình ảnh tour");
                    if (missingFields.length > 0) {
                      alert("Vui lòng nhập đầy đủ thông tin bắt buộc:\n" + missingFields.join(", "));
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Tiếp theo
                </button>
              )}
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleSaveTour}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Xác nhận
                </button>
              )}
            </div>
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