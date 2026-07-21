import { useState, useMemo, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, ArrowLeft, Loader2, Check, X, Eye, EyeOff } from 'lucide-react';
import { Button, cn } from '../components/ui/Base';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0
  })
};

export function SignupQuiz() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [painPoint, setPainPoint] = useState('');
  const [targetScore, setTargetScore] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Fake Loading states
  const [loadingStage, setLoadingStage] = useState(0);

  const nextStep = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const passwordStrength = useMemo(() => {
    let score = 0;
    const rules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (rules.length) score += 1;
    if (rules.uppercase) score += 1;
    if (rules.number) score += 1;
    if (rules.special) score += 1;

    let level: 'none' | 'weak' | 'medium' | 'strong' = 'none';
    let color = 'bg-border';
    let label = '';

    if (password.length === 0) {
      level = 'none';
    } else if (score <= 2) {
      level = 'weak';
      color = 'bg-danger';
      label = 'Fraca';
    } else if (score === 3) {
      level = 'medium';
      color = 'bg-warning';
      label = 'Média';
    } else if (score === 4) {
      level = 'strong';
      color = 'bg-success';
      label = 'Forte';
    }

    return { score, level, color, label, rules };
  }, [password]);

  const handleCreateAccount = async () => {
    if (passwordStrength.level !== 'strong') {
      setError('A senha deve ser forte para continuar.');
      return;
    }

    setError(null);
    setDirection(1);
    setStep(7); // Vai para a tela de processamento

    // Simula o processamento da IA
    setTimeout(() => setLoadingStage(1), 2000);
    setTimeout(() => setLoadingStage(2), 4000);

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone,
            quiz_goal: goal,
            quiz_pain: painPoint,
            quiz_target: targetScore
          }
        }
      });
      if (error) throw error;
      
      if (data?.user) {
        await supabase.from('user_roles').insert({ 
          id: data.user.id, 
          role: 'user',
          nome: name.trim(),
          email: email,
          telefone: phone,
          objetivo: goal,
          maior_desafio: painPoint,
          meta_nota: targetScore
        });
      }

      // Aguarda o término da animação fake
      setTimeout(() => {
        navigate('/dashboard');
      }, 5500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a conta.');
      setStep(6); // Volta para a senha
    }
  };

  if (authLoading) return <div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>;
  if (user && step !== 7) return <Navigate to="/dashboard" replace />;

  const steps = [
    // Passo 0: Nome
    <div key="step-0" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Qual o seu nome completo?</h2>
      <p className="text-text-secondary mb-8 text-sm">Vamos personalizar sua experiência desde o primeiro momento.</p>
      <input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name.trim() && nextStep()}
        className="w-full p-4 bg-bg border border-border rounded-xl text-lg text-text-primary outline-none focus:ring-2 focus:ring-accent/40 mb-6"
        placeholder="Digite seu nome..."
      />
      <Button size="lg" onClick={nextStep} disabled={!name.trim()} className="w-full">Continuar <ArrowRight size={18} className="ml-2" /></Button>
    </div>,

    // Passo 1: Objetivo
    <div key="step-1" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Prazer, {name.split(' ')[0]}! 👋</h2>
      <p className="text-text-secondary mb-8 text-sm">A redação é o obstáculo que mais reprova. Qual é o seu foco principal agora?</p>
      <div className="grid gap-3 mb-6">
        {['ENEM / Vestibulares', 'Carreiras Policiais', 'Carreiras Bancárias', 'Tribunais / Administrativo', 'Outro Concurso'].map(opt => (
          <button
            key={opt}
            onClick={() => { setGoal(opt); nextStep(); }}
            className={cn("p-4 rounded-xl border text-left transition-all font-medium text-sm hover:border-accent hover:bg-accent/5", goal === opt ? "border-accent bg-accent/5 text-accent" : "border-border text-text-primary bg-white")}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>,

    // Passo 2: Dor
    <div key="step-2" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Excelente escolha!</h2>
      <p className="text-text-secondary mb-8 text-sm">A maioria dos candidatos para {goal} sofre com a discursiva. Qual o seu maior desafio hoje?</p>
      <div className="grid gap-3 mb-6">
        {['Dá "branco" na hora de escrever', 'Escrevo bem, mas minha nota não sobe', 'Falta de vocabulário e repertório', 'Não entendo os critérios da banca', 'Não tenho quem corrija meus textos'].map(opt => (
          <button
            key={opt}
            onClick={() => { setPainPoint(opt); nextStep(); }}
            className={cn("p-4 rounded-xl border text-left transition-all font-medium text-sm hover:border-accent hover:bg-accent/5", painPoint === opt ? "border-accent bg-accent/5 text-accent" : "border-border text-text-primary bg-white")}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>,

    // Passo 3: Meta
    <div key="step-3" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">O Disserta resolve exatamente isso.</h2>
      <p className="text-text-secondary mb-8 text-sm">Com correções detalhadas em 5 segundos, você vai evoluir rápido. Qual sua meta de nota?</p>
      <div className="grid gap-3 mb-6">
        {['Quero a nota máxima (Gabaritar)', 'Quero uma nota muito competitiva', 'Quero apenas o mínimo para passar'].map(opt => (
          <button
            key={opt}
            onClick={() => { setTargetScore(opt); nextStep(); }}
            className={cn("p-4 rounded-xl border text-left transition-all font-medium text-sm hover:border-accent hover:bg-accent/5", targetScore === opt ? "border-accent bg-accent/5 text-accent" : "border-border text-text-primary bg-white")}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>,

    // Passo 4: Telefone
    <div key="step-4" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Vamos bater essa meta! 🎯</h2>
      <p className="text-text-secondary mb-8 text-sm">Qual o seu WhatsApp? Vamos usá-lo para enviar avisos cruciais sobre sua evolução.</p>
      <input
        type="tel"
        autoFocus
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && phone.trim() && nextStep()}
        className="w-full p-4 bg-bg border border-border rounded-xl text-lg text-text-primary outline-none focus:ring-2 focus:ring-accent/40 mb-6"
        placeholder="(00) 00000-0000"
      />
      <Button size="lg" onClick={nextStep} disabled={!phone.trim()} className="w-full">Continuar <ArrowRight size={18} className="ml-2" /></Button>
    </div>,

    // Passo 5: Email
    <div key="step-5" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Estamos quase lá!</h2>
      <p className="text-text-secondary mb-8 text-sm">Qual o e-mail que você vai usar para acessar a plataforma?</p>
      <input
        type="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && email.includes('@') && nextStep()}
        className="w-full p-4 bg-bg border border-border rounded-xl text-lg text-text-primary outline-none focus:ring-2 focus:ring-accent/40 mb-6"
        placeholder="seu@email.com"
      />
      <Button size="lg" onClick={nextStep} disabled={!email.includes('@')} className="w-full">Continuar <ArrowRight size={18} className="ml-2" /></Button>
    </div>,

    // Passo 6: Senha
    <div key="step-6" className="flex flex-col h-full justify-center">
      <h2 className="text-2xl font-bold text-text-primary mb-2">Crie sua senha de acesso</h2>
      <p className="text-text-secondary mb-6 text-sm">Para proteger suas redações e garantir a segurança do seu progresso.</p>
      
      <div className="relative mb-2">
        <input
          type={showPassword ? 'text' : 'password'}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && passwordStrength.level === 'strong' && handleCreateAccount()}
          className="w-full p-4 pr-12 bg-bg border border-border rounded-xl text-lg text-text-primary outline-none focus:ring-2 focus:ring-accent/40"
          placeholder="Sua senha secreta"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {password.length > 0 && (
        <div className="p-4 bg-bg rounded-xl mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary">Força da senha:</span>
            <span className={cn("text-xs font-bold", `text-${passwordStrength.color.split('-')[1]}`)}>
              {passwordStrength.label}
            </span>
          </div>
          <div className="flex gap-1 h-1.5 mb-3">
            <div className={cn("flex-1 rounded-full transition-colors duration-300", passwordStrength.score >= 1 ? passwordStrength.color : "bg-border")} />
            <div className={cn("flex-1 rounded-full transition-colors duration-300", passwordStrength.score >= 3 ? passwordStrength.color : "bg-border")} />
            <div className={cn("flex-1 rounded-full transition-colors duration-300", passwordStrength.score === 4 ? passwordStrength.color : "bg-border")} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
            <div className="flex items-center gap-1.5">{passwordStrength.rules.length ? <Check size={12} className="text-success" /> : <X size={12} className="text-danger" />} <span>8 caracteres</span></div>
            <div className="flex items-center gap-1.5">{passwordStrength.rules.uppercase ? <Check size={12} className="text-success" /> : <X size={12} className="text-danger" />} <span>Letra Maiúscula</span></div>
            <div className="flex items-center gap-1.5">{passwordStrength.rules.number ? <Check size={12} className="text-success" /> : <X size={12} className="text-danger" />} <span>Número</span></div>
            <div className="flex items-center gap-1.5">{passwordStrength.rules.special ? <Check size={12} className="text-success" /> : <X size={12} className="text-danger" />} <span>Caractere Especial</span></div>
          </div>
        </div>
      )}

      {error && <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm mb-4">{error}</div>}

      <Button size="lg" onClick={handleCreateAccount} disabled={passwordStrength.level !== 'strong'} className="w-full">
        Criar conta e Começar <ArrowRight size={18} className="ml-2" />
      </Button>
    </div>,

    // Passo 7: Loading Fake
    <div key="step-7" className="flex flex-col h-full items-center justify-center text-center">
      <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 border-4 border-t-accent border-r-transparent border-b-transparent border-l-transparent rounded-2xl" />
        <BookOpen size={32} />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Preparando sua IA...</h2>
      <div className="h-6 overflow-hidden relative w-full flex justify-center">
        <AnimatePresence mode="wait">
          {loadingStage === 0 && <motion.p key="l0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-text-secondary text-sm absolute">Criando seu perfil de estudante...</motion.p>}
          {loadingStage === 1 && <motion.p key="l1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-text-secondary text-sm absolute">Configurando os critérios de correção para {goal || 'o concurso'}...</motion.p>}
          {loadingStage === 2 && <motion.p key="l2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-accent font-semibold text-sm absolute">Tudo pronto! Entrando na plataforma...</motion.p>}
        </AnimatePresence>
      </div>
    </div>
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="p-6 flex justify-between items-center z-20">
        <button 
          onClick={() => step > 0 && step < 7 ? prevStep() : navigate('/')} 
          className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors font-medium text-sm"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        {step < 7 && (
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-6 bg-accent" : i < step ? "w-2 bg-accent/40" : "w-2 bg-border")} />
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div className="w-full max-w-md relative h-[450px]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="absolute w-full h-full bg-white border border-border rounded-2xl shadow-sm p-8"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
