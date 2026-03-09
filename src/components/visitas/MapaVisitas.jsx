import { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import { Navigation, Layers, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix ícone padrão do Leaflet no Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const COR_STATUS = {
  "Agendada":       "#0ea5e9",
  "Realizada":      "#10b981",
  "Cancelada":      "#94a3b8",
  "Reagendada":     "#f59e0b",
  "Não Localizada": "#f43f5e",
};

const COR_TIPO = {
  "Busca Ativa":    "#8b5cf6",
  "Acompanhamento": "#0ea5e9",
  "Validação":      "#14b8a6",
  "Monitoramento":  "#f97316",
};

// Coordenadas de referência por região de MS
const COORDS_REGIAO = {
  "Bolsão":          { lat: -20.4697, lng: -52.6258 },
  "Central":         { lat: -20.4697, lng: -54.6201 },
  "Cone Sul":        { lat: -23.4558, lng: -54.6167 },
  "Grande Dourados": { lat: -22.2211, lng: -54.8056 },
  "Leste":           { lat: -21.1994, lng: -52.3717 },
  "Norte":           { lat: -18.9413, lng: -57.6561 },
  "Pantanal":        { lat: -19.5585, lng: -57.0539 },
  "Sudoeste":        { lat: -23.1292, lng: -55.2897 },
  "Sul Fronteira":   { lat: -22.5510, lng: -55.7260 },
};

// Jitter para não sobrepor marcadores sem lat/lng reais
function jitter(base, i) {
  const angle = (i * 137.5 * Math.PI) / 180;
  const r = 0.005 + (i % 5) * 0.003;
  return { lat: base.lat + r * Math.cos(angle), lng: base.lng + r * Math.sin(angle) };
}

function criarIcone(cor) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;border-radius:50% 50% 50% 0;
      background:${cor};border:2.5px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      transform:rotate(-45deg);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -24],
  });
}

