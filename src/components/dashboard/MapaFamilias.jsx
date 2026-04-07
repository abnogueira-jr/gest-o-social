import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { base44 } from "@/api/base44Client";
import { Users, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Coordenadas aproximadas dos municípios do MS mais comuns
const MUNICIPIOS_COORDS = {
  "Campo Grande": [-20.4697, -54.6201],
  "Dourados": [-22.2211, -54.8056],
  "Três Lagoas": [-20.7849, -51.7008],
  "Corumbá": [-19.0078, -57.6531],
  "Ponta Porã": [-22.5369, -55.7259],
  "Naviraí": [-23.0617, -54.1897],
  "Nova Andradina": [-22.2333, -53.3431],
  "Aquidauana": [-20.4697, -55.7869],
  "Coxim": [-18.5067, -54.7608],
  "Paranaíba": [-19.6758, -51.1908],
  "Sidrolândia": [-20.9319, -54.9597],
  "Maracaju": [-21.6133, -55.1683],
  "Jardim": [-21.4800, -56.1500],
  "Bonito": [-21.1264, -56.4847],
  "Miranda": [-20.2397, -56.3764],
  "Chapadão do Sul": [-18.7908, -52.6258],
  "São Gabriel do Oeste": [-19.3950, -54.5597],
  "Ribas do Rio Pardo": [-20.4444, -53.7581],
  "Anastácio": [-20.4833, -55.8167],
  "Amambai": [-23.1050, -55.2258],
  "Itaquiraí": [-23.4769, -54.1869],
  "Eldorado": [-23.7842, -54.2819],
  "Iguatemi": [-23.6764, -54.5575],
  "Mundo Novo": [-23.9361, -54.2808],
  "Tacuru": [-23.6347, -55.0128],
  "Sete Quedas": [-23.9775, -55.0325],
  "Paranhos": [-23.8897, -55.4342],
};

function FitBounds() {
  const map = useMap();
  useEffect(() => {
    // Centro do MS com zoom para mostrar o estado inteiro
    map.setView([-20.7722, -54.7852], 6);
  }, [map]);
  return null;
}

export default function MapaFamilias() {
  const [familias, setFamilias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pontos, setPontos] = useState([]);

  useEffect(() => {
    base44.entities.Familia.list("-created_date", 500).then(data => {
      setFamilias(data);

      // Agrupa por município para criar pontos no mapa
      const agrupado = {};
      data.forEach(f => {
        const mun = f.municipio || "Campo Grande";
        if (!agrupado[mun]) agrupado[mun] = { municipio: mun, count: 0, familias: [] };
        agrupado[mun].count++;
        agrupado[mun].familias.push(f.nome_responsavel);
      });

      const pts = Object.values(agrupado).map(g => {
        const coords = MUNICIPIOS_COORDS[g.municipio];
        if (!coords) return null;
        // Adiciona pequena variação aleatória (seed por nome) para evitar sobreposição exata
        return {
          ...g,
          lat: coords[0] + (Math.sin(g.municipio.charCodeAt(0)) * 0.05),
          lng: coords[1] + (Math.cos(g.municipio.charCodeAt(0)) * 0.05),
        };
      }).filter(Boolean);

      // Também adiciona pontos individuais com lat/lng se disponíveis
      const individuais = data
        .filter(f => f.latitude && f.longitude)
        .map(f => ({
          municipio: f.municipio || "—",
          count: 1,
          familias: [f.nome_responsavel],
          lat: f.latitude,
          lng: f.longitude,
          individual: true,
        }));

      setPontos([...pts, ...individuais]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const maxCount = Math.max(...pontos.map(p => p.count), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MapPin size={15} className="text-sky-500" />
            Famílias por Município — MS
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? "Carregando..." : (
              <><span className="font-semibold text-slate-600">{familias.length.toLocaleString("pt-BR")}</span> famílias cadastradas</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-lg">
          <Users size={13} className="text-sky-500" />
          <span className="text-xs font-medium text-sky-600">{pontos.length} municípios</span>
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-lg">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="h-[400px] rounded-lg overflow-hidden border border-slate-100">
          <MapContainer
            center={[-20.7722, -54.7852]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <FitBounds />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {pontos.map((p, i) => {
              const radius = p.individual ? 6 : Math.max(8, Math.min(28, (p.count / maxCount) * 28));
              return (
                <CircleMarker
                  key={i}
                  center={[p.lat, p.lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: p.individual ? "#10b981" : "#0ea5e9",
                    color: "#fff",
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.75,
                  }}
                >
                  <Popup>
                    <div className="text-xs min-w-[120px]">
                      <p className="font-semibold text-slate-700 mb-1">{p.municipio}</p>
                      <p className="text-slate-500">
                        <span className="font-semibold text-sky-600">{p.count}</span>{" "}
                        {p.count === 1 ? "família" : "famílias"}
                      </p>
                      {p.familias.slice(0, 3).map((n, j) => (
                        <p key={j} className="text-slate-400 mt-0.5 truncate max-w-[160px]">• {n}</p>
                      ))}
                      {p.count > 3 && <p className="text-slate-400 mt-0.5">+{p.count - 3} outras</p>}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Legenda */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-sky-400 border border-white" />
          <span className="text-xs text-slate-500">Por município</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 border border-white" />
          <span className="text-xs text-slate-500">Localização exata</span>
        </div>
        <span className="text-xs text-slate-400 ml-auto">Tamanho proporcional ao nº de famílias</span>
      </div>
    </div>
  );
}