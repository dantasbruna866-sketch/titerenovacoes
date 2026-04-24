import { useState, useMemo, useCallback } from 'react';
import { Search, Download, BarChart3 } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import logoIdentite from '@/assets/logo-identite.png';
import { mockProspects, type Prospect, type ProspectStatus } from '@/data/mockProspects';
import { type Client, type InteractionType, type CallStatus, type WhatsAppStatus, getEngagementLevel } from '@/data/mockData';
import { ClientTable } from '@/components/ClientTable';
import { ClientModal } from '@/components/ClientModal';
import { RegisterInteractionModal } from '@/components/RegisterInteractionModal';
import { AllInteractionsModal } from '@/components/AllInteractionsModal';
import { ContactModal } from '@/components/ContactModal';
import { Filters } from '@/components/Filters';
import { SalesByDayModal } from '@/components/SalesByDayModal';
import { StatusTabs, getProspectTab, type ProspectTab } from '@/components/StatusTabs';
import { DashboardCards } from '@/components/DashboardCards';
import { ModuleNav } from '@/components/ModuleNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SALES_DATE = new Date().toISOString().split('T')[0];

function getDatePart(value: string) {
  return value.split(' ')[0];
}

/**
 * Adapta um Prospect para o formato de Client esperado pela tabela compartilhada.
 * Mapeia prospectStatus → status (renovado/em_andamento/nao_renovado) só para visual.
 */
function prospectToClient(p: Prospect): Client {
  const statusMap: Record<ProspectStatus, Client['status']> = {
    nao_contatado: 'em_andamento',
    em_abordagem: 'em_andamento',
    interessado: 'em_andamento',
    qualificado: 'em_andamento',
    convertido: 'renovado',
    descartado: 'nao_renovado',
  };
  return {
    ...p,
    status: statusMap[p.prospectStatus],
    dataRenovacao: null,
    dataUltimaRenovacao: null,
    renovouAnoAnterior: false,
    indicadorComparativo: 'nao_renovou',
  };
}

