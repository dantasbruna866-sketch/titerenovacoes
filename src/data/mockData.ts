export type ClientStatus = 'renovado' | 'em_andamento' | 'nao_renovado';
export type InteractionType = 'whatsapp' | 'sms' | 'email' | 'ligacao';
export type CallStatus = 'atendeu' | 'nao_atendeu' | 'caixa_postal';
export type DispatchStatus = 'entregue' | 'lido' | 'falhou';
export type ComparativeIndicator = 'mesmo_mes' | 'atrasado' | 'nao_renovou';

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  callStatus?: CallStatus;
  audioUrl?: string;
  message?: string;
  dispatchStatus?: DispatchStatus;
  notes?: string;
}

export interface Client {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeSocio: string;
  socioAdministrador: boolean;
  telefone: string;
  email: string;
  dataVencimento: string;
  dataRenovacao: string | null;
  status: ClientStatus;
  renovouAnoAnterior: boolean;
  dataUltimaRenovacao: string | null;
  indicadorComparativo: ComparativeIndicator;
  vendedor: string | null;
  tags: string[];
  observacao: string;
  interactions: Interaction[];
  blacklist: boolean;
}

export const vendedores = ['Ana Silva', 'Carlos Souza', 'Maria Oliveira', 'João Santos', 'Paula Lima'];

export const tagColors: Record<string, { bg: string; text: string }> = {
  'Caixa postal': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Sem resposta': { bg: 'bg-red-100', text: 'text-red-700' },
  'Já renovou': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Cliente quente': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Primeiro contato': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Aguardando retorno': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'blacklist': { bg: 'bg-gray-800', text: 'text-gray-100' },
};

