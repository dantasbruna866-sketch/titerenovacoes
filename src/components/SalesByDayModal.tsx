import { BarChart3, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface SalesByDayItem {
  date: string;
  count: number;
  revenue: number;
}

interface SalesByDayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SalesByDayItem[];
}

export function SalesByDayModal({ open, onOpenChange, items }: SalesByDayModalProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Vendas por dia
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.length === 0 ? (
            <Card className="md:col-span-2 xl:col-span-3">
              <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Nenhuma venda encontrada no período selecionado.
              </CardContent>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.date}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-muted-foreground">{item.count} venda(s)</p>
                    </div>
                    <p className="text-sm font-semibold text-status-success">
                      R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Volume relativo do dia</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}