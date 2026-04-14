import { useState } from 'react';
import { Eye, UserPlus, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { Client } from '@/data/mockData';
import { StatusBadge, ComparativeIndicatorBadge } from './StatusBadge';
import { TagChip } from './TagChip';
import { InteractionIcons } from './InteractionIcons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ClientTableProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onPullClient: (clientId: string) => void;
}

export function ClientTable({ clients, onSelectClient, onPullClient }: ClientTableProps) {
  const [expandedObs, setExpandedObs] = useState<string | null>(null);

  return (
    <div className="crm-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">CNPJ</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Razão Social</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Sócio</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Contato</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vencimento</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Renovação</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Comparativo</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vendedor</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tags</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Obs</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Interações</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b hover:bg-crm-surface-hover transition-colors cursor-pointer"
                onClick={() => onSelectClient(client)}
              >
                <td className="px-4 py-3 font-mono text-xs">{client.cnpj}</td>
                <td className="px-4 py-3 font-medium max-w-[180px] truncate">{client.razaoSocial}</td>
                <td className="px-4 py-3">
                  <div>{client.nomeSocio}</div>
                  <div className="text-xs text-muted-foreground">{client.socioAdministrador ? 'Administrador' : 'Sócio'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-xs">{client.telefone}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[140px]">{client.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{new Date(client.dataVencimento).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {client.dataRenovacao ? new Date(client.dataRenovacao).toLocaleDateString('pt-BR') : <span className="text-muted-foreground italic">Em aberto</span>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="text-xs">{client.renovouAnoAnterior ? '✓ Renovou ant.' : '✗ Não renovou ant.'}</div>
                    <ComparativeIndicatorBadge indicator={client.indicadorComparativo} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  {client.vendedor ? (
                    <span className="font-medium text-xs">{client.vendedor}</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1 h-7"
                      onClick={(e) => { e.stopPropagation(); onPullClient(client.id); }}
                    >
                      <UserPlus className="h-3 w-3" /> Puxar
                    </Button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                    {client.tags.filter(t => t !== 'blacklist').map(tag => <TagChip key={tag} tag={tag} />)}
                  </div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {client.observacao ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted"
                          onClick={() => setExpandedObs(expandedObs === client.id ? null : client.id)}
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs">
                        <p className="text-xs">{client.observacao}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <InteractionIcons />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onSelectClient(client)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {clients.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum cliente encontrado com os filtros selecionados.
        </div>
      )}
    </div>
  );
}
