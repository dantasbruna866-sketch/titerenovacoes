import { BarChart3, CalendarDays, CalendarRange, Receipt, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface SalesByDayRow {
  id: string;
  clientName: string;
  cnpj: string;
  certificateLabel: string;
  paidAt: string;
  amountPaid: number;
}

interface SalesByDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  items: SalesByDayRow[];
  totalRevenue: number;
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

export function SalesByDayModal({
  open,
  onOpenChange,
  selectedDate,
  onDateChange,
  items,
  totalRevenue,
}: SalesByDayModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Vendas do dia
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-[220px_1fr_220px]">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarRange className="h-4 w-4 text-primary" />
                Data da venda
              </div>
              <Input type="date" value={selectedDate} onChange={(e) => onDateChange(e.target.value)} />
              <p className="text-xs text-muted-foreground">Mostrando pagamentos confirmados em {formatDate(selectedDate)}.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{items.length}</p>
                <p className="text-sm text-muted-foreground">cliente(s) com pagamento confirmado</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">total vendido no dia</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Nenhum pagamento confirmado na data selecionada.
              </div>
            ) : (
              <ScrollArea className="max-h-[420px]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">CNPJ</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Certificado</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Pago em</th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">Valor pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-4 py-3 font-medium text-foreground">{item.clientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.cnpj}</td>
                        <td className="px-4 py-3">{item.certificateLabel}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDateTime(item.paidAt)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          R$ {item.amountPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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