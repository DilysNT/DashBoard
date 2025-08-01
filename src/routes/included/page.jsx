import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react";

const IncludedServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [newService, setNewService] = useState({
    name: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/included-services";

  // Fetch included services from API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching included services:", error);
      setErrorMessage("Không thể tải danh sách dịch vụ bao gồm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Load services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    return services.filter(service =>
      service.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  // Create new included service
  const createService = async (serviceData) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const newService = await response.json();
      setServices(prev => [...prev, newService]);
      return true;
    } catch (error) {
      console.error("Error creating included service:", error);
      setErrorMessage(error.message || "Không thể tạo dịch vụ bao gồm mới. Vui lòng thử lại!");
      return false;
    }
  };

  // Update existing included service
  const updateService = async (id, serviceData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedService = await response.json();
      setServices(prev => prev.map(service =>
        service.id === id ? updatedService : service
      ));
      return true;
    } catch (error) {
      console.error("Error updating included service:", error);
      setErrorMessage(error.message || "Không thể cập nhật dịch vụ bao gồm. Vui lòng thử lại!");
      return false;
    }
  };

  // Delete included service
  const deleteService = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setServices(prev => prev.filter(service => service.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting included service:", error);
      setErrorMessage(error.message || "Không thể xóa dịch vụ bao gồm. Vui lòng thử lại!");
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ bao gồm này?")) {
      await deleteService(id);
    }
  };

  // Handle save service (create or update)
  const handleSaveService = async () => {
    if (!newService.name.trim()) {
      setErrorMessage("Vui lòng điền tên dịch vụ!");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    let success = false;

    if (editingService) {
      success = await updateService(editingService.id, newService);
    } else {
      success = await createService(newService);
    }

    if (success) {
      setIsModalOpen(false);
      setEditingService(null);
      resetForm();
    }

    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewService({
      name: "",
    });
    setErrorMessage("");
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setEditingService(service);
    setNewService({
      name: service.name || "",
    });
    setIsModalOpen(true);
    setDropdownOpenId(null);
    setErrorMessage("");
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingService(null);
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
    setEditingService(null);
    resetForm();
  };

  // Format UUID for display
  const formatId = (id) => {
    if (typeof id === 'string' && id.length > 8) {
      return id.substring(0, 8) + '...';
    }
    return id;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách dịch vụ bao gồm...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Dịch Vụ Bao Gồm</h1>
          <p className="text-slate-600 mt-1">Quản lý các dịch vụ bao gồm trong tour</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Dịch Vụ
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
              {editingService ? "Sửa Dịch Vụ Bao Gồm" : "Thêm Dịch Vụ Bao Gồm Mới"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Dịch Vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Ví dụ: Vé tham quan các điểm du lịch"
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
                  onClick={handleSaveService}
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
            placeholder="Tìm kiếm tên dịch vụ..."
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
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên Dịch Vụ</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-sm text-slate-500">
                  {searchTerm ? "Không tìm thấy dịch vụ bao gồm phù hợp." : "Chưa có dịch vụ bao gồm nào."}
                </td>
              </tr>
            ) : (
              filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded" title={service.id}>
                      {formatId(service.id)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 max-w-md">
                    <div className="truncate" title={service.name}>
                      {service.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 relative">
                    <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === service.id}
                      onClick={() => toggleDropdown(service.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {dropdownOpenId === service.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg"
                      >
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleEdit(service)}
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
                            onClick={() => handleDelete(service.id)}
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
    </div>
  );
};

export default IncludedServicesPage;