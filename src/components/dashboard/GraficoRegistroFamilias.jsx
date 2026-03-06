import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { dia: "1", familias: 12 }, { dia: "2", familias: 18 }, { dia: "3", familias: 9 },
  { dia: "4", familias: 22 }, { dia: "5", familias: 15 }, { dia: "6", familias: 28 },
  { dia: "7", familias: 19 }, { dia: "8", familias: 31 }, { dia: "9", familias: 24 },
  { dia: "10", familias: 17 }, { dia: "11", familias: 35 }, { dia: "12", familias: 29 },
  { dia: "13", familias: 42 }, { dia: "14", familias: 38 }, { dia: "15", familias: 26 },
  { dia: "16", familias: 33 }, { dia: "17", familias: 44 }, { dia: "18", familias: 39 },
  { dia: "19", familias: 48 }, { dia: "20", familias: 41 }, { dia: "21", familias: 37 },
  { dia: "22", familias: 52 }, { dia: "23", familias: 45 }, { dia: "24", familias: 58 },
  { dia: "25", familias: 49 }, { dia: "26", familias: 63 }, { dia: "27", familias: 55 },
  { dia: "28", familias: 67 }
];

export default function GraficoRegistroFamilias() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Registro de Famílias — Mês Atual (dia a dia)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="dia" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="familias" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Famílias" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}