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
  BarChart3,
} from 'lucide-react';
import logoIdentite from '@/assets/logo-identite.png';
import { ModuleNav } from '@/components/ModuleNav';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

type CampaignStatus = 'rascunho' | 'agendada' | 'enviada';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  list: string;
  scheduledAt?: string;
  htmlContent: string;
  status: CampaignStatus;
  createdAt: string;
  stats?: { sent: number; delivered: number; opens: number; clicks: number; errors: number };
}

interface Template {
  id: string;
  name: string;
  category: string;
  htmlContent: string;
}

const initialTemplates: Template[] = [
  {
    id: 't1',
    name: 'Boas-vindas',
    category: 'Boas-vindas',
    htmlContent:
      '<h2>Olá {{nome}}, seja bem-vindo(a)!</h2><p>É um prazer ter a <b>{{empresa}}</b> com a gente. Se precisar de qualquer coisa, é só responder este e-mail.</p>',
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
      '<h2>Hora de renovar, {{nome}}!</h2><p>Seu certificado digital está próximo do vencimento. Renove agora com condições especiais.</p>',
  },
  {
    id: 't4',
    name: 'Pós-venda',
    category: 'Pós-venda',
    htmlContent:
      '<p>Olá {{nome}}, tudo bem?</p><p>Queremos saber sua opinião sobre nosso atendimento. Sua resposta nos ajuda muito!</p>',
  },
];

const initialCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Renovação Novembro',
    subject: 'Seu certificado vence em breve',
    senderName: 'Identité Certificado Digital',
    senderEmail: 'contato@identite.com.br',
    list: 'Renovações - Novembro',
    htmlContent: '<p>Hora de renovar seu certificado!</p>',
    status: 'enviada',
    createdAt: '2026-04-28',
    stats: { sent: 1240, delivered: 1208, opens: 612, clicks: 184, errors: 32 },
  },
  {
    id: 'c2',
    name: 'Prospects Frios - Black Friday',
    subject: '🔥 Condição especial só hoje',
    senderName: 'Equipe Comercial',
    senderEmail: 'comercial@identite.com.br',
    list: 'Prospects EmpresAqui',
    htmlContent: '<p>Aproveite!</p>',
    status: 'agendada',
    scheduledAt: '2026-05-15 09:00',
    createdAt: '2026-05-02',
  },
];

