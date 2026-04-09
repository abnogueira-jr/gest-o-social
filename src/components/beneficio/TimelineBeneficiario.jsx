import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, GitBranch, ArrowRight } from "lucide-react";
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

export default function TimelineBeneficiario({ open, onClose, cpf, nome }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && cpf) {
      carregarHistorico();
    }
  }, [open, cpf]);

  const carregarHistorico = async () => {
    setLoading(true);
    const cpfLimpo = cpf.replace(/\D/g, "");
    const data = await base44.entities.AlteracaoBeneficio.list("-data_hora_alteracao", 200);
    const filtrado = data.filter(r => (r.cpf_beneficiario || "").replace(/\D/g, "") === cpfLimpo);
    setHistorico(filtrado);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <GitBranch size={18} className="text-sky-600" />
            Timeline do Beneficiário
          </DialogTitle>
          {nome && <p className="text-sm text-slate-500 mt-0.5">{nome} · CPF: {cpf}</p>}
        </DialogHeader>

        <div className="pt-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-slate-400" />
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <GitBranch size={32} className="mx-auto mb-2 opacity-30" />
              <p>Nenhum histórico encontrado para este CPF</p>
            </div>
          ) : (
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

              <div className="space-y-4">
                {historico.map((item, idx) => (
                  <div key={item.id} className="flex gap-4 relative">
                    {/* Ponto na linha */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-2 border-white shadow ${STATUS_PONTO[item.status_novo] || "bg-slate-400"}`}>
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>

                    {/* Card */}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}