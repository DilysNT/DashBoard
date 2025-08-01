import React, { useEffect, useState } from "react";
import PaymentStatsCards from "./PaymentStatsCards";
import PaymentRevenueChart from "./PaymentRevenueChart";
import PaymentMethodPie from "./PaymentMethodPie";
import RecentPaymentsTable from "./RecentPaymentsTable";

const PaymentsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [methodData, setMethodData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [statsRes, revenueRes, methodRes, recentRes] = await Promise.all([
        fetch('/api/agency/payments/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/agency/payments/revenue?period=month', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/agency/payments/methods', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/agency/payments/recent?limit=10', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      setStats(await statsRes.json());
      setRevenueData((await revenueRes.json()).data || []);
      setMethodData((await methodRes.json()).methods || []);
      setRecentPayments((await recentRes.json()).payments || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="p-8 text-lg">Đang tải thống kê payment...</div>;

  return (
    <div>
      <PaymentStatsCards stats={stats} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PaymentRevenueChart data={revenueData} />
        <PaymentMethodPie data={methodData} />
      </div>
      <RecentPaymentsTable payments={recentPayments} />
    </div>
  );
};

export default PaymentsDashboard; 