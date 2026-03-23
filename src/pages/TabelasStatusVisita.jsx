import CrudStatus from "@/components/tabelas/CrudStatus";
import { MapPin } from "lucide-react";

export default function TabelasStatusVisita() {
  return <CrudStatus titulo="Status de Visita de Campo" entityName="StatusVisita" icone={MapPin} />;
}