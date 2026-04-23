import { Link2, DollarSign, CalendarCheck, Video, ShieldCheck } from 'lucide-react';
import type { ProcessStatus, ProcessStepState } from '@/data/mockData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type StepKey = keyof ProcessStatus;

interface StepDef {
  key: StepKey;
  icon: React.ComponentType<{ className?: string }>;
  pendingLabel: string;
  doneLabel: string;
}

const STEPS: StepDef[] = [
  { key: 'paymentLink', icon: Link2, pendingLabel: 'Link de pagamento pendente', doneLabel: 'Link de pagamento gerado' },
  { key: 'payment', icon: DollarSign, pendingLabel: 'Pagamento pendente', doneLabel: 'Pagamento efetuado' },
  { key: 'scheduling', icon: CalendarCheck, pendingLabel: 'Agendamento pendente', doneLabel: 'Agendamento confirmado' },
  { key: 'videoConference', icon: Video, pendingLabel: 'Videoconferência pendente', doneLabel: 'Videoconferência realizada' },
  { key: 'certificate', icon: ShieldCheck, pendingLabel: 'Certificado pendente', doneLabel: 'Certificado emitido' },
];

function stepClass(state: ProcessStepState): string {
  // verde = feito, amarelo = pendente
  return state === 'done'
    ? 'bg-emerald-500 text-white'
    : 'bg-amber-400 text-white';
}

export function ProcessStatusIcons({ status }: { status: ProcessStatus }) {
  return (
    <div className="flex items-center gap-1">
      {STEPS.map(({ key, icon: Icon, pendingLabel, doneLabel }) => {
        const state = status[key];
        return (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <span
                className={`h-7 w-7 rounded-md flex items-center justify-center ${stepClass(state)}`}
                aria-label={state === 'done' ? doneLabel : pendingLabel}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {state === 'done' ? doneLabel : pendingLabel}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
