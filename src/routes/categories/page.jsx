import React, { useState, useEffect, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash, Loader2, X } from "lucide-react";
import { uploadToCloudinary } from '../../utils/cloudinary';
import usePagination from "../../hooks/usePagination";
import Pagination from '../../components/Pagination';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    image: "",
  });

  // State cho quản lý ảnh
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/tour-categories";

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Không thể tải danh sách danh mục. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered categories
  const filteredCategories = categories.filter(category => {
    return category.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination hook
  const {
    currentData: pagedCategories,
    currentPage,
    totalPages,
    handlePageChange
  } = usePagination(filteredCategories, 10);

  // Create new category
  const createCategory = async (categoryData) => {
    try {
      console.log('Creating category with data:', categoryData);
      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
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

      const newCategory = await response.json();
      console.log('Created category:', newCategory);
      setCategories(prev => [...prev, newCategory]);
      alert("Thêm danh mục thành công!");
      return true;
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Không thể tạo danh mục mới. Vui lòng thử lại!");
      return false;
    }
  };

  // Update existing category
  const updateCategory = async (id, categoryData) => {
    try {
      console.log('Updating category with ID:', id);
      console.log('Category data:', categoryData);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
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

      const updatedCategory = await response.json();
      console.log('Updated category:', updatedCategory);
      
      setCategories(prev =>
        prev.map(category =>
          category.id === id ? updatedCategory : category
        )
      );
      alert("Cập nhật danh mục thành công!");
      return true;
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Không thể cập nhật danh mục. Vui lòng thử lại!");
      return false;
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      console.log('Deleting category with ID:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
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

      setCategories(prev => prev.filter(category => category.id !== id));
      alert("Xóa danh mục thành công!");
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Không thể xóa danh mục. Vui lòng thử lại!");
      return false;
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      await deleteCategory(id);
    }
  };

  // Handle save category (create or update)
  const handleSaveCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("Vui lòng điền tên danh mục!");
      return;
    }

    setSubmitting(true);
    let success = false;

    // Prepare data according to API schema
    const categoryData = {
            name: newCategory.name,
      image: newCategory.image || null // Send null if empty string
    };

    if (editingCategory) {
      success = await updateCategory(editingCategory.id, categoryData);
        } else {
      success = await createCategory(categoryData);
      }

    if (success) {
      setIsModalOpen(false);
      setEditingCategory(null);
      resetForm();
    }
    
    setSubmitting(false);
  };

  // Reset form
  const resetForm = () => {
    setNewCategory({
      name: "",
      image: "",
    });
    setImagePreview("");
    setUploadingImage(false);
  };

  // Handle edit button click
  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      image: category.image || "",
    });
    setImagePreview(category.image || "");
    setIsModalOpen(true);
    setDropdownOpenId(null);
  };

  // Handle add new button click
  const handleAddNew = () => {
    setEditingCategory(null);
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
      setNewCategory(prev => ({ ...prev, image: imageUrl }));
      
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
    setNewCategory(prev => ({ ...prev, image: "" }));
    setImagePreview("");
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span>Đang tải danh sách danh mục...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Danh mục Tour</h1>
          <p className="text-slate-600 mt-1">Quản lý các danh mục tour du lịch</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Plus size={20} />
          Thêm Danh mục
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên danh mục</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hình ảnh</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pagedCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy danh mục phù hợp.
                </td>
              </tr>
            ) : (
              pagedCategories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium">{category.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {category.image ? <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" /> : "Không có ảnh"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Edit size={16} />
                        Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                          >
                        <Trash size={16} />
                        Xóa
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingCategory ? "Sửa Danh mục" : "Thêm Danh mục mới"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveCategory(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập tên danh mục"
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
                    editingCategory ? "Cập nhật" : "Thêm mới"
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

export default CategoryManagementPage;