import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];
const ANOS = ["2026", "2025", "2024"];
const REGIOES = ["Todas", "Bolsão", "Central", "Cone Sul", "Grande Dourados", "Leste", "Norte", "Pantanal", "Sudoeste", "Sul Fronteira"];
const TIPOS = ["Todos", "Busca Ativa", "Acompanhamento", "Validação", "Monitoramento"];

export default function RelatorioFiltros({ filtros, onChange, onLimpar }) {
  const mesAtual = new Date().getMonth();
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider self-center">
        <Filter size={12} /> Filtros
      </div>
      <div className="flex flex-wrap gap-3 flex-1">
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Mês</p>
          <Select value={filtros.mes} onValueChange={(v) => onChange("mes", v)}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MESES.map((m, i) => <SelectItem key={m} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Ano</p>
          <Select value={filtros.ano} onValueChange={(v) => onChange("ano", v)}>
            <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ANOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Região</p>
          <Select value={filtros.regiao} onValueChange={(v) => onChange("regiao", v)}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {REGIOES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Tipo de Visita</p>
          <Select value={filtros.tipo} onValueChange={(v) => onChange("tipo", v)}>
            <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="self-end">
          <Button variant="ghost" size="sm" onClick={onLimpar} className="h-8 text-xs gap-1 text-slate-500">
            <X size={12} /> Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}