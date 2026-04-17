export type ClientStatus = 'renovado' | 'em_andamento' | 'nao_renovado';
export type InteractionType = 'whatsapp' | 'sms' | 'email' | 'ligacao';
export type CallStatus = 'atendeu' | 'nao_atendeu' | 'caixa_postal' | 'numero_invalido';
export type DispatchStatus = 'entregue' | 'lido' | 'falhou';
export type WhatsAppStatus = 'enviado' | 'entregue' | 'visualizado' | 'respondido';
export type ComparativeIndicator = 'mesmo_mes' | 'atrasado' | 'nao_renovou';
export type EngagementLevel = 'engajado' | 'visualizou' | 'frio' | 'problema';

export interface Observation {
  id: string;
  date: string;
  text: string;
  author: string;
}

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  callStatus?: CallStatus;
  whatsappStatus?: WhatsAppStatus;
  audioUrl?: string;
  message?: string;
  dispatchStatus?: DispatchStatus;
  notes?: string;
  /** Duração em minutos da ligação (somente quando type === 'ligacao') */
  durationMinutes?: number;
  /** Conseguiu falar com o cliente — automático: true quando callStatus === 'atendeu' */
  spokeWithClient?: boolean;
}

export interface Client {
  id: string;
  cnpj: string;
  dataAbertura: string;
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
  observacoes: Observation[];
  interactions: Interaction[];
  blacklist: boolean;
  tentativasContato: number;
  engajamento: EngagementLevel;
}

export const vendedores = ['Ana Silva', 'Carlos Souza', 'Maria Oliveira', 'João Santos', 'Paula Lima'];

export const allTags = [
  'Interessado', 'Sem retorno', 'Negociando', 'Cliente quente', 'Perdeu preço',
  'Caixa postal', 'Já renovou', 'Primeiro contato', 'Aguardando retorno', 'blacklist',
];

export const tagColors: Record<string, { bg: string; text: string }> = {
  'Caixa postal': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Sem retorno': { bg: 'bg-red-100', text: 'text-red-700' },
  'Já renovou': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Cliente quente': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Primeiro contato': { bg: 'bg-sky-100', text: 'text-sky-700' },
  'Aguardando retorno': { bg: 'bg-violet-100', text: 'text-violet-700' },
  'Interessado': { bg: 'bg-teal-100', text: 'text-teal-700' },
  'Negociando': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  'Perdeu preço': { bg: 'bg-rose-100', text: 'text-rose-700' },
  'Sem resposta': { bg: 'bg-red-100', text: 'text-red-700' },
  'blacklist': { bg: 'bg-gray-200', text: 'text-gray-600' },
};

export function getEngagementLevel(client: Client): EngagementLevel {
  const hasInvalidNumber = client.interactions.some(i => i.callStatus === 'numero_invalido');
  const hasCaixaPostal = client.interactions.filter(i => i.callStatus === 'caixa_postal').length >= 2;
  if (hasInvalidNumber) return 'problema';
  if (hasCaixaPostal) return 'problema';

  const lastInteraction = client.interactions[client.interactions.length - 1];
  if (lastInteraction) {
    if (lastInteraction.whatsappStatus === 'respondido' || lastInteraction.callStatus === 'atendeu') return 'engajado';
    if (lastInteraction.whatsappStatus === 'visualizado' || lastInteraction.dispatchStatus === 'lido') return 'visualizou';
  }

  if (client.tentativasContato >= 3) return 'frio';
  return 'frio';
}

