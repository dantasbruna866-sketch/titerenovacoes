import { Users, Phone, UserX, XCircle, Star, CheckCircle2, Clock, Target, Sparkles, Trash2, MessageCircle, Mail } from 'lucide-react';
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

function getClientPendingMessages(client: Pick<Client, 'whatsappUnread' | 'interactions'>) {
  const whatsapp = client.whatsappUnread ?? 0;
  const email = client.interactions.filter(
    (interaction) => interaction.type === 'email' && interaction.dispatchStatus !== 'lido'
  ).length;

  return { whatsapp, email };
}

export function StatusTabs({ variant = 'renewals', clients = [], prospects = [], activeTab, onTabChange }: StatusTabsProps) {
  const isProspects = variant === 'prospects';
  const meta = isProspects ? PROSPECT_META : RENEWAL_META;
  const order = isProspects ? PROSPECT_ORDER : RENEWAL_ORDER;

  const counts: Record<string, number> = {};
  const pendingMessages: Record<string, { whatsapp: number; email: number }> = {};

  const accumulatePendingMessages = (tab: string, client: Client) => {
    const current = pendingMessages[tab] || { whatsapp: 0, email: 0 };
    const next = getClientPendingMessages(client);

    pendingMessages[tab] = {
      whatsapp: current.whatsapp + next.whatsapp,
      email: current.email + next.email,
    };
  };

  if (isProspects) {
    prospects.forEach(p => {
      const t = getProspectTab(p);
      counts[t] = (counts[t] || 0) + 1;
      accumulatePendingMessages(t, p);
      accumulatePendingMessages('todos', p);
    });
    counts.todos = prospects.length;
  } else {
    clients.forEach(c => {
      const t = getClientTab(c);
      counts[t] = (counts[t] || 0) + 1;
      accumulatePendingMessages(t, c);
      accumulatePendingMessages('todos', c);
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
          const messages = pendingMessages[tab] || { whatsapp: 0, email: 0 };
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
              <div className="ml-1 flex items-center gap-2">
                <span className="relative inline-flex items-center justify-center">
                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  {messages.whatsapp > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                      {messages.whatsapp}
                    </span>
                  )}
                </span>
                <span className="relative inline-flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {messages.email > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-secondary px-1 text-[10px] font-bold leading-4 text-secondary-foreground">
                      {messages.email}
                    </span>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
