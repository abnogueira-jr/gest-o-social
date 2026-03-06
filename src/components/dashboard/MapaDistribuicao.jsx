const regioes = [
  { nome: "Norte", familias: 2840, pct: 32, color: "bg-sky-500" },
  { nome: "Sul", familias: 1970, pct: 22, color: "bg-emerald-500" },
  { nome: "Leste", familias: 1590, pct: 18, color: "bg-violet-500" },
  { nome: "Oeste", familias: 1340, pct: 15, color: "bg-amber-500" },
  { nome: "Centro", familias: 890, pct: 10, color: "bg-rose-500" },
  { nome: "Rural", familias: 304, pct: 3, color: "bg-slate-400" }
];

export default function MapaDistribuicao() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribuição por Região</h3>

      {/* Visual map placeholder */}
      <div className="relative bg-slate-50 rounded-lg h-36 mb-4 flex items-center justify-center border border-slate-200 overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 p-2">
          {regioes.map((r) => (
            <div
              key={r.nome}
              className={`${r.color} bg-opacity-20 rounded flex flex-col items-center justify-center border border-white`}
              style={{ background: `${r.color.replace("bg-", "").replace("-500", "")}20` }}
            >
              <span className="text-xs font-semibold text-slate-700">{r.nome}</span>
              <span className="text-xs text-slate-500">{r.familias.toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {regioes.map((r) => (
          <div key={r.nome} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 w-14">{r.nome}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div
                className={`${r.color} h-2 rounded-full`}
                style={{ width: `${r.pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-16 text-right">{r.familias.toLocaleString("pt-BR")}</span>
            <span className="text-xs font-medium text-slate-600 w-8 text-right">{r.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}