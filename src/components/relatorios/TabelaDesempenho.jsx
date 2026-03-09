import { TrendingUp } from "lucide-react";

function BarraProgresso({ valor, max, cor }) {
  const pct = max > 0 ? Math.round((valor / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all ${cor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-6 text-right">{valor}</span>
    </div>
  );
}

export default function TabelaDesempenho({ dados }) {
  if (!dados.length) return (
    <div className="text-center py-8 text-slate-400 text-sm">Sem dados para o período.</div>
  );

  const maxTotal = Math.max(...dados.map((d) => d.total), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Técnico</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider hidden sm:table-cell">Realizadas</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-sky-600 uppercase tracking-wider hidden md:table-cell">Agendadas</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-red-500 uppercase tracking-wider hidden lg:table-cell">Não Loc.</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Canceladas</th>
            <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Efetividade</th>
            <th className="text-center px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Produção</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {dados.sort((a, b) => b.total - a.total).map((d, i) => {
            const taxa = d.total > 0 ? Math.round((d.Realizada / d.total) * 100) : 0;
            const corTaxa = taxa >= 75 ? "text-emerald-600" : taxa >= 50 ? "text-amber-600" : "text-red-500";
            return (
              <tr key={d.tecnico} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-xs font-bold text-sky-600">
                      {i + 1}
                    </div>
                    <span className="font-medium text-slate-800">{d.tecnico}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-bold text-slate-700">{d.total}</td>
                <td className="px-3 py-3 text-center text-emerald-600 font-medium hidden sm:table-cell">{d.Realizada}</td>
                <td className="px-3 py-3 text-center text-sky-600 hidden md:table-cell">{d.Agendada}</td>
                <td className="px-3 py-3 text-center text-red-500 hidden lg:table-cell">{d["Não Localizada"] || 0}</td>
                <td className="px-3 py-3 text-center text-slate-400 hidden lg:table-cell">{d.Cancelada || 0}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${taxa >= 75 ? "bg-emerald-500" : taxa >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${taxa}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${corTaxa}`}>{taxa}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 hidden xl:table-cell">
                  <BarraProgresso valor={d.total} max={maxTotal} cor="bg-sky-400" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}