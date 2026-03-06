import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, Users, MapPin, Heart, CreditCard, Zap,
  BarChart2, Table2, Settings, ChevronDown, ChevronRight,
  Menu, X, Bell, Search, User, LogOut
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    page: "Dashboard"
  },
  {
    label: "Famílias",
    icon: Users,
    children: [
      { label: "Cadastro", page: "FamiliasCadastro" },
      { label: "Busca Ativa", page: "FamiliasBuscaAtiva" }
    ]
  },
  {
    label: "Visita de Campo",
    icon: MapPin,
    children: [
      { label: "Agendamento", page: "VisitaAgendamento" },
      { label: "Registro de Visitas", page: "VisitaRegistro" },
      { label: "Validação de Família", page: "VisitaValidacao" }
    ]
  },
  {
    label: "Programas Sociais",
    icon: Heart,
    children: [
      { label: "Cadastro", page: "ProgramasCadastro" },
      { label: "Contemplações", page: "ProgramasContemplacoes" },
      { label: "Monitoramento", page: "ProgramasMonitoramento" },
      { label: "Histórico do Beneficiário", page: "ProgramasHistorico" },
      { label: "Importar Dados Federais", page: "ProgramasImportar" }
    ]
  },
  {
    label: "Gestão de Cartões",
    icon: CreditCard,
    children: [
      { label: "Emissão", page: "CartoesEmissao" },
      { label: "Segunda Via", page: "CartoesSegundaVia" },
      { label: "Renovação", page: "CartoesRenovacao" },
      { label: "Entrega do Cartão", page: "CartoesEntrega" },
      { label: "Liberação para Uso", page: "CartoesLiberacao" },
      { label: "Pagamentos de Ativos", page: "CartoesPagamentos" },
      { label: "Transferência de Saldos", page: "CartoesTransferencia" },
      { label: "Bloqueio", page: "CartoesBloqueio" },
      { label: "Desbloqueio", page: "CartoesDesbloqueio" },
      { label: "Retorno de Solicitações", page: "CartoesRetornoSolicitacoes" },
      { label: "Retornos Diários", page: "CartoesRetornoDiario" }
    ]
  },
  {
    label: "Gestão de PIX",
    icon: Zap,
    children: [
      { label: "Geração do Lote", page: "PixGeracaoLote" },
      { label: "Envio do Lote", page: "PixEnvioLote" },
      { label: "Retorno do Lote", page: "PixRetornoLote" },
      { label: "Bloqueio de PIX", page: "PixBloqueio" },
      { label: "Desbloqueio de PIX", page: "PixDesbloqueio" }
    ]
  },
  {
    label: "Relatórios",
    icon: BarChart2,
    page: "Relatorios"
  },
  {
    label: "Tabelas",
    icon: Table2,
    children: [
      { label: "Status de Família", page: "TabelasStatusFamilia" },
      { label: "Status de Visita de Campo", page: "TabelasStatusVisita" },
      { label: "Status de Programa Social", page: "TabelasStatusPrograma" },
      { label: "Status de Pagamento", page: "TabelasStatusPagamento" },
      { label: "Status de Cartão", page: "TabelasStatusCartao" },
      { label: "Municípios", page: "TabelasMunicipios" },
      { label: "Regiões", page: "TabelasRegioes" },
      { label: "Regiões de Campo Grande", page: "TabelasRegioesCG" },
      { label: "Calendário de Pagamentos", page: "TabelasCalendario" }
    ]
  },
  {
    label: "Configurações",
    icon: Settings,
    children: [
      { label: "Usuários", page: "ConfigUsuarios" }
    ]
  }
];

function MenuItem({ item, currentPageName, depth = 0 }) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.page === currentPageName ||
    (hasChildren && item.children.some(c => c.page === currentPageName));
  const [open, setOpen] = useState(isActive);

  if (!hasChildren) {
    return (
      <Link
        to={createPageUrl(item.page)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
          ${depth > 0 ? "ml-6 pl-3" : ""}
          ${currentPageName === item.page
            ? "bg-sky-600 text-white font-medium"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
      >
        {item.icon && <item.icon size={16} />}
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all
          ${isActive ? "text-sky-400" : "text-slate-300 hover:bg-slate-700 hover:text-white"}`}
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon size={16} />}
          <span>{item.label}</span>
        </div>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="mt-1 space-y-0.5">
          {item.children.map((child) => (
            <MenuItem key={child.page} item={child} currentPageName={currentPageName} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 font-inter overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .font-inter { font-family: 'Inter', sans-serif; }
        :root { --primary: #0ea5e9; }
      `}</style>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-30 flex flex-col bg-slate-900 transition-all duration-300 h-full
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "w-64" : "w-16"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Heart size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white font-semibold text-sm leading-tight">Gestão Social</p>
              <p className="text-sky-400 text-xs">Estadual</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {menuItems.map((item) => (
            <MenuItem key={item.label} item={item} currentPageName={currentPageName} />
          ))}
        </nav>

        {/* Toggle sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center p-3 border-t border-slate-700 text-slate-400 hover:text-white"
        >
          {sidebarOpen ? <ChevronRight size={16} /> : <ChevronDown size={16} className="rotate-90" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 w-64"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-slate-100">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-slate-800 leading-tight">Admin</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}