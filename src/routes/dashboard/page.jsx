import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign,
  ShoppingCart, CreditCard, Calendar, Filter, Download
} from "lucide-react";

const DashboardPage = () => {
  const [bookingStats, setBookingStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [tourStats, setTourStats] = useState(null);
  const [bookingRevenue, setBookingRevenue] = useState([]);
  const [paymentRevenue, setPaymentRevenue] = useState([]);
  const [commissionData, setCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('tuần này');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        // Build query params
        let queryParams = '';
        if (timeFilter === 'tuần này') {
          queryParams = `?type=week&year=${selectedYear}&month=${selectedMonth}`;
        } else if (timeFilter === 'tháng') {
          queryParams = `?type=month&year=${selectedYear}&month=${selectedMonth}`;
        } else if (timeFilter === 'năm') {
          queryParams = `?type=year&year=${selectedYear}`;
        }

        const [
          bookingStatsRes,
          paymentStatsRes,
          tourStatsRes,
          bookingRevenueRes,
          paymentRevenueRes,
          commissionRes
        ] = await Promise.all([
          fetch(`http://localhost:5000/api/admin/bookings/stats${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/admin/payments/stats${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/admin/tours/stats${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/admin/bookings/revenue${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/admin/payments/revenue${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`http://localhost:5000/api/dashboard/commissions/admin/overview${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const bookingData = await bookingStatsRes.json();
        const paymentData = await paymentStatsRes.json();
        const tourData = await tourStatsRes.json();
        const bookingRevenueData = await bookingRevenueRes.json();
        const paymentRevenueData = await paymentRevenueRes.json();
        const commissionDataRes = await commissionRes.json();

        setBookingStats(bookingData);
        setPaymentStats(paymentData);
        setTourStats(tourData);
        setBookingRevenue(bookingRevenueData);
        setPaymentRevenue(paymentRevenueData);
        setCommissionData(commissionDataRes?.data);
      } catch (e) {
        console.error('Error fetching admin statistics:', e);
      }
      setLoading(false);
    };
    fetchStats();
  }, [timeFilter, selectedMonth, selectedYear]);

  const formatVND = v => Number(v || 0).toLocaleString('vi-VN') + ' ₫';
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };
  const formatMonth = (month, year) => `${month}/${year}`;
  const formatMonthFromString = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return `${month}/${year}`;
  };

  // Tính phần trăm cho pie charts dựa trên dữ liệu thực
  const totalOrders = bookingStats?.totalBookings || 0;
  const confirmedPercentage = totalOrders > 0 ? Math.round((bookingStats?.confirmedBookings / totalOrders) * 100) : 0;
  const pendingPercentage = totalOrders > 0 ? Math.round((bookingStats?.pendingBookings / totalOrders) * 100) : 0;
  const cancelledPercentage = totalOrders > 0 ? Math.round((bookingStats?.cancelledBookings / totalOrders) * 100) : 0;
  const getTimeFilterText = () => {
    if (timeFilter === 'tuần này') return 'tuần này';
    if (timeFilter === 'tháng') return `tháng ${selectedMonth}/${selectedYear}`;
    if (timeFilter === 'năm') return `năm ${selectedYear}`;
  };
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê</h1>
          <p className="text-gray-500 mt-1">Xin chào, Admin. Chào mừng trở lại hệ thống quản lý tour!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm text-gray-600 border-none bg-transparent outline-none cursor-pointer"
            >
              {/* <option value="tuần này">Tuần này</option>
              <option value="tháng">Theo tháng</option>
              <option value="năm">Theo năm</option> */}
            </select>
            {/* Chọn tháng nếu lọc theo tháng */}
            {timeFilter === 'tháng' && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1 ml-2"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Tháng {i + 1}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1"
                >
                  {[...Array(5)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </>
            )}
            {/* Chọn năm nếu lọc theo năm */}
            {timeFilter === 'năm' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1 ml-2"
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            )}
            <Filter size={16} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{bookingStats?.totalBookings || 0}</div>
              <div className="text-sm text-gray-500">Tổng đơn hàng</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              +{((bookingStats?.thisMonthBookings / bookingStats?.totalBookings) * 100 || 0).toFixed(1)}% từ tháng trước
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{paymentStats?.totalPayments || 0}</div>
              <div className="text-sm text-gray-500">Tổng giao dịch</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              +{((paymentStats?.thisMonthPayments / paymentStats?.totalPayments) * 100 || 0).toFixed(1)}% từ tuần trước
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <CreditCard className="text-red-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{bookingStats?.cancelledBookings || 0}</div>
              <div className="text-sm text-gray-500">Đã hủy</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownRight size={16} className="text-red-500" />
            <span className="text-sm text-red-600 font-medium">
              -{cancelledPercentage}% từ hôm qua
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <DollarSign className="text-purple-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₫{Math.floor((paymentRevenue?.totalRevenue || 0) / 1000000)}M
              </div>
              <div className="text-sm text-gray-500">Tổng doanh thu</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">
              +{((paymentRevenue?.thisMonthRevenue / paymentRevenue?.totalRevenue) * 100 || 0).toFixed(1)}% từ hôm qua
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Charts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Biểu đồ tròn</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="text-blue-500" />
                <span className="text-sm text-gray-600">Biểu đồ</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="text-red-500" />
                <span className="text-sm text-gray-600">Hiển thị giá trị</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Total Orders Pie */}
            <div className="text-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[{ value: confirmedPercentage }, { value: 100 - confirmedPercentage }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    dataKey="value"
                  >
                    <Cell fill="#EF4444" />
                    <Cell fill="#FEE2E2" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{confirmedPercentage}%</div>
                <div className="text-sm text-gray-500">Tổng đơn hàng</div>
              </div>
            </div>

            {/* Customer Growth Pie */}
            <div className="text-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[{ value: pendingPercentage }, { value: 100 - pendingPercentage }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#D1FAE5" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{pendingPercentage}%</div>
                <div className="text-sm text-gray-500">Tăng trưởng khách hàng</div>
              </div>
            </div>

            {/* Total Revenue Pie */}
            <div className="text-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[
                      { value: Math.round((paymentStats?.completedPayments / paymentStats?.totalPayments) * 100) || 62 },
                      { value: Math.round((paymentStats?.pendingPayments / paymentStats?.totalPayments) * 100) || 38 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={50}
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#DBEAFE" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((paymentStats?.completedPayments / paymentStats?.totalPayments) * 100) || 62}%
                </div>
                <div className="text-sm text-gray-500">Tổng doanh thu</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Order */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Biểu đồ đơn hàng</h3>
              <p className="text-sm text-gray-500">Thống kê đơn hàng theo thời gian thực</p>
            </div>
            <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
              <Download size={16} />
              Lưu báo cáo
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{bookingStats?.totalBookings || 0} Đơn hàng</span>
              <span className="text-gray-400">•</span>
              <span>{((bookingStats?.thisMonthBookings / bookingStats?.totalBookings) * 100 || 0).toFixed(1)}% Tăng trưởng</span>
            </div>
          </div>

          {/* Sort chart data before rendering */}
          {/* Chart Order */}
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={
                Array.isArray(paymentRevenue?.dailyChart)
                  ? [...paymentRevenue.dailyChart].sort((a, b) => new Date(a.date) - new Date(b.date))
                  : []
              }
              margin={{ top: 40, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorOrderRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => {
                  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
                  const date = new Date(value);
                  return days[date.getDay()];
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `${Math.floor(value / 1000000)}Tr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [formatVND(value), 'Doanh thu']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorOrderRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Charts */}
      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Total Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tổng doanh thu</h3>

          <div className="mb-4">
            <div className="text-2xl font-bold text-blue-600">
              {formatVND(paymentRevenue?.totalRevenue)}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentRevenue?.dailyChart || []}>
              <defs>
                <linearGradient id="colorBlue2020" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRed2021" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => formatDate(value)}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `${Math.floor(value / 1000000)}Tr`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  name === 'revenue' ? formatVND(value) : value,
                  name === 'revenue' ? 'Doanh thu' : 'Giao dịch'
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorBlue2020)"
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="#EF4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">2024</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">2025</span>
            </div>
          </div>
        </div>

        {/* Customer Map */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Bản đồ khách hàng</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm">
              <option>Hàng tuần</option>
              <option>Hàng tháng</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { day: 'CN', value: bookingStats?.confirmedBookings || 30 },
              { day: 'T2', value: Math.floor((bookingStats?.confirmedBookings || 30) * 1.5) },
              { day: 'T3', value: Math.floor((bookingStats?.confirmedBookings || 30) * 0.8) },
              { day: 'T4', value: Math.floor((bookingStats?.confirmedBookings || 30) * 1.8) },
              { day: 'T5', value: Math.floor((bookingStats?.confirmedBookings || 30) * 1.2) },
              { day: 'T6', value: Math.floor((bookingStats?.confirmedBookings || 30) * 0.6) },
              { day: 'T7', value: Math.floor((bookingStats?.confirmedBookings || 30) * 1.4) }
            ]}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [value, 'Số lượng khách hàng']}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    index === 1 || index === 3 || index === 6 ? '#F59E0B' :
                      index === 2 || index === 4 ? '#EF4444' : '#10B981'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

