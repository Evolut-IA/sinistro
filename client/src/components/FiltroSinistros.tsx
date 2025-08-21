import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FiltroSinistrosProps {
  onFilterChange: (filters: any) => void;
  isLoading?: boolean;
}

export default function FiltroSinistros({ onFilterChange, isLoading }: FiltroSinistrosProps) {
  const [filters, setFilters] = useState({
    data_inicio: "",
    data_fim: "",
    busca: "",
    status: "",
    periodo: ""
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="rounded-lg p-6 mb-8 container-gradient">
      <h3 className="cor-titulo font-semibold mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <Label className="cor-titulo text-sm font-medium mb-2">Data início</Label>
          <Input
            type="date"
            value={filters.data_inicio}
            onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            className="w-full px-3 py-2 rounded input-themed no-outline"
            data-testid="input-data-inicio"
          />
        </div>
        <div>
          <Label className="cor-titulo text-sm font-medium mb-2">Data fim</Label>
          <Input
            type="date"
            value={filters.data_fim}
            onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            className="w-full px-3 py-2 rounded input-themed no-outline"
            data-testid="input-data-fim"
          />
        </div>
        <div>
          <Label className="cor-titulo text-sm font-medium mb-2">Busca texto</Label>
          <Input
            type="text"
            placeholder="Placa, CPF..."
            value={filters.busca}
            onChange={(e) => handleFilterChange('busca', e.target.value)}
            className="w-full px-3 py-2 rounded input-themed no-outline"
            data-testid="input-busca"
          />
        </div>
        <div>
          <Label className="cor-titulo text-sm font-medium mb-2">Status</Label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger className="w-full px-3 py-2 rounded input-themed no-outline" data-testid="select-status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="estimado">Estimado</SelectItem>
              <SelectItem value="autorizado_reparo">Autorizado reparo</SelectItem>
              <SelectItem value="perda_total">Perda total</SelectItem>
              <SelectItem value="negado">Negado</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="cor-titulo text-sm font-medium mb-2">Período</Label>
          <Select value={filters.periodo} onValueChange={(value) => handleFilterChange('periodo', value)}>
            <SelectTrigger className="w-full px-3 py-2 rounded input-themed no-outline">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mês</SelectItem>
              <SelectItem value="trimestre">Este trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
