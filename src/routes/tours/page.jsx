import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Edit, Trash, Check, X, ChevronLeft, ChevronRight, ChevronDown, Image, Upload, XCircle, Eye } from "lucide-react";
import axios from 'axios';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../../utils/cloudinary';
import ImageGallery from '../../components/ImageGallery';
import NotificationService from '../../services/NotificationService';
import TourService from '../../services/TourService';
import usePagination from "../../hooks/usePagination";
import Select from 'react-select';
import Pagination from '../../components/Pagination'; // Added Pagination import

const ToursPage = () => {
  const navigate = useNavigate();

  // Lấy role từ localStorage
  const userRole = localStorage.getItem('role');
  console.log('userRole:', userRole); // DEBUG

  // ======= KHAI BÁO STATE LUÔN Ở ĐẦU =======
  const [tours, setTours] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasNext: false, hasPrev: false, limit: 10 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [newTour, setNewTour] = useState({
    id: (Array.isArray(tours) ? tours.length : 0) + 1,
    agency_id: "1", // Assume current agency ID, adjust dynamically if needed
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
  });

  // State cho các quan hệ n-n
  const [categories, setCategories] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [includedServices, setIncludedServices] = useState([]);
  const [excludedServices, setExcludedServices] = useState([]);

  // Thêm trạng thái cho quản lý ảnh
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);

  // State cho ngày khởi hành và điểm đến
  const [departureDates, setDepartureDates] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedTourImages, setSelectedTourImages] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Thêm trạng thái cho quản lý agency
  const [agencies, setAgencies] = useState([]);
  const [newDepartureDates, setNewDepartureDates] = useState(['']);

  useEffect(() => {
    console.log('hotels:', hotels);
    console.log('excludedServices:', excludedServices);
  }, [hotels, excludedServices]);

  // Fetch tất cả dữ liệu options với ID đúng
  const fetchOptionsData = async () => {
    try {
      // Load danh sách options với ID đúng từ endpoints mới
      const [servicesRes, categoriesRes, hotelsRes, excludedServicesRes] = await Promise.all([
        fetch('http://localhost:5000/api/data/included-services').catch(() => null),
        fetch('http://localhost:5000/api/data/tour-categories').catch(() => null),
        fetch('http://localhost:5000/api/hotels').catch(() => null),
        fetch('http://localhost:5000/api/excluded-services').catch(() => null)
      ]);

      // Parse included services
      if (servicesRes?.ok) {
        const services = await servicesRes.json();
        setIncludedServices(services.map(service => ({
          included_service_id: service.id, // UUID string
          service_name: service.name
        })));
      } else {
        // Fallback data với string IDs
        setIncludedServices([
          { included_service_id: "inc-service-hdv", service_name: "Hướng dẫn viên" },
          { included_service_id: "inc-service-meals", service_name: "Ăn sáng" },
          { included_service_id: "inc-service-transport", service_name: "Xe đưa đón" },
        ]);
      }

      // Parse categories
      if (categoriesRes?.ok) {
        const categories = await categoriesRes.json();
        setCategories(categories.map(cat => ({
          category_id: cat.id, // UUID string
          category_name: cat.name
        })));
      } else {
        // Fallback data với string IDs
        setCategories([
          { category_id: "category-culture", category_name: "Tham quan văn hóa" },
          { category_id: "category-nature", category_name: "Thiên nhiên" },
          { category_id: "category-adventure", category_name: "Mạo hiểm" },
        ]);
      }

      // Parse hotels
      if (hotelsRes?.ok) {
        const hotelsData = await hotelsRes.json();
        setHotels(hotelsData);
      } else {
        // Fallback data với string IDs
        setHotels([
          { id_hotel: "hotel-dalat-a", hotel_name: "Khách sạn Đà Lạt A" },
          { id_hotel: "hotel-saigon-b", hotel_name: "Khách sạn Sài Gòn B" },
          { id_hotel: "hotel-hanoi-c", hotel_name: "Khách sạn Hà Nội C" },
        ]);
      }

      // Parse excluded services
      if (excludedServicesRes?.ok) {
        const excludedServicesData = await excludedServicesRes.json();
        setExcludedServices(excludedServicesData);
      } else {
        // Fallback data với string IDs
        setExcludedServices([
          { excluded_service_id: "exc-service-tip", service_name: "Tiền típ" },
          { excluded_service_id: "exc-service-insurance", service_name: "Bảo hiểm cá nhân" },
          { excluded_service_id: "exc-service-drinks", service_name: "Đồ uống" },
        ]);
      }

    } catch (error) {
      console.error('Error fetching options data:', error);
      // Use fallback data với string IDs
      setCategories([
        { category_id: "category-culture", category_name: "Tham quan văn hóa" },
        { category_id: "category-nature", category_name: "Thiên nhiên" },
        { category_id: "category-adventure", category_name: "Mạo hiểm" },
      ]);
      setHotels([
        { id_hotel: "hotel-dalat-a", hotel_name: "Khách sạn Đà Lạt A" },
        { id_hotel: "hotel-saigon-b", hotel_name: "Khách sạn Sài Gòn B" },
        { id_hotel: "hotel-hanoi-c", hotel_name: "Khách sạn Hà Nội C" },
      ]);
      setIncludedServices([
        { included_service_id: "inc-service-hdv", service_name: "Hướng dẫn viên" },
        { included_service_id: "inc-service-meals", service_name: "Ăn sáng" },
        { included_service_id: "inc-service-transport", service_name: "Xe đưa đón" },
      ]);
      setExcludedServices([
        { excluded_service_id: "exc-service-tip", service_name: "Tiền típ" },
        { excluded_service_id: "exc-service-insurance", service_name: "Bảo hiểm cá nhân" },
        { excluded_service_id: "exc-service-drinks", service_name: "Đồ uống" },
      ]);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    // Fetch tất cả options data với ID đúng
    fetchOptionsData();
  }, []);

  // Fetch ngày khởi hành, location, destination khi mở modal
  useEffect(() => {
    if (isModalOpen) {
      fetch('http://localhost:5000/api/departure-dates')
        .then(res => res.json())
        .then(data => setDepartureDates(data))
        .catch(() => setDepartureDates([]));

      // FETCH DỮ LIỆU ĐIỂM ĐẾN (destination)
      fetch('http://localhost:5000/api/destinations')
        .then(res => res.json())
        .then(data => setDestinations(data))
        .catch(() => setDestinations([]));

      // FETCH DỮ LIỆU LOCATION (nếu cần)
      fetch('http://localhost:5000/api/locations')
        .then(res => res.json())
        .then(data => setLocations(Array.isArray(data) ? data : (data.data || [])))
        .catch(() => setLocations([]));
    }
  }, [isModalOpen]);

  // Fetch agencies khi mở modal nếu là admin
  useEffect(() => {
    if (isModalOpen && userRole === 'admin') {
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/agencies', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
        .then(res => res.json())
        .then(data => setAgencies(Array.isArray(data) ? data : (data.data || [])))
        .catch(() => setAgencies([]));
    }
  }, [isModalOpen, userRole]);

  // Filtered tours
  const filteredTours = tours.filter(tour => {
    const searchMatch =
      tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tour.destination_id && tour.destination_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const statusMatch = selectedStatus === "all" || tour.status === selectedStatus;
    return searchMatch && statusMatch;
  });

  // Pagination hook
  const {
    currentData: pagedTours,
    currentPage,
    totalPages,
    handlePageChange
  } = usePagination(filteredTours, 10);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá tour này?")) {
      try {
        if (userRole === 'admin') {
          await TourService.deleteAdminTour(id);
        } else {
          await TourService.deleteTour(id);
        }
        // Fetch lại danh sách tours từ server để đảm bảo dữ liệu đồng bộ
        if (userRole === 'admin') {
          await fetchAdminTours(pagination.page, pagination.limit, filters);
        } else {
          await fetchTours();
        }
        alert("Xóa tour thành công!");
      } catch (error) {
        console.error("Error deleting tour:", error);
        alert("Có lỗi khi xóa tour. Vui lòng thử lại!");
      }
    }
  };

  // Sửa fetchTours để không chạy khi là admin
  const fetchTours = async () => {
    if (userRole === 'admin') return; // Không fetch nếu là admin!
    setLoading(true);
    setApiError(null);
    setUsingFallbackData(false);
    try {
      const data = selectedStatus === "all"
        ? await TourService.getAllTours()
        : await TourService.getToursByStatus(selectedStatus);
      setTours(Array.isArray(data) ? data : []);
      console.log(`Loaded ${data.length} tours`);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setApiError(error.message);
      setTours([]);
      setUsingFallbackData(true);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra trạng thái để hiển thị nút cho admin
  const canAdminApproveOrReject = (status) => {
    if (!status) return false;
    const normalized = status.toLowerCase().replace(/\s/g, '');
    return ["chờduyệt", "pending"].includes(normalized);
  };

  // Hàm xử lý duyệt/từ chối cho admin
  const handleToggleStatus = async (id, action) => {
    if (action === "approve" && !window.confirm("Bạn có chắc chắn muốn duyệt tour này?")) return;
    if (action === "reject" && !window.confirm("Bạn có chắc chắn muốn từ chối tour này?")) return;
    setLoading(true);
    try {
      if (userRole === 'admin') {
        if (action === 'approve') {
          await TourService.approveAdminTour(id);
          window.alert("Duyệt tour thành công!");
        } else if (action === 'reject') {
          const reason = prompt("Lý do từ chối (tùy chọn):");
          await TourService.rejectAdminTour(id, reason);
          window.alert("Từ chối tour thành công!");
        }
        await fetchAdminTours(pagination.page, pagination.limit, filters);
      } else {
        const newStatus = action === "approve" ? "Đang hoạt động" : "Đã hủy";
        await TourService.updateTourStatus(id, newStatus);
        await fetchTours();
      }
      // Gửi thông báo cho agency
      const tour = tours.find(t => t.id === id);
      if (tour) {
        if (action === "approve") {
          await NotificationService.notifyTourApproved({
            id: tour.id,
            name: tour.name,
            agency_id: tour.agency_id
          });
        } else if (action === "reject") {
          const reason = prompt("Lý do từ chối (tùy chọn):");
          await NotificationService.notifyTourRejected({
            id: tour.id,
            name: tour.name,
            agency_id: tour.agency_id
          }, reason);
        }
      }
    } catch (error) {
      window.alert(error.message || "Có lỗi khi cập nhật trạng thái tour!");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý upload ảnh - chỉ preview, chưa upload lên Cloudinary
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsUploading(true);
    try {
      const newImages = [];
      for (const file of files) {
        // Tạo preview URL để hiển thị ngay
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          file: file, // Lưu file để upload sau
          url: previewUrl, // URL preview tạm thời
          is_main: false,
          id: Date.now() + Math.random().toString(36).substring(2, 9)
        });
      }
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Có lỗi khi xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  // Cập nhật hàm xóa ảnh
  const handleRemoveImage = async (id, public_id) => {
    // Nếu là ảnh cũ đã upload (có public_id và id DB)
    if (public_id && id && typeof id === 'string') {
      try {
        await axios.delete(`http://localhost:5000/api/tour-images/${id}`);
        setImages(images.filter(img => img.id !== id));
      } catch (error) {
        alert('Lỗi khi xóa ảnh khỏi server!');
      }
    } else {
      // Ảnh mới (chưa upload)
      setImages(images.filter(img => img.id !== id));
    }
  };

  // Hàm đặt ảnh chính
  const handleSetMainImage = (id) => {
    setImages(images.map(img => ({ ...img, is_main: img.id === id })));
  };

  // Hàm xem ảnh tour
  const handleViewTourImages = (tour) => {
    // Giả sử tour có trường images, nếu không thì sử dụng ảnh mẫu
    const tourImages = tour.images || [
      {
        url: "https://res.cloudinary.com/dojbjbbjw/image/upload/v1/sample.jpg",
        is_main: true,
        id: "sample-1"
      }
    ];
    setSelectedTourImages(tourImages);
    setShowImageGallery(true);
  };

  // Hàm gửi ảnh lên máy chủ (khi submit form) - upload lên Cloudinary trước, sau đó lưu thông tin vào BE
  const saveImagesToServer = async (tourId) => {
    try {
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

      // Lưu thông tin ảnh mới vào backend
      const savePromises = uploadedImages.map(image => {
        const payload = {
          tour_id: tourId,
          image_url: image.url,
          public_id: image.public_id,
          is_main: image.is_main,
          width: image.width,
          height: image.height
        };
        console.log('Save image payload:', payload);
        return axios.post('http://localhost:5000/api/tour-images', payload);
      });
      await Promise.all(savePromises);
      console.log('Tất cả ảnh mới đã được upload lên Cloudinary và lưu vào database thành công');
    } catch (error) {
      console.error('Lỗi khi lưu ảnh:', error);
      throw error;
    }
  };

  // Hàm lưu tour mới hoặc cập nhật tour
  const [pendingSave, setPendingSave] = useState(false);

  useEffect(() => {
    // Khi pendingSave = true và newDepartureDates đã là object, gọi lại handleSaveTour
    if (pendingSave && userRole === 'admin' && !editingTour && Array.isArray(newDepartureDates) && typeof newDepartureDates[0] === 'object') {
      setPendingSave(false);
      handleSaveTour();
    }
  }, [newDepartureDates, pendingSave, userRole, editingTour]);

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
    if (userRole === 'admin' && !editingTour) {
      if (userRole === 'admin' && !editingTour && Array.isArray(newDepartureDates) && typeof newDepartureDates[0] === 'string') {
        setNewDepartureDates(newDepartureDates.map(date => ({ departure_date: date })));
        // return để chờ state cập nhật, sau đó submit lại
        return;
      }
    } else {
      if (!Array.isArray(newTour.departure_date_ids) || newTour.departure_date_ids.length === 0) {
        missingFields.push("Ngày khởi hành");
      }
    }
    if (images.length === 0) missingFields.push("Hình ảnh tour");
    if (userRole === 'admin' && (!newTour.agency_id || typeof newTour.agency_id !== 'string' || newTour.agency_id.trim() === '')) missingFields.push("Agency");

    // Kiểm tra ngày khởi hành hợp lệ
    let validDepartureDates = [];
    if (userRole === 'admin' && !editingTour) {
      validDepartureDates = newDepartureDates.filter(d => d && d.departure_date);
      if (validDepartureDates.length === 0) missingFields.push("Ngày khởi hành hợp lệ");
    } else {
      const depDatesArr = Array.isArray(departureDates.data) ? departureDates.data : [];
      validDepartureDates = depDatesArr.length
        ? (newTour.departure_date_ids || []).filter(id => {
          const match = depDatesArr.find(d =>
            d.id === id ||
            d.departure_date === id ||
            (d.departure_date && d.departure_date.slice(0, 10) === id)
          );
          return !!match;
        })
        : [];
      if (validDepartureDates.length === 0) missingFields.push("Ngày khởi hành hợp lệ");
    }

    if (missingFields.length > 0) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc:\n" + missingFields.join(", "));
      return;
    }

    // Chuẩn bị dữ liệu gửi lên BE
    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    const locationName = selectedLocation ? selectedLocation.name : "";
    const selectedDestinationNames = filteredDestinations
      .filter(dest => (newTour.selectedDestinations || []).includes(dest.id))
      .map(dest => dest.name);
    const destinationString = selectedDestinationNames.join(', ');

    const body = {
      ...newTour,
      location: locationName,
      destination: destinationString,
      departureDates: newTour.departure_date_ids || [],
      images: images.map(img => ({ image_url: img.url, is_main: img.is_main })),
      included_service_ids: newTour.selectedIncludedServices || [],
      category_ids: newTour.selectedCategories || [],
      hotel_ids: newTour.selectedHotels || [],
      excluded_service_ids: Array.isArray(newTour.selectedExcludedServices) ? newTour.selectedExcludedServices : [],
      agency_id: userRole === 'admin' ? String(newTour.agency_id) : newTour.agency_id || localStorage.getItem('agency_id') || '1',
    };

    // Xóa các trường không cần gửi lên BE
    delete body.selectedIncludedServices;
    delete body.selectedCategories;
    delete body.selectedHotels;
    delete body.departureDates;
    delete body.departure_date_id;
    delete body.location_id;
    delete body.destination_id;
    delete body.selectedDestinations;

    // Set status theo logic
    if (!editingTour) {
      body.status = userRole === 'admin' ? 'Đang hoạt động' : 'Chờ duyệt';
    } else {
      delete body.status; // Khi sửa, giữ nguyên status hiện tại
    }

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

      alert(editingTour ? "Cập nhật tour thành công!" : "Tạo tour thành công!");

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

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  // Validate ảnh và ngày khởi hành ở bước 1
  const handleNextStep = () => {
    // Đồng bộ ngày khởi hành cho admin
    let validDates = newTour.departure_date_ids;
    if (userRole === 'admin' && !editingTour) {
      validDates = newDepartureDates.filter(date => !!date);
    }

    // Log giá trị state để debug
    console.log('🟢 [handleNextStep] newTour:', newTour);
    console.log('🟢 [handleNextStep] validDates:', validDates);
    console.log('🟢 [handleNextStep] images:', images);

    // Kiểm tra các trường bắt buộc ở bước 1 trước khi chuyển sang bước 2
    const missingFields = [];
    if (!newTour.name) missingFields.push("Tên tour");
    if (!newTour.departure_location) missingFields.push("Điểm khởi hành");
    if (!newTour.destination_id) missingFields.push("Điểm đến");
    if (!newTour.tour_type) missingFields.push("Loại tour");
    if (!Array.isArray(validDates) || validDates.length === 0) {
      missingFields.push("Ngày khởi hành");
      console.log('🔴 [handleNextStep] LỖI: validDates bị thiếu hoặc rỗng', validDates);
    }
    if (images.length === 0) missingFields.push("Hình ảnh tour");
    if (userRole === 'admin' && !newTour.agency_id) missingFields.push("Agency");
    if (missingFields.length > 0) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc:\n" + missingFields.join(", "));
      return;
    }
    // Nếu là admin, cập nhật lại departure_date_ids trước khi sang bước 2
    if (userRole === 'admin' && !editingTour) {
      setNewTour(prev => ({
        ...prev,
        departure_date_ids: validDates
      }));
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleOpenModal = () => {
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
      price: 0, // KHỞI TẠO PRICE
      max_participants: 10,
      min_participants: 1,
      status: "draft",
      selectedCategories: [],
      selectedHotels: [],
      selectedIncludedServices: [],
      selectedExcludedServices: [],
      selectedDestinations: [],
      departure_date_ids: [],
      tour_type: '',
    });
    setCurrentStep(1); // Luôn bắt đầu từ bước 1 khi mở modal mới
    setIsModalOpen(true);
  };

  // Fetch thông tin chi tiết tour khi edit
  const fetchTourDetails = async (tourId) => {
    try {
      if (userRole === 'admin') {
        return await TourService.getAdminTourDetail(tourId);
      } else {
        return await TourService.getTourComplete(tourId);
      }
    } catch (error) {
      console.error('Error fetching tour details:', error);
      throw error;
    }
  };

  // Hàm chuyển dữ liệu chi tiết tour từ BE về đúng format cho form FE
  const mapTourDetailToFormState = (detailedTour) => {
    console.log('🔍 DEBUG: Raw detailedTour input:', detailedTour);

    // Handle các trường cơ bản
    const basicFields = {
      id: detailedTour.id,
      agency_id: detailedTour.agency_id || detailedTour.agency?.id || '',
      name: detailedTour.name || '',
      description: detailedTour.description || '',
      destination_id: detailedTour.destination_id || detailedTour.destination?.id || '',
      location_id: detailedTour.location_id || detailedTour.location?.id || '',
      duration_days: detailedTour.duration_days || 1,
      duration_nights: detailedTour.duration_nights || 0,
      departure_location: detailedTour.departure_location || '',
      price: detailedTour.price || 0,
      max_participants: detailedTour.max_participants || 10,
      min_participants: detailedTour.min_participants || 1,
      status: detailedTour.status || 'draft',
      tour_type: detailedTour.tour_type || '',
    };

    // Debug các mảng quan hệ
    console.log('🔍 DEBUG: detailedTour.categories:', detailedTour.categories);
    console.log('🔍 DEBUG: detailedTour.hotels:', detailedTour.hotels);
    console.log('🔍 DEBUG: detailedTour.includedServices:', detailedTour.includedServices);
    console.log('🔍 DEBUG: detailedTour.excludedServices:', detailedTour.excludedServices);
    console.log('🔍 DEBUG: detailedTour.destinations:', detailedTour.destinations);
    console.log('🔍 DEBUG: detailedTour.departureDates:', detailedTour.departureDates);

    // ✅ Handle multi-select fields với mapping BE structure
    const relationshipFields = {
      selectedCategories: Array.isArray(detailedTour.categories)
        ? detailedTour.categories.map(c => String(c.category_id || c.id || c))
        : [],
      selectedHotels: Array.isArray(detailedTour.hotels)
        ? detailedTour.hotels.map(h => String(h.id_hotel || h.hotel_id || h.id || h))
        : [],
      selectedIncludedServices: Array.isArray(detailedTour.includedServices)
        ? detailedTour.includedServices.map(s => String(s.included_service_id || s.service_id || s.id || s))
        : [],
      // ✅ Cải thiện mapping excludedServices để handle BE structure
      selectedExcludedServices: Array.isArray(detailedTour.excludedServices)
        ? detailedTour.excludedServices.map(s => String(
          s.TourExcludedService?.excluded_service_id || // Ưu tiên từ bảng liên kết
          s.excluded_service_id ||
          s.service_id ||
          s.id ||
          s
        ))
        : [],
      selectedDestinations: Array.isArray(detailedTour.destinations)
        ? detailedTour.destinations.map(d => String(d.destination_id || d.id || d))
        : [],
      departure_date_ids: Array.isArray(detailedTour.departureDates)
        ? detailedTour.departureDates.map(d => String(d.departure_date_id || d.id || d))
        : [],
    };

    const result = { ...basicFields, ...relationshipFields };

    console.log('🔍 DEBUG: Final mapped result:', result);
    console.log('🔍 DEBUG: selectedExcludedServices specifically:', result.selectedExcludedServices);

    return result;
  };
  const handleEditTour = async (tour) => {
    try {
      setLoading(true);
      console.log('🔍 DEBUG: Starting edit tour', tour);

      // Fetch thông tin chi tiết từ backend
      const detailedTour = await fetchTourDetails(tour.id);
      console.log('🔍 DEBUG: detailedTour from API', detailedTour);

      // Xử lý response data - có thể data nằm trong detailedTour.data hoặc trực tiếp detailedTour
      const tourData = detailedTour.data || detailedTour;
      console.log('🔍 DEBUG: actual tour data', tourData);

      const mappedFormState = mapTourDetailToFormState(tourData);
      console.log('🔍 DEBUG: mapped form state', mappedFormState);

      // Map dữ liệu về đúng format cho form FE
      setEditingTour(tourData);
      setNewTour(mappedFormState);

      // Set selectedLocationId để UI bước 2 hiện đúng destinations
      setSelectedLocationId(mappedFormState.location_id || '');

      // Load existing images nếu có
      if (tourData.images && tourData.images.length > 0) {
        const existingImages = tourData.images.map(img => ({
          id: img.id,
          url: img.image_url || img.url, // Handle different field names
          is_main: img.is_main,
          public_id: img.public_id
        }));
        console.log('🔍 DEBUG: existing images', existingImages);
        setImages(existingImages);
      } else {
        setImages([]);
      }

      setCurrentStep(1);
      setIsModalOpen(true);
    } catch (error) {
      console.error('🔍 DEBUG: Error loading tour details:', error);
      alert('Không thể tải thông tin chi tiết tour. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Sửa hàm getDestinationName để ưu tiên hiển thị tour.location, sau đó đến tour.destination, cuối cùng mới lookup theo id. Khi render bảng, truyền cả location, destination, destination_id vào getDestinationName.
  const getDestinationName = (destinationId, destinationName, location) => {
    if (location && location !== 'null') return location;
    if (destinationName && destinationName !== 'null') return destinationName;
    const destination = destinations.find(dest => dest.id === destinationId);
    return destination ? destination.name : "N/A";
  };

  // Lọc khách sạn theo location đã chọn
  const filteredHotels = useMemo(() => {
    if (!newTour.destination_id) return hotels;
    return hotels.filter(hotel => hotel.location_id === newTour.destination_id);
  }, [hotels, newTour.destination_id]);

  // Lọc destinations theo location đã chọn
  const filteredDestinations = useMemo(() => {
    const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
    return selectedLocation ? selectedLocation.destinations : [];
  }, [locations, selectedLocationId]);

  // Fetch tours cho admin (pagination BE)
  const fetchAdminTours = async (page = 1, limit = 10, filters = {}) => {
    console.log('DEBUG: fetchAdminTours CALLED', { page, limit, filters });
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      const data = await TourService.getAdminTours(params);
      console.log('DEBUG: fetchAdminTours DATA', data);
      setTours(data.tours || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, hasNext: false, hasPrev: false, limit: 10 });
      // Nếu không có dữ liệu ở trang hiện tại và đang ở trang > 1, tự động về trang 1
      if ((data.tours?.length === 0 || !data.tours) && (data.pagination?.page > 1)) {
        setPagination(prev => ({ ...prev, page: 1 }));
      }
    } catch (error) {
      console.error('DEBUG: fetchAdminTours ERROR', error);
      setTours([]);
      setPagination({ page: 1, totalPages: 1, hasNext: false, hasPrev: false, limit: 10 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('DEBUG: useEffect for fetchAdminTours', { userRole, pagination, filters });
    if (userRole === 'admin') {
      fetchAdminTours(pagination.page, pagination.limit, filters);
    } else {
      fetchTours();
    }
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, filters, userRole, selectedStatus]);

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Tour</h1>
          <p className="text-slate-600 mt-1">
            Quản lý các tour du lịch
            {usingFallbackData && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Dữ liệu mẫu
              </span>
            )}
          </p>
        </div>
        {/* Chỉ agency hoặc admin mới được thêm tour */}
        {(userRole === 'agency' || userRole === 'admin') && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus size={20} />
            Thêm Tour
          </button>
        )}
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Cảnh báo: Không thể kết nối đến máy chủ
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Lỗi: {apiError}</p>
                <p className="mt-1">Đang hiển thị dữ liệu mẫu. Vui lòng kiểm tra kết nối máy chủ và thử lại.</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchTours}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[90vh] shadow-2xl transform transition-all duration-300 ease-in-out flex flex-col">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingTour ? "Sửa Tour" : "Tạo Tour mới"} - Bước {currentStep}
            </h2>

            <div className="flex-grow overflow-y-auto pr-4">
              <div> {/* ✅ Thay form bằng div để tránh auto-submit */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {/* Nếu là admin thì cho chọn agency */}
                    {userRole === 'admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Chọn Agency</label>
                        <select
                          value={newTour.agency_id}
                          onChange={e => setNewTour({ ...newTour, agency_id: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="">-- Chọn agency --</option>
                          {agencies.map(agency => (
                            <option key={agency.id} value={agency.id}>{agency.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Thêm trường loại tour */}
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
                        <option value="Quốc tế">Quốc tế</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Tour</label>
                        <input
                          type="text"
                          value={newTour.name}
                          onChange={(e) => setNewTour({ ...newTour, name: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                        <textarea
                          value={newTour.description}
                          onChange={(e) => setNewTour({ ...newTour, description: e.target.value })}
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {userRole === 'admin' && !editingTour ? 'Nhập ngày khởi hành' : 'Ngày khởi hành'}
                        </label>

                        {userRole === 'admin' && !editingTour ? (
                          <div className="space-y-2">
                            {newDepartureDates.map((date, index) => (
                              <div key={index} className="flex gap-2 items-center">
                                <input
                                  type="date"
                                  value={date}
                                  onChange={e => {
                                    const inputDate = e.target.value;
                                    if (!inputDate) {
                                      // Cho phép xóa giá trị
                                      setNewDepartureDates(dates => dates.map((d, i) => i === index ? '' : d));
                                      return;
                                    }
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const sevenDaysFromNow = new Date(today);
                                    sevenDaysFromNow.setDate(today.getDate() + 7);
                                    const picked = new Date(inputDate);
                                    if (picked < sevenDaysFromNow) {
                                      alert('Vui lòng chọn ngày khởi hành ít nhất 7 ngày từ hôm nay!');
                                      return;
                                    }
                                    const updatedDates = [...newDepartureDates];
                                    updatedDates[index] = inputDate;
                                    setNewDepartureDates(updatedDates);
                                  }}
                                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                  required
                                />
                                {
                                  newDepartureDates.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedDates = newDepartureDates.filter((_, i) => i !== index);
                                        setNewDepartureDates(updatedDates);
                                      }}
                                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      Xóa
                                    </button>
                                  )
                                }
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setNewDepartureDates([...newDepartureDates, ''])}
                              className="mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              + Thêm ngày
                            </button>
                          </div>
                        ) : (
                          <Select
                            isMulti
                            options={departureDates.map(date => ({
                              value: date.id,
                              label: date.departure_date ? new Date(date.departure_date).toLocaleDateString('vi-VN') : date.id
                            }))}
                            value={
                              (newTour.departure_date_ids || [])
                                .map(id => {
                                  const found = departureDates.find(d => d.id === id);
                                  return found ? {
                                    value: found.id,
                                    label: found.departure_date ? new Date(found.departure_date).toLocaleDateString('vi-VN') : found.id
                                  } : null;
                                })
                                .filter(Boolean)
                            }
                            onChange={selected => {
                              setNewTour(prev => ({
                                ...prev,
                                departure_date_ids: selected ? selected.map(opt => opt.value) : []
                              }));
                            }}
                            placeholder="Chọn ngày khởi hành..."
                            className="min-w-[200px]"
                            classNamePrefix="react-select"
                            noOptionsMessage={() => 'Không có ngày khởi hành nào'}
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số ngày</label>
                        <input
                          type="number"
                          value={newTour.duration_days}
                          onChange={(e) => setNewTour({ ...newTour, duration_days: parseInt(e.target.value) || 1 })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số đêm</label>
                        <input
                          type="number"
                          value={newTour.duration_nights}
                          onChange={(e) => setNewTour({ ...newTour, duration_nights: parseInt(e.target.value) || 0 })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Điểm khởi hành</label>
                        <input
                          type="text"
                          value={newTour.departure_location}
                          onChange={(e) => setNewTour({ ...newTour, departure_location: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Giá</label> {/* THÊM TRƯỜNG GIÁ */}
                        <input
                          type="number"
                          value={newTour.price}
                          onChange={(e) => setNewTour({ ...newTour, price: parseFloat(e.target.value) || 0 })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số lượng tối đa</label>
                        <input
                          type="number"
                          value={newTour.max_participants}
                          onChange={(e) => setNewTour({ ...newTour, max_participants: parseInt(e.target.value) || 1 })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số lượng tối thiểu</label>
                        <input
                          type="number"
                          value={newTour.min_participants}
                          onChange={(e) => setNewTour({ ...newTour, min_participants: parseInt(e.target.value) || 1 })}
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
                                onChange={async (e) => {
                                  const files = Array.from(e.target.files);
                                  setIsUploading(true);
                                  try {
                                    for (const file of files) {
                                      // Tạo preview trước
                                      const previewUrl = URL.createObjectURL(file);
                                      // Upload lên Cloudinary
                                      const imageUrl = await uploadToCloudinary(file);
                                      setImages(prev => [
                                        ...prev,
                                        {
                                          url: imageUrl,
                                          is_main: prev.length === 0, // Ảnh đầu tiên là ảnh chính
                                          id: Date.now() + Math.random().toString(36).substring(2, 9),
                                          previewUrl
                                        }
                                      ]);
                                      // Xóa preview local sau khi upload xong
                                      URL.revokeObjectURL(previewUrl);
                                    }
                                  } catch (error) {
                                    alert('Có lỗi khi upload ảnh. Vui lòng thử lại!');
                                  } finally {
                                    setIsUploading(false);
                                  }
                                }}
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
                                src={image.url}
                                alt="Preview"
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(image.id, image.public_id)}
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

                {currentStep === 2 && (
                  <div className="grid grid-cols-1 gap-6">
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục Tour</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => {
                          const allIds = categories.map(c => String(c.category_id || c.id));
                          const isAllSelected = allIds.every(id => newTour.selectedCategories.includes(id));
                          setNewTour(prev => ({
                            ...prev,
                            selectedCategories: isAllSelected ? [] : allIds,
                          }));
                        }}
                      >
                        {categories.length && categories.every(c => newTour.selectedCategories.includes(String(c.category_id || c.id)))
                          ? "Bỏ chọn tất cả"
                          : "Chọn tất cả"}
                      </button>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((category) => {
                          const value = String(category.category_id || category.id);
                          if (!value || value === 'undefined') return null;
                          const checked = newTour.selectedCategories.includes(value);
                          return (
                            <div key={value} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`category-${value}`}
                                value={value}
                                checked={checked}
                                onChange={(e) => {
                                  const { value, checked } = e.target;
                                  setNewTour((prev) => ({
                                    ...prev,
                                    selectedCategories: checked
                                      ? [...prev.selectedCategories, value]
                                      : prev.selectedCategories.filter((id) => id !== value),
                                  }));
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <label htmlFor={`category-${value}`} className="ml-2 text-sm text-gray-700">
                                {category.category_name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Khách sạn</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => {
                          const allIds = filteredHotels.map(h => String(h.id_hotel || h.id));
                          const isAllSelected = allIds.every(id => newTour.selectedHotels.includes(id));
                          setNewTour(prev => ({
                            ...prev,
                            selectedHotels: isAllSelected ? [] : allIds,
                          }));
                        }}
                      >
                        {filteredHotels.length && filteredHotels.every(h => newTour.selectedHotels.includes(String(h.id_hotel || h.id)))
                          ? "Bỏ chọn tất cả"
                          : "Chọn tất cả"}
                      </button>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {filteredHotels.map((hotel) => {
                          const value = String(hotel.id_hotel || hotel.id);
                          if (!value || value === 'undefined') return null;
                          const checked = newTour.selectedHotels.includes(value);
                          return (
                            <div key={value} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`hotel-${value}`}
                                value={value}
                                checked={checked}
                                onChange={(e) => {
                                  const { value, checked } = e.target;
                                  setNewTour((prev) => ({
                                    ...prev,
                                    selectedHotels: checked
                                      ? [...prev.selectedHotels, value]
                                      : prev.selectedHotels.filter((id) => id !== value),
                                  }));
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <label htmlFor={`hotel-${value}`} className="ml-2 text-sm text-gray-700">
                                {hotel.ten_khach_san || hotel.hotel_name || hotel.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ bao gồm</label>
                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => {
                          const allIds = includedServices.map(s => String(s.included_service_id || s.id));
                          const isAllSelected = allIds.every(id => newTour.selectedIncludedServices.includes(id));
                          setNewTour(prev => ({
                            ...prev,
                            selectedIncludedServices: isAllSelected ? [] : allIds,
                          }));
                        }}
                      >
                        {includedServices.length && includedServices.every(s => newTour.selectedIncludedServices.includes(String(s.included_service_id || s.id)))
                          ? "Bỏ chọn tất cả"
                          : "Chọn tất cả"}
                      </button>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {includedServices.map((service) => {
                          const value = String(service.included_service_id || service.id);
                          if (!value || value === 'undefined') return null;
                          const checked = newTour.selectedIncludedServices.includes(value);
                          return (
                            <div key={value} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`included-service-${value}`}
                                value={value}
                                checked={checked}
                                onChange={(e) => {
                                  const { value, checked } = e.target;
                                  setNewTour((prev) => ({
                                    ...prev,
                                    selectedIncludedServices: checked
                                      ? [...prev.selectedIncludedServices, value]
                                      : prev.selectedIncludedServices.filter((id) => id !== value),
                                  }));
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <label htmlFor={`included-service-${value}`} className="ml-2 text-sm text-gray-700">
                                {service.service_name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ loại trừ</label>

                      {/* ✅ Debug info */}
                      {excludedServices.length === 0 && (
                        <div className="text-red-500 text-xs mb-2">
                          Không có dữ liệu excluded services từ API
                        </div>
                      )}

                      <button
                        type="button"
                        className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={() => {
                          const allIds = excludedServices.map(s => String(s.excluded_service_id || s.id));
                          const isAllSelected = allIds.every(id => (newTour.selectedExcludedServices || []).includes(id));
                          setNewTour(prev => ({
                            ...prev,
                            selectedExcludedServices: isAllSelected ? [] : allIds,
                          }));
                        }}
                      >
                        {excludedServices.length && excludedServices.every(s => (newTour.selectedExcludedServices || []).includes(String(s.excluded_service_id || s.id)))
                          ? "Bỏ chọn tất cả"
                          : "Chọn tất cả"}
                      </button>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {excludedServices.map((service) => {
                          const value = String(service.excluded_service_id || service.id);
                          if (!value || value === 'undefined') return null; // ✅ Null check
                          const checked = (newTour.selectedExcludedServices || []).includes(value);

                          // ✅ Debug log
                          console.log('🔍 DEBUG excluded service render:', { service, value, checked });

                          return (
                            <div key={value} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`excluded-service-${value}`}
                                value={value}
                                checked={checked}
                                onChange={(e) => {
                                  const { value, checked } = e.target;
                                  console.log('🔍 DEBUG excluded service change:', { value, checked });
                                  setNewTour((prev) => ({
                                    ...prev,
                                    selectedExcludedServices: checked
                                      ? [...(prev.selectedExcludedServices || []), value]
                                      : (prev.selectedExcludedServices || []).filter((id) => id !== value),
                                  }));
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <label htmlFor={`excluded-service-${value}`} className="ml-2 text-sm text-gray-700">
                                {service.service_name || service.name}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bước 2: UI chọn destination (checkbox, lấy từ selectedLocation.destinations) */}
                    {currentStep === 2 && (
                      <div className="col-span-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa điểm tham quan (destination)
                          {/* ✅ Thêm thông tin debug */}
                          <span className="text-xs text-gray-500">
                            (Đã chọn: {newTour.selectedDestinations?.length || 0}/{filteredDestinations.length})
                          </span>
                        </label>

                        {/* ✅ Thêm nút chọn tất cả */}
                        {filteredDestinations.length > 0 && (
                          <button
                            type="button"
                            className="mb-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                            onClick={() => {
                              const allIds = filteredDestinations.map(d => String(d.id));
                              const isAllSelected = allIds.every(id => newTour.selectedDestinations?.includes(id));
                              setNewTour(prev => ({
                                ...prev,
                                selectedDestinations: isAllSelected ? [] : allIds,
                              }));
                            }}
                          >
                            {filteredDestinations.every(d => newTour.selectedDestinations?.includes(String(d.id)))
                              ? "Bỏ chọn tất cả"
                              : "Chọn tất cả"}
                          </button>
                        )}

                        {/* ✅ Thông báo nếu chưa chọn location */}
                        {filteredDestinations.length === 0 && (
                          <div className="text-sm text-gray-500 italic mb-2">
                            Vui lòng chọn điểm đến ở bước 1 để hiển thị địa điểm tham quan
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {filteredDestinations.map(dest => {
                            const value = String(dest.id);
                            const checked = newTour.selectedDestinations?.includes(value);

                            // ✅ Debug log
                            console.log('🔍 DEBUG destination:', { dest, value, checked });

                            return (
                              <div key={value} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`destination-${value}`}
                                  value={value}
                                  checked={checked}
                                  onChange={e => {
                                    const { value, checked } = e.target;
                                    console.log('🔍 DEBUG destination change:', { value, checked });
                                    setNewTour(prev => ({
                                      ...prev,
                                      selectedDestinations: checked
                                        ? [...(prev.selectedDestinations || []), value]
                                        : (prev.selectedDestinations || []).filter(id => id !== value)
                                    }));
                                  }}
                                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor={`destination-${value}`} className="ml-2 text-sm text-gray-700">
                                  {dest.name}
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setEditingTour(null); setCurrentStep(1); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Quay lại
                </button>
              )}
              {currentStep < 2 && (
                <button
                  type="button" // ✅ Đảm bảo là button, không phải submit
                  onClick={handleNextStep} // ✅ Chỉ gọi handleNextStep
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Tiếp theo
                </button>
              )}
              {currentStep === 2 && (
                <button
                  type="button" // ✅ Chỉ bước 2 mới có thể submit
                  onClick={handleSaveTour} // ✅ Chỉ gọi handleSaveTour ở bước 2
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {userRole === 'admin' ? (editingTour ? 'Cập nhật' : 'Thêm Tour') : (editingTour ? 'Cập nhật' : 'Gửi duyệt')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter controls cho admin */}
      {userRole === 'admin' && (
        <div className="filters flex gap-2 mb-4">
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đang hoạt động">Đang hoạt động</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="border rounded px-2 py-1"
          />
        </div>
      )}

      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên tour</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Điểm đến</th>
             <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời lượng</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Giá</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredTours.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy tour phù hợp.
                </td>
              </tr>
            ) : (
              filteredTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium">{tour.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {getDestinationName(tour.destination_id, tour.destination, tour.location)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.duration_days} ngày {tour.duration_nights} đêm</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{tour.price?.toLocaleString('vi-VN')} ₫</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${tour.status === "Đang hoạt động" ? "bg-green-100 text-green-800" :
                        tour.status === "Chờ duyệt" ? "bg-yellow-100 text-yellow-800" :
                          tour.status === "Đã hủy" ? "bg-red-100 text-red-800" :
                            tour.status === "Ngừng hoạt động" ? "bg-gray-100 text-gray-800" :
                              tour.status === "Từ chối" ? "bg-red-100 text-red-800" :
                                "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {tour.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative">
                    <div className="relative">
                      <button
                        type="button"
                        className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 flex items-center"
                        onClick={() => toggleDropdown(tour.id)}
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      {dropdownOpenId === tour.id && (
                        <ul className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-10">
                          <li>
                            <button
                              role="menuitem"
                              onClick={() => handleViewTourImages(tour)}
                              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                            >
                              <Eye size={16} className="mr-2" /> Xem ảnh
                            </button>
                          </li>
                          {/* Sửa tour: agency hoặc admin đều được sửa, admin luôn thấy */}
                          {(userRole === 'agency' || userRole === 'admin') && (
                            <li>
                              <button
                                role="menuitem"
                                onClick={() => handleEditTour(tour)}
                                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                              >
                                <Edit size={16} className="mr-2" /> Sửa
                              </button>
                            </li>
                          )}
                          {/* Xóa tour: chỉ agency được xóa */}
                          {userRole === 'agency' && (
                            <>
                              <li>
                                <hr className="border-slate-200" />
                                <button
                                  role="menuitem"
                                  onClick={() => handleDelete(tour.id)}
                                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                                >
                                  <Trash size={16} className="mr-2" /> Xóa
                                </button>
                              </li>
                            </>
                          )}
                          {/* Gửi duyệt: chỉ agency, trạng thái là draft/chờ duyệt */}
                          {userRole === 'admin' && canAdminApproveOrReject(tour.status) && (
                            <>
                              <li>
                                <button
                                  role="menuitem"
                                  onClick={() => handleToggleStatus(tour.id, "approve")}
                                  className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-slate-100 flex items-center"
                                >
                                  <Check size={16} className="mr-2" /> Duyệt
                                </button>
                              </li>
                              <li>
                                <button
                                  role="menuitem"
                                  onClick={() => handleToggleStatus(tour.id, "reject")}
                                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                                >
                                  <XCircle size={16} className="mr-2" /> Từ chối
                                </button>
                              </li>
                            </>
                          )}
                        </ul>

                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination controls cho admin */}
        {userRole === 'admin' && pagination.totalPages > 1 && filteredTours.length > 0 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={page => setPagination(p => ({ ...p, page }))}
            />
          </div>
        )}
      </div>

      {loading && <div className="text-center text-blue-600 py-2">Đang tải...</div>}

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <ImageGallery
          images={selectedTourImages}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  );
};

export default ToursPage;
