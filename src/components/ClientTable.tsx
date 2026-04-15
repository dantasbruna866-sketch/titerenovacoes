import { useState } from 'react';
import { Eye, UserPlus, FileText, Phone, MessageCircle, Hash, Plus } from 'lucide-react';
import type { Client } from '@/data/mockData';
import { StatusBadge } from './StatusBadge';
import { TagChip } from './TagChip';
import { EngagementBadge } from './EngagementBadge';
import { WhatsAppStatusIcon } from './WhatsAppStatusIcon';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ClientTableProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onPullClient: (clientId: string) => void;
  onRegisterInteraction: (client: Client) => void;
}

const interactionTypeIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-3 w-3 text-emerald-500" />,
  sms: <span className="text-xs">📱</span>,
  email: <span className="text-xs">📧</span>,
  ligacao: <Phone className="h-3 w-3 text-violet-500" />,
};

const interactionTypeLabels: Record<string, string> = {
  whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email', ligacao: 'Ligação',
};

export function ClientTable({ clients, onSelectClient, onPullClient, onRegisterInteraction }: ClientTableProps) {
  return (
    <div className="crm-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nome / Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Telefone</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Engajamento</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Última Interação</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Tentativas</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tags</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vendedor</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Obs</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const lastInteraction = client.interactions.length > 0
                ? client.interactions[client.interactions.length - 1]
                : null;
              const lastObs = client.observacoes.length > 0 ? client.observacoes[0] : null;

              return (
                <tr
                  key={client.id}
                  className="border-b hover:bg-crm-surface-hover transition-colors cursor-pointer"
                  onClick={() => onSelectClient(client)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium max-w-[200px] truncate">{client.razaoSocial}</div>
                    <div className="text-xs text-muted-foreground">{client.nomeSocio} · {client.cnpj}</div>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">{client.telefone}</td>
                  <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                  <td className="px-4 py-3"><EngagementBadge level={client.engajamento} /></td>
                  <td className="px-4 py-3">
                    {lastInteraction ? (
                      <div className="flex items-center gap-1.5">
                        {interactionTypeIcons[lastInteraction.type]}
                        <span className="text-xs">{interactionTypeLabels[lastInteraction.type]}</span>
                        {lastInteraction.whatsappStatus && (
                          <WhatsAppStatusIcon status={lastInteraction.whatsappStatus} />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(lastInteraction.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Nenhuma</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      client.tentativasContato >= 5 ? 'text-red-600' :
                      client.tentativasContato >= 3 ? 'text-amber-600' : 'text-muted-foreground'
                    }`}>
                      <Hash className="h-3 w-3" />
                      {client.tentativasContato}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {client.tags.filter(t => t !== 'blacklist').slice(0, 2).map(tag => <TagChip key={tag} tag={tag} />)}
                      {client.tags.filter(t => t !== 'blacklist').length > 2 && (
                        <span className="tag-chip bg-muted text-muted-foreground">+{client.tags.filter(t => t !== 'blacklist').length - 2}</span>
                      )}
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
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {lastObs ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs">{lastObs.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{lastObs.author} · {new Date(lastObs.date).toLocaleDateString('pt-BR')}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onRegisterInteraction(client)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Registrar interação</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onSelectClient(client)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalhes</TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
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