export const mockClients: Client[] = [
  {
    id: '1', cnpj: '12.345.678/0001-90', dataAbertura: '2018-03-15', razaoSocial: 'Tech Solutions Ltda', nomeSocio: 'Roberto Almeida',
    socioAdministrador: true, telefone: '(11) 99876-5432', email: 'roberto@techsolutions.com.br',
    dataVencimento: '2025-05-15', dataRenovacao: '2025-04-10', status: 'renovado',
    renovouAnoAnterior: true, dataUltimaRenovacao: '2024-04-12', indicadorComparativo: 'mesmo_mes',
    vendedor: 'Ana Silva', tags: ['Já renovou', 'Cliente quente'],
    observacoes: [
      { id: 'o1', date: '2025-04-10 11:00', text: 'Renovação concluída sem problemas.', author: 'Ana Silva' },
      { id: 'o2', date: '2025-04-08 09:00', text: 'Cliente fiel, renova sempre no mesmo período. Preferência por e-CNPJ A1.', author: 'Ana Silva' },
    ],
    interactions: [
      { id: 'i1', date: '2025-04-08 09:30', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 6, spokeWithClient: true, notes: 'Confirmou interesse na renovação' },
      { id: 'i2', date: '2025-04-09 14:00', type: 'whatsapp', whatsappStatus: 'respondido', message: 'Olá Roberto, segue o link para renovação.', dispatchStatus: 'lido' },
      { id: 'i3', date: '2025-04-10 10:15', type: 'email', message: 'Confirmação de renovação enviada.', dispatchStatus: 'entregue' },
    ],
    blacklist: false, tentativasContato: 3, engajamento: 'engajado',
  },
  {
    id: '2', cnpj: '98.765.432/0001-10', dataAbertura: '2015-07-22', razaoSocial: 'Comércio Express S.A.', nomeSocio: 'Fernanda Costa',
    socioAdministrador: true, telefone: '(21) 98765-4321', email: 'fernanda@comercioexpress.com.br',
    dataVencimento: '2025-04-30', dataRenovacao: null, status: 'em_andamento',
    renovouAnoAnterior: true, dataUltimaRenovacao: '2024-03-20', indicadorComparativo: 'atrasado',
    vendedor: 'Carlos Souza', tags: ['Aguardando retorno', 'Negociando'],
    observacoes: [
      { id: 'o3', date: '2025-04-07 16:00', text: 'Está comparando preços com concorrentes.', author: 'Carlos Souza' },
    ],
    interactions: [
      { id: 'i4', date: '2025-04-05 11:00', type: 'ligacao', callStatus: 'nao_atendeu', durationMinutes: 0, spokeWithClient: false },
      { id: 'i5', date: '2025-04-06 09:00', type: 'sms', message: 'Seu certificado vence em breve!', dispatchStatus: 'entregue' },
      { id: 'i6', date: '2025-04-07 15:30', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 4, spokeWithClient: true, notes: 'Disse que vai pensar' },
    ],
    blacklist: false, tentativasContato: 3, engajamento: 'visualizou',
  },
  {
    id: '3', cnpj: '11.222.333/0001-44', dataAbertura: '2020-01-10', razaoSocial: 'Distribuidora Norte Ltda', nomeSocio: 'Paulo Mendes',
    socioAdministrador: false, telefone: '(31) 97654-3210', email: 'paulo@distnorte.com.br',
    dataVencimento: '2025-04-20', dataRenovacao: null, status: 'nao_renovado',
    renovouAnoAnterior: false, dataUltimaRenovacao: null, indicadorComparativo: 'nao_renovou',
    vendedor: null, tags: ['Sem retorno', 'Caixa postal'],
    observacoes: [
      { id: 'o4', date: '2025-04-05 10:00', text: 'Tentativas de contato sem sucesso.', author: 'Sistema' },
    ],
    interactions: [
      { id: 'i7', date: '2025-04-01 10:00', type: 'ligacao', callStatus: 'caixa_postal', durationMinutes: 0, spokeWithClient: false },
      { id: 'i8', date: '2025-04-03 14:00', type: 'ligacao', callStatus: 'caixa_postal', durationMinutes: 0, spokeWithClient: false },
      { id: 'i9', date: '2025-04-05 09:30', type: 'whatsapp', whatsappStatus: 'entregue', message: 'Precisamos falar sobre seu certificado.', dispatchStatus: 'entregue' },
    ],
    blacklist: false, tentativasContato: 5, engajamento: 'problema',
  },
  {
    id: '4', cnpj: '55.666.777/0001-88', dataAbertura: '2019-11-05', razaoSocial: 'Logística Rápida ME', nomeSocio: 'Sandra Ferreira',
    socioAdministrador: true, telefone: '(41) 96543-2109', email: 'sandra@lograpida.com.br',
    dataVencimento: '2025-05-01', dataRenovacao: null, status: 'em_andamento',
    renovouAnoAnterior: true, dataUltimaRenovacao: '2024-05-03', indicadorComparativo: 'mesmo_mes',
    vendedor: 'Maria Oliveira', tags: ['Cliente quente', 'Interessado'],
    observacoes: [
      { id: 'o5', date: '2025-04-12 11:00', text: 'Muito interessada, pediu proposta por email.', author: 'Maria Oliveira' },
    ],
    interactions: [
      { id: 'i10', date: '2025-04-12 08:45', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 8, spokeWithClient: true, notes: 'Pediu proposta formal' },
      { id: 'i11', date: '2025-04-12 10:00', type: 'email', message: 'Proposta de renovação A3.', dispatchStatus: 'lido' },
    ],
    blacklist: false, tentativasContato: 2, engajamento: 'engajado',
  },
  {
    id: '5', cnpj: '33.444.555/0001-22', dataAbertura: '2012-05-30', razaoSocial: 'Construções Sólidas Ltda', nomeSocio: 'Marcos Vieira',
    socioAdministrador: true, telefone: '(51) 95432-1098', email: 'marcos@construsolidas.com.br',
    dataVencimento: '2025-04-10', dataRenovacao: '2025-04-08', status: 'renovado',
    renovouAnoAnterior: true, dataUltimaRenovacao: '2024-04-15', indicadorComparativo: 'mesmo_mes',
    vendedor: 'João Santos', tags: ['Já renovou'],
    observacoes: [
      { id: 'o6', date: '2025-04-08 12:00', text: 'Renovação rápida sem objeções.', author: 'João Santos' },
    ],
    interactions: [
      { id: 'i12', date: '2025-04-07 09:00', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 5, spokeWithClient: true, notes: 'Quer renovar imediatamente' },
      { id: 'i13', date: '2025-04-08 11:00', type: 'whatsapp', whatsappStatus: 'respondido', message: 'Certificado renovado com sucesso!', dispatchStatus: 'lido' },
    ],
    blacklist: false, tentativasContato: 2, engajamento: 'engajado',
  },
  {
    id: '6', cnpj: '77.888.999/0001-66', dataAbertura: '2010-09-18', razaoSocial: 'Importações Global S.A.', nomeSocio: 'Lúcia Rodrigues',
    socioAdministrador: true, telefone: '(61) 94321-0987', email: 'lucia@impglobal.com.br',
    dataVencimento: '2025-04-25', dataRenovacao: null, status: 'nao_renovado',
    renovouAnoAnterior: true, dataUltimaRenovacao: '2024-04-10', indicadorComparativo: 'atrasado',
    vendedor: 'Paula Lima', tags: ['Perdeu preço', 'Sem retorno'],
    observacoes: [
      { id: 'o7', date: '2025-04-10 10:00', text: 'Reclamou do preço na última interação.', author: 'Paula Lima' },
    ],
    interactions: [
      { id: 'i14', date: '2025-04-02 16:00', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 12, spokeWithClient: true, notes: 'Reclamou do reajuste' },
      { id: 'i15', date: '2025-04-10 09:00', type: 'email', message: 'Proposta com desconto especial.', dispatchStatus: 'entregue' },
      { id: 'i16', date: '2025-04-12 14:00', type: 'whatsapp', whatsappStatus: 'visualizado', message: 'Lúcia, temos condições especiais para você!', dispatchStatus: 'lido' },
    ],
    blacklist: false, tentativasContato: 4, engajamento: 'visualizou',
  },
  {
    id: '7', cnpj: '22.111.000/0001-33', dataAbertura: '2023-02-14', razaoSocial: 'Auto Peças Central Ltda', nomeSocio: 'José Moreira',
    socioAdministrador: false, telefone: '(71) 93210-9876', email: 'jose@autocentral.com.br',
    dataVencimento: '2025-05-20', dataRenovacao: null, status: 'em_andamento',
    renovouAnoAnterior: false, dataUltimaRenovacao: null, indicadorComparativo: 'nao_renovou',
    vendedor: 'Ana Silva', tags: ['Primeiro contato'],
    observacoes: [
      { id: 'o8', date: '2025-04-13 10:30', text: 'Novo cliente, nunca teve certificado conosco.', author: 'Ana Silva' },
    ],
    interactions: [
      { id: 'i17', date: '2025-04-13 10:00', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 7, spokeWithClient: true, notes: 'Interessado, pediu mais info' },
    ],
    blacklist: false, tentativasContato: 1, engajamento: 'engajado',
  },
  {
    id: '8', cnpj: '44.555.666/0001-77', dataAbertura: '2021-06-08', razaoSocial: 'Fraudes & Cia Ltda', nomeSocio: 'Antônio Duvidoso',
    socioAdministrador: true, telefone: '(11) 91111-1111', email: 'antonio@fraudes.com.br',
    dataVencimento: '2025-04-15', dataRenovacao: null, status: 'nao_renovado',
    renovouAnoAnterior: false, dataUltimaRenovacao: null, indicadorComparativo: 'nao_renovou',
    vendedor: null, tags: ['blacklist'],
    observacoes: [
      { id: 'o9', date: '2025-03-01 08:00', text: 'Cliente com pendências judiciais. Não entrar em contato.', author: 'Sistema' },
    ],
    interactions: [],
    blacklist: true, tentativasContato: 0, engajamento: 'problema',
  },
];
