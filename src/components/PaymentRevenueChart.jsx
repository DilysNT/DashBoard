import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const PaymentRevenueChart = ({ data }) => (
  <div className="bg-white rounded-xl shadow p-4 mb-6">
    <h3 className="text-lg font-bold mb-2">Doanh thu Payment theo tháng</h3>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="#bbf7d0" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default PaymentRevenueChart; 