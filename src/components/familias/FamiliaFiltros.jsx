import { Search, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const regioes = ["Bolsão", "Central", "Cone Sul", "Grande Dourados", "Leste", "Norte", "Pantanal", "Sudoeste", "Sul Fronteira"];

export default function FamiliaFiltros({ filtros, onChange, onLimpar }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative lg:col-span-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nome, CPF ou NIS..."
            className="pl-9"
            value={filtros.busca}
            onChange={(e) => onChange("busca", e.target.value)}
          />
        </div>

        <Select value={filtros.situacao} onValueChange={(v) => onChange("situacao", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Situação Cadastral" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Pendente">Pendente</SelectItem>
            <SelectItem value="Suspenso">Suspenso</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtros.regiao} onValueChange={(v) => onChange("regiao", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            {regioes.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtros.faixaPobreza} onValueChange={(v) => onChange("faixaPobreza", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Faixa de Pobreza" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="Extrema Pobreza">Extrema Pobreza</SelectItem>
            <SelectItem value="Pobreza">Pobreza</SelectItem>
            <SelectItem value="Baixa Renda">Baixa Renda</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtros.statusBeneficio} onValueChange={(v) => onChange("statusBeneficio", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status Benefício" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Suspenso">Suspenso</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
            <SelectItem value="Em Análise">Em Análise</SelectItem>
            <SelectItem value="Aguardando">Aguardando</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtros.municipio} onValueChange={(v) => onChange("municipio", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Município" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Campo Grande">Campo Grande</SelectItem>
            <SelectItem value="Dourados">Dourados</SelectItem>
            <SelectItem value="Três Lagoas">Três Lagoas</SelectItem>
            <SelectItem value="Corumbá">Corumbá</SelectItem>
            <SelectItem value="Ponta Porã">Ponta Porã</SelectItem>
            <SelectItem value="Naviraí">Naviraí</SelectItem>
            <SelectItem value="Nova Andradina">Nova Andradina</SelectItem>
            <SelectItem value="Aquidauana">Aquidauana</SelectItem>
            <SelectItem value="Coxim">Coxim</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onLimpar} className="gap-1.5">
            <X size={13} /> Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}