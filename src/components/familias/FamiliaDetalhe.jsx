import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, MapPin } from "lucide-react";

function Item({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 font-medium">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}

function MapaFamilia({ lat, lng, nome }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }

    import("leaflet").then((L) => {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current).setView([lat, lng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.marker([lat, lng]).addTo(map).bindPopup(nome).openPopup();
      instanceRef.current = map;
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [lat, lng, nome]);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: "220px", width: "100%", borderRadius: "8px", zIndex: 0 }} />
    </>
  );
}

const situacaoCor = {
  "Ativo": "bg-emerald-100 text-emerald-700",
  "Inativo": "bg-slate-100 text-slate-600",
  "Pendente": "bg-amber-100 text-amber-700",
  "Suspenso": "bg-orange-100 text-orange-700",
  "Cancelado": "bg-red-100 text-red-700",
};

export default function FamiliaDetalhe({ open, familia, onClose, onEditar }) {
  if (!familia) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold text-slate-800">{familia.nome_responsavel}</DialogTitle>
              <p className="text-xs text-slate-400 mt-0.5">NIS: {familia.numero_nis || "Não informado"}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${situacaoCor[familia.situacao_cadastral] || "bg-slate-100 text-slate-600"}`}>
              {familia.situacao_cadastral || "—"}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <Section title="Identificação">
            <Item label="CPF" value={familia.cpf_responsavel} />
            <Item label="Data de Nascimento" value={familia.data_nascimento} />
            <Item label="Telefone" value={familia.telefone} />
            <Item label="E-mail" value={familia.email} />
            <Item label="Data de Cadastro" value={familia.data_cadastro} />
          </Section>

          <Section title="Endereço">
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-slate-400 font-medium">Endereço</p>
              <p className="text-sm text-slate-800 mt-0.5">{familia.endereco || "—"}</p>
            </div>
            <Item label="Bairro" value={familia.bairro} />
            <Item label="Município" value={familia.municipio} />
            <Item label="Região" value={familia.regiao} />
            <Item label="Latitude" value={familia.latitude} />
            <Item label="Longitude" value={familia.longitude} />
          </Section>

          {familia.latitude && familia.longitude && (
            <div>
              <h4 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3 pb-1 border-b border-sky-100 flex items-center gap-1.5">
                <MapPin size={12} /> Localização no Mapa
              </h4>
              <MapaFamilia
                lat={parseFloat(familia.latitude)}
                lng={parseFloat(familia.longitude)}
                nome={familia.nome_responsavel}
              />
            </div>
          )}

          <Section title="Composição Familiar">
            <Item label="Nº de Membros" value={familia.num_membros} />
            <Item label="Renda Familiar" value={familia.renda_familiar ? `R$ ${parseFloat(familia.renda_familiar).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : null} />
            <Item label="Tipo de Família" value={familia.tipo_familia} />
          </Section>

          <Section title="Status e Benefício">
            <Item label="Faixa de Pobreza" value={familia.faixa_pobreza} />
            <Item label="Status do Benefício" value={familia.status_beneficio} />
          </Section>

          {familia.observacoes && (
            <div>
              <h4 className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-2 pb-1 border-b border-sky-100">Observações</h4>
              <p className="text-sm text-slate-700 leading-relaxed">{familia.observacoes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button className="bg-sky-600 hover:bg-sky-700 gap-1.5" onClick={() => { onClose(); onEditar(familia); }}>
            <Pencil size={13} /> Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}