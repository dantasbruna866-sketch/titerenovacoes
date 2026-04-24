import { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import type { InteractionType, CallStatus, WhatsAppStatus } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterInteractionModalProps {
  clientName: string;
  initialReturnAt?: string | null;
  initialReturnAction?: string | null;
  onClose: () => void;
  onSubmit: (data: {
    type: InteractionType;
    callStatus?: CallStatus;
    whatsappStatus?: WhatsAppStatus;
    message?: string;
    notes?: string;
    durationMinutes?: number;
    spokeWithClient?: boolean;
    dataRetorno?: string;
    retornoAcao?: string;
  }) => void;
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return '';
  const [date, time] = value.split(' ');
  return date && time ? `${date}T${time}` : '';
}

export function RegisterInteractionModal({ clientName, onClose, onSubmit }: RegisterInteractionModalProps) {
  const [type, setType] = useState<InteractionType>('ligacao');
  const [callStatus, setCallStatus] = useState<CallStatus>('atendeu');
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('enviado');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<string>('');
  const [returnAt, setReturnAt] = useState(toDateTimeLocalValue(initialReturnAt));
  const [returnAction, setReturnAction] = useState(initialReturnAction ?? '');

  // Falou com o cliente: automático com base no status da ligação
  const spokeWithClient = type === 'ligacao' && callStatus === 'atendeu';

  const handleSubmit = () => {
    onSubmit({
      type,
      callStatus: type === 'ligacao' ? callStatus : undefined,
      whatsappStatus: type === 'whatsapp' ? whatsappStatus : undefined,
      message: message || undefined,
      notes: notes || undefined,
      durationMinutes: type === 'ligacao' ? (parseInt(durationMinutes) || 0) : undefined,
      spokeWithClient: type === 'ligacao' ? spokeWithClient : undefined,
      dataRetorno: returnAt ? returnAt.replace('T', ' ') : undefined,
      retornoAcao: returnAction.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Registrar Interação</h2>
            <p className="text-sm text-muted-foreground">{clientName}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Tipo de interação</Label>
            <Select value={type} onValueChange={(v) => setType(v as InteractionType)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ligacao">📞 Ligação</SelectItem>
                <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                <SelectItem value="email">📧 E-mail</SelectItem>
                <SelectItem value="sms">📱 SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'ligacao' && (
            <>
              <div>
                <Label className="text-sm font-medium">Status da ligação</Label>
                <Select value={callStatus} onValueChange={(v) => setCallStatus(v as CallStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atendeu">✅ Atendeu</SelectItem>
                    <SelectItem value="nao_atendeu">❌ Não atendeu</SelectItem>
                    <SelectItem value="caixa_postal">📪 Caixa postal / Bloqueio</SelectItem>
                    <SelectItem value="numero_invalido">⛔ Número inválido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Duração da ligação (minutos)</Label>
                <Input
                  type="number"
                  min={0}
                  className="mt-1"
                  placeholder="0"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                />
              </div>
              <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${
                spokeWithClient ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'
              }`}>
                {spokeWithClient ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span>
                  {spokeWithClient ? 'Falou com o cliente (automático)' : 'Não falou com o cliente (automático)'}
                </span>
              </div>
            </>
          )}

          {type === 'whatsapp' && (
            <div>
              <Label className="text-sm font-medium">Status do WhatsApp</Label>
              <Select value={whatsappStatus} onValueChange={(v) => setWhatsappStatus(v as WhatsAppStatus)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="enviado">✓ Enviado</SelectItem>
                  <SelectItem value="entregue">✓✓ Entregue</SelectItem>
                  <SelectItem value="visualizado">✓✓ Visualizado</SelectItem>
                  <SelectItem value="respondido">💬 Respondido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(type === 'whatsapp' || type === 'email' || type === 'sms') && (
            <div>
              <Label className="text-sm font-medium">Mensagem</Label>
              <Textarea className="mt-1" rows={2} placeholder="Conteúdo enviado..." value={message} onChange={e => setMessage(e.target.value)} />
            </div>
          )}

          <div>
            <Label className="text-sm font-medium">Observação</Label>
            <Textarea className="mt-1" rows={2} placeholder="Notas sobre a interação..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <Label className="text-sm font-medium">Data de retorno</Label>
              <Input
                type="datetime-local"
                className="mt-1"
                value={returnAt}
                onChange={e => setReturnAt(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Próxima ação</Label>
              <Input
                className="mt-1"
                placeholder="Ex.: enviar WhatsApp"
                value={returnAction}
                onChange={e => setReturnAction(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </div>
      </div>
    </div>
  );
}
