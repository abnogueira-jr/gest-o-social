import CrudStatus from "@/components/tabelas/CrudStatus";
import { Zap } from "lucide-react";

export default function TabelasStatusPagamento() {
  return <CrudStatus titulo="Status de Pagamento" entityName="StatusPagamento" icone={Zap} />;
}