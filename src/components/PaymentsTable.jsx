import React, { useEffect, useState } from "react";

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/payments?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPayments(data.payments || data || []);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  if (loading) return <div>Đang tải danh sách payment...</div>;

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Danh sách giao dịch</h3>
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>Số tiền</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.booking?.user?.name || p.booking?.user_id || "N/A"}</td>
              <td>{Number(p.amount).toLocaleString()} VNĐ</td>
              <td>{p.payment_method}</td>
              <td>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {p.status}
                </span>
              </td>
              <td>{new Date(p.payment_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable; 