import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Play, RotateCcw, TableIcon } from "lucide-react";

// ─── Definição dos campos disponíveis ────────────────────────────────────────
const CAMPOS = [
  { key: "situacao_cadastral", label: "Situação Cadastral", type: "string" },
  { key: "faixa_pobreza", label: "Faixa de Pobreza", type: "string" },
  { key: "municipio", label: "Município", type: "string" },
  { key: "regiao", label: "Região", type: "string" },
  { key: "bairro", label: "Bairro", type: "string" },
  { key: "genero", label: "Gênero", type: "string" },
  { key: "estado_civil", label: "Estado Civil", type: "string" },
  { key: "escolaridade", label: "Escolaridade", type: "string" },
  { key: "situacao_ocupacao", label: "Situação de Ocupação", type: "string" },
  { key: "tipo_familia", label: "Tipo de Família", type: "string" },
  { key: "situacao_moradia", label: "Situação da Moradia", type: "string" },
  { key: "tipo_moradia", label: "Tipo de Moradia", type: "string" },
  { key: "status_beneficio", label: "Status do Benefício", type: "string" },
  { key: "possui_doenca", label: "Possui Doença", type: "boolean" },
  { key: "possui_deficiencia", label: "Possui Deficiência", type: "boolean" },
  { key: "possui_beneficio", label: "Possui Benefício", type: "boolean" },
  { key: "participa_qualifica_ms", label: "Participa Qualifica MS", type: "boolean" },
];

const MEDIDAS = [
  { key: "count", label: "Contagem de Famílias" },
  { key: "renda_mensal", label: "Soma Renda Mensal" },
  { key: "renda_per_capita", label: "Média Renda Per Capita" },
  { key: "num_membros", label: "Soma Nº de Membros" },
];

function getFieldValue(record, key) {
  const v = record[key];
  if (v === undefined || v === null || v === "") return "(vazio)";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  return String(v);
}

function calcMedida(records, medida) {
  if (records.length === 0) return 0;
  if (medida === "count") return records.length;
  if (medida === "renda_mensal") return records.reduce((s, r) => s + (Number(r.renda_mensal) || 0), 0).toFixed(2);
  if (medida === "renda_per_capita") return (records.reduce((s, r) => s + (Number(r.renda_per_capita) || 0), 0) / records.length).toFixed(2);
  if (medida === "num_membros") return records.reduce((s, r) => s + (Number(r.num_membros) || 0), 0);
  return 0;
}

function buildPivot(records, rowField, colField, medida) {
  const rowValues = [...new Set(records.map(r => getFieldValue(r, rowField)))].sort();
  const colValues = colField
    ? [...new Set(records.map(r => getFieldValue(r, colField)))].sort()
    : null;

  const pivot = {};
  rowValues.forEach(rv => { pivot[rv] = {}; });

  records.forEach(r => {
    const rv = getFieldValue(r, rowField);
    const cv = colField ? getFieldValue(r, colField) : "__total__";
    if (!pivot[rv][cv]) pivot[rv][cv] = [];
    pivot[rv][cv].push(r);
  });

  return { rowValues, colValues, pivot };
}

