import { useState } from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { vendedores, allTags } from '@/data/mockData';

interface FiltersProps {
  dateRange: DateRange | undefined;
  dateLabel?: string;
  vendedor: string;
  engajamento: string;
  tag: string;
  tentativasMin: string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onVendedorChange: (v: string) => void;
  onEngajamentoChange: (v: string) => void;
  onTagChange: (v: string) => void;
  onTentativasMinChange: (v: string) => void;
}

export function Filters({
  dateRange, dateLabel = 'Selecione o período de vencimento', vendedor, engajamento, tag, tentativasMin,
  onDateRangeChange, onVendedorChange, onEngajamentoChange, onTagChange, onTentativasMinChange,
}: FiltersProps) {
  const [open, setOpen] = useState(false);

  const label = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} – ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
      : format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
    : dateLabel;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left text-sm font-normal min-w-[280px]",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
            {dateRange?.from && (
              <X
                className="ml-auto h-4 w-4 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDateRangeChange(undefined);
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
            locale={ptBR}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

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