export default function Prospeccoes() {
  const { toast } = useToast();
  const [prospects, setProspects] = useState<Prospect[]>(mockProspects);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [interactionClient, setInteractionClient] = useState<Client | null>(null);
  const [allInteractionsClient, setAllInteractionsClient] = useState<Client | null>(null);
  const [contactState, setContactState] = useState<{ client: Client; channel: InteractionType } | null>(null);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [vendedor, setVendedor] = useState('all');
  const [engajamento, setEngajamento] = useState('all');
  const [tag, setTag] = useState('all');
  const [tentativasMin, setTentativasMin] = useState('all');
  const [activeTab, setActiveTab] = useState<ProspectTab>('todos');
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [selectedSalesDate, setSelectedSalesDate] = useState(DEFAULT_SALES_DATE);
  const [selectedReturnDate, setSelectedReturnDate] = useState(DEFAULT_SALES_DATE);

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      if (p.blacklist) return false;
      const abertura = new Date(p.dataAbertura);
      if (dateRange?.from) {
        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);
        const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
        to.setHours(23, 59, 59, 999);
        if (abertura < from || abertura > to) return false;
      }
      if (vendedor !== 'all' && p.vendedor !== vendedor) return false;
      if (engajamento !== 'all' && p.engajamento !== engajamento) return false;
      if (tag !== 'all' && !p.tags.includes(tag)) return false;
      if (tentativasMin !== 'all' && p.tentativasContato < parseInt(tentativasMin)) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.razaoSocial.toLowerCase().includes(q) ||
          p.cnpj.includes(q) ||
          p.nomeSocio.toLowerCase().includes(q) ||
          (p.segmento?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [prospects, search, dateRange, vendedor, engajamento, tag, tentativasMin]);

  const tabFilteredProspects = useMemo(() => {
    if (activeTab === 'todos') return filteredProspects;
    if (activeTab === 'retornos_dia') {
      return filteredProspects.filter((prospect) => prospect.dataRetorno && getDatePart(prospect.dataRetorno) === selectedReturnDate);
    }
    return filteredProspects.filter(p => getProspectTab(p) === activeTab);
  }, [filteredProspects, activeTab, selectedReturnDate]);

  const tableClients = useMemo(
    () => tabFilteredProspects.map(prospectToClient),
    [tabFilteredProspects]
  );

  const handlePullClient = (clientId: string) => {
    setProspects(prev => prev.map(p => p.id === clientId ? { ...p, vendedor: 'Você' } : p));
    toast({ title: 'Prospect puxado!', description: 'Você agora é responsável por este lead.' });
  };

  const handleAddObservation = useCallback((clientId: string, text: string) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== clientId) return p;
      const newObs = {
        id: `o-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        text,
        author: 'Você',
      };
      const updated = { ...p, observacoes: [newObs, ...p.observacoes] };
      setSelectedClient(prev => prev?.id === clientId ? prospectToClient(updated) : prev);
      return updated;
    }));
    toast({ title: 'Observação adicionada!' });
  }, [toast]);

  const handleUpdateReturn = useCallback((clientId: string, dataRetorno?: string, retornoAcao?: string) => {
    setProspects(prev => prev.map(p => {
      if (p.id !== clientId) return p;
      const updated = {
        ...p,
        dataRetorno: dataRetorno || null,
        retornoAcao: retornoAcao || null,
      };
      setSelectedClient(prevSelected => prevSelected?.id === clientId ? prospectToClient(updated) : prevSelected);
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

    setProspects(prev => prev.map(p => {
      if (p.id !== clientId) return p;
      const newInteraction = {
        id: `i-${Date.now()}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        ...data,
      };
      const updated: Prospect = {
        ...p,
        interactions: [...p.interactions, newInteraction],
        tentativasContato: p.tentativasContato + 1,
        dataRetorno: data.dataRetorno || p.dataRetorno || null,
        retornoAcao: data.retornoAcao || p.retornoAcao || null,
      };
      // recalcula engajamento usando o tipo Client (compatível em estrutura)
      updated.engajamento = getEngagementLevel(prospectToClient(updated));
      // se ainda estava "não contatado", move para "em_abordagem"
      if (updated.prospectStatus === 'nao_contatado') {
        updated.prospectStatus = 'em_abordagem';
      }
      setSelectedClient(prev => prev?.id === clientId ? prospectToClient(updated) : prev);
      setAllInteractionsClient(prev => prev?.id === clientId ? prospectToClient(updated) : prev);
      return updated;
    }));

    setInteractionClient(null);
    toast({ title: 'Interação registrada!' });
  }, [interactionClient, toast]);

  const handleImportEmpresAqui = () => {
    toast({
      title: 'Importação iniciada',
      description: 'A integração com EmpresAqui será conectada em breve.',
    });
  };

  // KPIs simples para prospecções
  const kpis = useMemo(() => {
    const total = filteredProspects.length;
    const renovados = filteredProspects.filter(p => p.prospectStatus === 'convertido').length;
    const emAberto = filteredProspects.filter(p => ['nao_contatado', 'em_abordagem', 'interessado', 'qualificado'].includes(p.prospectStatus)).length;
    const naoRenovados = filteredProspects.filter(p => p.prospectStatus === 'descartado').length;
    const taxa = total > 0 ? (renovados / total) * 100 : 0;
    const receita = filteredProspects.reduce((acc, prospect) => acc + (prospect.saleInfo?.amountPaid ?? 0), 0);
    return { total, renovados, emAberto, naoRenovados, taxaRenovacao: taxa, receita };
  }, [filteredProspects]);

  const salesByDay = useMemo(() => {
    return prospects
      .filter((prospect) => prospect.saleInfo && getDatePart(prospect.saleInfo.paidAt) === selectedSalesDate)
      .map((prospect) => ({
        id: prospect.id,
        clientName: prospect.razaoSocial,
        cnpj: prospect.cnpj,
        certificateLabel: prospect.saleInfo!.certificateLabel,
        paidAt: prospect.saleInfo!.paidAt,
        amountPaid: prospect.saleInfo!.amountPaid,
      }))
      .sort((a, b) => a.paidAt.localeCompare(b.paidAt));
  }, [prospects, selectedSalesDate]);

  const salesTotal = useMemo(
    () => salesByDay.reduce((acc, item) => acc + item.amountPaid, 0),
    [salesByDay]
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={logoIdentite} alt="Identité Certificado Digital" className="h-9" />
            <ModuleNav />
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prospect, CNPJ, segmento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-xl font-bold">Gestão de Prospecções</h1>
              <p className="text-sm text-muted-foreground">Lista fria importada da base do EmpresAqui — converta novos clientes em primeiras emissões</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setSalesModalOpen(true)}>
                <BarChart3 className="h-4 w-4" />
                Ver vendas por dia
              </Button>
              <Button onClick={handleImportEmpresAqui} className="gap-2">
                <Download className="h-4 w-4" />
                Importar base do EmpresAqui
              </Button>
            </div>
          </div>

          <Filters
            dateRange={dateRange}
            dateLabel="Selecione o período de abertura"
            vendedor={vendedor}
            engajamento={engajamento}
            tag={tag}
            tentativasMin={tentativasMin}
            onDateRangeChange={setDateRange}
            onVendedorChange={setVendedor}
            onEngajamentoChange={setEngajamento}
            onTagChange={setTag}
            onTentativasMinChange={setTentativasMin}
          />
        </div>

        <DashboardCards {...kpis} />

        <div>
          <StatusTabs
            variant="prospects"
            prospects={filteredProspects}
            activeTab={activeTab}
            returnDate={selectedReturnDate}
            onTabChange={(t) => setActiveTab(t as ProspectTab)}
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
              clients={tableClients}
              dateColumnLabel="Data de abertura da empresa"
              dateColumnVariant="opening"
              onSelectClient={setSelectedClient}
              onPullClient={handlePullClient}
              onRegisterInteraction={setInteractionClient}
              onViewAllInteractions={setAllInteractionsClient}
              onContact={(client, channel) => setContactState({ client, channel })}
            />
          </div>
        </div>
      </main>

      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onMarkRenewed={(id) => {
            setProspects(prev => prev.map(p => p.id === id ? { ...p, prospectStatus: 'convertido' } : p));
            setSelectedClient(null);
            toast({ title: 'Prospect convertido!', description: 'Cliente movido para "Convertidos".' });
          }}
          onAddObservation={handleAddObservation}
          onRegisterInteraction={setInteractionClient}
          onUpdateReturn={handleUpdateReturn}
        />
      )}

      {interactionClient && (
        <RegisterInteractionModal
          clientName={interactionClient.razaoSocial}
          initialReturnAt={interactionClient.dataRetorno}
          initialReturnAction={interactionClient.retornoAcao}
          onClose={() => setInteractionClient(null)}
          onSubmit={handleRegisterInteraction}
        />
      )}

      {allInteractionsClient && (
        <AllInteractionsModal
          clientName={allInteractionsClient.razaoSocial}
          interactions={allInteractionsClient.interactions}
          onClose={() => setAllInteractionsClient(null)}
        />
      )}

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
