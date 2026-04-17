import { Eye, UserPlus, FileText, Phone, MessageCircle, MessageSquare, Mail, Hash, Plus, Clock, CheckCircle2 } from 'lucide-react';
import type { Client, Interaction, InteractionType } from '@/data/mockData';
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
  onViewAllInteractions: (client: Client) => void;
}

const channelOrder: InteractionType[] = ['ligacao', 'whatsapp', 'email', 'sms'];

const channelIcon: Record<InteractionType, React.ReactNode> = {
  ligacao: <Phone className="h-3.5 w-3.5 text-violet-600" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />,
  email: <Mail className="h-3.5 w-3.5 text-amber-600" />,
  sms: <MessageSquare className="h-3.5 w-3.5 text-blue-600" />,
};

const channelLabel: Record<InteractionType, string> = {
  ligacao: 'Ligação', whatsapp: 'WhatsApp', email: 'E-mail', sms: 'SMS',
};

function formatDateShort(date: string) {
  const d = new Date(date.replace(' ', 'T'));
  if (isNaN(d.getTime())) return date;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatDateTime(date: string) {
  const d = new Date(date.replace(' ', 'T'));
  if (isNaN(d.getTime())) return date;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function getLastByChannel(interactions: Interaction[]): Partial<Record<InteractionType, Interaction>> {
  const map: Partial<Record<InteractionType, Interaction>> = {};
  for (const i of interactions) {
    const prev = map[i.type];
    if (!prev || i.date > prev.date) map[i.type] = i;
  }
  return map;
}

export function ClientTable({ clients, onSelectClient, onPullClient, onRegisterInteraction, onViewAllInteractions }: ClientTableProps) {
  return (
    <div className="crm-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Cliente / Telefone</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Última Renovação</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Engajamento</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tentativas</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Última Interação</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tags</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Vendedor</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Obs</th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const lastByChannel = getLastByChannel(client.interactions);
              const lastObs = client.observacoes.length > 0 ? client.observacoes[0] : null;

              // Counts per channel for the "Tentativas" column
              const counts: Partial<Record<InteractionType, number>> = {};
              client.interactions.forEach(i => { counts[i.type] = (counts[i.type] || 0) + 1; });
              const usedChannels = channelOrder.filter(c => counts[c]);

              return (
                <tr
                  key={client.id}
                  className="border-b hover:bg-crm-surface-hover transition-colors cursor-pointer"
                  onClick={() => onSelectClient(client)}
                >
                  {/* Cliente + Telefone */}
                  <td className="px-4 py-3">
                    <div className="font-medium max-w-[220px] truncate">{client.razaoSocial}</div>
                    <div className="text-xs text-muted-foreground truncate">{client.nomeSocio} · {client.cnpj}</div>
                    <div className="text-xs text-foreground/80 mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {client.telefone}
                    </div>
                  </td>

                  {/* Última Renovação */}
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {client.dataUltimaRenovacao ? (
                      <span className="font-medium">
                        {new Date(client.dataUltimaRenovacao).toLocaleDateString('pt-BR')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">Nunca renovou</span>
                    )}
                  </td>

                  <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                  <td className="px-4 py-3"><EngagementBadge level={client.engajamento} /></td>

                  {/* Tentativas: total + ícones por canal */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        client.tentativasContato >= 5 ? 'text-red-600' :
                        client.tentativasContato >= 3 ? 'text-amber-600' : 'text-foreground'
                      }`}>
                        <Hash className="h-3 w-3" />
                        {client.tentativasContato}
                      </span>
                      {usedChannels.length > 0 && (
                        <div className="flex items-center gap-1">
                          {usedChannels.map(ch => (
                            <Tooltip key={ch}>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/60">
                                  {channelIcon[ch]}
                                  <span className="text-[10px] font-medium text-muted-foreground">{counts[ch]}</span>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>{counts[ch]} {channelLabel[ch]}</TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Última Interação por canal: ícone + data/hora */}
                  <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); onViewAllInteractions(client); }}>
                    {Object.keys(lastByChannel).length === 0 ? (
                      <span className="text-muted-foreground text-xs italic">Nenhuma</span>
                    ) : (
                      <div className="flex flex-col gap-0.5 hover:bg-muted/40 rounded px-1.5 py-1 -mx-1.5 -my-1 cursor-pointer">
                        {channelOrder.filter(ch => lastByChannel[ch]).map(ch => {
                          const it = lastByChannel[ch]!;
                          return (
                            <div key={ch} className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                              {channelIcon[ch]}
                              <span className="text-muted-foreground">{formatDateTime(it.date)}</span>
                              {ch === 'ligacao' && typeof it.durationMinutes === 'number' && it.durationMinutes > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-violet-700">
                                  <Clock className="h-2.5 w-2.5" />{it.durationMinutes}m
                                </span>
                              )}
                              {ch === 'ligacao' && it.spokeWithClient && (
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              )}
                              {it.whatsappStatus && <WhatsAppStatusIcon status={it.whatsappStatus} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                          <p className="text-xs text-muted-foreground mt-1">{lastObs.author} · {formatDateShort(lastObs.date)}</p>
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
