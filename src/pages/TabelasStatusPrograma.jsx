import CrudStatus from "@/components/tabelas/CrudStatus";
import { Heart } from "lucide-react";

export default function TabelasStatusPrograma() {
  return <CrudStatus titulo="Status de Programa Social" entityName="StatusPrograma" icone={Heart} />;
}