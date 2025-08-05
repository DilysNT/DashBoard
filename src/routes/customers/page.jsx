"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PencilLine, Trash, Plus, Search, MoreHorizontal, Lock, Unlock, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import usePagination from "../../hooks/usePagination";

// Simulated initial agencies data (replace with API call in real app)
// This data would ideally also come from an API
const initialAgencies = [
  { id: "1", name: "Saigon Travel Agency", email: "info@saigontravel.com" },
  { id: "2", name: "Hanoi Tours & Travel", email: "contact@hanoitours.vn" },
];

export default function UserManagementPage() {
  const { token, isAdmin } = useAuth();
  const [users, setUsers] = useState([]); // Khởi tạo rỗng để tải từ API
  const [agencies, setAgencies] = useState([]);
  const [pendingAgencies, setPendingAgencies] = useState([]); // State for approved agencies without user
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Dùng cho chế độ sửa
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "", // Sử dụng 'password' cho input, backend sẽ hash thành password_hash
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "Male",
    role: "user",
    agency_id: null,
    is_active: true,
  });

  const API_BASE_URL = "http://localhost:5000/api"; // Base URL của API

  // Hàm để tải danh sách người dùng từ API
  const fetchUsers = useCallback(async () => {
    try {
      if (!token) {
        console.error("No token available");
        return;
      }
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('📊 Users API response:', data);
      // API trả về mảng trực tiếp
      const usersData = Array.isArray(data) ? data : [];
      // Map data từ API để phù hợp với cấu trúc hiện tại nếu cần
      const mappedUsers = usersData.map(user => ({
        ...user,
        name: user.username || user.name || 'Không có tên',
        password_hash: user.password_hash,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
      }));
      setUsers(mappedUsers);
      console.log('✅ Users loaded successfully:', mappedUsers.length, 'users');
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  }, [token]);

  // Fetch agencies from API
  const fetchAgencies = useCallback(async () => {
    try {
      if (!token) {
        console.error("No token available for agencies");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/agencies`, {
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Agencies API response:', data);
      
      // Handle different response formats
      const agenciesData = Array.isArray(data.data) ? data.data : (data.data || data.agencies || []);
      setAgencies(agenciesData);
      console.log('✅ Agencies loaded successfully:', agenciesData.length, 'agencies');

      // Filter for approved agencies that don't have a user account yet
      const unassignedAgencies = agenciesData.filter(
        (agency) => agency.status === 'approved' 
      );
      setPendingAgencies(unassignedAgencies);
      console.log('✅ Pending agencies for user creation:', unassignedAgencies.length);

    } catch (error) {
      console.error("Error fetching agencies:", error);
      // Fallback to mock data if API fails
      setAgencies([
        { id: "1", name: "Saigon Travel Agency", email: "info@saigontravel.com" },
        { id: "2", name: "Hanoi Tours & Travel", email: "contact@hanoitours.vn" },
      ]);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchAgencies();
  }, [fetchUsers, fetchAgencies]);

  const toggleDropdown = (id) => {
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const closeDropdown = () => setDropdownOpenId(null);

  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered users
  const filteredUsers = users.filter(user => {
    const searchMatch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = selectedRole === "all" || user.role === selectedRole;
    const statusMatch = selectedStatus === "all" || (user.status && user.status.toLowerCase() === 'active') === (selectedStatus === 'active');
    return searchMatch && roleMatch && statusMatch;
  });

  // Pagination hook
  const {
    currentData: pagedUsers,
    currentPage,
    totalPages,
    handlePageChange
  } = usePagination(filteredUsers, 10);

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá người dùng này?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "DELETE",
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setUsers(users.filter(user => user.id !== id));
        closeDropdown();
        alert("Người dùng đã được xoá thành công!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Không thể xoá người dùng. Vui lòng thử lại.");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    const userToUpdate = users.find(user => user.id === id);
    if (!userToUpdate) return;

    const newStatus = !userToUpdate.is_active;
    try {
              const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ is_active: newStatus, updated_at: new Date().toISOString() }),
        });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedUser = await response.json(); // API có thể trả về user đã cập nhật
      setUsers(users.map(user =>
        user.id === id ? { ...user, is_active: newStatus, updated_at: updatedUser.updated_at || new Date().toISOString() } : user
      ));
      closeDropdown();
      alert(`Người dùng đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"} thành công!`);
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Không thể cập nhật trạng thái người dùng. Vui lòng thử lại.");
    }
  };

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      date_of_birth: "",
      gender: "Male",
      role: "user",
      agency_id: null,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      password: "", // Không hiển thị mật khẩu cũ, yêu cầu nhập lại nếu muốn đổi
      phone: user.phone || "",
      address: user.address || "",
      date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : "", // Format YYYY-MM-DD
      gender: user.gender || "Male",
      role: user.role,
      agency_id: user.agency_id || null,
      is_active: user.is_active,
    });
    setIsModalOpen(true);
    closeDropdown();
  };

  const handleUserRoleChange = (newRole) => {
    // Reset form to defaults when role changes
    setNewUser({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      date_of_birth: "",
      gender: "Male",
      role: newRole,
      agency_id: null,
      is_active: true,
      tax_code: "",
    });
  };

  const handleAgencySelectionChange = (agencyId) => {
    if (!agencyId) {
      // If "-- Select Agency --" is chosen, reset relevant fields
      setNewUser(prev => ({
        ...prev,
        agency_id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        tax_code: "",
        password: ""
      }));
      return;
    }

    const selectedAgency = pendingAgencies.find(a => a.id === agencyId);
    if (selectedAgency) {
      setNewUser(prev => ({
        ...prev,
        agency_id: selectedAgency.id,
        name: selectedAgency.name,
        email: selectedAgency.email,
        phone: selectedAgency.phone,
        address: selectedAgency.address,
        tax_code: selectedAgency.tax_code,
        password: "" // Clear password field for security
      }));
    }
  };


  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (isEditMode) {
      // --- EDIT MODE ---
      const userPayload = {
        username: newUser.name,
        email: newUser.email,
        password: newUser.password || undefined, // Send password only if changed
        phone: newUser.phone,
        address: newUser.address,
        date_of_birth: newUser.date_of_birth,
        gender: newUser.gender,
        role: newUser.role,
        is_active: newUser.is_active,
        agency_id: newUser.agency_id,
      };

      try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userPayload),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedUser = await response.json();
        setUsers(users.map(user =>
          user.id === currentUser.id ? {
            ...user,
            ...updatedUser,
            name: updatedUser.username, // Update name from API's username
            updated_at: new Date().toISOString()
          } : user
        ));
        alert("Cập nhật người dùng thành công!");
      } catch (error) {
        console.error("Error updating user:", error);
        alert("Không thể cập nhật người dùng. Vui lòng thử lại.");
      }
    } else {
      // --- ADD NEW MODE ---
      let userPayload;
      if (newUser.role === 'agency') {
        // Create user for an existing, approved agency
        if (!newUser.agency_id || !newUser.password) {
          alert("Vui lòng chọn một agency và nhập mật khẩu.");
          return;
        }
        userPayload = {
          username: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone,
          address: newUser.address,
          role: 'agency',
          agency_id: newUser.agency_id,
          is_active: true
        };
      } else {
        // Create a regular admin or user
        userPayload = {
          username: newUser.name,
          email: newUser.email,
          password: newUser.password,
          phone: newUser.phone,
          address: newUser.address,
          date_of_birth: newUser.date_of_birth,
          gender: newUser.gender,
          role: newUser.role,
          is_active: newUser.is_active,
        };
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const addedUser = await response.json();
        setUsers(prevUsers => [...prevUsers, {
          ...addedUser,
          name: addedUser.username || addedUser.name,
          created_at: addedUser.created_at || new Date().toISOString(),
          updated_at: addedUser.updated_at || new Date().toISOString(),
        }]);

        if (newUser.role === 'agency') {
          // Refresh agency list to reflect the new user_id link
          fetchAgencies();
          alert(`Tạo tài khoản cho agency "${newUser.name}" thành công!`);
        } else {
          alert("Thêm người dùng thành công!");
        }
      } catch (error) {
        console.error("Error adding user:", error);
        alert(`Không thể thêm người dùng: ${error.message}`);
      }
    }
    setIsModalOpen(false);
  };


  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Người Dùng</h1>
          <p className="text-slate-600 mt-1">Quản lý Admin, User và Agency</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="button"
        >
          <Plus size={20} />
          Thêm người dùng
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {isEditMode ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
            </h2>
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                <select
                  value={newUser.role}
                  onChange={(e) => handleUserRoleChange(e.target.value)}
                  disabled={isEditMode}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-100"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="agency">Agency</option>
                </select>
              </div>

              {newUser.role === 'agency' && !isEditMode ? (
                // UI for creating a user for an existing agency
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chọn Agency đã được duyệt</label>
                    <select
                      value={newUser.agency_id || ""}
                      onChange={(e) => handleAgencySelectionChange(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="">-- Chọn một Agency --</option>
                      {pendingAgencies.map(agency => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name} ({agency.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {newUser.agency_id && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tên Agency</label>
                        <input type="text" value={newUser.name} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={newUser.email} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input type="text" value={newUser.phone} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                        <input type="text" value={newUser.address} disabled className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" />
                      </div>
                    </>
                  )}
                </>
              ) : (
                // Original UI for admin/user or any edit mode
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mật khẩu {isEditMode && "(Để trống nếu không đổi)"}</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required={!isEditMode}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <input
                      type="text"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                    <input
                      type="text"
                      value={newUser.address}
                      onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
                    <input
                      type="date"
                      value={newUser.date_of_birth}
                      onChange={(e) => setNewUser({ ...newUser, date_of_birth: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                    <select
                      value={newUser.gender}
                      onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  {isEditMode && newUser.role === "agency" && (
                     <div>
                      <label className="block text-sm font-medium text-gray-700">ID Đại lý</label>
                      <select
                        value={newUser.agency_id || ""}
                        onChange={(e) => setNewUser({ ...newUser, agency_id: e.target.value || null })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      >
                        <option value="">Không có đại lý</option>
                        {agencies.map(agency => (
                          <option key={agency.id} value={agency.id}>
                            {agency.name} ({agency.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {isEditMode ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {["all", "admin", "user", "agency"].map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`rounded-md py-2 font-semibold transition ${selectedRole === role ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-blue-300 hover:text-white"
              }`}
          >
            {role === "all" ? `Tất cả (${users.length})` : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tên hoặc email..."
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
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
      </div>

      <div className="overflow-auto rounded border border-slate-300 shadow-md">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Tên</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Vai trò</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày tạo</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pagedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy khách hàng phù hợp.
                </td>
              </tr>
            ) : (
              pagedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium">{user.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{user.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{user.role}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    <span className={
                      user.status && user.status.toLowerCase() === 'active'
                        ? 'inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-green-100 text-green-800'
                        : 'inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-red-100 text-red-800'
                    }>
                      {user.status && user.status.toLowerCase() === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : ''}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative" ref={user.id === dropdownOpenId ? dropdownRef : null}>
                    <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === user.id}
                      onClick={() => toggleDropdown(user.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="button"
                      aria-label={`Hành động cho ${user.name}`}
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {dropdownOpenId === user.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg focus:outline-none"
                      >
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleOpenEditModal(user)}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                            type="button"
                          >
                            <PencilLine size={16} className="inline mr-2" />
                            Sửa
                          </button>
                        </li>
                        <li>
                          <hr className="border-slate-200" />
                        </li>
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleToggleStatus(user.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                          >
                            {user.is_active ? <Lock size={16} className="mr-2" /> : <Unlock size={16} className="mr-2" />}
                            {user.is_active ? "Khóa" : "Mở khóa"}
                          </button>
                        </li>
                        <li>
                          <hr className="border-slate-200" />
                        </li>
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleDelete(user.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100"
                            type="button"
                          >
                            <Trash size={16} className="inline mr-2" />
                            Xoá
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
        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white'}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded border bg-white disabled:opacity-50">&gt;</button>
          </div>
        )}
      </div>
    </div>
  );
}
