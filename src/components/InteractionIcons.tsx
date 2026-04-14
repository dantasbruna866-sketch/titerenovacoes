import { MessageCircle, Mail, Phone, MessageSquare } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InteractionIconsProps {
  onWhatsApp?: () => void;
  onSMS?: () => void;
  onEmail?: () => void;
  onCall?: () => void;
}

export function InteractionIcons({ onWhatsApp, onSMS, onEmail, onCall }: InteractionIconsProps) {
  const items = [
    { icon: MessageCircle, label: 'WhatsApp', onClick: onWhatsApp, color: 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50' },
    { icon: MessageSquare, label: 'SMS', onClick: onSMS, color: 'bg-sky-900/30 text-sky-400 hover:bg-sky-900/50' },
    { icon: Mail, label: 'Email', onClick: onEmail, color: 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' },
    { icon: Phone, label: 'Ligação', onClick: onCall, color: 'bg-violet-900/30 text-violet-400 hover:bg-violet-900/50' },
  ];

  return (
    <div className="flex gap-1">
      {items.map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <button onClick={item.onClick} className={`interaction-icon ${item.color}`}>
              <item.icon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
