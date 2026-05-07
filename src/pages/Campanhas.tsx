import { useState, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Smile,
  Minus,
  Table as TableIcon,
  MousePointerClick,
  Eye,
  Send,
  Save,
  Copy,
  FileText,
  Mail,
  Plus,
  Trash2,
  LayoutDashboard,
  List as ListIcon,
  Users,
  PieChart as PieChartIcon,
  FolderOpen,
  Pause,
  Archive,
  BarChart3,
  Megaphone,
  ChevronRight,
  Settings,
  Server,
  Shield,
  Lock,
  Bell,
  Palette,
  Wrench,
  ScrollText,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
} from 'recharts';
import logoIdentite from '@/assets/logo-identite.png';
import { ModuleNav } from '@/components/ModuleNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type CampaignStatus = 'rascunho' | 'agendada' | 'enviada' | 'pausada' | 'finalizada';
type Section =
  | 'painel'
  | 'todas'
  | 'criar'
  | 'midia'
  | 'modelos'
  | 'analises'
  | 'listas'
  | 'assinantes'
  | 'configuracoes'
  | 'logs';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  list: string;
  lists: string[];
  scheduledAt?: string;
  htmlContent: string;
  status: CampaignStatus;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  duration?: string;
  stats?: {
    views: number;
    clicks: number;
    sent: number;
    total: number;
    rejections: number;
  };
}

interface Template {
  id: string;
  name: string;
  category: string;
  htmlContent: string;
}

interface MailingList {
  id: string;
  name: string;
  type: 'Pública' | 'Privada';
  optin: 'Simples' | 'Confirmação';
  subscribers: number;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: 'Ativo' | 'Bloqueado' | 'Não confirmado';
  lists: string[];
  createdAt: string;
}

const initialTemplates: Template[] = [
  {
    id: 't1',
    name: 'Boas-vindas',
    category: 'Boas-vindas',
    htmlContent:
      '<h2>Olá {{nome}}, seja bem-vindo(a)!</h2><p>É um prazer ter a <b>{{empresa}}</b> com a gente.</p>',
  },
  {
    id: 't2',
    name: 'Cobrança amigável',
    category: 'Cobrança',
    htmlContent:
      '<p>Olá {{nome}},</p><p>Identificamos uma pendência referente à <b>{{empresa}}</b>. Acesse o link abaixo para regularizar:</p><p><a href="https://exemplo.com">Quitar pendência</a></p>',
  },
  {
    id: 't3',
    name: 'Renovação de Certificado',
    category: 'Renovação',
    htmlContent:
      '<h2>Hora de renovar, {{nome}}!</h2><p>Seu certificado digital está próximo do vencimento.</p>',
  },
  {
    id: 't4',
    name: 'Pós-venda',
    category: 'Pós-venda',
    htmlContent:
      '<p>Olá {{nome}}, tudo bem?</p><p>Queremos saber sua opinião sobre nosso atendimento.</p>',
  },
];

const initialCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Maio Geral - Todos os dados',
    subject: '{{nome}}, seu Certificado Digital vence esse mês!',
    senderName: 'Identité',
    senderEmail: 'contato@identite.com.br',
    list: 'Agilize Meses Anteriores',
    lists: ['Agilize Meses Anteriores', 'Maio'],
    htmlContent: '<p>Hora de renovar!</p>',
    status: 'finalizada',
    createdAt: 'Qua, 06 Mai 2026, 10:32',
    startedAt: 'Qua, 06 Mai 2026, 10:32',
    finishedAt: 'Qua, 06 Mai 2026, 15:44',
    duration: '5h 11m 55s',
    stats: { views: 9, clicks: 0, sent: 6793, total: 18198, rejections: 0 },
  },
  {
    id: 'c2',
    name: 'Abril Geral - Todos os dados',
    subject: '{{nome}}, seu Certificado Digital vence esse mês!',
    senderName: 'Identité',
    senderEmail: 'contato@identite.com.br',
    list: 'Psicólogos EmpresAqui',
    lists: ['Psicólogos EmpresAqui', 'Agilize Meses Anteriores'],
    htmlContent: '<p>Renovação Abril</p>',
    status: 'finalizada',
    createdAt: 'Seg, 04 Mai 2026, 11:15',
    startedAt: 'Seg, 04 Mai 2026, 12:30',
    finishedAt: 'Seg, 04 Mai 2026, 12:50',
    duration: '19m 29s',
    stats: { views: 20, clicks: 0, sent: 12023, total: 21229, rejections: 0 },
  },
  {
    id: 'c3',
    name: 'Black Friday Prospects',
    subject: '🔥 Condição especial só hoje',
    senderName: 'Equipe Comercial',
    senderEmail: 'comercial@identite.com.br',
    list: 'Prospects EmpresAqui',
    lists: ['Prospects EmpresAqui'],
    htmlContent: '<p>Aproveite!</p>',
    status: 'rascunho',
    createdAt: 'Seg, 04 Mai 2026, 11:15',
    stats: { views: 0, clicks: 0, sent: 0, total: 0, rejections: 0 },
  },
  {
    id: 'c4',
    name: 'Dados 30042026',
    subject: '{{nome}}, seu Certificado Digital vence esse mês!',
    senderName: 'Identité',
    senderEmail: 'contato@identite.com.br',
    list: 'EmpresAqui Bahia',
    lists: ['EmpresAqui Bahia', 'DISPARO JAI'],
    htmlContent: '',
    status: 'finalizada',
    createdAt: 'Qui, 30 Abr 2026, 10:22',
    startedAt: 'Qui, 30 Abr 2026, 10:22',
    finishedAt: 'Qui, 30 Abr 2026, 10:30',
    duration: '8m',
    stats: { views: 0, clicks: 0, sent: 169, total: 8972, rejections: 0 },
  },
  {
    id: 'c5',
    name: 'Renovação Junho - Agendada',
    subject: 'Sua renovação está chegando',
    senderName: 'Identité',
    senderEmail: 'contato@identite.com.br',
    list: 'Renovações Junho',
    lists: ['Renovações Junho'],
    scheduledAt: '2026-06-01 09:00',
    htmlContent: '',
    status: 'agendada',
    createdAt: 'Sex, 02 Mai 2026, 14:10',
    stats: { views: 0, clicks: 0, sent: 0, total: 4210, rejections: 0 },
  },
];

const initialLists: MailingList[] = [
  { id: 'l1', name: 'Agilize Meses Anteriores', type: 'Privada', optin: 'Simples', subscribers: 18198, createdAt: '01 Jan 2026' },
  { id: 'l2', name: 'Psicólogos EmpresAqui', type: 'Privada', optin: 'Simples', subscribers: 21229, createdAt: '15 Fev 2026' },
  { id: 'l3', name: 'EmpresAqui Bahia', type: 'Privada', optin: 'Simples', subscribers: 8972, createdAt: '10 Mar 2026' },
  { id: 'l4', name: 'Prospects EmpresAqui', type: 'Privada', optin: 'Confirmação', subscribers: 5430, createdAt: '20 Mar 2026' },
  { id: 'l5', name: 'Renovações Junho', type: 'Privada', optin: 'Simples', subscribers: 4210, createdAt: '01 Mai 2026' },
  { id: 'l6', name: 'Clientes Convertidos 2026', type: 'Pública', optin: 'Confirmação', subscribers: 1820, createdAt: '02 Jan 2026' },
];

const initialSubscribers: Subscriber[] = [
  { id: 's1', email: 'joao@empresa.com.br', name: 'João Silva', status: 'Ativo', lists: ['Agilize Meses Anteriores'], createdAt: '02 Mai 2026' },
  { id: 's2', email: 'maria@psico.com', name: 'Maria Costa', status: 'Ativo', lists: ['Psicólogos EmpresAqui'], createdAt: '04 Mai 2026' },
  { id: 's3', email: 'pedro@bahiacert.com', name: 'Pedro Souza', status: 'Não confirmado', lists: ['Prospects EmpresAqui'], createdAt: '05 Mai 2026' },
  { id: 's4', email: 'ana@contabil.com', name: 'Ana Pereira', status: 'Bloqueado', lists: ['EmpresAqui Bahia'], createdAt: '01 Mai 2026' },
  { id: 's5', email: 'carlos@advog.com', name: 'Carlos Lima', status: 'Ativo', lists: ['Renovações Junho'], createdAt: '03 Mai 2026' },
  { id: 's6', email: 'fernanda@med.com', name: 'Fernanda Rocha', status: 'Ativo', lists: ['Clientes Convertidos 2026'], createdAt: '02 Mai 2026' },
];

const viewsChartData = [
  { date: '06 Abr', value: 10 }, { date: '07 Abr', value: 8 }, { date: '08 Abr', value: 5 },
  { date: '10 Abr', value: 4 }, { date: '14 Abr', value: 3 }, { date: '16 Abr', value: 4 },
  { date: '20 Abr', value: 6 }, { date: '27 Abr', value: 8 }, { date: '28 Abr', value: 9 },
  { date: '29 Abr', value: 7 }, { date: '30 Abr', value: 5 }, { date: '02 Mai', value: 4 },
  { date: '03 Mai', value: 3 }, { date: '04 Mai', value: 22 }, { date: '06 Mai', value: 12 },
];

const clicksChartData = [
  { date: '20 Mar', value: 1 }, { date: '21 Mar', value: 3 }, { date: '22 Mar', value: 5 },
  { date: '23 Mar', value: 7 }, { date: '24 Mar', value: 6 }, { date: '26 Mar', value: 4 },
  { date: '28 Mar', value: 3 }, { date: '30 Mar', value: 2 }, { date: '02 Abr', value: 1 },
];

function buildEmailHtml(content: string, subject: string): string {
  const sanitized = content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.06);">
<tr><td style="padding:32px;font-size:15px;line-height:1.6;color:#1f2937;">
${sanitized}
</td></tr>
<tr><td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;text-align:center;">
Você recebeu este e-mail porque é cliente Identité. <a href="#" style="color:#6b7280;">Cancelar inscrição</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const EMOJIS = ['😀', '😍', '🎉', '🚀', '🔥', '✅', '⭐', '💡', '📧', '📱', '💰', '👍'];

const statusBadge = (status: CampaignStatus) => {
  const map: Record<CampaignStatus, string> = {
    rascunho: 'bg-muted text-muted-foreground',
    agendada: 'bg-amber-100 text-amber-700',
    enviada: 'bg-emerald-100 text-emerald-700',
    finalizada: 'bg-emerald-100 text-emerald-700',
    pausada: 'bg-orange-100 text-orange-700',
  };
  const label: Record<CampaignStatus, string> = {
    rascunho: 'Rascunho',
    agendada: 'Agendada',
    enviada: 'Enviada',
    finalizada: 'Finalizada',
    pausada: 'Pausada',
  };
  return <Badge className={`${map[status]} border-0`}>{label[status]}</Badge>;
};

const NAV_ITEMS: { id: Section; label: string; icon: typeof Mail; group?: 'campanhas' }[] = [
  { id: 'painel', label: 'Painel', icon: LayoutDashboard },
  { id: 'todas', label: 'Todas as campanhas', icon: Megaphone, group: 'campanhas' },
  { id: 'criar', label: 'Criar nova', icon: Plus, group: 'campanhas' },
  { id: 'midia', label: 'Mídia', icon: FolderOpen, group: 'campanhas' },
  { id: 'modelos', label: 'Modelos', icon: FileText, group: 'campanhas' },
  { id: 'analises', label: 'Análises', icon: PieChartIcon, group: 'campanhas' },
  { id: 'listas', label: 'Listas', icon: ListIcon },
  { id: 'assinantes', label: 'Assinantes', icon: Users },
];

