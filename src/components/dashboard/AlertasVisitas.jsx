import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Clock, CalendarCheck, X, CalendarClock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function diffDias(dataStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataStr + "T00:00:00");
  return Math.floor((data - hoje) / (1000 * 60 * 60 * 24));
}

function BadgeStatus({ diff }) {
  if (diff < 0) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
      <AlertTriangle size={10} /> {Math.abs(diff)}d atrasada
    </span>
  );
  if (diff === 0) return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
      <Clock size={10} /> Hoje
    </span>
  );
  return null;
}

function ModalReagendar({ visita, onClose, onSalvo }) {
  const [novaData, setNovaData] = useState(visita?.data_agendamento || "");
  const [saving, setSaving] = useState(false);

  const handleSalvar = async () => {
    if (!novaData) return;
    setSaving(true);
    await base44.entities.VisitaCampo.update(visita.id, {
      data_agendamento: novaData,
      status: "Reagendada"
    });
    toast.success("Visita reagendada com sucesso!");
    setSaving(false);
    onSalvo();
    onClose();
  };

  return (
    <Dialog open={!!visita} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarClock size={16} className="text-sky-600" /> Reagendar Visita
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div>
            <p className="text-xs text-slate-500 font-medium">Família</p>
            <p className="text-sm text-slate-800 font-medium">{visita?.familia_nome}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Técnico</p>
            <p className="text-sm text-slate-700">{visita?.tecnico_responsavel || "—"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600 font-medium">Nova Data de Agendamento</Label>
            <Input
              type="date"
              value={novaData}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setNovaData(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" disabled={saving || !novaData} onClick={handleSalvar} className="bg-sky-600 hover:bg-sky-700">
            {saving ? "Salvando..." : "Reagendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AlertasVisitas() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState(true);
  const [reagendando, setReagendando] = useState(null);

  const carregar = async () => {
    setLoading(true);
    const todas = await base44.entities.VisitaCampo.filter({ status: "Agendada" }, "-data_agendamento", 200);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alertas = todas
      .filter((v) => v.data_agendamento && diffDias(v.data_agendamento) <= 0)
      .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento));
    setVisitas(alertas);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  if (loading) return null;
  if (visitas.length === 0) return null;

  const atrasadas = visitas.filter((v) => diffDias(v.data_agendamento) < 0);
  const hoje = visitas.filter((v) => diffDias(v.data_agendamento) === 0);

  return (
    <>
      <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
        {/* Header do alerta */}
        <button
          onClick={() => setExpandido(!expandido)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-100/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-red-800">
                Atenção — Visitas Pendentes
              </p>
              <p className="text-xs text-red-600">
                {atrasadas.length > 0 && `${atrasadas.length} atrasada${atrasadas.length > 1 ? "s" : ""}`}
                {atrasadas.length > 0 && hoje.length > 0 && " · "}
                {hoje.length > 0 && `${hoje.length} para hoje`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-600 text-white rounded-full px-2 py-0.5 font-bold">{visitas.length}</span>
            {expandido ? <ChevronUp size={16} className="text-red-500" /> : <ChevronDown size={16} className="text-red-500" />}
          </div>
        </button>

        {/* Lista de visitas */}
        {expandido && (
          <div className="border-t border-red-200 divide-y divide-red-100">
            {visitas.map((v) => {
              const diff = diffDias(v.data_agendamento);
              return (
                <div key={v.id} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white/60 hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${diff < 0 ? "bg-red-500" : "bg-amber-400"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{v.familia_nome}</p>
                      <p className="text-xs text-slate-400">
                        {v.tecnico_responsavel || "Técnico não definido"} · {v.tipo_visita || "Visita"} · {new Date(v.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <BadgeStatus diff={diff} />
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2.5 border-sky-300 text-sky-700 hover:bg-sky-50 gap-1"
                      onClick={() => setReagendando(v)}
                    >
                      <CalendarClock size={11} /> Reagendar
                    </Button>
                  </div>
                </div>
              );
            })}

            <div className="px-4 py-2 bg-red-50 flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700 gap-1" onClick={carregar}>
                <RefreshCw size={11} /> Atualizar
              </Button>
            </div>
          </div>
        )}
      </div>

      <ModalReagendar
        visita={reagendando}
        onClose={() => setReagendando(null)}
        onSalvo={carregar}
      />
    </>
  );
}