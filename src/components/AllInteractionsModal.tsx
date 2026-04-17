import { X, Phone, MessageCircle, MessageSquare, Mail, Clock, CheckCircle2, XCircle } from 'lucide-react';
import type { Interaction } from '@/data/mockData';
import { WhatsAppStatusIcon } from './WhatsAppStatusIcon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AllInteractionsModalProps {
  clientName: string;
  interactions: Interaction[];
  onClose: () => void;
}

const typeIcon: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4 text-emerald-600" />,
  sms: <MessageSquare className="h-4 w-4 text-blue-600" />,
  email: <Mail className="h-4 w-4 text-amber-600" />,
  ligacao: <Phone className="h-4 w-4 text-violet-600" />,
};

const typeLabel: Record<string, string> = {
  whatsapp: 'WhatsApp', sms: 'SMS', email: 'E-mail', ligacao: 'Ligação',
};

const callStatusLabel: Record<string, string> = {
  atendeu: 'Atendeu', nao_atendeu: 'Não atendeu',
  caixa_postal: 'Caixa postal', numero_invalido: 'Número inválido',
};

function formatDateTime(date: string) {
  const d = new Date(date.replace(' ', 'T'));
  if (isNaN(d.getTime())) return date;
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function AllInteractionsModal({ clientName, interactions, onClose }: AllInteractionsModalProps) {
  const sorted = [...interactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-lg font-semibold">Todas as interações</h2>
            <p className="text-sm text-muted-foreground">{clientName} · {interactions.length} registro(s)</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5">
            {sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma interação registrada.</p>
            ) : (
              <div className="space-y-3">
                {sorted.map(i => (
                  <div key={i.id} className="border rounded-lg p-3 bg-muted/30">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{typeIcon[i.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{typeLabel[i.type]}</span>
                          <span className="text-xs text-muted-foreground">{formatDateTime(i.date)}</span>

                          {i.type === 'ligacao' && (
                            <>
                              {typeof i.durationMinutes === 'number' && (
                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-violet-100 text-violet-700">
                                  <Clock className="h-3 w-3" /> {i.durationMinutes} min
                                </span>
                              )}
                              {i.callStatus && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  i.callStatus === 'atendeu' ? 'bg-emerald-100 text-emerald-700' :
                                  i.callStatus === 'numero_invalido' || i.callStatus === 'caixa_postal' ? 'bg-red-100 text-red-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {callStatusLabel[i.callStatus]}
                                </span>
                              )}
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                                i.spokeWithClient ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                              }`}>
                                {i.spokeWithClient ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {i.spokeWithClient ? 'Falou com cliente' : 'Não falou'}
                              </span>
                            </>
                          )}

                          {i.whatsappStatus && <WhatsAppStatusIcon status={i.whatsappStatus} />}
                        </div>
                        {i.message && <p className="text-sm text-muted-foreground mt-1.5">{i.message}</p>}
                        {i.notes && <p className="text-sm italic text-foreground/80 mt-1">"{i.notes}"</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
