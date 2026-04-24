import { useState, useMemo, useCallback } from 'react';
import { Search, BarChart3 } from 'lucide-react';
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
import { SalesByDayModal } from '@/components/SalesByDayModal';
import { StatusTabs, getClientTab, type StatusTab } from '@/components/StatusTabs';
import { ModuleNav } from '@/components/ModuleNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SALES_DATE = new Date().toISOString().split('T')[0];

function getDatePart(value: string) {
  return value.split(' ')[0];
}

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
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [selectedSalesDate, setSelectedSalesDate] = useState(DEFAULT_SALES_DATE);
  const [selectedReturnDate, setSelectedReturnDate] = useState(DEFAULT_SALES_DATE);

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
    if (activeTab === 'retornos_dia') {
      return filteredClients.filter((client) => client.dataRetorno && getDatePart(client.dataRetorno) === selectedReturnDate);
    }
    return filteredClients.filter(c => getClientTab(c) === activeTab);
  }, [filteredClients, activeTab, selectedReturnDate]);

  const kpis = useMemo(() => {
    const total = filteredClients.length;
    const renovados = filteredClients.filter(c => c.status === 'renovado').length;
    const emAberto = filteredClients.filter(c => c.status === 'em_andamento').length;
    const naoRenovados = filteredClients.filter(c => c.status === 'nao_renovado').length;
    const taxa = total > 0 ? (renovados / total) * 100 : 0;
    const receita = filteredClients.reduce((acc, client) => acc + (client.saleInfo?.amountPaid ?? 0), 0);
    return { total, renovados, emAberto, naoRenovados, taxaRenovacao: taxa, receita };
  }, [filteredClients]);

  const salesByDay = useMemo(() => {
    return clients
      .filter((client) => client.saleInfo && getDatePart(client.saleInfo.paidAt) === selectedSalesDate)
      .map((client) => ({
        id: client.id,
        clientName: client.razaoSocial,
        cnpj: client.cnpj,
        certificateLabel: client.saleInfo!.certificateLabel,
        paidAt: client.saleInfo!.paidAt,
        amountPaid: client.saleInfo!.amountPaid,
      }))
      .sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  }, [clients, selectedSalesDate]);

  const salesTotal = useMemo(
    () => salesByDay.reduce((acc, item) => acc + item.amountPaid, 0),
    [salesByDay]
  );

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

  const handleUpdateReturn = useCallback((clientId: string, dataRetorno?: string, retornoAcao?: string) => {
    setClients(prev => prev.map(c => {
      if (c.id !== clientId) return c;
      const updated = {
        ...c,
        dataRetorno: dataRetorno || null,
        retornoAcao: retornoAcao || null,
      };
      setSelectedClient(prevSelected => prevSelected?.id === clientId ? updated : prevSelected);
      return updated;
    }));
    toast({ title: 'Retorno atualizado!' });
  }, [toast]);

  const handleRegisterInteraction = useCallback((data: {
    type: InteractionType;
    callStatus?: CallStatus;
    whatsappStatus?: WhatsAppStatus;
    message?: string;
    notes?: string;
    durationMinutes?: number;
    spokeWithClient?: boolean;
    dataRetorno?: string;
    retornoAcao?: string;
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
        dataRetorno: data.dataRetorno || c.dataRetorno || null,
        retornoAcao: data.retornoAcao || c.retornoAcao || null,
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
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={logoIdentite} alt="Identité Certificado Digital" className="h-9" />
            <ModuleNav />
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
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <Filters
              dateRange={dateRange} vendedor={vendedor}
              engajamento={engajamento} tag={tag} tentativasMin={tentativasMin}
              onDateRangeChange={setDateRange} onVendedorChange={setVendedor}
              onEngajamentoChange={setEngajamento} onTagChange={setTag} onTentativasMinChange={setTentativasMin}
            />
            <Button variant="outline" className="gap-2 self-start" onClick={() => setSalesModalOpen(true)}>
              <BarChart3 className="h-4 w-4" />
              Ver vendas por dia
            </Button>
          </div>
        </div>

        <DashboardCards {...kpis} />

        <div>
          <StatusTabs
            variant="renewals"
            clients={filteredClients}
            activeTab={activeTab}
            returnDate={selectedReturnDate}
            onTabChange={(t) => setActiveTab(t as StatusTab)}
          />
          {activeTab === 'retornos_dia' && (
            <div className="mt-3 flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
              <span className="text-sm font-medium">Data dos retornos</span>
              <Input type="date" value={selectedReturnDate} onChange={(e) => setSelectedReturnDate(e.target.value)} className="w-[180px] h-9" />
              <span className="text-sm text-muted-foreground">Visualizando todos os clientes agendados nesse dia.</span>
            </div>
          )}
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
          onUpdateReturn={handleUpdateReturn}
        />
      )}

      {/* Register Interaction Modal */}
      {interactionClient && (
        <RegisterInteractionModal
          clientName={interactionClient.razaoSocial}
          initialReturnAt={interactionClient.dataRetorno}
          initialReturnAction={interactionClient.retornoAcao}
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

      <SalesByDayModal
        open={salesModalOpen}
        onOpenChange={setSalesModalOpen}
        selectedDate={selectedSalesDate}
        onDateChange={setSelectedSalesDate}
        items={salesByDay}
        totalRevenue={salesTotal}
      />
    </div>
  );
}
