import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const dadosPorMes = {
  "Mar/26": Array.from({ length: 28 }, (_, i) => ({ dia: String(i + 1), familias: Math.floor(10 + Math.random() * 60 + i * 1.5) })),
  "Fev/26": Array.from({ length: 28 }, (_, i) => ({ dia: String(i + 1), familias: Math.floor(8 + Math.random() * 50 + i * 1.2) })),
  "Jan/26": Array.from({ length: 31 }, (_, i) => ({ dia: String(i + 1), familias: Math.floor(5 + Math.random() * 45 + i * 1.0) })),
};

// Dados fixos para consistência visual
const dadosFixos = {
  "Mar/26": [
    {dia:"1",familias:12},{dia:"2",familias:18},{dia:"3",familias:9},{dia:"4",familias:22},
    {dia:"5",familias:15},{dia:"6",familias:28},{dia:"7",familias:19},{dia:"8",familias:31},
    {dia:"9",familias:24},{dia:"10",familias:17},{dia:"11",familias:35},{dia:"12",familias:29},
    {dia:"13",familias:42},{dia:"14",familias:38},{dia:"15",familias:26},{dia:"16",familias:33},
    {dia:"17",familias:44},{dia:"18",familias:39},{dia:"19",familias:48},{dia:"20",familias:41},
    {dia:"21",familias:37},{dia:"22",familias:52},{dia:"23",familias:45},{dia:"24",familias:58},
    {dia:"25",familias:49},{dia:"26",familias:63},{dia:"27",familias:55},{dia:"28",familias:67},
  ],
  "Fev/26": [
    {dia:"1",familias:8},{dia:"2",familias:14},{dia:"3",familias:11},{dia:"4",familias:19},
    {dia:"5",familias:23},{dia:"6",familias:17},{dia:"7",familias:28},{dia:"8",familias:22},
    {dia:"9",familias:31},{dia:"10",familias:25},{dia:"11",familias:18},{dia:"12",familias:34},
    {dia:"13",familias:29},{dia:"14",familias:43},{dia:"15",familias:38},{dia:"16",familias:32},
    {dia:"17",familias:27},{dia:"18",familias:41},{dia:"19",familias:36},{dia:"20",familias:44},
    {dia:"21",familias:39},{dia:"22",familias:48},{dia:"23",familias:53},{dia:"24",familias:46},
    {dia:"25",familias:51},{dia:"26",familias:57},{dia:"27",familias:62},{dia:"28",familias:58},
  ],
  "Jan/26": [
    {dia:"1",familias:6},{dia:"2",familias:10},{dia:"3",familias:14},{dia:"4",familias:9},
    {dia:"5",familias:18},{dia:"6",familias:13},{dia:"7",familias:22},{dia:"8",familias:17},
    {dia:"9",familias:25},{dia:"10",familias:20},{dia:"11",familias:28},{dia:"12",familias:24},
    {dia:"13",familias:31},{dia:"14",familias:27},{dia:"15",familias:34},{dia:"16",familias:29},
    {dia:"17",familias:38},{dia:"18",familias:33},{dia:"19",familias:42},{dia:"20",familias:36},
    {dia:"21",familias:45},{dia:"22",familias:40},{dia:"23",familias:49},{dia:"24",familias:43},
    {dia:"25",familias:52},{dia:"26",familias:47},{dia:"27",familias:55},{dia:"28",familias:51},
    {dia:"29",familias:58},{dia:"30",familias:54},{dia:"31",familias:61},
  ],
};

const meses = ["Mar/26", "Fev/26", "Jan/26"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-1">Dia {label}</p>
        <p className="text-sky-600">Famílias: <span className="font-bold">{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

export default function GraficoRegistroFamilias() {
  const [mesSel, setMesSel] = useState("Mar/26");
  const data = dadosFixos[mesSel];
  const total = data.reduce((s, d) => s + d.familias, 0);
  const media = Math.round(total / data.length);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Registro de Famílias — Dia a Dia</h3>
          <p className="text-xs text-slate-400 mt-0.5">Total: <span className="text-sky-600 font-semibold">{total.toLocaleString("pt-BR")}</span> · Média/dia: <span className="text-sky-600 font-semibold">{media}</span></p>
        </div>
        <div className="flex gap-1">
          {meses.map((m) => (
            <button
              key={m}
              onClick={() => setMesSel(m)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                mesSel === m
                  ? "bg-sky-500 text-white border-sky-500 font-medium"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="dia" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={3} />
          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={media} stroke="#0ea5e9" strokeDasharray="4 4" strokeOpacity={0.5} />
          <Line
            type="monotone"
            dataKey="familias"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#0ea5e9" }}
            name="Famílias"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}