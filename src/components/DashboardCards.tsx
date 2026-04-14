import { Users, CheckCircle2, Clock, XCircle, TrendingUp, DollarSign } from 'lucide-react';

interface KPI {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
}

interface DashboardCardsProps {
  total: number;
  renovados: number;
  emAberto: number;
  naoRenovados: number;
  taxaRenovacao: number;
  receita: number;
}

export function DashboardCards({ total, renovados, emAberto, naoRenovados, taxaRenovacao, receita }: DashboardCardsProps) {
  const kpis: KPI[] = [
    { label: 'Total de Clientes', value: total, icon: <Users className="h-5 w-5" /> },
    { label: 'Renovados', value: renovados, icon: <CheckCircle2 className="h-5 w-5" />, accent: 'text-status-success' },
    { label: 'Em Aberto', value: emAberto, icon: <Clock className="h-5 w-5" />, accent: 'text-status-warning' },
    { label: 'Não Renovados', value: naoRenovados, icon: <XCircle className="h-5 w-5" />, accent: 'text-status-danger' },
    { label: 'Taxa de Renovação', value: `${taxaRenovacao.toFixed(1)}%`, icon: <TrendingUp className="h-5 w-5" />, accent: 'text-primary' },
    { label: 'Receita Gerada', value: `R$ ${receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: <DollarSign className="h-5 w-5" />, accent: 'text-status-success' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="crm-kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className={`${kpi.accent || 'text-muted-foreground'}`}>{kpi.icon}</span>
          </div>
          <p className={`text-2xl font-bold ${kpi.accent || 'text-foreground'}`}>{kpi.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
        </div>
      ))}
    </div>
  );
}
