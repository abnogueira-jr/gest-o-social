import CrudStatus from "@/components/tabelas/CrudStatus";
import { Users } from "lucide-react";

export default function TabelasStatusFamilia() {
  return <CrudStatus titulo="Status de Família" entityName="StatusFamilia" icone={Users} />;
}