import { MapPin, Heart, CreditCard, Users, Lock, Unlock } from "lucide-react";

const atividades = [
  { tipo: "Cadastro", desc: "Nova família cadastrada: Maria Silva", tempo: "há 5 min", icon: Users, color: "bg-sky-100 text-sky-600" },
  { tipo: "Visita", desc: "Visita realizada: João Pereira — Região Norte", tempo: "há 18 min", icon: MapPin, color: "bg-amber-100 text-amber-600" },
  { tipo: "Contemplação", desc: "Família Santos incluída no Prog. Renda Cidadã", tempo: "há 32 min", icon: Heart, color: "bg-emerald-100 text-emerald-600" },
  { tipo: "Pagamento", desc: "Pagamento processado: R$ 450,00 — Cartão", tempo: "há 1h", icon: CreditCard, color: "bg-violet-100 text-violet-600" },
  { tipo: "Bloqueio", desc: "Cartão bloqueado: Ana Rodrigues — Perda", tempo: "há 2h", icon: Lock, color: "bg-red-100 text-red-600" },
  { tipo: "Cadastro", desc: "Nova família cadastrada: Carlos Mendes", tempo: "há 2h 15min", icon: Users, color: "bg-sky-100 text-sky-600" },
  { tipo: "Visita", desc: "Visita agendada: Família Oliveira — Zona Sul", tempo: "há 3h", icon: MapPin, color: "bg-amber-100 text-amber-600" },
  { tipo: "Desbloqueio", desc: "Cartão desbloqueado: Pedro Costa", tempo: "há 4h", icon: Unlock, color: "bg-teal-100 text-teal-600" }
];

export default function AtividadesRecentes() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Atividades Recentes</h3>
      <div className="space-y-3">
        {atividades.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${a.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <a.icon size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700 leading-tight">{a.desc}</p>
              <p className="text-xs text-slate-400 mt-0.5">{a.tempo}</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">{a.tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}