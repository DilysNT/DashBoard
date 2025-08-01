import React, { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const BookingRevenueChart = ({ period = "month", isAdmin = true }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const endpoint = isAdmin
          ? `/api/admin/bookings/revenue?period=${period}`
          : `/api/agency/bookings/revenue?period=${period}`;
        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        setData(result.data || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchRevenue();
  }, [period, isAdmin]);

  if (loading) return <div>Đang tải biểu đồ doanh thu booking...</div>;
  if (error) return <div className="text-red-600">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="text-lg font-bold mb-2">Doanh thu Booking ({period})</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#93c5fd" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingRevenueChart; 