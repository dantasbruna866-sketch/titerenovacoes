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
    { icon: MessageCircle, label: 'WhatsApp', onClick: onWhatsApp, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
    { icon: MessageSquare, label: 'SMS', onClick: onSMS, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { icon: Mail, label: 'Email', onClick: onEmail, color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
    { icon: Phone, label: 'Ligação', onClick: onCall, color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
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
