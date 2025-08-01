const PaymentStatsCards = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <div className="text-gray-500">Tổng giao dịch</div>
      <div className="text-3xl font-bold text-blue-700">{stats?.totalPayments}</div>
      <div className="text-green-600 text-sm mt-1">{stats?.growth}% tăng trưởng</div>
    </div>
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <div className="text-gray-500">Tổng doanh thu</div>
      <div className="text-3xl font-bold text-green-700">{stats?.totalRevenue?.toLocaleString()} VNĐ</div>
      <div className="text-green-600 text-sm mt-1">{stats?.revenueGrowth}% tăng trưởng</div>
    </div>
    <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
      <div className="text-gray-500">Tỷ lệ thành công</div>
      <div className="text-3xl font-bold text-purple-700">{stats?.successRate}%</div>
      <div className="text-red-600 text-sm mt-1">Thất bại: {stats?.failedCount}</div>
    </div>
  </div>
);

export default PaymentStatsCards; 