/** Sanitiza e converte o HTML do editor para um HTML responsivo com inline CSS, pronto para email. */
function buildEmailHtml(content: string, subject: string): string {
  // Remove scripts/eventos perigosos
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

export default function Campanhas() {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [templates] = useState<Template[]>(initialTemplates);
  const [view, setView] = useState<'list' | 'editor'>('list');
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
    setView('editor');
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
      scheduledAt: scheduledAt || undefined,
      htmlContent: html,
      status,
      createdAt: new Date().toISOString().split('T')[0],
      stats:
        status === 'enviada'
          ? { sent: 0, delivered: 0, opens: 0, clicks: 0, errors: 0 }
          : undefined,
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
    setView('list');
  };

  const handleSendTest = () => {
    if (!testEmail) {
      toast({ title: 'Informe um e-mail para teste', variant: 'destructive' });
      return;
    }
    toast({
      title: 'Teste enviado!',
      description: `E-mail de teste enviado para ${testEmail}`,
    });
    setTestEmail('');
  };

  const duplicateCampaign = (c: Campaign) => {
    setCampaigns((prev) => [
      {
        ...c,
        id: `c-${Date.now()}`,
        name: `${c.name} (cópia)`,
        status: 'rascunho',
        createdAt: new Date().toISOString().split('T')[0],
        stats: undefined,
      },
      ...prev,
    ]);
    toast({ title: 'Campanha duplicada' });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast({ title: 'Campanha removida' });
  };

  const statusBadge = (status: CampaignStatus) => {
    const map: Record<CampaignStatus, string> = {
      rascunho: 'bg-muted text-muted-foreground',
      agendada: 'bg-amber-100 text-amber-700',
      enviada: 'bg-emerald-100 text-emerald-700',
    };
    const label: Record<CampaignStatus, string> = {
      rascunho: 'Rascunho',
      agendada: 'Agendada',
      enviada: 'Enviada',
    };
    return <Badge className={`${map[status]} border-0`}>{label[status]}</Badge>;
  };

  const previewHtml = useMemo(
    () => buildEmailHtml(editorContent, subject || 'Pré-visualização'),
    [editorContent, subject],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={logoIdentite} alt="Identité Certificado Digital" className="h-9" />
            <ModuleNav />
          </div>
          {view === 'list' && (
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campanha..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {view === 'list' ? (
          <>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-xl font-bold">Campanhas de E-mail</h1>
                <p className="text-sm text-muted-foreground">
                  Crie disparos em massa visualmente — o sistema converte automaticamente para HTML
                  responsivo pronto para envio.
                </p>
              </div>
              <Button onClick={openNewCampaign} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova campanha
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Enviadas</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {campaigns.filter((c) => c.status === 'enviada').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Agendadas</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {campaigns.filter((c) => c.status === 'agendada').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Rascunhos</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {campaigns.filter((c) => c.status === 'rascunho').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="campanhas">
              <TabsList>
                <TabsTrigger value="campanhas" className="gap-2">
                  <Mail className="h-4 w-4" /> Campanhas
                </TabsTrigger>
                <TabsTrigger value="templates" className="gap-2">
                  <FileText className="h-4 w-4" /> Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="campanhas" className="space-y-3">
                {filteredCampaigns.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      Nenhuma campanha encontrada.
                    </CardContent>
                  </Card>
                )}
                {filteredCampaigns.map((c) => (
                  <Card key={c.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{c.name}</h3>
                          {statusBadge(c.status)}
                          <span className="text-xs text-muted-foreground">{c.list}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Assunto:</span> {c.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          De: {c.senderName} &lt;{c.senderEmail}&gt; · Criada em {c.createdAt}
                          {c.scheduledAt && ` · Envio: ${c.scheduledAt}`}
                        </p>
                        {c.stats && (
                          <div className="flex gap-4 text-xs pt-1">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              <b>{c.stats.sent}</b> enviados
                            </span>
                            <span className="text-emerald-600">
                              <b>{c.stats.delivered}</b> entregues
                            </span>
                            <span className="text-sky-600">
                              <b>{c.stats.opens}</b> aberturas
                            </span>
                            <span className="text-violet-600">
                              <b>{c.stats.clicks}</b> cliques
                            </span>
                            <span className="text-destructive">
                              <b>{c.stats.errors}</b> erros
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => duplicateCampaign(c)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCampaign(c.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="templates" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {templates.map((t) => (
                  <Card key={t.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{t.name}</CardTitle>
                        <Badge variant="secondary">{t.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div
                        className="text-xs text-muted-foreground line-clamp-3 [&_*]:!text-xs"
                        dangerouslySetInnerHTML={{ __html: t.htmlContent }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          openNewCampaign();
                          setTimeout(() => loadTemplate(t.id), 50);
                        }}
                      >
                        Usar template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Nova Campanha</h1>
                <p className="text-sm text-muted-foreground">
                  Componha visualmente — o HTML responsivo é gerado automaticamente.
                </p>
              </div>
              <Button variant="outline" onClick={() => setView('list')}>
                Voltar
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Configurações */}
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
                    <Input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Lista de contatos</Label>
                    <Select value={list} onValueChange={setList}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os clientes</SelectItem>
                        <SelectItem value="renovacoes">Renovações pendentes</SelectItem>
                        <SelectItem value="prospects">Prospects EmpresAqui</SelectItem>
                        <SelectItem value="convertidos">Clientes convertidos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Agendamento (opcional)</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>

                  <div className="pt-2 border-t">
                    <Label className="text-xs mb-2 block">Variáveis dinâmicas</Label>
                    <div className="flex flex-wrap gap-1">
                      {['nome', 'empresa', 'telefone', 'email'].map((v) => (
                        <Button
                          key={v}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => insertVariable(v)}
                        >
                          {`{{${v}}}`}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Label className="text-xs mb-2 block">Templates</Label>
                    <Select onValueChange={loadTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Carregar template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 border-t space-y-2">
                    <Label className="text-xs">Enviar teste para:</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={handleSendTest}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editor */}
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
                      <Button
                        size="sm"
                        onClick={() => persist(scheduledAt ? 'agendada' : 'enviada')}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {scheduledAt ? 'Agendar' : 'Enviar agora'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 border rounded-md bg-muted/40">
                    <Select onValueChange={(v) => exec('fontSize', v)}>
                      <SelectTrigger className="h-8 w-20 text-xs">
                        <SelectValue placeholder="Fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Pequena</SelectItem>
                        <SelectItem value="3">Normal</SelectItem>
                        <SelectItem value="5">Grande</SelectItem>
                        <SelectItem value="7">Título</SelectItem>
                      </SelectContent>
                    </Select>
                    <ToolbarBtn label="Negrito" onClick={() => exec('bold')}>
                      <Bold className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Itálico" onClick={() => exec('italic')}>
                      <Italic className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Sublinhado" onClick={() => exec('underline')}>
                      <Underline className="h-4 w-4" />
                    </ToolbarBtn>
                    <label className="relative inline-flex items-center justify-center h-8 w-8 rounded hover:bg-muted cursor-pointer">
                      <span
                        className="h-4 w-4 rounded border"
                        style={{ background: 'linear-gradient(45deg,#ef4444,#3b82f6)' }}
                      />
                      <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => exec('foreColor', e.target.value)}
                      />
                    </label>
                    <span className="w-px h-6 bg-border mx-1" />
                    <ToolbarBtn label="Esquerda" onClick={() => exec('justifyLeft')}>
                      <AlignLeft className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Centro" onClick={() => exec('justifyCenter')}>
                      <AlignCenter className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Direita" onClick={() => exec('justifyRight')}>
                      <AlignRight className="h-4 w-4" />
                    </ToolbarBtn>
                    <span className="w-px h-6 bg-border mx-1" />
                    <ToolbarBtn label="Link" onClick={handleInsertLink}>
                      <LinkIcon className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Imagem (URL)" onClick={handleInsertImage}>
                      <ImageIcon className="h-4 w-4" />
                    </ToolbarBtn>
                    <label className="inline-flex items-center justify-center h-8 px-2 rounded hover:bg-muted cursor-pointer text-xs">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadImage}
                      />
                    </label>
                    <ToolbarBtn label="Botão CTA" onClick={handleInsertButton}>
                      <MousePointerClick className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Separador" onClick={handleInsertSeparator}>
                      <Minus className="h-4 w-4" />
                    </ToolbarBtn>
                    <ToolbarBtn label="Tabela" onClick={handleInsertTable}>
                      <TableIcon className="h-4 w-4" />
                    </ToolbarBtn>
                    <div className="relative">
                      <ToolbarBtn label="Emojis" onClick={() => setEmojiOpen((s) => !s)}>
                        <Smile className="h-4 w-4" />
                      </ToolbarBtn>
                      {emojiOpen && (
                        <div className="absolute z-50 mt-1 bg-popover border rounded-md shadow-md p-2 grid grid-cols-6 gap-1">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              className="text-lg hover:bg-muted rounded p-1"
                              onClick={() => {
                                insertHTML(e);
                                setEmojiOpen(false);
                              }}
                            >
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
                    className="min-h-[420px] border rounded-md p-4 bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-relaxed prose prose-sm max-w-none"
                    style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
                  />

                  <p className="text-xs text-muted-foreground">
                    Dica: use <code>{'{{nome}}'}</code>, <code>{'{{empresa}}'}</code> etc. para
                    personalizar. Ao salvar, o conteúdo é convertido para HTML responsivo
                    compatível com Gmail, Outlook e mobile.
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização do e-mail</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md overflow-hidden bg-muted">
            <iframe
              title="preview"
              srcDoc={previewHtml}
              className="w-full h-[600px] bg-white"
            />
          </div>
          <Textarea
            readOnly
            value={previewHtml}
            className="font-mono text-xs h-32"
          />
        </DialogContent>
      </Dialog>
    </div>
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
