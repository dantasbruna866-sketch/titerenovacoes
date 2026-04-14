import { X, Phone, MessageCircle, MessageSquare, CheckCircle2, Mail, Clock, AlertTriangle } from 'lucide-react';
import type { Client, Interaction } from '@/data/mockData';
import { StatusBadge, ComparativeIndicatorBadge } from './StatusBadge';
import { TagChip } from './TagChip';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ClientModalProps {
  client: Client;
  onClose: () => void;
  onMarkRenewed: (id: string) => void;
}

const interactionTypeIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4 text-emerald-500" />,
  sms: <MessageSquare className="h-4 w-4 text-blue-500" />,
  email: <Mail className="h-4 w-4 text-amber-500" />,
  ligacao: <Phone className="h-4 w-4 text-violet-500" />,
};

const interactionTypeLabels: Record<string, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
  ligacao: 'Ligação',
};

const callStatusLabels: Record<string, string> = {
  atendeu: 'Atendeu',
  nao_atendeu: 'Não atendeu',
  caixa_postal: 'Caixa postal',
};

const dispatchStatusLabels: Record<string, string> = {
  entregue: 'Entregue',
  lido: 'Lido',
  falhou: 'Falhou',
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
            <span className={`tag-chip text-xs ${interaction.callStatus === 'atendeu' ? 'status-renovado' : interaction.callStatus === 'caixa_postal' ? 'status-andamento' : 'status-nao-renovado'}`}>
              {callStatusLabels[interaction.callStatus]}
            </span>
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

export function ClientModal({ client, onClose, onMarkRenewed }: ClientModalProps) {
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
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <StatusBadge status={client.status} />
                <ComparativeIndicatorBadge indicator={client.indicadorComparativo} />
                {client.tags.map(tag => <TagChip key={tag} tag={tag} />)}
              </div>
              {client.vendedor && <p className="text-sm mt-2"><span className="text-muted-foreground">Vendedor:</span> <span className="font-medium">{client.vendedor}</span></p>}
            </section>

            {client.observacao && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observação</h3>
                <p className="text-sm bg-muted/50 rounded-lg p-3">{client.observacao}</p>
              </section>
            )}

            <Separator />

            {/* Timeline */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Timeline de Interações</h3>
              {client.interactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma interação registrada.</p>
              ) : (
                <div className="divide-y">
                  {client.interactions.map(i => <InteractionItem key={i.id} interaction={i} />)}
                </div>
              )}
            </section>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="p-4 border-t bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" /> Ligar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" /> SMS
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