function exportCSV(rowValues, colValues, pivot, medida, rowField, colField) {
  const cols = colValues || ["Total"];
  const header = [rowField, ...cols, "Total"].join(";");
  const lines = [header];

  rowValues.forEach(rv => {
    const rowData = cols.map(cv => {
      const key = colValues ? cv : "__total__";
      return calcMedida(pivot[rv][key] || [], medida);
    });
    const total = calcMedida(Object.values(pivot[rv]).flat(), medida);
    lines.push([rv, ...rowData, total].join(";"));
  });

  // totals row
  const totalsRow = cols.map(cv => {
    const key = colValues ? cv : "__total__";
    const allRecs = rowValues.flatMap(rv => pivot[rv][key] || []);
    return calcMedida(allRecs, medida);
  });
  const grandTotal = calcMedida(rowValues.flatMap(rv => Object.values(pivot[rv]).flat()), medida);
  lines.push(["TOTAL", ...totalsRow, grandTotal].join(";"));

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `painel_dimensional_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PainelDimensional() {
  const [rowField, setRowField] = useState("");
  const [colField, setColField] = useState("");
  const [medida, setMedida] = useState("count");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState(null);

  const handleGerar = async () => {
    if (!rowField) return;
    setLoading(true);
    let all = await base44.entities.Familia.list("-created_date", 5000);
    if (dateFrom || dateTo) {
      all = all.filter(r => {
        const d = r.data_cadastro || r.created_date?.slice(0, 10);
        if (!d) return true;
        if (dateFrom && d < dateFrom) return false;
        if (dateTo && d > dateTo) return false;
        return true;
      });
    }
    setRecords(all);
    setLoading(false);
  };

  const pivot = useMemo(() => {
    if (!records || !rowField) return null;
    return buildPivot(records, rowField, colField || null, medida);
  }, [records, rowField, colField, medida]);

  const medidaLabel = MEDIDAS.find(m => m.key === medida)?.label || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Painel Dimensional</h1>
          <p className="text-sm text-slate-500 mt-0.5">Analise dados de famílias com tabelas dinâmicas personalizadas</p>
        </div>
        {pivot && (
          <Button variant="outline" className="gap-2" onClick={() =>
            exportCSV(pivot.rowValues, pivot.colValues, pivot.pivot, medida, rowField, colField)
          }>
            <Download size={15} /> Exportar CSV
          </Button>
        )}
      </div>

      {/* Configuração */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Configuração</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dimensão Linha */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Dimensão — Linhas <span className="text-red-500">*</span></Label>
            <Select value={rowField} onValueChange={setRowField}>
              <SelectTrigger><SelectValue placeholder="Selecione um campo" /></SelectTrigger>
              <SelectContent>
                {CAMPOS.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Dimensão Coluna */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Dimensão — Colunas (opcional)</Label>
            <Select value={colField} onValueChange={setColField}>
              <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Nenhuma</SelectItem>
                {CAMPOS.filter(c => c.key !== rowField).map(c => (
                  <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Medida */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Medida (valor)</Label>
            <Select value={medida} onValueChange={setMedida}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MEDIDAS.map(m => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de Data */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Intervalo de Data de Cadastro</Label>
            <div className="flex gap-2">
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs" />
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button onClick={handleGerar} disabled={!rowField || loading} className="bg-sky-600 hover:bg-sky-700 gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Carregando...</>
              : <><Play size={14} /> Gerar Tabela</>}
          </Button>
          {records !== null && (
            <Button variant="outline" className="gap-2" onClick={() => { setRecords(null); }}>
              <RotateCcw size={14} /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Resultado */}
      {pivot && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
            <TableIcon size={15} className="text-sky-600" />
            <span className="text-sm font-semibold text-slate-700">Resultado — {medidaLabel}</span>
            <span className="ml-auto text-xs text-slate-400">{records.length} famílias processadas</span>
          </div>

          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200 whitespace-nowrap">
                    {CAMPOS.find(c => c.key === rowField)?.label}
                  </th>
                  {pivot.colValues
                    ? pivot.colValues.map(cv => (
                      <th key={cv} className="text-right px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200 whitespace-nowrap">
                        {cv}
                      </th>
                    ))
                    : null
                  }
                  <th className="text-right px-4 py-2.5 font-semibold text-sky-700 border-b border-slate-200 bg-sky-50 whitespace-nowrap">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {pivot.rowValues.map((rv, ri) => {
                  const rowTotal = calcMedida(Object.values(pivot.pivot[rv]).flat(), medida);
                  return (
                    <tr key={rv} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-4 py-2 font-medium text-slate-700 border-b border-slate-100 whitespace-nowrap">{rv}</td>
                      {pivot.colValues
                        ? pivot.colValues.map(cv => (
                          <td key={cv} className="px-4 py-2 text-right text-slate-600 border-b border-slate-100 tabular-nums">
                            {calcMedida(pivot.pivot[rv][cv] || [], medida)}
                          </td>
                        ))
                        : null
                      }
                      <td className="px-4 py-2 text-right font-semibold text-sky-700 border-b border-slate-100 bg-sky-50/40 tabular-nums">
                        {pivot.colValues ? rowTotal : calcMedida(pivot.pivot[rv]["__total__"] || [], medida)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100">
                  <td className="px-4 py-2.5 font-bold text-slate-800">TOTAL</td>
                  {pivot.colValues
                    ? pivot.colValues.map(cv => {
                      const allRecs = pivot.rowValues.flatMap(rv => pivot.pivot[rv][cv] || []);
                      return (
                        <td key={cv} className="px-4 py-2.5 text-right font-bold text-slate-800 tabular-nums">
                          {calcMedida(allRecs, medida)}
                        </td>
                      );
                    })
                    : null
                  }
                  <td className="px-4 py-2.5 text-right font-bold text-sky-800 bg-sky-100 tabular-nums">
                    {calcMedida(pivot.rowValues.flatMap(rv => Object.values(pivot.pivot[rv]).flat()), medida)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {records !== null && !pivot && (
        <div className="text-center py-16 text-slate-400 text-sm">Selecione ao menos a dimensão de Linhas e clique em Gerar Tabela.</div>
      )}

      {records === null && (
        <div className="border-2 border-dashed border-slate-200 rounded-xl py-20 text-center">
          <TableIcon size={36} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Configure as dimensões e clique em <strong>Gerar Tabela</strong></p>
          <p className="text-slate-400 text-xs mt-1">Os dados serão processados e exibidos aqui</p>
        </div>
      )}
    </div>
  );
}