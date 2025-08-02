import React, { useEffect, useState } from "react";
import Pagination from "@/AgencyDashboard/components/Pagination";
import { X, Eye } from "lucide-react"; // Thêm Eye vào import

const REFUND_API_URLS = [
  "http://localhost:5000/api/payments/momo/refund",
  "http://localhost:5000/api/payments/refund"
];

const statusMap = {
  pending: "Đang xử lý",
  completed: "Đã hoàn tất",
  manual_required: "Cần xử lý thủ công",
  no_refund: "Không hoàn tiền"
};

function formatAmount(amount) {
  return parseInt(amount, 10).toLocaleString("vi-VN") + "₫";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("vi-VN");
}

const RefundManagementPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterSource, setFilterSource] = useState("all");
  const [detailRefund, setDetailRefund] = useState(null); // Modal state

  useEffect(() => {
    const fetchRefunds = async () => {
      setLoading(true);
      setError("");
      let allRefunds = [];
      const token = localStorage.getItem("token");
      for (const url of REFUND_API_URLS) {
        try {
          const res = await fetch(url, {
            headers: {
              "Authorization": token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json"
            }
          });
          if (!res.ok) throw new Error("API lỗi: " + url);
          const data = await res.json();
          if (Array.isArray(data.refunds)) {
            // Gắn nguồn refund
            const source = url.includes("/refund") ? (url.includes("momo") ? "momo" : "vnpay") : "unknown";
            allRefunds = allRefunds.concat(data.refunds.map(r => ({ ...r, source })));
          }
        } catch (err) {
          setError(err.message);
        }
      }
      setRefunds(allRefunds);
      setLoading(false);
    };
    fetchRefunds();
  }, []);

  // Filter by source
  const filteredRefunds = filterSource === "all"
    ? refunds
    : refunds.filter(r => r.source === filterSource);

  // Pagination
  const totalPages = Math.ceil(filteredRefunds.length / pageSize);
  const pagedRefunds = filteredRefunds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý hoàn tiền</h1>
      <p className="text-slate-600 mb-4">Danh sách các yêu cầu hoàn tiền từ hệ thống</p>
      {/* Filter by source */}
      <div className="flex gap-4 items-center mb-2">
        <label className="font-medium">Nguồn hoàn tiền:</label>
        <select value={filterSource} onChange={e => { setFilterSource(e.target.value); setCurrentPage(1); }} className="border rounded px-2 py-1">
          <option value="all">Tất cả</option>
          <option value="momo">Momo</option>
          <option value="vnpay">VNPay</option>
        </select>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span>{error}</span>
        </div>
      )}
      {loading ? (
        <div className="flex items-center gap-2 text-slate-500">Đang tải dữ liệu hoàn tiền...</div>
      ) : (
        <div className="overflow-auto rounded border border-slate-300 shadow-md">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Booking ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">User ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Số tiền</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Nguồn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Lý do</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian tạo</th>
                {/* Chỉ hiển thị cột thời gian xử lý nếu có dữ liệu */}
                {filteredRefunds.some(r => r.processed_at) && (
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thời gian xử lý</th>
                )}
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pagedRefunds.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-sm text-slate-500">
                    Không có yêu cầu hoàn tiền nào.
                  </td>
                </tr>
              ) : (
                pagedRefunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono bg-slate-100 rounded">{refund.id}</td>
                    <td className="px-4 py-3 text-xs font-mono bg-blue-100 rounded">{refund.booking_id}</td>
                    <td className="px-4 py-3 text-xs font-mono bg-purple-100 rounded">{refund.user_id}</td>
                    <td className="px-4 py-3 text-sm text-green-700 font-semibold">{formatAmount(refund.amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${refund.status === "completed" ? "bg-green-100 text-green-800" : refund.status === "manual_required" ? "bg-yellow-100 text-yellow-800" : refund.status === "no_refund" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{statusMap[refund.status] || refund.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">
                      {refund.source === "momo" ? "Momo" : refund.source === "vnpay" ? "VNPay" : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{refund.reason}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(refund.createdAt)}</td>
                    {/* Chỉ hiển thị cột thời gian xử lý nếu có dữ liệu */}
                    {filteredRefunds.some(r => r.processed_at) && (
                      <td className="px-4 py-3 text-xs">{refund.processed_at ? formatDate(refund.processed_at) : "-"}</td>
                    )}
                    <td className="px-4 py-3">
                      <button
                        className="flex items-center gap-1 text-blue-600 hover:underline bg-transparent p-0 border-0 cursor-pointer"
                        onClick={() => setDetailRefund(refund)}
                        style={{ background: "none" }}
                      >
                        <Eye size={18} strokeWidth={2} />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Trang {currentPage} / {totalPages || 1}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Sau
          </button>
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="border rounded px-2 py-1">
            {[10, 20, 50, 100].map(size => (
              <option key={size} value={size}>{size} / trang</option>
            ))}
          </select>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredRefunds.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={size => { setPageSize(size); setCurrentPage(1); }}
        showQuickJumper={true}
        showSizeChanger={true}
        pageSizeOptions={[10, 20, 50, 100]}
      />
      {detailRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-slate-500 hover:text-slate-700"
              onClick={() => setDetailRefund(null)}
              title="Đóng"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">Chi tiết hoàn tiền</h2>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">ID:</span> <span className="font-mono bg-slate-100 px-2 py-1 rounded">{detailRefund.id}</span></div>
              <div><span className="font-medium">Booking ID:</span> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{detailRefund.booking_id}</span></div>
              <div><span className="font-medium">User ID:</span> <span className="font-mono bg-purple-100 px-2 py-1 rounded">{detailRefund.user_id}</span></div>
              <div><span className="font-medium">Số tiền:</span> <span className="text-green-700 font-semibold">{formatAmount(detailRefund.amount)}</span></div>
              <div><span className="font-medium">Trạng thái:</span> <span className={`px-2 py-1 rounded text-xs font-medium ${detailRefund.status === "completed" ? "bg-green-100 text-green-800" : detailRefund.status === "manual_required" ? "bg-yellow-100 text-yellow-800" : detailRefund.status === "no_refund" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>{statusMap[detailRefund.status] || detailRefund.status}</span></div>
              <div><span className="font-medium">Nguồn:</span> {detailRefund.source === "momo" ? "Momo" : detailRefund.source === "vnpay" ? "VNPay" : "-"}</div>
              <div><span className="font-medium">Lý do:</span> <span className="text-slate-700">{detailRefund.reason}</span></div>
              <div><span className="font-medium">Thời gian tạo:</span> <span>{formatDate(detailRefund.createdAt)}</span></div>
              <div><span className="font-medium">Thời gian xử lý:</span> <span>{formatDate(detailRefund.processed_at)}</span></div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="px-4 py-2 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 font-medium"
                onClick={() => setDetailRefund(null)}
              >Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManagementPage;