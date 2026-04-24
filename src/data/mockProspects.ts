import type { Client, ProcessStatus } from './mockData';

/** Status específicos do funil de prospecção (lista fria) */
export type ProspectStatus =
  | 'nao_contatado'
  | 'em_abordagem'
  | 'interessado'
  | 'qualificado'
  | 'descartado'
  | 'convertido';

/** Origem da lista importada */
export type ProspectSource = 'EmpresAqui' | 'Importação manual' | 'Indicação';

/**
 * Prospect reaproveita a estrutura de Client para compatibilidade com a tabela,
 * mas adiciona campos específicos da prospecção.
 */
export interface Prospect extends Omit<Client, 'status' | 'dataRenovacao' | 'dataUltimaRenovacao' | 'renovouAnoAnterior' | 'indicadorComparativo'> {
  prospectStatus: ProspectStatus;
  source: ProspectSource;
  /** Data em que entrou na base */
  dataImportacao: string;
  /** Setor / segmento (vindo do EmpresAqui) */
  segmento?: string;
}

const emptyProcess: ProcessStatus = {
  paymentLink: 'pending',
  payment: 'pending',
  scheduling: 'pending',
  videoConference: 'pending',
  certificate: 'pending',
};

export const mockProspects: Prospect[] = [
  {
    id: 'p1', cnpj: '45.678.901/0001-22', dataAbertura: '2022-08-10',
    dataRetorno: '2025-04-20 09:30',
    retornoAcao: 'Enviar WhatsApp de apresentação',
    razaoSocial: 'Padaria Pão Quente ME', nomeSocio: 'José Carlos da Silva',
    socioAdministrador: true, telefone: '(11) 98765-1111', email: 'contato@paoquente.com.br',
    dataVencimento: '2025-06-20',
    vendedor: null, tags: ['Primeiro contato'], observacoes: [], interactions: [],
    blacklist: false, tentativasContato: 0, engajamento: 'frio',
    saleInfo: null,
    processStatus: emptyProcess,
    prospectStatus: 'nao_contatado', source: 'EmpresAqui',
    dataImportacao: '2025-04-01', segmento: 'Alimentação',
  },
  {
    id: 'p2', cnpj: '78.901.234/0001-55', dataAbertura: '2020-02-03',
    dataRetorno: '2025-04-16 15:00',
    retornoAcao: 'Ligar para proposta inicial',
    razaoSocial: 'Auto Peças Veloz Ltda', nomeSocio: 'Marcos Pereira',
    socioAdministrador: true, telefone: '(11) 98765-2222', email: 'marcos@autovaloz.com.br',
    dataVencimento: '2025-07-05',
    vendedor: 'Carlos Souza', tags: ['Interessado'], observacoes: [],
    interactions: [
      { id: 'pi1', date: '2025-04-15 10:30', type: 'whatsapp', whatsappStatus: 'respondido', message: 'Bom dia, tem interesse em emitir certificado conosco?' },
    ],
    blacklist: false, tentativasContato: 1, engajamento: 'engajado',
    saleInfo: null,
    processStatus: emptyProcess,
    prospectStatus: 'interessado', source: 'EmpresAqui',
    dataImportacao: '2025-04-01', segmento: 'Automotivo',
  },
  {
    id: 'p3', cnpj: '23.456.789/0001-77', dataAbertura: '2019-11-22',
    dataRetorno: '2025-04-17 11:15',
    retornoAcao: 'Enviar e-mail com condições',
    razaoSocial: 'Clínica Bem Estar EIRELI', nomeSocio: 'Dra. Fernanda Souza',
    socioAdministrador: true, telefone: '(11) 98765-3333', email: 'fernanda@bemestar.com.br',
    dataVencimento: '2025-05-30',
    vendedor: 'Ana Silva', tags: ['Negociando'], observacoes: [],
    interactions: [
      { id: 'pi2', date: '2025-04-10 14:00', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 8, spokeWithClient: true },
      { id: 'pi3', date: '2025-04-12 09:15', type: 'email', dispatchStatus: 'lido' },
    ],
    blacklist: false, tentativasContato: 2, engajamento: 'engajado',
    saleInfo: null,
    processStatus: { ...emptyProcess, paymentLink: 'done' },
    prospectStatus: 'qualificado', source: 'EmpresAqui',
    dataImportacao: '2025-04-01', segmento: 'Saúde',
  },
  {
    id: 'p4', cnpj: '34.567.890/0001-88', dataAbertura: '2023-05-18',
    dataRetorno: null,
    retornoAcao: null,
    razaoSocial: 'Studio Fitness Energia', nomeSocio: 'Paulo Henrique',
    socioAdministrador: true, telefone: '(11) 98765-4444', email: 'paulo@studiofitness.com.br',
    dataVencimento: '2025-08-12',
    vendedor: null, tags: [], observacoes: [], interactions: [],
    blacklist: false, tentativasContato: 0, engajamento: 'frio',
    saleInfo: null,
    processStatus: emptyProcess,
    prospectStatus: 'nao_contatado', source: 'EmpresAqui',
    dataImportacao: '2025-04-05', segmento: 'Fitness',
  },
  {
    id: 'p5', cnpj: '56.789.012/0001-33', dataAbertura: '2021-09-09',
    dataRetorno: '2025-04-18 08:45',
    retornoAcao: 'Tentar novo contato por ligação',
    razaoSocial: 'Mercadinho Boa Vista', nomeSocio: 'Antônia Rodrigues',
    socioAdministrador: true, telefone: '(11) 98765-5555', email: 'antonia@boavista.com.br',
    dataVencimento: '2025-06-01',
    vendedor: 'Maria Oliveira', tags: ['Sem retorno'], observacoes: [],
    interactions: [
      { id: 'pi4', date: '2025-04-08 11:00', type: 'ligacao', callStatus: 'nao_atendeu' },
      { id: 'pi5', date: '2025-04-09 11:00', type: 'ligacao', callStatus: 'caixa_postal' },
    ],
    blacklist: false, tentativasContato: 2, engajamento: 'frio',
    saleInfo: null,
    processStatus: emptyProcess,
    prospectStatus: 'em_abordagem', source: 'EmpresAqui',
    dataImportacao: '2025-04-05', segmento: 'Varejo',
  },
  {
    id: 'p6', cnpj: '67.890.123/0001-44', dataAbertura: '2017-04-14',
    dataRetorno: null,
    retornoAcao: null,
    razaoSocial: 'Construtora Alicerce S/A', nomeSocio: 'Eduardo Mendes',
    socioAdministrador: true, telefone: '(11) 98765-6666', email: 'eduardo@alicerce.com.br',
    dataVencimento: '2025-07-25',
    vendedor: 'João Santos', tags: ['Cliente quente'], observacoes: [],
    interactions: [
      { id: 'pi6', date: '2025-04-18 15:30', type: 'ligacao', callStatus: 'atendeu', durationMinutes: 15, spokeWithClient: true },
    ],
    blacklist: false, tentativasContato: 1, engajamento: 'engajado',
    saleInfo: { paidAt: '2026-04-24 14:22', certificateLabel: 'e-CNPJ A1', amountPaid: 230 },
    processStatus: { ...emptyProcess, paymentLink: 'done', payment: 'done', scheduling: 'done' },
    prospectStatus: 'convertido', source: 'EmpresAqui',
    dataImportacao: '2025-03-28', segmento: 'Construção',
  },
];