export const mockClients: Client[] = [
  {
    id: '1',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Tech Solutions Ltda',
    nomeSocio: 'Roberto Almeida',
    socioAdministrador: true,
    telefone: '(11) 99876-5432',
    email: 'roberto@techsolutions.com.br',
    dataVencimento: '2025-05-15',
    dataRenovacao: '2025-04-10',
    status: 'renovado',
    renovouAnoAnterior: true,
    dataUltimaRenovacao: '2024-04-12',
    indicadorComparativo: 'mesmo_mes',
    vendedor: 'Ana Silva',
    tags: ['Já renovou', 'Cliente quente'],
    observacao: 'Cliente fiel, renova sempre no mesmo período. Preferência por e-CNPJ A1.',
    interactions: [
      { id: 'i1', date: '2025-04-08 09:30', type: 'ligacao', callStatus: 'atendeu', notes: 'Confirmou interesse na renovação' },
      { id: 'i2', date: '2025-04-09 14:00', type: 'whatsapp', message: 'Olá Roberto, segue o link para renovação do certificado.', dispatchStatus: 'lido' },
      { id: 'i3', date: '2025-04-10 10:15', type: 'email', message: 'Confirmação de renovação enviada.', dispatchStatus: 'entregue' },
    ],
    blacklist: false,
  },
  {
    id: '2',
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'Comércio Express S.A.',
    nomeSocio: 'Fernanda Costa',
    socioAdministrador: true,
    telefone: '(21) 98765-4321',
    email: 'fernanda@comercioexpress.com.br',
    dataVencimento: '2025-04-30',
    dataRenovacao: null,
    status: 'em_andamento',
    renovouAnoAnterior: true,
    dataUltimaRenovacao: '2024-03-20',
    indicadorComparativo: 'atrasado',
    vendedor: 'Carlos Souza',
    tags: ['Aguardando retorno'],
    observacao: 'Está comparando preços com concorrentes.',
    interactions: [
      { id: 'i4', date: '2025-04-05 11:00', type: 'ligacao', callStatus: 'nao_atendeu' },
      { id: 'i5', date: '2025-04-06 09:00', type: 'sms', message: 'Seu certificado vence em breve. Entre em contato!', dispatchStatus: 'entregue' },
      { id: 'i6', date: '2025-04-07 15:30', type: 'ligacao', callStatus: 'atendeu', notes: 'Disse que vai pensar e retorna amanhã' },
    ],
    blacklist: false,
  },
  {
    id: '3',
    cnpj: '11.222.333/0001-44',
    razaoSocial: 'Distribuidora Norte Ltda',
    nomeSocio: 'Paulo Mendes',
    socioAdministrador: false,
    telefone: '(31) 97654-3210',
    email: 'paulo@distnorte.com.br',
    dataVencimento: '2025-04-20',
    dataRenovacao: null,
    status: 'nao_renovado',
    renovouAnoAnterior: false,
    dataUltimaRenovacao: null,
    indicadorComparativo: 'nao_renovou',
    vendedor: null,
    tags: ['Sem resposta', 'Caixa postal'],
    observacao: 'Tentativas de contato sem sucesso. Verificar número atualizado.',
    interactions: [
      { id: 'i7', date: '2025-04-01 10:00', type: 'ligacao', callStatus: 'caixa_postal' },
      { id: 'i8', date: '2025-04-03 14:00', type: 'ligacao', callStatus: 'caixa_postal' },
      { id: 'i9', date: '2025-04-05 09:30', type: 'whatsapp', message: 'Olá Paulo, precisamos falar sobre seu certificado digital.', dispatchStatus: 'entregue' },
    ],
    blacklist: false,
  },
  {
    id: '4',
    cnpj: '55.666.777/0001-88',
    razaoSocial: 'Logística Rápida ME',
    nomeSocio: 'Sandra Ferreira',
    socioAdministrador: true,
    telefone: '(41) 96543-2109',
    email: 'sandra@lograpida.com.br',
    dataVencimento: '2025-05-01',
    dataRenovacao: null,
    status: 'em_andamento',
    renovouAnoAnterior: true,
    dataUltimaRenovacao: '2024-05-03',
    indicadorComparativo: 'mesmo_mes',
    vendedor: 'Maria Oliveira',
    tags: ['Cliente quente', 'Primeiro contato'],
    observacao: 'Muito interessada, pediu proposta por email.',
    interactions: [
      { id: 'i10', date: '2025-04-12 08:45', type: 'ligacao', callStatus: 'atendeu', notes: 'Pediu proposta formal por email' },
      { id: 'i11', date: '2025-04-12 10:00', type: 'email', message: 'Proposta de renovação de certificado digital A3.', dispatchStatus: 'lido' },
    ],
    blacklist: false,
  },
  {
    id: '5',
    cnpj: '33.444.555/0001-22',
    razaoSocial: 'Construções Sólidas Ltda',
    nomeSocio: 'Marcos Vieira',
    socioAdministrador: true,
    telefone: '(51) 95432-1098',
    email: 'marcos@construsolidas.com.br',
    dataVencimento: '2025-04-10',
    dataRenovacao: '2025-04-08',
    status: 'renovado',
    renovouAnoAnterior: true,
    dataUltimaRenovacao: '2024-04-15',
    indicadorComparativo: 'mesmo_mes',
    vendedor: 'João Santos',
    tags: ['Já renovou'],
    observacao: 'Renovação rápida sem objeções.',
    interactions: [
      { id: 'i12', date: '2025-04-07 09:00', type: 'ligacao', callStatus: 'atendeu', notes: 'Quer renovar imediatamente' },
      { id: 'i13', date: '2025-04-08 11:00', type: 'whatsapp', message: 'Certificado renovado com sucesso!', dispatchStatus: 'lido' },
    ],
    blacklist: false,
  },
  {
    id: '6',
    cnpj: '77.888.999/0001-66',
    razaoSocial: 'Importações Global S.A.',
    nomeSocio: 'Lúcia Rodrigues',
    socioAdministrador: true,
    telefone: '(61) 94321-0987',
    email: 'lucia@impglobal.com.br',
    dataVencimento: '2025-04-25',
    dataRenovacao: null,
    status: 'nao_renovado',
    renovouAnoAnterior: true,
    dataUltimaRenovacao: '2024-04-10',
    indicadorComparativo: 'atrasado',
    vendedor: 'Paula Lima',
    tags: ['Sem resposta'],
    observacao: 'Reclamou do preço na última interação.',
    interactions: [
      { id: 'i14', date: '2025-04-02 16:00', type: 'ligacao', callStatus: 'atendeu', notes: 'Reclamou do reajuste de preço' },
      { id: 'i15', date: '2025-04-10 09:00', type: 'email', message: 'Proposta com desconto especial para renovação.', dispatchStatus: 'entregue' },
    ],
    blacklist: false,
  },
  {
    id: '7',
    cnpj: '22.111.000/0001-33',
    razaoSocial: 'Auto Peças Central Ltda',
    nomeSocio: 'José Moreira',
    socioAdministrador: false,
    telefone: '(71) 93210-9876',
    email: 'jose@autocentral.com.br',
    dataVencimento: '2025-05-20',
    dataRenovacao: null,
    status: 'em_andamento',
    renovouAnoAnterior: false,
    dataUltimaRenovacao: null,
    indicadorComparativo: 'nao_renovou',
    vendedor: 'Ana Silva',
    tags: ['Primeiro contato'],
    observacao: 'Novo cliente, nunca teve certificado conosco.',
    interactions: [
      { id: 'i16', date: '2025-04-13 10:00', type: 'ligacao', callStatus: 'atendeu', notes: 'Interessado, pediu mais informações' },
    ],
    blacklist: false,
  },
  {
    id: '8',
    cnpj: '44.555.666/0001-77',
    razaoSocial: 'Fraudes & Cia Ltda',
    nomeSocio: 'Antônio Duvidoso',
    socioAdministrador: true,
    telefone: '(11) 91111-1111',
    email: 'antonio@fraudes.com.br',
    dataVencimento: '2025-04-15',
    dataRenovacao: null,
    status: 'nao_renovado',
    renovouAnoAnterior: false,
    dataUltimaRenovacao: null,
    indicadorComparativo: 'nao_renovou',
    vendedor: null,
    tags: ['blacklist'],
    observacao: 'Cliente com pendências judiciais. Não entrar em contato.',
    interactions: [],
    blacklist: true,
  },
];
