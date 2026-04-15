import { AlertTriangle, Eye, Flame, Ban } from 'lucide-react';
import type { EngagementLevel } from '@/data/mockData';

const config: Record<EngagementLevel, { label: string; icon: React.ReactNode; className: string }> = {
  engajado: {
    label: 'Engajado',
    icon: <Flame className="h-3 w-3" />,
    className: 'bg-emerald-100 text-emerald-700',
  },
  visualizou: {
    label: 'Visualizou',
    icon: <Eye className="h-3 w-3" />,
    className: 'bg-amber-100 text-amber-700',
  },
  frio: {
    label: 'Frio',
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'bg-red-100 text-red-700',
  },
  problema: {
    label: 'Problema',
    icon: <Ban className="h-3 w-3" />,
    className: 'bg-gray-200 text-gray-700',
  },
};

export function EngagementBadge({ level }: { level: EngagementLevel }) {
  const c = config[level];
  return (
    <span className={`tag-chip ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}
