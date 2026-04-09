/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Dashboard from './pages/Dashboard';
import FamiliasCadastro from './pages/FamiliasCadastro';
import ProgramasContemplacoes from './pages/ProgramasContemplacoes';
import Relatorios from './pages/Relatorios';
import VisitaAgendamento from './pages/VisitaAgendamento';
import TabelasMunicipios from './pages/TabelasMunicipios';
import TabelasStatusFamilia from './pages/TabelasStatusFamilia';
import TabelasStatusVisita from './pages/TabelasStatusVisita';
import TabelasStatusPrograma from './pages/TabelasStatusPrograma';
import TabelasStatusPagamento from './pages/TabelasStatusPagamento';
import TabelasStatusCartao from './pages/TabelasStatusCartao';
import TabelasRegioes from './pages/TabelasRegioes';
import TabelasRegioesCG from './pages/TabelasRegioesCG';
import ConfigSupabase from './pages/ConfigSupabase';
import ProgramasCadastro from './pages/ProgramasCadastro';
import FamiliasBuscaAtiva from './pages/FamiliasBuscaAtiva';
import AgendaBuscaAtiva from './pages/AgendaBuscaAtiva';
import DicionarioDados from './pages/DicionarioDados';
import ConfigAgentesCampo from './pages/ConfigAgentesCampo';
import FamiliasAvaliacaoVulnerabilidade from './pages/FamiliasAvaliacaoVulnerabilidade';
import VisitaRegistro from './pages/VisitaRegistro';
import ProgramasAlteracaoBeneficio from './pages/ProgramasAlteracaoBeneficio';
import ProgramasHistorico from './pages/ProgramasHistorico';
import RelatorioAlteracaoBeneficio from './pages/RelatorioAlteracaoBeneficio';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "FamiliasCadastro": FamiliasCadastro,
    "ProgramasContemplacoes": ProgramasContemplacoes,
    "Relatorios": Relatorios,
    "VisitaAgendamento": VisitaAgendamento,
    "TabelasMunicipios": TabelasMunicipios,
    "TabelasStatusFamilia": TabelasStatusFamilia,
    "TabelasStatusVisita": TabelasStatusVisita,
    "TabelasStatusPrograma": TabelasStatusPrograma,
    "TabelasStatusPagamento": TabelasStatusPagamento,
    "TabelasStatusCartao": TabelasStatusCartao,
    "TabelasRegioes": TabelasRegioes,
    "TabelasRegioesCG": TabelasRegioesCG,
    "ConfigSupabase": ConfigSupabase,
    "ProgramasCadastro": ProgramasCadastro,
    "FamiliasBuscaAtiva": FamiliasBuscaAtiva,
    "AgendaBuscaAtiva": AgendaBuscaAtiva,
    "DicionarioDados": DicionarioDados,
    "ConfigAgentesCampo": ConfigAgentesCampo,
    "FamiliasAvaliacaoVulnerabilidade": FamiliasAvaliacaoVulnerabilidade,
    "VisitaRegistro": VisitaRegistro,
    "ProgramasAlteracaoBeneficio": ProgramasAlteracaoBeneficio,
    "ProgramasHistorico": ProgramasHistorico,
    "RelatorioAlteracaoBeneficio": RelatorioAlteracaoBeneficio,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};