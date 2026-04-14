import type { ClientStatus, ComparativeIndicator } from '@/data/mockData';

const statusLabels: Record<ClientStatus, string> = {
  renovado: 'Renovado',
  em_andamento: 'Em andamento',
  nao_renovado: 'Não renovado',
};

const statusClasses: Record<ClientStatus, string> = {
  renovado: 'status-renovado',
  em_andamento: 'status-andamento',
  nao_renovado: 'status-nao-renovado',
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`tag-chip font-semibold ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

const indicatorLabels: Record<ComparativeIndicator, string> = {
  mesmo_mes: 'Mesmo mês',
  atrasado: 'Atrasado',
  nao_renovou: 'Não renovou',
};

const indicatorClasses: Record<ComparativeIndicator, string> = {
  mesmo_mes: 'status-renovado',
  atrasado: 'status-andamento',
  nao_renovou: 'status-nao-renovado',
};

export function ComparativeIndicatorBadge({ indicator }: { indicator: ComparativeIndicator }) {
  return (
    <span className={`tag-chip ${indicatorClasses[indicator]}`}>
      {indicatorLabels[indicator]}
    </span>
  );
}
