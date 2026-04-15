import { useState } from 'react';
import { X } from 'lucide-react';
import type { InteractionType, CallStatus, WhatsAppStatus } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface RegisterInteractionModalProps {
  clientName: string;
  onClose: () => void;
  onSubmit: (data: {
    type: InteractionType;
    callStatus?: CallStatus;
    whatsappStatus?: WhatsAppStatus;
    message?: string;
    notes?: string;
  }) => void;
}

export function RegisterInteractionModal({ clientName, onClose, onSubmit }: RegisterInteractionModalProps) {
  const [type, setType] = useState<InteractionType>('ligacao');
  const [callStatus, setCallStatus] = useState<CallStatus>('atendeu');
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>('enviado');
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      type,
      callStatus: type === 'ligacao' ? callStatus : undefined,
      whatsappStatus: type === 'whatsapp' ? whatsappStatus : undefined,
      message: message || undefined,
      notes: notes || undefined,
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
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Registrar</Button>
        </div>
      </div>
    </div>
  );
}
