import { Pencil, Trash2, MapPin, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_ESTILO = {
  "Agendada":       "bg-sky-100 text-sky-700",
  "Realizada":      "bg-emerald-100 text-emerald-700",
  "Cancelada":      "bg-slate-200 text-slate-500",
  "Reagendada":     "bg-amber-100 text-amber-700",
  "Não Localizada": "bg-red-100 text-red-700",
};

const TIPO_COR = {
  "Busca Ativa":    "bg-violet-100 text-violet-700",
  "Acompanhamento": "bg-blue-100 text-blue-700",
  "Validação":      "bg-teal-100 text-teal-700",
  "Monitoramento":  "bg-orange-100 text-orange-700",
};

export default function AgendamentoLista({ visitas, onEditar, onExcluir, titulo }) {
  if (visitas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <Calendar size={28} className="text-slate-200 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Nenhuma visita agendada{titulo ? ` para ${titulo}` : ""}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {titulo && (
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">{titulo}</p>
      )}
      {visitas.map((v) => (
        <div
          key={v.id}
          className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
        >
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-800 truncate">{v.familia_nome}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_ESTILO[v.status] || "bg-slate-100 text-slate-600"}`}>
                {v.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TIPO_COR[v.tipo_visita] || "bg-slate-100 text-slate-600"}`}>
                {v.tipo_visita}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={11} />
                {v.data_agendamento
                  ? new Date(v.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })
                  : "—"}
              </span>
              {v.tecnico_responsavel && (
                <span className="flex items-center gap-1">
                  <User size={11} /> {v.tecnico_responsavel}
                </span>
              )}
            </div>
            {v.resultado && (
              <p className="text-xs text-slate-500 italic truncate">"{v.resultado}"</p>
            )}
            {!v.resultado && v.observacoes && (
              <p className="text-xs text-slate-400 truncate">{v.observacoes}</p>
            )}
            {v.fotos?.length > 0 && (
              <div className="flex gap-1 mt-1 flex-wrap">
                {v.fotos.slice(0, 4).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt={`Foto ${i+1}`} className="w-9 h-9 rounded object-cover border border-slate-200 hover:opacity-75 transition-opacity" />
                  </a>
                ))}
                {v.fotos.length > 4 && (
                  <div className="w-9 h-9 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-medium">
                    +{v.fotos.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEditar(v)} title="Editar">
              <Pencil size={13} className="text-slate-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onExcluir(v.id)} title="Excluir">
              <Trash2 size={13} className="text-red-400" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}