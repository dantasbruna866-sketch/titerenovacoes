import { CalendarCheck2, CalendarDays, Phone, TimerReset, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ReturnByDayRow {
  id: string;
  clientName: string;
  cnpj: string;
  phone: string;
  email: string;
  returnAt: string;
  returnAction?: string | null;
}

interface ReturnsByDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  items: ReturnByDayRow[];
}

function formatDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date: string) {
  const parsed = new Date(date.replace(' ', 'T'));
  return Number.isNaN(parsed.getTime())
    ? date
    : parsed.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function ReturnsByDayModal({
  open,
  onOpenChange,
  selectedDate,
  onDateChange,
  items,
}: ReturnsByDayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TimerReset className="h-5 w-5 text-primary" />
            Retornos do dia
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-[220px_1fr]">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4 text-primary" />
                Data do retorno
              </div>
              <Input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} />
              <p className="text-xs text-muted-foreground">Mostrando todos os retornos agendados para {formatDate(selectedDate)}.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CalendarCheck2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{items.length}</p>
                <p className="text-sm text-muted-foreground">cliente(s) com retorno agendado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Nenhum retorno agendado na data selecionada.
              </div>
            ) : (
              <ScrollArea className="max-h-[420px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Contato</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Retorno</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Ação prevista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0 align-top">
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{item.clientName}</div>
                          <div className="text-xs text-muted-foreground">{item.cnpj}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{item.phone}</span>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>{item.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDateTime(item.returnAt)}</td>
                        <td className="px-4 py-3">
                          {item.returnAction ? item.returnAction : <span className="text-muted-foreground italic">Sem ação definida</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}