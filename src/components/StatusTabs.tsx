import { Users, Phone, UserX, XCircle, Star, CheckCircle2, Clock } from 'lucide-react';
import type { Client } from '@/data/mockData';

export type StatusTab =
  | 'todos'
  | 'em_atendimento'
  | 'nao_contatado'
  | 'interessado'
  | 'em_negociacao'
  | 'renovado'
  | 'nao_renovado';

interface StatusTabsProps {
  clients: Client[];
  activeTab: StatusTab;
  onTabChange: (tab: StatusTab) => void;
}

/** Deriva a aba a que um cliente pertence (cada cliente conta em apenas uma aba, exceto "todos"). */
export function getClientTab(client: Client): Exclude<StatusTab, 'todos'> {
  if (client.status === 'renovado') return 'renovado';
  if (client.status === 'nao_renovado') return 'nao_renovado';

  // em_andamento → subdividido por tags / interações
  const tags = client.tags;
  if (tags.includes('Negociando') || tags.includes('Perdeu preço')) return 'em_negociacao';
  if (tags.includes('Interessado') || tags.includes('Cliente quente')) return 'interessado';
  if (client.interactions.length === 0) return 'nao_contatado';
  return 'em_atendimento';
}

const TAB_META: Record<StatusTab, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; activeColor: string }> = {
  todos:           { label: 'Todos',           icon: Users,        color: 'text-muted-foreground', activeColor: 'border-primary text-primary' },
  em_atendimento:  { label: 'Em atendimento',  icon: Clock,        color: 'text-sky-600',          activeColor: 'border-sky-600 text-sky-700' },
  nao_contatado:   { label: 'Não contatado',   icon: UserX,        color: 'text-slate-500',        activeColor: 'border-slate-600 text-slate-700' },
  interessado:     { label: 'Interessado',     icon: Star,         color: 'text-orange-500',       activeColor: 'border-orange-500 text-orange-600' },
  em_negociacao:   { label: 'Em negociação',   icon: Phone,        color: 'text-indigo-500',       activeColor: 'border-indigo-600 text-indigo-700' },
  renovado:        { label: 'Renovado',        icon: CheckCircle2, color: 'text-emerald-600',      activeColor: 'border-emerald-600 text-emerald-700' },
  nao_renovado:    { label: 'Não renovado',    icon: XCircle,      color: 'text-rose-500',         activeColor: 'border-rose-600 text-rose-700' },
};

const TAB_ORDER: StatusTab[] = ['todos', 'em_atendimento', 'nao_contatado', 'interessado', 'em_negociacao', 'renovado', 'nao_renovado'];

export function StatusTabs({ clients, activeTab, onTabChange }: StatusTabsProps) {
  const counts = clients.reduce<Record<string, number>>((acc, c) => {
    const t = getClientTab(c);
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});
  counts.todos = clients.length;

  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap items-end gap-1 -mb-px overflow-x-auto">
        {TAB_ORDER.map((tab) => {
          const meta = TAB_META[tab];
          const Icon = meta.icon;
          const isActive = activeTab === tab;
          const count = counts[tab] || 0;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${isActive
                  ? `${meta.activeColor} bg-background`
                  : `border-transparent ${meta.color} hover:text-foreground hover:bg-muted/50`}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{meta.label}</span>
              <span className={`
                ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold leading-none
                ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
              `}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
