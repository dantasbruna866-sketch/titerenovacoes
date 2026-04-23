import { useState } from 'react';
import { X, Phone, MessageCircle, MessageSquare, Mail, Send, PhoneCall, PhoneOff, Copy, Check } from 'lucide-react';
import type { Client, InteractionType } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ContactModalProps {
  client: Client;
  channel: InteractionType;
  onClose: () => void;
  onSent?: (channel: InteractionType, payload: { message?: string; subject?: string; durationMinutes?: number; spokeWithClient?: boolean }) => void;
}

const channelMeta: Record<InteractionType, { title: string; icon: React.ReactNode; accent: string }> = {
  whatsapp: { title: 'Enviar WhatsApp', icon: <MessageCircle className="h-5 w-5" />, accent: 'text-emerald-600 bg-emerald-50' },
  ligacao: { title: 'Ligar para o cliente', icon: <Phone className="h-5 w-5" />, accent: 'text-violet-600 bg-violet-50' },
  sms: { title: 'Enviar SMS', icon: <MessageSquare className="h-5 w-5" />, accent: 'text-sky-600 bg-sky-50' },
  email: { title: 'Enviar E-mail', icon: <Mail className="h-5 w-5" />, accent: 'text-amber-600 bg-amber-50' },
};

export function ContactModal({ client, channel, onClose, onSent }: ContactModalProps) {
  const { toast } = useToast();
  const meta = channelMeta[channel];
  const phoneDigits = client.telefone.replace(/\D/g, '');

  // shared fields
  const [phone, setPhone] = useState(client.telefone);
  const [email, setEmail] = useState(client.email);

  // whatsapp / sms
  const [message, setMessage] = useState(
    channel === 'whatsapp'
      ? `Olá ${client.nomeSocio.split(' ')[0]}, tudo bem? Sou da Identité, estou entrando em contato sobre a renovação do seu certificado digital.`
      : channel === 'sms'
      ? `Olá ${client.nomeSocio.split(' ')[0]}, seu certificado digital está próximo do vencimento. Renove agora!`
      : ''
  );

  // email
  const [subject, setSubject] = useState('Renovação do seu Certificado Digital');
  const [body, setBody] = useState(
    `Prezado(a) ${client.nomeSocio},\n\nIdentificamos que seu certificado digital está próximo do vencimento. Podemos auxiliá-lo no processo de renovação de forma rápida e segura.\n\nAguardamos seu retorno.\n\nAtenciosamente,\nEquipe Identité`
  );

  // ligacao
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'in_call' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [spokeWithClient, setSpokeWithClient] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [copied, setCopied] = useState(false);

  // simple timer for in-call
  const startCall = () => {
    setCallState('ringing');
    setTimeout(() => setCallState('in_call'), 1200);
    const start = Date.now();
    const interval = setInterval(() => {
      setCallSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    // store interval to clear when ending
    (window as unknown as { __callInt?: number }).__callInt = interval as unknown as number;
  };

  const endCall = () => {
    const i = (window as unknown as { __callInt?: number }).__callInt;
    if (i) clearInterval(i);
    setCallState('ended');
  };

  const handleCopyPhone = async () => {
    await navigator.clipboard.writeText(client.telefone);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = () => {
    if (channel === 'whatsapp') {
      window.open(`https://wa.me/55${phoneDigits}?text=${encodeURIComponent(message)}`, '_blank');
      onSent?.(channel, { message });
      toast({ title: 'WhatsApp aberto', description: 'A conversa foi aberta em nova aba.' });
    } else if (channel === 'sms') {
      window.open(`sms:${phoneDigits}?body=${encodeURIComponent(message)}`, '_self');
      onSent?.(channel, { message });
      toast({ title: 'SMS preparado', description: 'O aplicativo de SMS foi aberto.' });
    } else if (channel === 'email') {
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
      onSent?.(channel, { message: body, subject });
      toast({ title: 'E-mail preparado', description: 'O cliente de e-mail foi aberto.' });
    } else if (channel === 'ligacao') {
      const minutes = Math.max(0, Math.round(callSeconds / 60));
      onSent?.(channel, { message: callNotes, durationMinutes: minutes, spokeWithClient });
      toast({ title: 'Ligação registrada', description: `Duração: ${minutes} min.` });
    }
    onClose();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${meta.accent}`}>
              {meta.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{meta.title}</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[260px]">{client.razaoSocial} · {client.nomeSocio}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* WhatsApp unread banner */}
        {channel === 'whatsapp' && client.whatsappUnread && client.whatsappUnread > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
            <span className="h-5 min-w-5 px-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
              {client.whatsappUnread}
            </span>
            <span>{client.whatsappUnread === 1 ? 'mensagem nova não lida' : 'mensagens novas não lidas'} do cliente</span>
          </div>
        )}

        {/* Body por canal */}
        {channel === 'ligacao' ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4 text-center space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Telefone</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-semibold tabular-nums">{client.telefone}</span>
                <button onClick={handleCopyPhone} className="h-7 w-7 rounded hover:bg-muted flex items-center justify-center">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
              {callState === 'idle' && (
                <p className="text-xs text-muted-foreground">Pronto para iniciar a ligação</p>
              )}
              {callState === 'ringing' && (
                <p className="text-xs text-violet-700 animate-pulse">Chamando…</p>
              )}
              {callState === 'in_call' && (
                <p className="text-xs text-emerald-700 font-medium">Em ligação · {formatTime(callSeconds)}</p>
              )}
              {callState === 'ended' && (
                <p className="text-xs text-muted-foreground">Ligação encerrada · {formatTime(callSeconds)}</p>
              )}
            </div>

            {/* Call action buttons */}
            <div className="flex justify-center gap-3">
              {callState === 'idle' || callState === 'ended' ? (
                <Button onClick={startCall} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                  <PhoneCall className="h-4 w-4" /> {callState === 'ended' ? 'Ligar novamente' : 'Iniciar ligação'}
                </Button>
              ) : (
                <Button onClick={endCall} variant="destructive" className="gap-2">
                  <PhoneOff className="h-4 w-4" /> Encerrar
                </Button>
              )}
              <a
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center justify-center rounded-md border px-4 h-10 text-sm hover:bg-muted gap-2"
              >
                <Phone className="h-4 w-4" /> Discar no aparelho
              </a>
            </div>

            {(callState === 'in_call' || callState === 'ended') && (
              <>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={spokeWithClient}
                    onChange={e => setSpokeWithClient(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Falei com o cliente
                </label>
                <div>
                  <Label className="text-sm font-medium">Anotações da ligação</Label>
                  <Textarea
                    className="mt-1"
                    rows={3}
                    placeholder="O que foi conversado..."
                    value={callNotes}
                    onChange={e => setCallNotes(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        ) : channel === 'email' ? (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Para</Label>
              <Input className="mt-1" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Assunto</Label>
              <Input className="mt-1" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Mensagem</Label>
              <Textarea className="mt-1" rows={6} value={body} onChange={e => setBody(e.target.value)} />
            </div>
          </div>
        ) : (
          // whatsapp / sms
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Telefone</Label>
              <Input className="mt-1" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm font-medium">Mensagem</Label>
              <Textarea
                className="mt-1"
                rows={channel === 'whatsapp' ? 5 : 3}
                maxLength={channel === 'sms' ? 160 : undefined}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              {channel === 'sms' && (
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{message.length}/160</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-end pt-2 border-t">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          {channel === 'ligacao' ? (
            <Button onClick={handleSubmit} disabled={callState === 'idle'}>
              Salvar registro
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="h-4 w-4" />
              {channel === 'whatsapp' ? 'Abrir WhatsApp' : channel === 'sms' ? 'Enviar SMS' : 'Enviar E-mail'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
