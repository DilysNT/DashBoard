import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
const COLORS = ["#2563eb", "#f59e42", "#10b981", "#f43f5e", "#a21caf"];

const PaymentMethodPie = ({ data }) => (
  <div className="bg-white rounded-xl shadow p-4 mb-6">
    <h3 className="text-lg font-bold mb-2">Phương thức thanh toán</h3>
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="method" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label>
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default PaymentMethodPie; 