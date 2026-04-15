import type { WhatsAppStatus } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, CheckCheck } from 'lucide-react';

const statusConfig: Record<WhatsAppStatus, { label: string; icon: React.ReactNode }> = {
  enviado: { label: 'Enviado', icon: <Check className="h-3.5 w-3.5 text-muted-foreground" /> },
  entregue: { label: 'Entregue', icon: <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" /> },
  visualizado: { label: 'Visualizado', icon: <CheckCheck className="h-3.5 w-3.5 text-blue-500" /> },
  respondido: { label: 'Respondido', icon: <span className="text-xs font-bold text-emerald-600">💬</span> },
};

export function WhatsAppStatusIcon({ status }: { status?: WhatsAppStatus }) {
  if (!status) return null;
  const c = statusConfig[status];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center">{c.icon}</span>
      </TooltipTrigger>
      <TooltipContent>{c.label}</TooltipContent>
    </Tooltip>
  );
}
