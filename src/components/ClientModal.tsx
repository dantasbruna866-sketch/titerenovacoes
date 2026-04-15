import { useState } from 'react';
import { X, Phone, MessageCircle, MessageSquare, CheckCircle2, Mail, Plus, History } from 'lucide-react';
import type { Client, Interaction, Observation } from '@/data/mockData';
import { StatusBadge, ComparativeIndicatorBadge } from './StatusBadge';
import { TagChip } from './TagChip';
import { EngagementBadge } from './EngagementBadge';
import { WhatsAppStatusIcon } from './WhatsAppStatusIcon';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface ClientModalProps {
  client: Client;
  onClose: () => void;
  onMarkRenewed: (id: string) => void;
  onAddObservation: (clientId: string, text: string) => void;
  onRegisterInteraction: (client: Client) => void;
}

const interactionTypeIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4 text-emerald-500" />,
  sms: <MessageSquare className="h-4 w-4 text-blue-500" />,
  email: <Mail className="h-4 w-4 text-amber-500" />,
  ligacao: <Phone className="h-4 w-4 text-violet-500" />,
};

const interactionTypeLabels: Record<string, string> = {
  whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email', ligacao: 'Ligação',
};

const callStatusLabels: Record<string, string> = {
  atendeu: 'Atendeu', nao_atendeu: 'Não atendeu', caixa_postal: 'Caixa postal', numero_invalido: 'Número inválido',
};

const dispatchStatusLabels: Record<string, string> = {
  entregue: 'Entregue', lido: 'Lido', falhou: 'Falhou',
};

function InteractionItem({ interaction }: { interaction: Interaction }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="mt-0.5">{interactionTypeIcons[interaction.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{interactionTypeLabels[interaction.type]}</span>
          <span className="text-xs text-muted-foreground">{interaction.date}</span>
          {interaction.callStatus && (
            <span className={`tag-chip text-xs ${interaction.callStatus === 'atendeu' ? 'status-renovado' : interaction.callStatus === 'caixa_postal' || interaction.callStatus === 'numero_invalido' ? 'status-nao-renovado' : 'status-andamento'}`}>
              {callStatusLabels[interaction.callStatus]}
            </span>
          )}
          {interaction.whatsappStatus && (
            <WhatsAppStatusIcon status={interaction.whatsappStatus} />
          )}
          {interaction.dispatchStatus && (
            <span className={`tag-chip text-xs ${interaction.dispatchStatus === 'lido' ? 'status-renovado' : interaction.dispatchStatus === 'entregue' ? 'status-andamento' : 'status-nao-renovado'}`}>
              {dispatchStatusLabels[interaction.dispatchStatus]}
            </span>
          )}
        </div>
        {interaction.message && <p className="text-sm text-muted-foreground mt-1">{interaction.message}</p>}
        {interaction.notes && <p className="text-sm text-foreground/80 mt-1 italic">"{interaction.notes}"</p>}
        {interaction.audioUrl && (
          <div className="mt-2">
            <audio controls className="h-8 w-full max-w-xs">
              <source src={interaction.audioUrl} />
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}

export function ClientModal({ client, onClose, onMarkRenewed, onAddObservation, onRegisterInteraction }: ClientModalProps) {
  const [newObs, setNewObs] = useState('');
  const [showAllObs, setShowAllObs] = useState(false);

  const handleAddObs = () => {
    if (!newObs.trim()) return;
    onAddObservation(client.id, newObs.trim());
    setNewObs('');
  };

  const visibleObs = showAllObs ? client.observacoes : client.observacoes.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card shadow-xl animate-slide-in-right flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">{client.razaoSocial}</h2>
            <p className="text-sm text-muted-foreground">{client.cnpj}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-6">
            {/* Client Data */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Dados do Cliente</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Sócio:</span> <span className="font-medium">{client.nomeSocio}</span></div>
                <div><span className="text-muted-foreground">Administrador:</span> <span className="font-medium">{client.socioAdministrador ? 'Sim' : 'Não'}</span></div>
                <div><span className="text-muted-foreground">Telefone:</span> <span className="font-medium">{client.telefone}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{client.email}</span></div>
                <div><span className="text-muted-foreground">Vencimento:</span> <span className="font-medium">{new Date(client.dataVencimento).toLocaleDateString('pt-BR')}</span></div>
                <div><span className="text-muted-foreground">Renovação:</span> <span className="font-medium">{client.dataRenovacao ? new Date(client.dataRenovacao).toLocaleDateString('pt-BR') : 'Em aberto'}</span></div>
                <div><span className="text-muted-foreground">Tentativas:</span> <span className="font-medium">{client.tentativasContato}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <StatusBadge status={client.status} />
                <EngagementBadge level={client.engajamento} />
                <ComparativeIndicatorBadge indicator={client.indicadorComparativo} />
                {client.tags.filter(t => t !== 'blacklist').map(tag => <TagChip key={tag} tag={tag} />)}
              </div>
              {client.vendedor && <p className="text-sm mt-2"><span className="text-muted-foreground">Vendedor:</span> <span className="font-medium">{client.vendedor}</span></p>}
            </section>

            {/* Observations */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Observações</h3>
                {client.observacoes.length > 2 && (
                  <button onClick={() => setShowAllObs(!showAllObs)} className="text-xs text-primary flex items-center gap-1 hover:underline">
                    <History className="h-3 w-3" />
                    {showAllObs ? 'Mostrar menos' : `Ver todas (${client.observacoes.length})`}
                  </button>
                )}
              </div>
              <div className="space-y-2 mb-3">
                {visibleObs.map(obs => (
                  <div key={obs.id} className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">{obs.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{obs.author} · {new Date(obs.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
                {client.observacoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma observação.</p>}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Adicionar observação..."
                  rows={2}
                  value={newObs}
                  onChange={e => setNewObs(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" className="self-end" onClick={handleAddObs} disabled={!newObs.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </section>

            <Separator />

            {/* Timeline */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline de Interações ({client.interactions.length})</h3>
              {client.interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>
              ) : (
                <div className="divide-y">
                  {[...client.interactions].reverse().map(i => <InteractionItem key={i.id} interaction={i} />)}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="p-4 border-t bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => onRegisterInteraction(client)}>
              <Plus className="h-4 w-4" /> Registrar Interação
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" /> Ligar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button size="sm" className="gap-2" onClick={() => onMarkRenewed(client.id)}>
              <CheckCircle2 className="h-4 w-4" /> Marcar Renovado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
