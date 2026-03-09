import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS = ["Rascunho", "Pendente Aprovação", "Aprovado", "Reprovado", "Suspenso", "Cancelado", "Encerrado"];

export default function AprovacaoFiltros({ filtros, onChange, onLimpar }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por família ou programa..."
            className="pl-9"
            value={filtros.busca}
            onChange={(e) => onChange("busca", e.target.value)}
          />
        </div>
        <Select value={filtros.status} onValueChange={(v) => onChange("status", v)}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onLimpar} className="gap-1.5">
            <X size={13} /> Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}