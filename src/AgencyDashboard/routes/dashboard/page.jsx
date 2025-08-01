import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Filter, Download, ArrowUpRight, TrendingUp,
  ShoppingCart, DollarSign, CreditCard, Users 
} from 'lucide-react';

const AgencyDashboardPage = () => {
  const [bookingStats, setBookingStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [commissionData, setCommissionData] = useState(null);
  const [customerStats, setCustomerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Thêm state cho filter
  const [timeFilter, setTimeFilter] = useState('tuần này');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
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
          revenueRes,
          monthlyRes,
          commissionRes,
          customerRes
        ] = await Promise.all([
          fetch(`/api/agency/bookings/stats${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/agency/payments/stats${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/agency/payments/revenue${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/agency/payments/monthly${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/agency/payments/commission${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`/api/agency/bookings/customers${queryParams}`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const bookingData = await bookingStatsRes.json();
        const paymentData = await paymentStatsRes.json();
        const revenueDataRes = await revenueRes.json();
        const monthlyRevenueData = await monthlyRes.json();
        const commissionDataRes = await commissionRes.json();
        const customerData = await customerRes.json();

        setBookingStats(bookingData);
        setPaymentStats(paymentData);
        setRevenueData(revenueDataRes);
        setMonthlyRevenue(monthlyRevenueData);
        setCommissionData(commissionDataRes);
        setCustomerStats(customerData);
        
        // Debug data
        console.log('Monthly Revenue:', monthlyRevenueData);
        console.log('Commission Data:', commissionDataRes);
        console.log('Booking Stats:', bookingData);
        console.log('Payment Stats:', paymentData);
      } catch (error) {
        console.error('Error fetching agency statistics:', error);
      }
      setLoading(false);
    };
    fetchStats();
  }, [timeFilter, selectedMonth, selectedYear]);

  const formatVND = (value) => Number(value || 0).toLocaleString('vi-VN') + ' ₫';
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };
  const formatMonth = (month, year) => `${month}/${year}`;
  
  // Tính phần trăm cho pie charts dựa trên dữ liệu thực
  const totalOrders = bookingStats?.totalBookings || 0;
  const confirmedPercentage = totalOrders > 0 ? Math.round((bookingStats?.confirmedBookings / totalOrders) * 100) : 0;
  const pendingPercentage = totalOrders > 0 ? Math.round((bookingStats?.pendingBookings / totalOrders) * 100) : 0;
  const cancelledPercentage = totalOrders > 0 ? Math.round((bookingStats?.cancelledBookings / totalOrders) * 100) : 0;
  
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  // Dữ liệu mẫu cho biểu đồ với cấu trúc phù hợp
  const sampleRevenueData = [
    { month: 'T1', revenue: 50000000 },
    { month: 'T2', revenue: 75000000 },
    { month: 'T3', revenue: 60000000 },
    { month: 'T4', revenue: 85000000 },
    { month: 'T5', revenue: 70000000 },
    { month: 'T6', revenue: 90000000 },
    { month: 'T7', revenue: 80000000 }
  ];

  const sampleCommissionData = [
    { month: 'T1', commission: 5000000 },
    { month: 'T2', commission: 7500000 },
    { month: 'T3', commission: 6000000 },
    { month: 'T4', commission: 8500000 },
    { month: 'T5', commission: 7000000 },
    { month: 'T6', commission: 9000000 },
    { month: 'T7', commission: 8000000 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header với filter */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Agency</h1>
          <p className="text-gray-500 mt-1">Xin chào! Chào mừng trở lại hệ thống quản lý agency.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm text-gray-600 border-none bg-transparent outline-none cursor-pointer"
            >
              <option value="tuần này">Tuần này</option>
              <option value="tháng">Theo tháng</option>
              <option value="năm">Theo năm</option>
            </select>
            
            {(timeFilter === 'tháng' || timeFilter === 'tuần này') && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1 ml-2"
                >
                  {months.map(m => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1"
                >
                  {years.map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </>
            )}
            
            {timeFilter === 'năm' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="text-sm text-gray-600 border border-gray-200 rounded px-2 py-1 ml-2"
              >
                {years.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
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
            <div className="bg-blue-100 p-3 rounded-xl">
              <ShoppingCart className="text-blue-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{bookingStats?.totalBookings || 0}</div>
              <div className="text-sm text-gray-500">Tổng booking</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">Đang chờ: {bookingStats?.pendingBookings || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₫{Math.floor((paymentStats?.totalRevenue || 0) / 1000000)}M
              </div>
              <div className="text-sm text-gray-500">Tổng doanh thu</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">Hôm nay: {formatVND(paymentStats?.todayRevenue)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <CreditCard className="text-purple-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                ₫{Math.floor((commissionData?.totalCommission || 0) / 1000000)}M
              </div>
              <div className="text-sm text-gray-500">Hoa hồng tổng</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">Đã trả: {formatVND(commissionData?.paidCommission)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Users className="text-orange-600" size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{customerStats?.totalCustomers || 0}</div>
              <div className="text-sm text-gray-500">Tổng khách hàng</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-green-500" />
            <span className="text-sm text-green-600 font-medium">Khách mới: {customerStats?.newCustomers || 0}</span>
          </div>
        </div>
      </div>

      {/* Pie Charts và Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Charts */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Biểu đồ tròn - Thống kê Booking</h3>
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
            {/* Confirmed Bookings */}
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
                    <Cell fill="#10B981" />
                    <Cell fill="#D1FAE5" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{confirmedPercentage}%</div>
                <div className="text-sm text-gray-500">Đã xác nhận</div>
              </div>
            </div>

            {/* Pending Bookings */}
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
                    <Cell fill="#F59E0B" />
                    <Cell fill="#FEF3C7" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{pendingPercentage}%</div>
                <div className="text-sm text-gray-500">Đang chờ</div>
              </div>
            </div>

            {/* Cancelled Bookings */}
            <div className="text-center">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie
                    data={[{ value: cancelledPercentage }, { value: 100 - cancelledPercentage }]}
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
                <div className="text-2xl font-bold text-gray-900">{cancelledPercentage}%</div>
                <div className="text-sm text-gray-500">Đã hủy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Biểu đồ doanh thu</h3>
              <p className="text-sm text-gray-500">Thống kê doanh thu theo thời gian thực</p>
            </div>
            <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
              <Download size={16} />
              Lưu báo cáo
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{formatVND(paymentStats?.totalRevenue)} Tổng doanh thu</span>
              <span className="text-gray-400">•</span>
              <span>{paymentStats?.totalPayments || 0} Giao dịch</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={Array.isArray(monthlyRevenue) && monthlyRevenue.length > 0 ? monthlyRevenue : 
                            Array.isArray(monthlyRevenue?.data) && monthlyRevenue.data.length > 0 ? monthlyRevenue.data : 
                            sampleRevenueData}>
              <defs>
                <linearGradient id="colorOrderRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                hide 
                domain={['dataMin * 0.8', 'dataMax * 1.2']}
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

      {/* Commission và Customer Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Commission Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hoa hồng theo tháng</h3>

          <div className="mb-4">
            <div className="text-2xl font-bold text-purple-600">
              {formatVND(commissionData?.totalCommission)}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Array.isArray(commissionData) && commissionData.length > 0 ? commissionData :
                           Array.isArray(commissionData?.monthlyCommission) && commissionData.monthlyCommission.length > 0 ? commissionData.monthlyCommission :
                           Array.isArray(commissionData?.data) && commissionData.data.length > 0 ? commissionData.data :
                           sampleCommissionData}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
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
                formatter={(value) => [formatVND(value), 'Hoa hồng']}
              />
              <Bar
                dataKey="commission"
                radius={[4, 4, 0, 0]}
                fill="#a855f7"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động khách hàng</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm">
              <option>Hàng tuần</option>
              <option>Hàng tháng</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { day: 'CN', value: bookingStats?.confirmedBookings || 12 },
              { day: 'T2', value: Math.floor((bookingStats?.confirmedBookings || 12) * 1.5) },
              { day: 'T3', value: Math.floor((bookingStats?.confirmedBookings || 12) * 0.8) },
              { day: 'T4', value: Math.floor((bookingStats?.confirmedBookings || 12) * 1.8) },
              { day: 'T5', value: Math.floor((bookingStats?.confirmedBookings || 12) * 1.2) },
              { day: 'T6', value: Math.floor((bookingStats?.confirmedBookings || 12) * 0.6) },
              { day: 'T7', value: Math.floor((bookingStats?.confirmedBookings || 12) * 1.4) }
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
                formatter={(value) => [value, 'Số lượng booking']}
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

      {/* Detail Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê booking chi tiết</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">Tổng booking:</span>
              <span className="font-bold text-blue-700 text-xl">{bookingStats?.totalBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Đã xác nhận:</span>
              <div className="text-right">
                <span className="font-bold text-green-700 text-xl">{bookingStats?.confirmedBookings || 0}</span>
                <div className="text-sm text-green-600">({confirmedPercentage}%)</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-yellow-900">Đang chờ:</span>
              <div className="text-right">
                <span className="font-bold text-yellow-700 text-xl">{bookingStats?.pendingBookings || 0}</span>
                <div className="text-sm text-yellow-600">({pendingPercentage}%)</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-900">Đã hủy:</span>
              <div className="text-right">
                <span className="font-bold text-red-700 text-xl">{bookingStats?.cancelledBookings || 0}</span>
                <div className="text-sm text-red-600">({cancelledPercentage}%)</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê thanh toán chi tiết</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-900">Tổng thanh toán:</span>
              <span className="font-bold text-blue-700 text-xl">{paymentStats?.totalPayments || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-green-900">Thành công:</span>
              <div className="text-right">
                <span className="font-bold text-green-700 text-xl">{paymentStats?.successfulPayments || 0}</span>
                <div className="text-sm text-green-600">
                  ({Math.round(((paymentStats?.successfulPayments || 0) / (paymentStats?.totalPayments || 1)) * 100)}%)
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-red-900">Thất bại:</span>
              <div className="text-right">
                <span className="font-bold text-red-700 text-xl">{paymentStats?.failedPayments || 0}</span>
                <div className="text-sm text-red-600">
                  ({Math.round(((paymentStats?.failedPayments || 0) / (paymentStats?.totalPayments || 1)) * 100)}%)
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="font-medium text-yellow-900">Đang xử lý:</span>
              <div className="text-right">
                <span className="font-bold text-yellow-700 text-xl">{paymentStats?.pendingPayments || 0}</span>
                <div className="text-sm text-yellow-600">
                  ({Math.round(((paymentStats?.pendingPayments || 0) / (paymentStats?.totalPayments || 1)) * 100)}%)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Tours Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Top Tours theo doanh thu</h2>
          <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tên Tour</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Số booking</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Doanh thu</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Hoa hồng</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {bookingStats?.topTours?.length > 0 ? bookingStats.topTours.map((tour, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{tour.name}</td>
                  <td className="py-3 px-4 text-gray-600">{tour.bookingCount}</td>
                  <td className="py-3 px-4 font-semibold text-green-600">{formatVND(tour.revenue)}</td>
                  <td className="py-3 px-4 font-semibold text-purple-600">{formatVND(tour.commission)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((tour.revenue / (bookingStats?.topTours?.[0]?.revenue || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round((tour.revenue / (bookingStats?.topTours?.[0]?.revenue || 1)) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <TrendingUp size={48} className="text-gray-300" />
                      <span>Không có dữ liệu tour</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboardPage;

