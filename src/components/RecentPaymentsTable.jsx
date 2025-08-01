const RecentPaymentsTable = ({ payments }) => (
  <div className="bg-white rounded-xl shadow p-4">
    <h3 className="text-lg font-bold mb-2">Giao dịch gần đây</h3>
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
            <td>{p.customerName}</td>
            <td>{p.amount?.toLocaleString()} VNĐ</td>
            <td>{p.method}</td>
            <td>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {p.status}
              </span>
            </td>
            <td>{new Date(p.date).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default RecentPaymentsTable; 