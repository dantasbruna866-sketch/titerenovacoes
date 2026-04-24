import { useState, useMemo, useCallback } from 'react';
import { Search, Download } from 'lucide-react';
import logoIdentite from '@/assets/logo-identite.png';
import { mockProspects, type Prospect, type ProspectStatus } from '@/data/mockProspects';
import { type Client, type InteractionType, type CallStatus, type WhatsAppStatus, getEngagementLevel } from '@/data/mockData';
import { ClientTable } from '@/components/ClientTable';
import { ClientModal } from '@/components/ClientModal';
import { RegisterInteractionModal } from '@/components/RegisterInteractionModal';
import { AllInteractionsModal } from '@/components/AllInteractionsModal';
import { ContactModal } from '@/components/ContactModal';
import { StatusTabs, getProspectTab, type ProspectTab } from '@/components/StatusTabs';
import { ModuleNav } from '@/components/ModuleNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const [activeTab, setActiveTab] = useState<ProspectTab>('todos');

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      if (p.blacklist) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.razaoSocial.toLowerCase().includes(q) ||
          p.cnpj.includes(q) ||
          p.nomeSocio.toLowerCase().includes(q) ||
          (p.segmento?.toLowerCase().includes(q) ?? false);
      }
      return true;
    });
  }, [prospects, search]);

  const tabFilteredProspects = useMemo(() => {
    if (activeTab === 'todos') return filteredProspects;
    return filteredProspects.filter(p => getProspectTab(p) === activeTab);
  }, [filteredProspects, activeTab]);

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
    const naoContatados = filteredProspects.filter(p => p.prospectStatus === 'nao_contatado').length;
    const emFunil = filteredProspects.filter(p => ['em_abordagem', 'interessado', 'qualificado'].includes(p.prospectStatus)).length;
    const convertidos = filteredProspects.filter(p => p.prospectStatus === 'convertido').length;
    const taxa = total > 0 ? (convertidos / total) * 100 : 0;
    return { total, naoContatados, emFunil, convertidos, taxa };
  }, [filteredProspects]);

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Gestão de Prospecções</h1>
            <p className="text-sm text-muted-foreground">Lista fria importada da base do EmpresAqui — converta novos clientes em primeiras emissões</p>
          </div>
          <Button onClick={handleImportEmpresAqui} className="gap-2">
            <Download className="h-4 w-4" />
            Importar base do EmpresAqui
          </Button>
        </div>

        {/* KPIs simples */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KpiCard label="Total" value={kpis.total} accent="text-foreground" />
          <KpiCard label="Não contatados" value={kpis.naoContatados} accent="text-slate-600" />
          <KpiCard label="Em funil" value={kpis.emFunil} accent="text-sky-600" />
          <KpiCard label="Convertidos" value={kpis.convertidos} accent="text-emerald-600" />
          <KpiCard label="Taxa de conversão" value={`${kpis.taxa.toFixed(1)}%`} accent="text-primary" />
        </div>

        <div>
          <StatusTabs
            variant="prospects"
            prospects={filteredProspects}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t as ProspectTab)}
          />
          <div className="mt-3">
            <ClientTable
              clients={tableClients}
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
        />
      )}

      {interactionClient && (
        <RegisterInteractionModal
          clientName={interactionClient.razaoSocial}
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
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="crm-kpi-card">
      <p className={`text-2xl font-bold ${accent || 'text-foreground'}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
