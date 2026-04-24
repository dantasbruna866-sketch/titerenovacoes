import { Users, Phone, UserX, XCircle, Star, CheckCircle2, Clock, Target, Sparkles, Trash2 } from 'lucide-react';
import type { Client } from '@/data/mockData';
import type { Prospect } from '@/data/mockProspects';

/* ======================== RENOVAÇÕES ======================== */

export type StatusTab =
  | 'todos'
  | 'em_atendimento'
  | 'nao_contatado'
  | 'interessado'
  | 'em_negociacao'
  | 'renovado'
  | 'nao_renovado';

export function getClientTab(client: Client): Exclude<StatusTab, 'todos'> {
  if (client.status === 'renovado') return 'renovado';
  if (client.status === 'nao_renovado') return 'nao_renovado';
  const tags = client.tags;
  if (tags.includes('Negociando') || tags.includes('Perdeu preço')) return 'em_negociacao';
  if (tags.includes('Interessado') || tags.includes('Cliente quente')) return 'interessado';
  if (client.interactions.length === 0) return 'nao_contatado';
  return 'em_atendimento';
}

const RENEWAL_META: Record<StatusTab, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; activeColor: string }> = {
  todos:           { label: 'Todos',           icon: Users,        color: 'text-muted-foreground', activeColor: 'border-primary text-primary' },
  em_atendimento:  { label: 'Em atendimento',  icon: Clock,        color: 'text-sky-600',          activeColor: 'border-sky-600 text-sky-700' },
  nao_contatado:   { label: 'Não contatado',   icon: UserX,        color: 'text-slate-500',        activeColor: 'border-slate-600 text-slate-700' },
  interessado:     { label: 'Interessado',     icon: Star,         color: 'text-orange-500',       activeColor: 'border-orange-500 text-orange-600' },
  em_negociacao:   { label: 'Em negociação',   icon: Phone,        color: 'text-indigo-500',       activeColor: 'border-indigo-600 text-indigo-700' },
  renovado:        { label: 'Renovado',        icon: CheckCircle2, color: 'text-emerald-600',      activeColor: 'border-emerald-600 text-emerald-700' },
  nao_renovado:    { label: 'Não renovado',    icon: XCircle,      color: 'text-rose-500',         activeColor: 'border-rose-600 text-rose-700' },
};

const RENEWAL_ORDER: StatusTab[] = ['todos', 'em_atendimento', 'nao_contatado', 'interessado', 'em_negociacao', 'renovado', 'nao_renovado'];

/* ======================== PROSPECÇÕES ======================== */

export type ProspectTab =
  | 'todos'
  | 'nao_contatado'
  | 'em_abordagem'
  | 'interessado'
  | 'qualificado'
  | 'convertido'
  | 'descartado';

export function getProspectTab(p: Prospect): Exclude<ProspectTab, 'todos'> {
  return p.prospectStatus;
}

const PROSPECT_META: Record<ProspectTab, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; activeColor: string }> = {
  todos:         { label: 'Todos',          icon: Users,        color: 'text-muted-foreground', activeColor: 'border-primary text-primary' },
  nao_contatado: { label: 'Não contatado',  icon: UserX,        color: 'text-slate-500',        activeColor: 'border-slate-600 text-slate-700' },
  em_abordagem:  { label: 'Em abordagem',   icon: Phone,        color: 'text-sky-600',          activeColor: 'border-sky-600 text-sky-700' },
  interessado:   { label: 'Interessado',    icon: Star,         color: 'text-orange-500',       activeColor: 'border-orange-500 text-orange-600' },
  qualificado:   { label: 'Qualificado',    icon: Sparkles,     color: 'text-indigo-500',       activeColor: 'border-indigo-600 text-indigo-700' },
  convertido:    { label: 'Convertido',     icon: Target,       color: 'text-emerald-600',      activeColor: 'border-emerald-600 text-emerald-700' },
  descartado:    { label: 'Descartado',     icon: Trash2,       color: 'text-rose-500',         activeColor: 'border-rose-600 text-rose-700' },
};

const PROSPECT_ORDER: ProspectTab[] = ['todos', 'nao_contatado', 'em_abordagem', 'interessado', 'qualificado', 'convertido', 'descartado'];

/* ======================== COMPONENTE GENÉRICO ======================== */

interface StatusTabsProps {
  variant?: 'renewals' | 'prospects';
  clients?: Client[];
  prospects?: Prospect[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function StatusTabs({ variant = 'renewals', clients = [], prospects = [], activeTab, onTabChange }: StatusTabsProps) {
  const isProspects = variant === 'prospects';
  const meta = isProspects ? PROSPECT_META : RENEWAL_META;
  const order = isProspects ? PROSPECT_ORDER : RENEWAL_ORDER;

  const counts: Record<string, number> = {};
  if (isProspects) {
    prospects.forEach(p => {
      const t = getProspectTab(p);
      counts[t] = (counts[t] || 0) + 1;
    });
    counts.todos = prospects.length;
  } else {
    clients.forEach(c => {
      const t = getClientTab(c);
      counts[t] = (counts[t] || 0) + 1;
    });
    counts.todos = clients.length;
  }

  return (
    <div className="border-b border-border">
      <div className="flex flex-wrap items-end gap-1 -mb-px overflow-x-auto">
        {order.map((tab) => {
          const m = meta[tab as keyof typeof meta];
          const Icon = m.icon;
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
                  ? `${m.activeColor} bg-background`
                  : `border-transparent ${m.color} hover:text-foreground hover:bg-muted/50`}
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{m.label}</span>
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
