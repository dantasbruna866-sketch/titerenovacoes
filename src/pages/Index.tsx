import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import logoIdentite from '@/assets/logo-identite.png';
import { mockClients, type Client } from '@/data/mockData';
import { DashboardCards } from '@/components/DashboardCards';
import { ClientTable } from '@/components/ClientTable';
import { ClientModal } from '@/components/ClientModal';
import { Filters } from '@/components/Filters';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const RECEITA_POR_RENOVACAO = 250;

export default function Index() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState('4');
  const [year, setYear] = useState('2025');
  const [vendedor, setVendedor] = useState('all');

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      if (c.blacklist) return false;
      const venc = new Date(c.dataVencimento);
      if (month !== 'all' && venc.getMonth() + 1 !== parseInt(month)) return false;
      if (year !== 'all' && venc.getFullYear() !== parseInt(year)) return false;
      if (vendedor !== 'all' && c.vendedor !== vendedor) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.razaoSocial.toLowerCase().includes(q) ||
          c.cnpj.includes(q) ||
          c.nomeSocio.toLowerCase().includes(q);
      }
      return true;
    });
  }, [clients, month, year, vendedor, search]);

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
        {/* Filters + Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Gestão de Renovações</h1>
            <p className="text-sm text-muted-foreground">Acompanhe e gerencie as renovações de certificados digitais</p>
          </div>
          <Filters
            month={month} year={year} vendedor={vendedor}
            onMonthChange={setMonth} onYearChange={setYear} onVendedorChange={setVendedor}
          />
        </div>

        <DashboardCards {...kpis} />

        {/* Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Clientes ({filteredClients.length})
            </h2>
          </div>
          <ClientTable
            clients={filteredClients}
            onSelectClient={setSelectedClient}
            onPullClient={handlePullClient}
          />
        </div>
      </main>

      {/* Modal */}
      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onMarkRenewed={handleMarkRenewed}
        />
      )}
    </div>
  );
}