function FitBounds({ pontos }) {
  const map = useMap();
  useEffect(() => {
    if (pontos.length > 0) {
      const bounds = L.latLngBounds(pontos.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [pontos, map]);
  return null;
}

export default function MapaVisitas({ visitas, diaSelecionado }) {
  const [filtroCor, setFiltroCor] = useState("status"); // "status" | "tipo"
  const [mostrarRaio, setMostrarRaio] = useState(true);
  const [mostrarRota, setMostrarRota] = useState(false);
  const [tecnicoRota, setTecnicoRota] = useState("todos");

  const tecnicos = useMemo(() => {
    const set = new Set(visitas.map((v) => v.tecnico_responsavel).filter(Boolean));
    return ["todos", ...Array.from(set)];
  }, [visitas]);

  // Atribui coordenadas: real (lat/lng) ou estimada por região + jitter
  const pontos = useMemo(() => {
    const contadores = {};
    return visitas
      .map((v) => {
        let lat = v.latitude;
        let lng = v.longitude;
        let estimado = false;

        if (!lat || !lng) {
          const base = COORDS_REGIAO[v.regiao] || { lat: -20.4697, lng: -54.6201 };
          const chave = v.regiao || "default";
          contadores[chave] = (contadores[chave] || 0) + 1;
          const pos = jitter(base, contadores[chave]);
          lat = pos.lat;
          lng = pos.lng;
          estimado = true;
        }
        return { ...v, lat, lng, estimado };
      });
  }, [visitas]);

  // Linha de rota por técnico (pontos agendados ordenados por data)
  const rotaPolyline = useMemo(() => {
    if (!mostrarRota) return [];
    const filtrados = tecnicoRota === "todos"
      ? pontos
      : pontos.filter((p) => p.tecnico_responsavel === tecnicoRota);
    return filtrados
      .filter((p) => p.status === "Agendada")
      .sort((a, b) => (a.data_agendamento || "").localeCompare(b.data_agendamento || ""))
      .map((p) => [p.lat, p.lng]);
  }, [pontos, mostrarRota, tecnicoRota]);

  const centroMS = [-20.4697, -54.6201];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Toolbar do mapa */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <Navigation size={14} className="text-sky-600" />
          <span className="text-sm font-semibold text-slate-700">Mapa de Visitas</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {pontos.length} visita(s)
          </span>
          {diaSelecionado && (
            <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
              {new Date(diaSelecionado + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Cor dos marcadores */}
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {[{ k: "status", l: "Por Status" }, { k: "tipo", l: "Por Tipo" }].map(({ k, l }) => (
              <button key={k} onClick={() => setFiltroCor(k)}
                className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium
                  ${filtroCor === k ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Raio de atendimento */}
          <button
            onClick={() => setMostrarRaio(!mostrarRaio)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all
              ${mostrarRaio ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-200 text-slate-500"}`}
          >
            {mostrarRaio ? <Eye size={12} /> : <EyeOff size={12} />} Raio
          </button>

          {/* Rota otimizada */}
          <button
            onClick={() => setMostrarRota(!mostrarRota)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all
              ${mostrarRota ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-white border-slate-200 text-slate-500"}`}
          >
            <Navigation size={12} /> Rota
          </button>

          {/* Seletor de técnico (só quando rota ativa) */}
          {mostrarRota && (
            <Select value={tecnicoRota} onValueChange={setTecnicoRota}>
              <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {tecnicos.map((t) => (
                  <SelectItem key={t} value={t}>{t === "todos" ? "Todos os técnicos" : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Mapa */}
      <div style={{ height: 440 }}>
        {pontos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Layers size={32} className="text-slate-200" />
            <p className="text-sm">Nenhuma visita com localização para exibir.</p>
            <p className="text-xs">Selecione um dia no calendário ou aguarde dados.</p>
          </div>
        ) : (
          <MapContainer
            center={centroMS}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <FitBounds pontos={pontos} />

            {/* Rota como Polyline */}
            {mostrarRota && rotaPolyline.length > 1 && (
              <Polyline
                positions={rotaPolyline}
                pathOptions={{ color: "#0ea5e9", weight: 2.5, dashArray: "6 4", opacity: 0.8 }}
              />
            )}

            {pontos.map((p, i) => {
              const cor = filtroCor === "status"
                ? COR_STATUS[p.status] || "#94a3b8"
                : COR_TIPO[p.tipo_visita] || "#94a3b8";

              return (
                <Marker key={p.id || i} position={[p.lat, p.lng]} icon={criarIcone(cor)}>
                  <Popup>
                    <div className="text-xs space-y-1 min-w-[160px]">
                      <p className="font-bold text-slate-800">{p.familia_nome}</p>
                      <p className="text-slate-500">{p.tipo_visita} · {p.status}</p>
                      {p.tecnico_responsavel && <p className="text-slate-500">👤 {p.tecnico_responsavel}</p>}
                      {p.data_agendamento && (
                        <p className="text-slate-500">📅 {new Date(p.data_agendamento + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                      )}
                      {p.endereco && <p className="text-slate-500">📍 {p.endereco}{p.bairro ? `, ${p.bairro}` : ""}</p>}
                      {p.municipio && <p className="text-slate-500">🏙️ {p.municipio} — {p.regiao || "—"}</p>}
                      {p.estimado && <p className="text-amber-500 text-[10px] mt-1">⚠ Posição estimada por região</p>}
                    </div>
                  </Popup>
                  {/* Raio de atendimento: 800m */}
                  {mostrarRaio && (
                    <Circle
                      center={[p.lat, p.lng]}
                      radius={800}
                      pathOptions={{ color: cor, fillColor: cor, fillOpacity: 0.06, weight: 1, dashArray: "4 3" }}
                    />
                  )}
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Legenda */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-wrap gap-3">
          {filtroCor === "status"
            ? Object.entries(COR_STATUS).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                  <span className="text-xs text-slate-500">{s}</span>
                </div>
              ))
            : Object.entries(COR_TIPO).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                  <span className="text-xs text-slate-500">{t}</span>
                </div>
              ))
          }
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-4 border-t border-dashed border-sky-400" /> Rota agendada
          </div>
        </div>
      </div>
    </div>
  );
}