export default function Campanhas() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [templates] = useState<Template[]>(initialTemplates);
  const [lists] = useState<MailingList[]>(initialLists);
  const [subscribers] = useState<Subscriber[]>(initialSubscribers);
  const [section, setSection] = useState<Section>('painel');
  const [search, setSearch] = useState('');

  // Editor state
  const editorRef = useRef<HTMLDivElement>(null);
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [senderName, setSenderName] = useState('Identité Certificado Digital');
  const [senderEmail, setSenderEmail] = useState('contato@identite.com.br');
  const [list, setList] = useState('todos');
  const [scheduledAt, setScheduledAt] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  const filteredCampaigns = useMemo(
    () =>
      campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.subject.toLowerCase().includes(search.toLowerCase()),
      ),
    [campaigns, search],
  );

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  }, []);

  const handleEditorInput = () => {
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  };

  const insertHTML = (html: string) => {
    document.execCommand('insertHTML', false, html);
    if (editorRef.current) setEditorContent(editorRef.current.innerHTML);
  };

  const handleInsertLink = () => {
    const url = window.prompt('URL do link:');
    if (url) exec('createLink', url);
  };

  const handleInsertImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url)
      insertHTML(
        `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:6px;margin:8px 0;" />`,
      );
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      insertHTML(
        `<img src="${reader.result}" alt="" style="max-width:100%;height:auto;border-radius:6px;margin:8px 0;" />`,
      );
    };
    reader.readAsDataURL(file);
  };

  const handleInsertButton = () => {
    const text = window.prompt('Texto do botão:', 'Saiba mais');
    if (!text) return;
    const url = window.prompt('Link do botão:', 'https://');
    if (!url) return;
    insertHTML(
      `<p style="text-align:center;margin:16px 0;"><a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">${text}</a></p>`,
    );
  };

  const handleInsertSeparator = () =>
    insertHTML('<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;" />');

  const handleInsertTable = () =>
    insertHTML(
      '<table style="border-collapse:collapse;width:100%;margin:12px 0;"><tr><th style="border:1px solid #e5e7eb;padding:8px;background:#f9fafb;">Coluna 1</th><th style="border:1px solid #e5e7eb;padding:8px;background:#f9fafb;">Coluna 2</th></tr><tr><td style="border:1px solid #e5e7eb;padding:8px;">&nbsp;</td><td style="border:1px solid #e5e7eb;padding:8px;">&nbsp;</td></tr></table>',
    );

  const insertVariable = (variable: string) => insertHTML(`{{${variable}}}`);

  const resetEditor = () => {
    setCampaignName('');
    setSubject('');
    setList('todos');
    setScheduledAt('');
    setEditorContent('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const openNewCampaign = () => {
    resetEditor();
    setSection('criar');
  };

  const loadTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl || !editorRef.current) return;
    editorRef.current.innerHTML = tpl.htmlContent;
    setEditorContent(tpl.htmlContent);
    toast({ title: 'Template carregado', description: tpl.name });
  };

  const persist = (status: CampaignStatus) => {
    if (!campaignName.trim() || !subject.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Informe nome e assunto da campanha.',
        variant: 'destructive',
      });
      return;
    }
    const html = buildEmailHtml(editorContent, subject);
    const newCampaign: Campaign = {
      id: `c-${Date.now()}`,
      name: campaignName,
      subject,
      senderName,
      senderEmail,
      list,
      lists: [list],
      scheduledAt: scheduledAt || undefined,
      htmlContent: html,
      status,
      createdAt: new Date().toLocaleString('pt-BR'),
      stats: { views: 0, clicks: 0, sent: 0, total: 0, rejections: 0 },
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    toast({
      title:
        status === 'rascunho'
          ? 'Rascunho salvo!'
          : status === 'agendada'
            ? 'Campanha agendada!'
            : 'Campanha enviada!',
      description: campaignName,
    });
    setSection('todas');
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast({ title: 'Informe um e-mail para teste', variant: 'destructive' });
      return;
    }
    toast({ title: 'Teste enviado!', description: `E-mail enviado para ${testEmail}` });
    setTestEmail('');
  };

  const duplicateCampaign = (c: Campaign) => {
    setCampaigns((prev) => [
      {
        ...c,
        id: `c-${Date.now()}`,
        name: `${c.name} (cópia)`,
        status: 'rascunho',
        createdAt: new Date().toLocaleString('pt-BR'),
        stats: { views: 0, clicks: 0, sent: 0, total: 0, rejections: 0 },
      },
      ...prev,
    ]);
    toast({ title: 'Campanha duplicada' });
  };

  const pauseCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'pausada' } : c)));
    toast({ title: 'Campanha pausada' });
  };

  const archiveCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'finalizada' } : c)));
    toast({ title: 'Campanha arquivada' });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast({ title: 'Campanha removida' });
  };

  const previewHtml = useMemo(
    () => buildEmailHtml(editorContent, subject || 'Pré-visualização'),
    [editorContent, subject],
  );

  // Métricas painel
  const metrics = useMemo(() => {
    const totalSubs = lists.reduce((acc, l) => acc + l.subscribers, 0);
    const totalSent = campaigns.reduce((acc, c) => acc + (c.stats?.sent || 0), 0);
    const blocked = subscribers.filter((s) => s.status === 'Bloqueado').length;
    return {
      lists: lists.length,
      publicLists: lists.filter((l) => l.type === 'Pública').length,
      privateLists: lists.filter((l) => l.type === 'Privada').length,
      simpleOptin: lists.filter((l) => l.optin === 'Simples').length,
      confirmOptin: lists.filter((l) => l.optin === 'Confirmação').length,
      campaigns: campaigns.length,
      finished: campaigns.filter((c) => c.status === 'finalizada' || c.status === 'enviada').length,
      paused: campaigns.filter((c) => c.status === 'pausada').length,
      drafts: campaigns.filter((c) => c.status === 'rascunho').length,
      scheduled: campaigns.filter((c) => c.status === 'agendada').length,
      subscribers: totalSubs,
      blocked,
      orphans: 2747,
      messagesSent: totalSent,
    };
  }, [campaigns, lists, subscribers]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={logoIdentite} alt="Identité Certificado Digital" className="h-9" />
            <ModuleNav />
          </div>
          {(section === 'todas' || section === 'modelos' || section === 'listas' || section === 'assinantes') && (
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome ou assunto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r bg-card/40 min-h-[calc(100vh-3.5rem)]">
          <nav className="p-3 space-y-0.5">
            <button
              onClick={() => setSection('painel')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                section === 'painel' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Painel
            </button>

            <div className="pt-3 pb-1 px-3 text-xs font-semibold text-muted-foreground uppercase">
              Campanhas
            </div>
            {NAV_ITEMS.filter((i) => i.group === 'campanhas').map((item) => {
              const active = section === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-3 pb-1 px-3 text-xs font-semibold text-muted-foreground uppercase">
              Audiência
            </div>
            <button
              onClick={() => setSection('listas')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                section === 'listas' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              }`}
            >
              <ListIcon className="h-4 w-4" />
              Listas
            </button>
            <button
              onClick={() => setSection('assinantes')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                section === 'assinantes' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
              }`}
            >
              <Users className="h-4 w-4" />
              Assinantes
            </button>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-6 space-y-6 min-w-0">
          {/* PAINEL */}
          {section === 'painel' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</h1>
                  <p className="text-sm text-muted-foreground">Visão geral das campanhas e audiência</p>
                </div>
                <Button onClick={openNewCampaign} className="gap-2">
                  <Plus className="h-4 w-4" /> Nova campanha
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                  icon={<ListIcon className="h-6 w-6" />}
                  big={metrics.lists}
                  label="Listas"
                  rows={[
                    { label: 'Pública', value: metrics.publicLists },
                    { label: 'Privada', value: metrics.privateLists },
                    { label: 'Inscrição simples', value: metrics.simpleOptin },
                    { label: 'Inscrição com confirmação', value: metrics.confirmOptin },
                  ]}
                />
                <MetricCard
                  icon={<Users className="h-6 w-6" />}
                  big={`${(metrics.subscribers / 1000).toFixed(2)}k`}
                  label="Assinantes"
                  rows={[
                    { label: 'Lista de bloqueados', value: metrics.blocked },
                    { label: 'Órfãos', value: metrics.orphans },
                  ]}
                />
                <MetricCard
                  icon={<Megaphone className="h-6 w-6" />}
                  big={metrics.campaigns}
                  label="Campanhas"
                  rows={[
                    { label: 'Finalizada', value: metrics.finished },
                    { label: 'Pausada', value: metrics.paused },
                    { label: 'Rascunho', value: metrics.drafts },
                    { label: 'Agendada', value: metrics.scheduled },
                  ]}
                />
                <MetricCard
                  icon={<Mail className="h-6 w-6" />}
                  big={`${(metrics.messagesSent / 1000).toFixed(2)}k`}
                  label="Mensagens enviadas"
                  rows={[
                    { label: 'Aberturas', value: '~38%' },
                    { label: 'Cliques', value: '~12%' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Visualizações da campanha</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viewsChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ReTooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold">Links clicados</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={clicksChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ReTooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* TODAS AS CAMPANHAS */}
          {section === 'todas' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Campanhas ({filteredCampaigns.length})</h1>
                <Button onClick={openNewCampaign} className="gap-2">
                  <Plus className="h-4 w-4" /> Novo
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[110px]">Status</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Listas</TableHead>
                      <TableHead>Data e hora</TableHead>
                      <TableHead>Estatísticas</TableHead>
                      <TableHead className="text-right w-[180px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{statusBadge(c.status)}</TableCell>
                        <TableCell>
                          <div className="font-medium text-primary">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.subject}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {c.lists.map((l) => (
                              <div key={l} className="text-xs flex items-center gap-1">
                                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                                {l}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <div><span className="text-muted-foreground">Criado:</span> {c.createdAt}</div>
                            {c.startedAt && <div><span className="text-muted-foreground">Iniciada:</span> {c.startedAt}</div>}
                            {c.finishedAt && <div><span className="text-muted-foreground">Finalizada:</span> {c.finishedAt}</div>}
                            {c.duration && <div className="text-muted-foreground">⏱ {c.duration}</div>}
                            {c.scheduledAt && <div><span className="text-muted-foreground">Agendado:</span> {c.scheduledAt}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.stats && (
                            <div className="text-xs space-y-0.5">
                              <div className="flex gap-2"><span className="text-muted-foreground w-20">Visualizações</span><b>{c.stats.views}</b></div>
                              <div className="flex gap-2"><span className="text-muted-foreground w-20">Cliques</span><b>{c.stats.clicks}</b></div>
                              <div className="flex gap-2"><span className="text-muted-foreground w-20">Enviada</span><b>{c.stats.sent.toLocaleString('pt-BR')} / {c.stats.total.toLocaleString('pt-BR')}</b></div>
                              <div className="flex gap-2"><span className="text-muted-foreground w-20">Rejeições</span><b>{c.stats.rejections}</b></div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <IconAction label="Pré-visualizar" onClick={() => setPreviewOpen(true)}>
                              <Eye className="h-4 w-4" />
                            </IconAction>
                            <IconAction label="Pausar" onClick={() => pauseCampaign(c.id)}>
                              <Pause className="h-4 w-4" />
                            </IconAction>
                            <IconAction label="Arquivar" onClick={() => archiveCampaign(c.id)}>
                              <Archive className="h-4 w-4" />
                            </IconAction>
                            <IconAction label="Duplicar" onClick={() => duplicateCampaign(c)}>
                              <Copy className="h-4 w-4" />
                            </IconAction>
                            <IconAction label="Análises" onClick={() => setSection('analises')}>
                              <BarChart3 className="h-4 w-4" />
                            </IconAction>
                            <IconAction label="Excluir" onClick={() => deleteCampaign(c.id)}>
                              <Trash2 className="h-4 w-4" />
                            </IconAction>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCampaigns.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          Nenhuma campanha encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}

          {/* CRIAR */}
          {section === 'criar' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">Nova Campanha</h1>
                  <p className="text-sm text-muted-foreground">
                    Componha visualmente — o HTML responsivo é gerado automaticamente.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSection('todas')}>Voltar</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1 h-fit">
                  <CardHeader>
                    <CardTitle className="text-base">Configurações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs">Nome da campanha *</Label>
                      <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Assunto do e-mail *</Label>
                      <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Remetente</Label>
                      <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">E-mail de envio</Label>
                      <Input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Lista de contatos</Label>
                      <Select value={list} onValueChange={setList}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os clientes</SelectItem>
                          {lists.map((l) => (
                            <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Agendamento (opcional)</Label>
                      <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                    </div>

                    <div className="pt-2 border-t">
                      <Label className="text-xs mb-2 block">Variáveis dinâmicas</Label>
                      <div className="flex flex-wrap gap-1">
                        {['nome', 'empresa', 'telefone', 'email'].map((v) => (
                          <Button key={v} variant="outline" size="sm" className="h-7 text-xs" onClick={() => insertVariable(v)}>
                            {`{{${v}}}`}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Label className="text-xs mb-2 block">Templates</Label>
                      <Select onValueChange={loadTemplate}>
                        <SelectTrigger><SelectValue placeholder="Carregar template..." /></SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2 border-t space-y-2">
                      <Label className="text-xs">Enviar teste para:</Label>
                      <div className="flex gap-2">
                        <Input type="email" placeholder="seu@email.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                        <Button variant="outline" size="sm" onClick={handleSendTest}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Editor visual</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                          <Eye className="h-4 w-4 mr-1" /> Visualizar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => persist('rascunho')}>
                          <Save className="h-4 w-4 mr-1" /> Salvar rascunho
                        </Button>
                        <Button size="sm" onClick={() => persist(scheduledAt ? 'agendada' : 'enviada')}>
                          <Send className="h-4 w-4 mr-1" />
                          {scheduledAt ? 'Agendar' : 'Enviar agora'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/40">
                      <Select onValueChange={(v) => exec('fontSize', v)}>
                        <SelectTrigger className="h-8 w-20 text-xs"><SelectValue placeholder="Fonte" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">Pequena</SelectItem>
                          <SelectItem value="3">Normal</SelectItem>
                          <SelectItem value="5">Grande</SelectItem>
                          <SelectItem value="7">Título</SelectItem>
                        </SelectContent>
                      </Select>
                      <ToolbarBtn label="Negrito" onClick={() => exec('bold')}><Bold className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Itálico" onClick={() => exec('italic')}><Italic className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Sublinhado" onClick={() => exec('underline')}><Underline className="h-4 w-4" /></ToolbarBtn>
                      <label className="relative inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted cursor-pointer">
                        <span className="h-4 w-4 rounded border" style={{ background: 'linear-gradient(45deg,#ef4444,#3b82f6)' }} />
                        <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => exec('foreColor', e.target.value)} />
                      </label>
                      <span className="w-px h-6 bg-border mx-1" />
                      <ToolbarBtn label="Esquerda" onClick={() => exec('justifyLeft')}><AlignLeft className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Centro" onClick={() => exec('justifyCenter')}><AlignCenter className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Direita" onClick={() => exec('justifyRight')}><AlignRight className="h-4 w-4" /></ToolbarBtn>
                      <span className="w-px h-6 bg-border mx-1" />
                      <ToolbarBtn label="Link" onClick={handleInsertLink}><LinkIcon className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Imagem (URL)" onClick={handleInsertImage}><ImageIcon className="h-4 w-4" /></ToolbarBtn>
                      <label className="inline-flex items-center justify-center h-8 px-2 rounded hover:bg-muted cursor-pointer text-xs">
                        Upload
                        <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                      </label>
                      <ToolbarBtn label="Botão CTA" onClick={handleInsertButton}><MousePointerClick className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Separador" onClick={handleInsertSeparator}><Minus className="h-4 w-4" /></ToolbarBtn>
                      <ToolbarBtn label="Tabela" onClick={handleInsertTable}><TableIcon className="h-4 w-4" /></ToolbarBtn>
                      <div className="relative">
                        <ToolbarBtn label="Emojis" onClick={() => setEmojiOpen((s) => !s)}><Smile className="h-4 w-4" /></ToolbarBtn>
                        {emojiOpen && (
                          <div className="absolute z-50 mt-1 bg-popover border rounded-md shadow-md p-2 grid grid-cols-6 gap-1">
                            {EMOJIS.map((e) => (
                              <button key={e} type="button" className="text-lg hover:bg-muted rounded p-1" onClick={() => { insertHTML(e); setEmojiOpen(false); }}>
                                {e}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      className="min-h-[420px] border rounded-md p-4 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-relaxed"
                      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                    />

                    <p className="text-xs text-muted-foreground">
                      Dica: use <code>{'{{nome}}'}</code>, <code>{'{{empresa}}'}</code> etc. Ao salvar, o HTML responsivo é gerado automaticamente.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* MIDIA */}
          {section === 'midia' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Mídia</h1>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Enviar arquivo</Button>
              </div>
              <Card>
                <CardContent className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded border bg-muted/30 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {/* MODELOS */}
          {section === 'modelos' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Modelos</h1>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Novo modelo</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((t) => (
                  <Card key={t.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{t.name}</CardTitle>
                        <Badge variant="secondary">{t.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-xs text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: t.htmlContent }} />
                      <Button size="sm" variant="outline" className="w-full" onClick={() => { openNewCampaign(); setTimeout(() => loadTemplate(t.id), 50); }}>
                        Usar modelo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* ANALISES */}
          {section === 'analises' && (
            <>
              <h1 className="text-xl font-bold">Análises</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <SmallStat label="Enviadas (total)" value={metrics.messagesSent.toLocaleString('pt-BR')} />
                <SmallStat label="Aberturas" value="~38%" />
                <SmallStat label="Cliques" value="~12%" />
                <SmallStat label="Rejeições" value="~1.2%" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Visualizações por dia</CardTitle></CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={viewsChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ReTooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">Cliques por dia</CardTitle></CardHeader>
                  <CardContent className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={clicksChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ReTooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* LISTAS */}
          {section === 'listas' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Listas ({lists.length})</h1>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Nova lista</Button>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Inscrição</TableHead>
                      <TableHead>Assinantes</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lists
                      .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
                      .map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium text-primary">{l.name}</TableCell>
                          <TableCell><Badge variant="secondary">{l.type}</Badge></TableCell>
                          <TableCell>{l.optin}</TableCell>
                          <TableCell>{l.subscribers.toLocaleString('pt-BR')}</TableCell>
                          <TableCell className="text-muted-foreground">{l.createdAt}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <IconAction label="Editar"><FileText className="h-4 w-4" /></IconAction>
                              <IconAction label="Excluir"><Trash2 className="h-4 w-4" /></IconAction>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}

          {/* ASSINANTES */}
          {section === 'assinantes' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">Assinantes ({subscribers.length})</h1>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Novo assinante</Button>
              </div>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Listas</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers
                      .filter((s) => s.email.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
                      .map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium text-primary">{s.email}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>
                            <Badge
                              className={`border-0 ${
                                s.status === 'Ativo'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : s.status === 'Bloqueado'
                                    ? 'bg-rose-100 text-rose-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{s.lists.join(', ')}</TableCell>
                          <TableCell className="text-muted-foreground">{s.createdAt}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <IconAction label="Editar"><FileText className="h-4 w-4" /></IconAction>
                              <IconAction label="Bloquear"><Pause className="h-4 w-4" /></IconAction>
                              <IconAction label="Excluir"><Trash2 className="h-4 w-4" /></IconAction>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </main>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>Pré-visualização do e-mail</DialogTitle></DialogHeader>
          <div className="border rounded-md overflow-hidden bg-muted">
            <iframe title="preview" srcDoc={previewHtml} className="w-full h-[600px] bg-white" />
          </div>
          <Textarea readOnly value={previewHtml} className="font-mono text-xs h-32" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({
  icon,
  big,
  label,
  rows,
}: {
  icon: React.ReactNode;
  big: number | string;
  label: string;
  rows: { label: string; value: number | string }[];
}) {
  return (
    <Card>
      <CardContent className="p-5 flex gap-4">
        <div className="flex flex-col items-start">
          <div className="text-muted-foreground mb-2">{icon}</div>
          <div className="text-3xl font-bold leading-none">{big}</div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
        </div>
        <div className="flex-1 border-l pl-4 space-y-1">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="font-semibold">{r.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted text-foreground"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
