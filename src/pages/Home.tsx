import { ArrowRight, BadgeCheck, BellRing, CreditCard, Mail, MessageCircle, Phone, Target, RefreshCw, ShieldCheck, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoIdentite from '@/assets/logo-identite.png';
import { ModuleNav } from '@/components/ModuleNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const highlights = [
  {
    icon: RefreshCw,
    title: 'Gestão de renovações',
    description: 'Acompanhe vencimentos, distribua carteiras, priorize retornos e mantenha total visibilidade da operação comercial.',
  },
  {
    icon: Target,
    title: 'Gestão de prospecções',
    description: 'Estruture o funil comercial com base fria, qualificação, negociação e acompanhamento completo da evolução dos leads.',
  },
  {
    icon: Workflow,
    title: 'CRM completo para a empresa',
    description: 'Centralize processos, equipes, interações e indicadores em um único sistema preparado para escala e produtividade.',
  },
];

const communicationFeatures = [
  { icon: MessageCircle, title: 'Chat de WhatsApp', description: 'Converse com clientes dentro do sistema e mantenha o histórico centralizado.' },
  { icon: BellRing, title: 'Disparo em massa', description: 'Execute campanhas em escala com acompanhamento operacional e segmentação comercial.' },
  { icon: Phone, title: 'Ligação no sistema', description: 'Realize contatos sem sair da plataforma e registre cada interação no CRM.' },
  { icon: Mail, title: 'Email em massa', description: 'Envie comunicações comerciais e operacionais com controle de execução.' },
  { icon: MessageCircle, title: 'SMS em massa', description: 'Amplie o alcance das campanhas com comunicações rápidas e diretas.' },
  { icon: CreditCard, title: 'Pagamento integrado', description: 'Gere cobranças com gateway e acompanhe a confirmação do pagamento em tempo real.' },
];

const operationalFeatures = [
  'Controle de status, engajamento e tags comerciais',
  'Agendamento de retornos e acompanhamento diário da equipe',
  'Distribuição de leads e clientes por vendedor',
  'Registro completo de interações e histórico comercial',
  'Filtros avançados para gestão, operação e tomada de decisão',
  'Visão integrada entre renovação, prospecção e conversão',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-6">
            <img src={logoIdentite} alt="Identité Certificado Digital" className="h-10 w-auto" />
            <ModuleNav />
          </div>
          <Button asChild>
            <Link to="/">
              Acessar sistema
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="border-b bg-muted/30">
          <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-20">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-md border bg-card px-3 py-1 text-sm font-medium text-muted-foreground">
                Plataforma comercial e operacional
              </div>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
                  CRM completo para gestão de renovações, prospecções e conversão comercial.
                </h1>
                <p className="max-w-3xl text-lg text-muted-foreground">
                  Nosso sistema centraliza toda a operação da empresa em uma única plataforma, unindo atendimento,
                  prospecção, comunicação em massa, cobrança e acompanhamento comercial com visão estratégica e execução eficiente.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/">
                    Ver renovações
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/prospeccoes">Ver prospecções</Link>
                </Button>
              </div>
            </div>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Objetivo do sistema</p>
                  <p className="text-base leading-7">
                    Organizar, automatizar e acelerar a operação comercial da empresa, garantindo controle de ponta a ponta sobre clientes,
                    leads, contatos, cobranças e oportunidades de fechamento.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Gestão centralizada</p>
                    <p className="mt-1 text-sm">Clientes, leads, equipe comercial e histórico completo em um só ambiente.</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium text-muted-foreground">Acompanhamento em tempo real</p>
                    <p className="mt-1 text-sm">Pagamentos, retornos, status e negociações acompanhados com agilidade.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="mb-8 max-w-3xl space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Visão institucional da plataforma</h2>
            <p className="text-muted-foreground">
              Desenvolvido para empresas que precisam de controle comercial real, o sistema conecta operação, relacionamento e faturamento em um fluxo único.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border shadow-sm">
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-[1600px] px-6 py-16">
            <div className="mb-8 max-w-3xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Funcionalidades que sustentam a operação</h2>
              <p className="text-muted-foreground">
                A plataforma foi pensada para cobrir toda a jornada comercial, do primeiro contato à confirmação do pagamento.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {communicationFeatures.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="border-border bg-card shadow-sm">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1600px] px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Recursos para gestão comercial completa</h2>
              <p className="text-muted-foreground">
                Além da comunicação multicanal e do faturamento integrado, o sistema entrega ferramentas práticas para gestão diária, performance e organização da equipe.
              </p>
            </div>

            <Card className="border-border shadow-sm">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                {operationalFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm leading-6">{feature}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-t bg-card">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Uma plataforma pensada para crescimento, controle e escala</h2>
              <p className="text-muted-foreground">
                Mais do que um sistema de acompanhamento, esta solução posiciona a empresa com um CRM completo, preparado para ampliar conversões,
                melhorar a produtividade do time e profissionalizar toda a operação comercial.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/">
                Entrar no sistema
                <BadgeCheck className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}