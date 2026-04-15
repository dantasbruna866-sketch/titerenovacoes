import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vendedores, allTags } from '@/data/mockData';

interface FiltersProps {
  month: string;
  year: string;
  vendedor: string;
  engajamento: string;
  tag: string;
  tentativasMin: string;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  onVendedorChange: (v: string) => void;
  onEngajamentoChange: (v: string) => void;
  onTagChange: (v: string) => void;
  onTentativasMinChange: (v: string) => void;
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

export function Filters({
  month, year, vendedor, engajamento, tag, tentativasMin,
  onMonthChange, onYearChange, onVendedorChange, onEngajamentoChange, onTagChange, onTentativasMinChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={month} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Mês" /></SelectTrigger>
        <SelectContent>
          {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-[100px] h-9 text-sm"><SelectValue placeholder="Ano" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
        </SelectContent>
      </Select>

      <Select value={vendedor} onValueChange={onVendedorChange}>
        <SelectTrigger className="w-[160px] h-9 text-sm"><SelectValue placeholder="Vendedor" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos vendedores</SelectItem>
          {vendedores.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={engajamento} onValueChange={onEngajamentoChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Engajamento" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="engajado">🟢 Engajado</SelectItem>
          <SelectItem value="visualizou">🟡 Visualizou</SelectItem>
          <SelectItem value="frio">🔴 Frio</SelectItem>
          <SelectItem value="problema">⚫ Problema</SelectItem>
        </SelectContent>
      </Select>

      <Select value={tag} onValueChange={onTagChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm"><SelectValue placeholder="Tag" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas tags</SelectItem>
          {allTags.filter(t => t !== 'blacklist').map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={tentativasMin} onValueChange={onTentativasMinChange}>
        <SelectTrigger className="w-[150px] h-9 text-sm"><SelectValue placeholder="Tentativas" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas tentativas</SelectItem>
          <SelectItem value="3">≥ 3 tentativas</SelectItem>
          <SelectItem value="5">≥ 5 tentativas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
