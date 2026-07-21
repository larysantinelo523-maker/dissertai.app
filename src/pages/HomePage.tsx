import { Link } from 'react-router-dom';
import { useRef } from 'react';
import {
  BookOpen, CheckCircle2, Award, Zap, Star, ShieldCheck,
  PenTool, Brain, TrendingUp, Users, ArrowRight, Files,
  ChevronLeft, ChevronRight, GraduationCap, Shield, Scale, Landmark
} from 'lucide-react';
import { Button, cn } from '../components/ui/Base';
import { Header } from '../components/Header';
import { motion } from 'motion/react';

// Variantes de animação
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg font-sans overflow-x-hidden">
      <Header />

      <main className="flex-1 pt-16 md:pt-20">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-20 md:pt-32 pb-24 md:pb-32 flex flex-col items-center text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl flex flex-col items-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-xs mb-6 border border-accent/20 whitespace-nowrap">
              <Star size={13} className="fill-accent shrink-0" />
              <span>Plataforma #1 de Correção de Redações para Concursos</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-6xl md:text-7,5xl font-extrabold tracking-tight text-text-primary leading-[1.1] mb-6">
              Alcance os <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-600">1000 pontos</span> na redação com analise imediata!
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl text-text-secondary mb-10 leading-relaxed max-w-2xl">
              Pare de depender de apostilas ou cursinhos. Nosso aplicativo avalia sua redação em segundos com o rigor das bancas oficiais (ENEM, SSA, CESAR e UNICAP).
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link to="/cadastro" className="w-full sm:w-auto">
                <Button size="lg" className="px-10 h-14 text-base w-full group relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-2">
                    Corrigir minha redação agora <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-secondary">
              <div className="flex -space-x-3">
                {['/avatars/avatar1.jpg', '/avatars/avatar2.jpg', '/avatars/avatar3.jpg', '/avatars/avatar4.jpg', '/avatars/avatar5.jpg'].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                    <img src={src} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="flex text-yellow-400">
                  <Star size={14} className="fill-current" />
                  <Star size={14} className="fill-current" />
                  <Star size={14} className="fill-current" />
                  <Star size={14} className="fill-current" />
                  <Star size={14} className="fill-current" />
                </div>
                <span>Avaliado com 4.9/5 por mais de 5.000 estudantes</span>
              </div>
            </motion.div>
          </motion.div>
        </section>



        {/* COMO FUNCIONA */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Como funciona a Análise?</h2>
            <p className="text-text-secondary">Três passos simples para transformar seus textos em aprovações.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              icon={<PenTool size={32} className="text-accent" />}
              title="Escreva seu Texto"
              description="Digite sua redação diretamente na plataforma ou cole de onde quiser. O sistema aceita qualquer tema."
            />
            <StepCard
              number="2"
              icon={<Brain size={32} className="text-accent" />}
              title="A IA Analisa"
              description="Nossa inteligência artificial incorpora o manual oficial dos corretores (ENEM, SSA, etc) e lê cada vírgula."
            />
            <StepCard
              number="3"
              icon={<TrendingUp size={32} className="text-accent" />}
              title="Receba o Relatório"
              description="Em 5 segundos você descobre sua nota, quais competências errou e recebe sugestões de reescrita."
            />
          </div>
        </section>

        {/* FEATURES (BENEFÍCIOS) */}
        <section className="bg-white py-24 border-y border-border">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-16 md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Por que escolher o Disserta.ai?</h2>
              <p className="text-text-secondary text-lg">Nós não apenas damos notas, nós ensinamos você a escrever melhor com a precisão que nenhum humano consegue replicar em massa.</p>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureCard
                icon={<CheckCircle2 className="text-accent" size={28} />}
                title="Critérios Oficiais e Rigorosos"
                description="Se a prova tira pontos por repetição de palavras, vícios de linguagem, crase errada ou qualquer outro erro ortográfico nosso aplicativo também vai tirar. Sem colher de chá."
              />
              <FeatureCard
                icon={<Award className="text-accent" size={28} />}
                title="Nota Exata por Competência"
                description="Receba uma quebra detalhada. Saiba exatamente se você perdeu pontos na C1 (Gramática) ou na C5 (Proposta de Intervenção)."
              />
              <FeatureCard
                icon={<Zap className="text-accent" size={28} />}
                title="Mentoria de Reescrita"
                description="A IA não diz apenas que está errado. Ela reescreve o parágrafo problemático te mostrando como um aluno nota 1000 faria."
              />
            </motion.div>
          </div>
        </section>

        {/* PARA QUEM É O DISSERTA */}
        <section className="py-24 bg-white overflow-hidden relative">
          {/* Decoração de fundo */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bg rounded-full translate-x-1/3 -translate-y-1/2 opacity-50" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16 max-w-3xl mx-auto">
              <span className="text-accent font-bold tracking-wider uppercase text-sm mb-3 block">Público-Alvo</span>
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">Para quem é o Disserta.ai?</h2>
              <p className="text-lg text-text-secondary leading-relaxed">
                A redação é o critério de desempate mais importante que separa os <strong className="text-text-primary">APROVADOS</strong> dos <strong className="text-text-primary">NÃO APROVADOS</strong>. Nossa inteligência artificial foi treinada para quem deseja extrair a <strong className="text-text-primary">nota máxima</strong> em qualquer banca examinadora do Brasil.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AudienceCard
                icon={<GraduationCap className="text-blue-600" size={32} />}
                title="ENEM & Vestibulares"
                description="Alcance a nota 1000 com correções estritas nas 5 competências oficiais do MEC. Fundamental para quem busca Medicina ou engenharias em federais."
                tags={['ENEM', 'FUVEST', 'UNICAMP', 'SSA']}
                colorClass="bg-blue-50 border-blue-100"
              />
              <AudienceCard
                icon={<Shield className="text-zinc-800" size={32} />}
                title="Carreiras Policiais"
                description="Polícia Federal, PRF, Polícias Militares e Civis. Domine o texto dissertativo exigido pelas bancas mais temidas na segurança pública."
                tags={['Cebraspe', 'Vunesp', 'PM', 'PF']}
                colorClass="bg-zinc-50 border-zinc-200"
              />
              <AudienceCard
                icon={<Scale className="text-emerald-700" size={32} />}
                title="Tribunais & Administrativo"
                description="TJ, TRT, TRE e Ministérios. Desenvolva o rigor técnico, coesão, clareza e vocabulário cobrados nas provas discursivas mais exigentes do país."
                tags={['FCC', 'FGV', 'Analista', 'Técnico']}
                colorClass="bg-emerald-50 border-emerald-100"
              />
              <AudienceCard
                icon={<Landmark className="text-amber-600" size={32} />}
                title="Carreiras Bancárias"
                description="Banco do Brasil, Caixa Econômica e BACEN. Entenda o que a banca quer ler sobre atualidades, tecnologia e sistema financeiro nacional."
                tags={['Cesgranrio', 'BB', 'Caixa', 'BNDES']}
                colorClass="bg-amber-50 border-amber-100"
              />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS (DEPOIMENTOS) */}
        <section className="py-24 bg-bg overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">Quem usou, aprovou.</h2>
              <p className="text-text-secondary">Depoimentos reais de alunos que transformaram suas notas com nossa ferramenta.</p>
            </motion.div>

            <TestimonialsCarousel />
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-text-primary py-24 relative overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 opacity-20 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="max-w-4xl mx-auto px-6 text-center relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Sua aprovação não pode esperar</h2>
            <p className="text-xl text-slate-300 mb-10">Junte-se aos milhares de estudantes que já estão garantindo as melhores notas do Brasil.</p>
            <Link to="/cadastro">
              <Button size="lg" className="px-12 h-16 text-lg bg-white text-text-primary hover:bg-slate-100 shadow-xl shadow-white/10">
                Começar a corrigir agora
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-accent" />
              <span className="font-semibold text-text-primary">Disserta.ai</span>
            </div>
            <span className="text-text-muted text-sm mt-1 md:mt-0">© 2026 Todos os direitos reservados.</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-sm text-text-secondary">
            <Link to="/termos" className="hover:text-accent transition-colors">Termos de Uso</Link>
            <Link to="/privacidade" className="hover:text-accent transition-colors">Política de Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ number, label, icon, labelColor }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="mb-2">{icon}</div>
      <span className={cn("text-3xl md:text-4xl font-black text-text-primary mb-1", labelColor)}>{number}</span>
      <span className="text-text-secondary text-sm font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
}

