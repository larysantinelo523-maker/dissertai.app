import { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { BookOpen, Loader2, ArrowLeft, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '../components/ui/Base';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const TESTIMONIALS = [
  {
    name: "Lucas Silva",
    course: "Aprovado em Administração • PROUNI",
    avatar: "/avatars/avatar2.jpg",
    text: "A velocidade é absurda. Antigamente esperava 1 semana pro cursinho devolver a redação. Aqui, em 5s sei no que errei. Minha nota saltou de 420 para 720.",
  },
  {
    name: "Maria Eduarda",
    course: "Aprovada em Pedagogia • ENEM 780",
    avatar: "/avatars/avatar1.jpg",
    text: "Eu estava travada nos 500 pontos há meses. Com as correções detalhadas do Disserta.ai, descobri que meu problema era a Competência 3. Foquei nisso e tirei 780 no ENEM!",
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
  {
    name: "Rafael Santos",
    course: "Aprovado em Engenharia Civil • ENEM 920",
    avatar: "/avatars/avatar8.jpg",
    text: "Eu travava na hora de escrever a proposta de intervenção — sempre perdia pontos na C5. O Disserta identificou isso na primeira correção e me ensinou a estrutura certa.",
  },
  {
    name: "Camila Rodrigues",
    course: "Aprovada em Letras • FUVEST",
    avatar: "/avatars/novo1.jpg",
    text: "Sempre tive dificuldade com a norma culta. O Disserta.ai me forçou a sair da zona de conforto com correções cirúrgicas. A evolução foi nítida, de 400 na primeira para 760 no dia da prova.",
  },
  {
    name: "Bruno Souza",
    course: "Auditor Fiscal • Receita Federal",
    avatar: "/avatars/novo5.jpg",
    text: "Em concursos de alto nível cada décimo conta. A nota exata por competência que o sistema dá foi essencial pra eu focar onde estava mais fraco. O rigor da plataforma é o grande diferencial.",
  }
];

export function Login() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  
  // Modal "Esqueci minha senha"
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success' | 'not_found'>('idle');

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Se já estiver logado, manda pro dashboard
  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TEMPORARY BYPASS
      if (email === 'usuario1@gmail.com' && password === '12345678') {
        localStorage.setItem('temp_auth', 'true');
        // Usar window.location para forçar recarregamento do AuthContext
        window.location.href = '/dashboard';
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos.');
        }
        throw error;
      }

      // O ProtectedRoute ou DashboardLayout se encarregará de buscar o role
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotStatus('loading');
    try {
      // 1. Verifica se o e-mail existe no banco de dados
      const { data, error: dbError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('email', forgotEmail)
        .maybeSingle();

      if (dbError) throw dbError;

      // Se não encontrou, exibe estado para convidar ao cadastro
      if (!data) {
        setForgotStatus('not_found');
        return;
      }

      // 2. Se encontrou, envia o link de redefinição
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setForgotStatus('success');
    } catch (err) {
      console.error(err);
      // Se houver erro inesperado, podemos voltar para idle e talvez mostrar um toast (simplificado aqui)
      setForgotStatus('idle');
      alert('Ocorreu um erro ao tentar recuperar a senha. Tente novamente mais tarde.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* TOPO (mobile) / ESQUERDA (desktop): Formulário de Login */}
      <div className="lg:order-1 w-full lg:w-1/2 flex flex-col items-center justify-center p-8 pt-30 pb-10 lg:py-8 bg-white overflow-y-auto relative">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-text-secondary hover:text-accent transition-colors mb-16 text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para o início
          </Link>

          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <BookOpen size={24} />
            </div>
            <span className="text-2xl font-black text-text-primary">Disserta.ai</span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-2">Bem-vindo de volta!</h1>
          <p className="text-text-secondary mb-8">Acesse sua conta para continuar evoluindo.</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-bg border border-border rounded-xl text-text-primary outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 bg-bg border border-border rounded-xl text-text-primary outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <button 
                  type="button" 
                  onClick={() => {
                    setForgotEmail(email); // Preenche com o email já digitado, se houver
                    setForgotStatus('idle');
                    setShowForgotModal(true);
                  }}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Entrar na Plataforma'}
            </Button>
          </form>

          <p className="text-center text-text-secondary mt-8 text-sm">
            Ainda não tem uma conta?{' '}
            <Link to="/cadastro" className="text-accent font-bold hover:underline">Comece grátis aqui</Link>
          </p>
        </div>
      </div>

      {/* BAIXO (mobile) / DIREITA (desktop): Banner com provas sociais */}
      <div className="lg:order-2 w-full lg:w-1/2 bg-bg flex flex-col justify-center p-8 py-10 lg:p-12 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col max-w-lg mx-auto w-full gap-5">
          {/* Card do depoimento — padding e margin negativa para dar espaço à sombra sem ser cortada pelo overflow */}
          <div className="relative overflow-hidden px-4 py-8 -mx-4 -my-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white/70 backdrop-blur-xl border border-white/50 p-6 lg:p-8 rounded-3xl shadow-xl flex flex-col gap-4 overflow-hidden"
              >
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={17} className="fill-current" />)}
                </div>
                {/* line-clamp garante que o texto nunca saia do card */}
                <p className="text-sm lg:text-base text-text-primary font-medium italic leading-relaxed line-clamp-4">
                  "{TESTIMONIALS[testimonialIndex].text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <img src={TESTIMONIALS[testimonialIndex].avatar} alt={TESTIMONIALS[testimonialIndex].name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-text-primary">{TESTIMONIALS[testimonialIndex].name}</p>
                    <p className="text-xs text-accent font-medium">{TESTIMONIALS[testimonialIndex].course}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modal de Esqueci Minha Senha */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8"
            >
              {forgotStatus === 'success' ? (
                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mb-4">
                    <Star size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">E-mail Enviado!</h3>
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    Enviamos as instruções de recuperação para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada (e o spam).
                  </p>
                  <Button onClick={() => setShowForgotModal(false)} className="w-full">
                    Voltar para o Login
                  </Button>
                </div>
              ) : forgotStatus === 'not_found' ? (
                <div className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">E-mail não cadastrado</h3>
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    Hmm... Não encontramos nenhuma conta com o e-mail <strong>{forgotEmail}</strong>. Que tal criar uma conta agora e dar o primeiro passo rumo à nota 1000?
                  </p>
                  <div className="flex flex-col gap-3 w-full">
                    <Button onClick={() => navigate('/cadastro')} className="w-full">
                      Quero criar minha conta
                    </Button>
                    <Button variant="ghost" onClick={() => setForgotStatus('idle')} className="w-full">
                      Tentar com outro e-mail
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="flex flex-col">
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Recuperar Senha</h3>
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    Digite o e-mail que você usou no cadastro. Enviaremos um link para você cadastrar uma nova senha.
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-text-primary mb-1.5">E-mail cadastrado</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full p-3 bg-bg border border-border rounded-xl text-text-primary outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
                      placeholder="seu@email.com"
                      disabled={forgotStatus === 'loading'}
                    />
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1"
                      disabled={forgotStatus === 'loading'}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1"
                      disabled={forgotStatus === 'loading'}
                    >
                      {forgotStatus === 'loading' ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Enviar Link'}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
