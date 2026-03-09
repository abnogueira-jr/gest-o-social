import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const STATUS_COR = {
  "Agendada":       "bg-sky-500",
  "Realizada":      "bg-emerald-500",
  "Cancelada":      "bg-slate-400",
  "Reagendada":     "bg-amber-500",
  "Não Localizada": "bg-red-500",
};

export default function AgendamentoCalendario({ visitas, mesAtual, onMesAnterior, onProximoMes, onDiaSelecionado, diaSelecionado }) {
  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();

  // Mapeia visitas por dia
  const visitasPorDia = useMemo(() => {
    const mapa = {};
    visitas.forEach((v) => {
      if (!v.data_agendamento) return;
      const d = new Date(v.data_agendamento + "T00:00:00");
      if (d.getFullYear() === ano && d.getMonth() === mes) {
        const dia = d.getDate();
        if (!mapa[dia]) mapa[dia] = [];
        mapa[dia].push(v);
      }
    });
    return mapa;
  }, [visitas, ano, mes]);

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

  const cells = [];
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= diasNoMes; d++) cells.push(d);

  const diaAtualStr = (d) =>
    `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMesAnterior}>
          <ChevronLeft size={15} />
        </Button>
        <h3 className="text-sm font-semibold text-slate-700">
          {MESES[mes]} {ano}
        </h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onProximoMes}>
          <ChevronRight size={15} />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grade dos dias */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((dia, i) => {
          if (!dia) return <div key={`empty-${i}`} />;
          const str = diaAtualStr(dia);
          const vissDia = visitasPorDia[dia] || [];
          const isHoje = str === hojeStr;
          const isSelecionado = str === diaSelecionado;

          return (
            <button
              key={dia}
              onClick={() => onDiaSelecionado(isSelecionado ? null : str)}
              className={`relative min-h-[52px] rounded-lg p-1 text-left transition-all border
                ${isSelecionado ? "border-sky-500 bg-sky-50" : "border-transparent hover:border-slate-200 hover:bg-slate-50"}
                ${isHoje && !isSelecionado ? "bg-sky-50/50" : ""}
              `}
            >
              <span className={`text-xs font-semibold block text-right pr-0.5
                ${isHoje ? "text-sky-600" : "text-slate-700"}
              `}>{dia}</span>
              {/* Pontos de visitas */}
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {vissDia.slice(0, 4).map((v, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${STATUS_COR[v.status] || "bg-slate-400"}`}
                    title={`${v.familia_nome} — ${v.status}`}
                  />
                ))}
                {vissDia.length > 4 && (
                  <span className="text-[10px] text-slate-400 leading-none">+{vissDia.length - 4}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-100">
        {Object.entries(STATUS_COR).map(([s, cor]) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cor}`} />
            <span className="text-xs text-slate-500">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}