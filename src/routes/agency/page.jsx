"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Lock, Unlock, Edit, Check, X, ChevronDown } from "lucide-react";
import usePagination from "../../hooks/usePagination";

export default function AgencyManagementPage() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [newAgency, setNewAgency] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_code: "",
    business_license: "",
    website: "",
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const dropdownRef = useRef();

  // Fetch agencies from API
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/agencies', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Endpoint /api/agencies không tồn tại. Vui lòng liên hệ admin để cấu hình backend.');
        }
        throw new Error('Failed to fetch agencies');
      }
      const data = await response.json();
      setAgencies(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching agencies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Approve agency
  const approveAgency = async (agencyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agencies/approve/${agencyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve agency');
      }
      
      // Refresh the agencies list after approval
      await fetchAgencies();
      alert("Agency đã được duyệt thành công!");
    } catch (err) {
      setError(err.message);
      console.error('Error approving agency:', err);
    }
  };

  // Reject agency
  const rejectAgency = async (agencyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/agencies/reject/${agencyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject agency');
      }
      
      // Refresh the agencies list after rejection
      await fetchAgencies();
      alert("Agency đã bị từ chối!");
    } catch (err) {
      setError(err.message);
      console.error('Error rejecting agency:', err);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpenId(null);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered agencies
  const filteredAgencies = agencies.filter(agency => {
    const searchMatch =
      agency.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agency.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = selectedStatus === "all" || agency.status === selectedStatus;
    // Ẩn agency đã xóa khỏi bảng, trừ khi filter status là 'deleted'
    const notDeleted = selectedStatus === 'deleted' ? true : agency.status !== "deleted";
    return searchMatch && statusMatch && notDeleted;
  });

  // Pagination hook
  const {
    currentData: pagedAgencies,
    currentPage,
    totalPages,
    handlePageChange
  } = usePagination(filteredAgencies, 10);

  // Sửa handleToggleStatus cho đúng API BE
  const handleToggleStatus = async (id, action) => {
    if (action === "approve") {
      if (!confirm("Bạn có chắc chắn muốn duyệt agency này?")) return;
      await approveAgency(id);
    } else if (action === "reject") {
      if (!confirm("Bạn có chắc chắn muốn từ chối agency này?")) return;
      await rejectAgency(id);
    } else {
      // Toggle lock/unlock
      try {
        const token = localStorage.getItem('token');
        const agency = agencies.find(a => a.id === id);
        const isLocked = agency.status === "locked";
        const actionType = isLocked ? "unlock" : "lock";
        const response = await fetch(`http://localhost:5000/api/agencies/toggle-lock/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: actionType }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to toggle lock agency');
        }
        await fetchAgencies();
        alert(`Agency đã được ${isLocked ? "mở khóa" : "khóa"}!`);
      } catch (err) {
        setError(err.message);
        console.error('Error toggling lock agency:', err);
      }
    }
    setDropdownOpenId(null);
  };

  // Sửa handleDelete cho đúng API BE (soft delete)
  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa agency này?")) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/agencies/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ permanently: false }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete agency');
        }
        await fetchAgencies();
        alert("Agency đã được xóa thành công!");
      } catch (err) {
        setError(err.message);
        console.error('Error deleting agency:', err);
      }
      setDropdownOpenId(null);
    }
  };

  const handleAddOrEditAgency = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingAgency ? 'PUT' : 'POST';
      const url = editingAgency 
        ? `http://localhost:5000/api/agencies/${editingAgency.id}`
        : 'http://localhost:5000/api/agencies';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAgency),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingAgency ? 'update' : 'add'} agency`);
      }
      
      // Refresh the agencies list
      await fetchAgencies();
      setNewAgency({
        id: null,
        name: "",
        email: "",
        phone: "",
        address: "",
        tax_code: "",
        business_license: "",
        website: "",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setEditingAgency(null);
      setIsModalOpen(false);
      alert(editingAgency ? "Cập nhật agency thành công!" : "Thêm agency thành công!");
    } catch (err) {
      setError(err.message);
      console.error(`Error ${editingAgency ? 'updating' : 'adding'} agency:`, err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-lg">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Lỗi: {error}
        </div>
        {/* Uncomment the following block to use mock data as a fallback */}
        {/* <button
          onClick={() => {
            setAgencies([
              { id: 1, name: "Agency A", email: "a@example.com", phone: "0901234567", address: "Hà Nội", status: "pending", created_at: new Date().toISOString() },
              { id: 2, name: "Agency B", email: "b@example.com", phone: "0907654321", address: "TP.HCM", status: "approved", created_at: new Date().toISOString() },
            ]);
            setError(null);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sử dụng dữ liệu mẫu
        </button> */}
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý Đại lý Du lịch</h1>
          <p className="text-slate-600 mt-1">Quản lý các agency du lịch</p>
        </div>
        <button
          onClick={() => { setEditingAgency(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={20} />
          Thêm Agency
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all duration-300 ease-in-out">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              {editingAgency ? "Sửa Agency" : "Thêm Agency mới"}
            </h2>
            <form onSubmit={(e) => { e.preventDefault(); handleAddOrEditAgency(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên Agency</label>
                <input
                  type="text"
                  value={newAgency.name}
                  onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newAgency.email}
                  onChange={(e) => setNewAgency({ ...newAgency, email: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="text"
                  value={newAgency.phone}
                  onChange={(e) => setNewAgency({ ...newAgency, phone: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                <input
                  type="text"
                  value={newAgency.address}
                  onChange={(e) => setNewAgency({ ...newAgency, address: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mã số thuế</label>
                <input
                  type="text"
                  value={newAgency.tax_code}
                  onChange={(e) => setNewAgency({ ...newAgency, tax_code: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giấy phép kinh doanh</label>
                <input
                  type="text"
                  value={newAgency.business_license}
                  onChange={(e) => setNewAgency({ ...newAgency, business_license: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website</label>
                <input
                  type="text"
                  value={newAgency.website}
                  onChange={(e) => setNewAgency({ ...newAgency, website: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingAgency(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {editingAgency ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="search"
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <select
            aria-label="Lọc trạng thái"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ duyệt</option>
            <option value="approved">Đã chấp nhận</option>
            <option value="rejected">Đã từ chối</option>
            <option value="suspended">Tạm khóa</option>
            <option value="deleted">Đã xóa</option>
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
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Số điện thoại</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Địa chỉ</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Ngày tạo</th>
              <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-slate-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pagedAgencies.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-slate-500">
                  Không tìm thấy agency phù hợp.
                </td>
              </tr>
            ) : (
              pagedAgencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 font-medium">{agency.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{agency.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{agency.phone}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{agency.address}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{agency.status}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">{agency.created_at ? new Date(agency.created_at).toLocaleDateString('vi-VN') : ''}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700 relative" ref={agency.id === dropdownOpenId ? dropdownRef : null}>
                    <button
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === agency.id}
                      onClick={() => setDropdownOpenId(dropdownOpenId === agency.id ? null : agency.id)}
                      className="inline-flex items-center rounded-md p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {dropdownOpenId === agency.id && (
                      <ul
                        role="menu"
                        aria-label="Hành động"
                        className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 bg-white shadow-lg"
                      >
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => {
                              setNewAgency(agency);
                              setEditingAgency(agency);
                              setIsModalOpen(true);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                          >
                            <Edit size={16} className="mr-2" /> Sửa
                          </button>
                        </li>
                        <li>
                          <hr className="border-slate-200" />
                        </li>
                        {agency.status === "pending" && (
                          <>
                            <li>
                              <button
                                role="menuitem"
                                onClick={() => handleToggleStatus(agency.id, "approve")}
                                className="block w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-slate-100 flex items-center"
                              >
                                <Check size={16} className="mr-2" /> Duyệt
                              </button>
                            </li>
                            <li>
                              <button
                                role="menuitem"
                                onClick={() => handleToggleStatus(agency.id, "reject")}
                                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                              >
                                <X size={16} className="mr-2" /> Từ chối
                              </button>
                            </li>
                          </>
                        )}
                        {agency.status === "approved" && (
                          <li>
                            <button
                              role="menuitem"
                              onClick={() => handleToggleStatus(agency.id, null)}
                              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                            >
                              <Lock size={16} className="mr-2" /> Khóa
                            </button>
                          </li>
                        )}
                        {agency.status === "suspended" && (
                          <li>
                            <button
                              role="menuitem"
                              onClick={() => handleToggleStatus(agency.id, null)}
                              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                            >
                              <Unlock size={16} className="mr-2" /> Mở khóa
                            </button>
                          </li>
                        )}
                        <li>
                          <hr className="border-slate-200" />
                        </li>
                        <li>
                          <button
                            role="menuitem"
                            onClick={() => handleDelete(agency.id)}
                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-100 flex items-center"
                          >
                            <MoreHorizontal size={16} className="mr-2" /> Xóa
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