function StepCard({ number, icon, title, description }: any) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center text-center p-6 relative">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 relative">
        {icon}
        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-text-primary text-white font-bold flex items-center justify-center text-sm border-4 border-bg">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </motion.div>
  );
}

function AudienceCard({ icon, title, description, tags, colorClass }: any) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn("flex flex-col p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl", colorClass)}
    >
      <div className="w-14 h-14 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-1">{description}</p>

      <div className="flex flex-wrap gap-2 mt-auto">
        {tags.map((tag: string, i: number) => (
          <span key={i} className="px-2.5 py-1 bg-white/60 text-text-primary text-[11px] font-bold uppercase tracking-wider rounded-md border border-black/5">
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <motion.div variants={fadeUp} className="bg-bg border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </motion.div>
  );
}

const TESTIMONIALS_TOP = [
  {
    name: "Maria Eduarda",
    course: "Aprovada em Pedagogia • ENEM 780",
    avatar: "/avatars/avatar1.jpg",
    text: "Eu estava travada nos 500 pontos há meses. Com as correções detalhadas do Disserta.ai, descobri que meu problema era a Competência 3. Foquei nisso e tirei 780 no ENEM!",
  },
  {
    name: "Lucas Silva",
    course: "Aprovado em Administração • PROUNI",
    avatar: "/avatars/avatar2.jpg",
    text: "A velocidade é absurda. Antigamente esperava 1 semana pro cursinho devolver a redação. Aqui, em 5s sei no que errei. Minha nota saltou de 420 para 720.",
  },
  {
    name: "Ana Beatriz",
    course: "Aprovada em Engenharia • UNICAMP",
    avatar: "/avatars/avatar4.jpg",
    text: "Os corretores de cursinho geralmente são bonzinhos. O rigor do Disserta me preparou para o pior. No dia da prova eu estava tão tranquila que fiz o texto rindo.",
  },
  {
    name: "Vitória Mendes",
    course: "Evolução Real • Fui de 360 → 740",
    avatar: "/avatars/avatar6.jpg",
    text: "Em 3 semanas corrigi 28 redações pelo Disserta. No cursinho teria feito 4 no máximo. Foi esse volume de prática que me deu consistência pra ir de 360 para 740.",
  },
];

const TESTIMONIALS_BOTTOM = [
  {
    name: "Camila Rodrigues",
    course: "Aprovada em Letras • FUVEST",
    avatar: "/avatars/novo1.jpg",
    text: "Sempre tive dificuldade com a norma culta. O Disserta.ai me forçou a sair da zona de conforto com correções cirúrgicas. A evolução foi nítida, de 400 na primeira para 760 no dia da prova.",
  },
  {
    name: "Amanda Silva",
    course: "Aprovada na Polícia Civil • PC",
    avatar: "/avatars/novo2.jpg",
    text: "As bancas de concurso público são implacáveis com erros de coesão. Treinar com o modelo do Disserta foi o melhor investimento que fiz. O feedback não me deixava cometer o mesmo erro.",
  },
  {
    name: "Fernanda Costa",
    course: "Aprovada em Enfermagem • UERJ",
    avatar: "/avatars/novo3.jpg",
    text: "Eu pagava cursinho caro e a correção demorava semanas. Com a plataforma, recebo o resultado na hora. A funcionalidade de mentoria de reescrita me ensinou a estruturar parágrafos como uma verdadeira nota 1000.",
  },
  {
    name: "Thiago Oliveira",
    course: "Aprovado em Direito • UFMG",
    avatar: "/avatars/novo4.jpg",
    text: "Meu problema era sempre repertório sociocultural. A IA não só apontava o erro, mas sugeria citações reais e me ajudava a encaixar no texto. Mudou o jogo pra mim na redação.",
  },
  {
    name: "Bruno Souza",
    course: "Auditor Fiscal • Receita Federal",
    avatar: "/avatars/novo5.jpg",
    text: "Em concursos de alto nível cada décimo conta. A nota exata por competência que o sistema dá foi essencial pra eu focar onde estava mais fraco. O rigor da plataforma é o grande diferencial.",
  },
];

function TestimonialsCarousel() {
  // Duplicamos os arrays para criar o efeito de loop perfeito na animação de marquee
  const ROW1_LOOP = [...TESTIMONIALS_TOP, ...TESTIMONIALS_TOP, ...TESTIMONIALS_TOP, ...TESTIMONIALS_TOP];
  const ROW2_LOOP = [...TESTIMONIALS_BOTTOM, ...TESTIMONIALS_BOTTOM, ...TESTIMONIALS_BOTTOM, ...TESTIMONIALS_BOTTOM];

  const renderCard = (t: any, idx: number, prefix: string) => (
    <div
      key={`${prefix}-${idx}`}
      className="shrink-0 w-[340px] md:w-[380px] bg-white border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-between cursor-default transition-all hover:border-accent/50 hover:shadow-md"
    >
      <div>
        <div className="flex text-yellow-400 mb-4">
          {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-current" />)}
        </div>
        <p className="text-text-secondary italic leading-relaxed mb-6 text-sm">"{t.text}"</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
          <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="font-bold text-sm text-text-primary">{t.name}</p>
          <p className="text-xs text-accent font-medium">{t.course}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden flex flex-col gap-6 testimonials-track py-4">
      {/* Máscaras de gradiente para esfumaçar as bordas e remover a delimitação seca dos cards */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-48 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 md:w-48 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

      {/* Primeira fileira (Cima) - movimento normal para a esquerda */}
      <div className="flex gap-6 w-max animate-marquee">
        {ROW1_LOOP.map((t, idx) => renderCard(t, idx, 'top'))}
      </div>

      {/* Segunda fileira (Baixo) - depoimentos novos, movimento reverso para a direita */}
      <div className="flex gap-6 w-max animate-marquee-reverse">
        {ROW2_LOOP.map((t, idx) => renderCard(t, idx, 'bottom'))}
      </div>
    </div>
  );
}


