import CrudStatus from "@/components/tabelas/CrudStatus";
import { CreditCard } from "lucide-react";

export default function TabelasStatusCartao() {
  return <CrudStatus titulo="Status de Cartão" entityName="StatusCartao" icone={CreditCard} />;
}