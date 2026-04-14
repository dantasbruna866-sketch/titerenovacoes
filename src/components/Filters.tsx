import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vendedores } from '@/data/mockData';

interface FiltersProps {
  month: string;
  year: string;
  vendedor: string;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onVendedorChange: (v: string) => void;
}

const months = [
  { value: 'all', label: 'Todos os meses' },
  { value: '1', label: 'Janeiro' }, { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' }, { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' }, { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' }, { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' }, { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
];

export function Filters({ month, year, vendedor, onMonthChange, onYearChange, onVendedorChange }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Mês" /></SelectTrigger>
        <SelectContent>
          {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[110px] h-9 text-sm"><SelectValue placeholder="Ano" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
        </SelectContent>
      </Select>

      <Select value={vendedor} onValueChange={onVendedorChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm"><SelectValue placeholder="Vendedor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os vendedores</SelectItem>
          {vendedores.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
