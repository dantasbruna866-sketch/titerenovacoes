import { useState, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import logoIdentite from '@/assets/logo-identite.png';
import { mockClients, type Client, type InteractionType, type CallStatus, type WhatsAppStatus, getEngagementLevel } from '@/data/mockData';
import { DashboardCards } from '@/components/DashboardCards';
import { ClientTable } from '@/components/ClientTable';
import { ClientModal } from '@/components/ClientModal';
import { Filters } from '@/components/Filters';
import { RegisterInteractionModal } from '@/components/RegisterInteractionModal';
import { AllInteractionsModal } from '@/components/AllInteractionsModal';
import { ContactModal } from '@/components/ContactModal';
import { StatusTabs, getClientTab, type StatusTab } from '@/components/StatusTabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const RECEITA_POR_RENOVACAO = 250;

export default function Index() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [interactionClient, setInteractionClient] = useState<Client | null>(null);
  const [allInteractionsClient, setAllInteractionsClient] = useState<Client | null>(null);
  const [contactState, setContactState] = useState<{ client: Client; channel: InteractionType } | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(2025, 3, 30),
  });
  const [vendedor, setVendedor] = useState('all');
  const [engajamento, setEngajamento] = useState('all');
  const [tag, setTag] = useState('all');
  const [tentativasMin, setTentativasMin] = useState('all');
  const [activeTab, setActiveTab] = useState<StatusTab>('todos');

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (c.blacklist) return false;
      const venc = new Date(c.dataVencimento);
      if (dateRange?.from) {
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
        to.setHours(23, 59, 59, 999);
        if (venc < from || venc > to) return false;
      }
      if (vendedor !== 'all' && c.vendedor !== vendedor) return false;
      if (engajamento !== 'all' && c.engajamento !== engajamento) return false;
      if (tag !== 'all' && !c.tags.includes(tag)) return false;
      if (tentativasMin !== 'all' && c.tentativasContato < parseInt(tentativasMin)) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.razaoSocial.toLowerCase().includes(q) ||
          c.cnpj.includes(q) ||
          c.nomeSocio.toLowerCase().includes(q);
      }
      return true;
    });
  }, [clients, dateRange, vendedor, engajamento, tag, tentativasMin, search]);

  const tabFilteredClients = useMemo(() => {
    if (activeTab === 'todos') return filteredClients;
    return filteredClients.filter(c => getClientTab(c) === activeTab);
  }, [filteredClients, activeTab]);

  const kpis = useMemo(() => {
    const total = filteredClients.length;
    const renovados = filteredClients.filter(c => c.status === 'renovado').length;
    const emAberto = filteredClients.filter(c => c.status === 'em_andamento').length;
    const naoRenovados = filteredClients.filter(c => c.status === 'nao_renovado').length;
    const taxa = total > 0 ? (renovados / total) * 100 : 0;
    const receita = renovados * RECEITA_POR_RENOVACAO;
    return { total, renovados, emAberto, naoRenovados, taxaRenovacao: taxa, receita };
  }, [filteredClients]);

  const handlePullClient = (clientId: string) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, vendedor: 'Você' } : c
    ));
    toast({ title: 'Atendimento puxado!', description: 'Você agora é responsável por este cliente.' });
  };

  const handleMarkRenewed = (clientId: string) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, status: 'renovado' as const, dataRenovacao: new Date().toISOString().split('T')[0] } : c
    ));
    setSelectedClient(null);
    toast({ title: 'Certificado renovado!', description: 'Status atualizado com sucesso.' });
  };

  const handleAddObservation = useCallback((clientId: string, text: string) => {
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      const newObs = {
        id: `o-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        text,
        author: 'Você',
      };
      const updated = { ...c, observacoes: [newObs, ...c.observacoes] };
      // Update selected client too
      setSelectedClient(prev => prev?.id === clientId ? updated : prev);
      return updated;
    }));
    toast({ title: 'Observação adicionada!' });
  }, [toast]);

  const handleRegisterInteraction = useCallback((data: {
    type: InteractionType;
    callStatus?: CallStatus;
    whatsappStatus?: WhatsAppStatus;
    message?: string;
    notes?: string;
    durationMinutes?: number;
    spokeWithClient?: boolean;
  }) => {
    if (!interactionClient) return;
    const clientId = interactionClient.id;

    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      const newInteraction = {
        id: `i-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        ...data,
      };
      const updated = {
        ...c,
        interactions: [...c.interactions, newInteraction],
        tentativasContato: c.tentativasContato + 1,
      };
      updated.engajamento = getEngagementLevel(updated);
      setSelectedClient(prev => prev?.id === clientId ? updated : prev);
      setAllInteractionsClient(prev => prev?.id === clientId ? updated : prev);
      return updated;
    }));

    setInteractionClient(null);
    toast({ title: 'Interação registrada!', description: `${data.type === 'ligacao' ? 'Ligação' : data.type === 'whatsapp' ? 'WhatsApp' : data.type === 'email' ? 'Email' : 'SMS'} registrado(a).` });
  }, [interactionClient, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoIdentite} alt="Identité Certificado Digital" className="h-9" />
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold">Gestão de Renovações</h1>
            <p className="text-sm text-muted-foreground">Acompanhe e gerencie as renovações de certificados digitais</p>
          </div>
          <Filters
            dateRange={dateRange} vendedor={vendedor}
            engajamento={engajamento} tag={tag} tentativasMin={tentativasMin}
            onDateRangeChange={setDateRange} onVendedorChange={setVendedor}
            onEngajamentoChange={setEngajamento} onTagChange={setTag} onTentativasMinChange={setTentativasMin}
          />
        </div>

        <DashboardCards {...kpis} />

        <div>
          <StatusTabs
            clients={filteredClients}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="mt-3">
            <ClientTable
              clients={tabFilteredClients}
              onSelectClient={setSelectedClient}
              onPullClient={handlePullClient}
              onRegisterInteraction={setInteractionClient}
              onViewAllInteractions={setAllInteractionsClient}
              onContact={(client, channel) => setContactState({ client, channel })}
            />
          </div>
        </div>
      </main>

      {/* Modal */}
      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onMarkRenewed={handleMarkRenewed}
          onAddObservation={handleAddObservation}
          onRegisterInteraction={setInteractionClient}
        />
      )}

      {/* Register Interaction Modal */}
      {interactionClient && (
        <RegisterInteractionModal
          clientName={interactionClient.razaoSocial}
          onClose={() => setInteractionClient(null)}
          onSubmit={handleRegisterInteraction}
        />
      )}

      {/* All Interactions Popup */}
      {allInteractionsClient && (
        <AllInteractionsModal
          clientName={allInteractionsClient.razaoSocial}
          interactions={allInteractionsClient.interactions}
          onClose={() => setAllInteractionsClient(null)}
        />
      )}

      {/* Contact Modal (WhatsApp / Ligação / SMS / E-mail) */}
      {contactState && (
        <ContactModal
          client={contactState.client}
          channel={contactState.channel}
          onClose={() => setContactState(null)}
        />
      )}
    </div>
  );
}
