import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, GitBranch, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_COR = {
  "Ativo": "bg-emerald-100 text-emerald-700 border-emerald-300",
  "Suspenso": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "Cancelado": "bg-red-100 text-red-700 border-red-300",
  "Em Análise": "bg-blue-100 text-blue-700 border-blue-300",
  "Aguardando": "bg-slate-100 text-slate-600 border-slate-300",
};

const STATUS_PONTO = {
  "Ativo": "bg-emerald-500",
  "Suspenso": "bg-yellow-500",
  "Cancelado": "bg-red-500",
  "Em Análise": "bg-blue-500",
  "Aguardando": "bg-slate-400",
};

export default function ProgramasHistorico() {
  const [cpf, setCpf] = useState("");
  const [historico, setHistorico] = useState([]);
  const [beneficiario, setBeneficiario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const buscar = async () => {
    if (!cpf.trim()) return;
    setLoading(true);
    setBuscou(true);
    const cpfLimpo = cpf.replace(/\D/g, "");
    const data = await base44.entities.AlteracaoBeneficio.list("-data_hora_alteracao", 200);
    const filtrado = data.filter(r => (r.cpf_beneficiario || "").replace(/\D/g, "") === cpfLimpo);
    setHistorico(filtrado);
    if (filtrado.length > 0) {
      setBeneficiario({ nome: filtrado[0].nome_beneficiario, cpf: filtrado[0].cpf_beneficiario });
    } else {
      setBeneficiario(null);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") buscar(); };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GitBranch size={22} className="text-sky-600" />
          Histórico do Beneficiário
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Consulte o histórico de alterações de benefício por CPF</p>
      </div>

      {/* Busca por CPF */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <label className="text-sm font-medium text-slate-700 block mb-2">Informe o CPF do Beneficiário</label>
        <div className="flex gap-3 max-w-md">
          <Input
            placeholder="000.000.000-00"
            value={cpf}
            onChange={e => setCpf(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-base"
          />
          <Button onClick={buscar} disabled={loading || !cpf.trim()} className="bg-sky-600 hover:bg-sky-700 gap-1.5">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Buscar
          </Button>
        </div>
      </div>

      {/* Resultado */}
      {buscou && !loading && (
        <>
          {beneficiario && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl px-5 py-3">
              <p className="font-semibold text-sky-800">{beneficiario.nome}</p>
              <p className="text-sm text-sky-600">CPF: {beneficiario.cpf} · {historico.length} registro(s) encontrado(s)</p>
            </div>
          )}

          {historico.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <GitBranch size={40} className="mx-auto mb-3 opacity-25" />
              <p className="font-medium">Nenhum histórico encontrado</p>
              <p className="text-sm mt-1">Verifique o CPF informado</p>
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-4 top-0 bottom-4 w-0.5 bg-slate-200" />

              <div className="space-y-4">
                {historico.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 border-white shadow ${STATUS_PONTO[item.status_novo] || "bg-slate-400"}`}>
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>

                    <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-1">
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.status_anterior && (
                            <>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COR[item.status_anterior] || "bg-slate-100 text-slate-600 border-slate-300"}`}>
                                {item.status_anterior}
                              </span>
                              <ArrowRight size={14} className="text-slate-400" />
                            </>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COR[item.status_novo] || "bg-slate-100 text-slate-600 border-slate-300"}`}>
                            {item.status_novo}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {item.data_hora_alteracao
                            ? format(new Date(item.data_hora_alteracao), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "—"}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-slate-700">{item.motivo_alteracao}</p>
                      {item.justificativa && (
                        <p className="text-sm text-slate-500 mt-1 italic">"{item.justificativa}"</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        {item.numero_cartao && <span>Cartão: {item.numero_cartao}</span>}
                        {item.usuario_responsavel && <span>Por: {item.usuario_responsavel}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}