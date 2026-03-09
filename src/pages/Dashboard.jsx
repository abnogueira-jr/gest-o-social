import KpiCards from "@/components/dashboard/KpiCards";
import AlertasVisitas from "@/components/dashboard/AlertasVisitas";
import GraficoRegistroFamilias from "@/components/dashboard/GraficoRegistroFamilias";
import GraficoEvolucaoPagamentos from "@/components/dashboard/GraficoEvolucaoPagamentos";
import GraficosTipoPizza from "@/components/dashboard/GraficosTipoPizza";
import GraficosPorRenda from "@/components/dashboard/GraficosPorenda";
import AtividadesRecentes from "@/components/dashboard/AtividadesRecentes";
import MapaDistribuicao from "@/components/dashboard/MapaDistribuicao";

export default function Dashboard() {
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 capitalize">{hoje}</p>
      </div>

      {/* KPIs */}
      <KpiCards />

      {/* Gráficos de linha */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GraficoRegistroFamilias />
        <GraficoEvolucaoPagamentos />
      </div>

      {/* Pizza — tipo, situação, status */}
      <GraficosTipoPizza />

      {/* Barras sem programa + Pizza com programa */}
      <GraficosPorRenda />

      {/* Atividades recentes + Mapa */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <AtividadesRecentes />
        </div>
        <MapaDistribuicao />
      </div>
    </div>
  );
}