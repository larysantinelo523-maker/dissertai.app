import { useState, useRef } from 'react';
import { Search, Loader2, Plus, ChevronRight, Highlighter as Highlight, AlertCircle, Camera, Sparkles } from 'lucide-react';
import { Button, Badge, cn } from '../components/ui/Base';
import { LanguageAlertPanel } from '../components/ui/LanguageAlertPanel';
import { RewrittenEssayViewer } from '../components/ui/RewrittenEssayViewer';
import { Input, Textarea } from '../components/ui/Form';
import { useAppStore } from '../store/useAppStore';
import { ExamType } from '../types';
import { correctionService } from '../services/correctionService';
import { ocrService } from '../services/ocrService';

export function NovaRedacao() {
  const { 
    currentEssay, 
    setEssayTitle, 
    setEssayContent, 
    setExam, 
    isCorrecting, 
    setCorrecting, 
    addCorrection, 
    lastCorrection,
    phase,
    setPhase,
    correctionError,
    setCorrectionError,
  } = useAppStore();
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [showRewrittenModal, setShowRewrittenModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsExtracting(true);
      setCorrectionError(null);

      // Converte a imagem para Base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = reader.result as string;
          const extractedText = await ocrService.extractTextFromImage(base64String);
          
          if (extractedText) {
            setEssayContent(extractedText);
            if (!currentEssay.title) {
              setEssayTitle('Redação Escaneada');
            }
          } else {
            setCorrectionError('Não foi possível encontrar texto legível na imagem.');
          }
        } catch (error: any) {
          setCorrectionError(error.message || 'Erro ao extrair texto da imagem.');
        } finally {
          setIsExtracting(false);
          // Limpa o input para poder subir a mesma imagem de novo se quiser
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setCorrectionError('Erro ao ler o arquivo de imagem.');
        setIsExtracting(false);
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      setCorrectionError(error.message || 'Erro inesperado no OCR.');
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentEssay.title || !currentEssay.content) return;
    
    setCorrectionError(null);
    setCorrecting(true);
    try {
      const result = await correctionService.correctEssay(
        currentEssay.title,
        currentEssay.content,
        currentEssay.exam
      );
      addCorrection(result);
      setPhase('ANALYZED');
    } catch (error: any) {
      console.error(error);
      setCorrectionError(
        error?.message ?? 'Erro ao conectar com a OpenAI. Verifique a chave de API e tente novamente.'
      );
    } finally {
      setCorrecting(false);
    }
  };

  const handleFullCorrection = () => {
    setPhase('CORRECTED');
  };

  const getScoreVariant = (score: number, max: number) => {
    const percent = (score / max) * 100;
    if (percent >= 80) return 'success';
    if (percent >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 lg:divide-x lg:divide-border lg:h-full">
      {/* Left Column - Input */}
      <section className="p-4 md:p-8 flex flex-col gap-5 bg-white lg:overflow-y-auto">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-text-primary">Banca do Exame</label>
          <div className="flex flex-wrap border border-border rounded-md overflow-hidden min-h-[40px]">
            {(['ENEM', 'SSA', 'CESAR', 'UNICAP'] as ExamType[]).map((exam) => (
              <button
                key={exam}
                onClick={() => setExam(exam)}
                disabled={phase !== 'IDLE'}
                className={cn(
                  'flex-1 min-w-[60px] text-xs font-semibold transition-all border-l first:border-l-0 border-border py-2',
                  currentEssay.exam === exam
                    ? 'bg-accent text-white'
                    : 'bg-white text-text-secondary hover:bg-accent-light',
                  phase !== 'IDLE' && 'opacity-50 cursor-not-allowed'
                )}
              >
                {exam}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Input 
            label="Tema da redação"
            placeholder="Ex: O impacto das redes sociais na saúde mental dos jovens"
            value={currentEssay.title}
            onChange={(e) => setEssayTitle(e.target.value)}
            className="text-sm"
            disabled={phase !== 'IDLE'}
          />
        </div>

        <div className="flex flex-col gap-2 flex-1 min-h-[220px] md:min-h-[300px]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-text-primary">Texto da redação</label>
              <button 
                onClick={() => setShowScannerModal(true)}
                disabled={isExtracting || phase !== 'IDLE'}
                className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 hover:bg-accent/20 px-2.5 py-1.5 rounded-md transition-colors"
              >
                {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                {isExtracting ? 'Extraindo texto...' : 'Escanear Foto'}
              </button>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload} 
              />
            </div>
            <button 
              id="demo-fill-button"
              onClick={() => {
                setEssayTitle("A Importância da Educação Midiática no Brasil");
                setEssayContent("A polarização política e a disseminação de notícias falsas têm se revelado obstáculos significativos para o desenvolvimento democrático do Brasil contemporâneo. Desde a popularização das redes sociais como principal fonte de informação, o debate público saudável foi gradualmente substituído por discursos de ódio. A longo prazo, a divergência de opiniões, que deveria ser o pilar de uma democracia, transforma-se em inimizade, inviabilizando o diálogo entre diferentes setores da sociedade e esgarçando o tecido social de maneira preocupante.\n\nAlém disso, a instrumentalização dessa polarização por agentes políticos agrava ainda mais a situação vigente. Em vez de proporem políticas públicas voltadas para o bem comum e para a estabilidade econômica, muitos líderes adotam narrativas populistas apenas para fidelizar suas bases eleitorais mais extremistas. Esse fenômeno gera um estado constante de instabilidade institucional, no qual o avanço de pautas essenciais para o país acaba sendo paralisado por disputas puramente partidárias.\n\nPortanto, medidas urgentes são necessárias para mitigar os efeitos nocivos dessa cisão. Cabe ao Ministério da Educação, em parceria com as secretarias estaduais, implementar campanhas obrigatórias de letramento digital. Somente através da educação constante nas escolas e na internet será possível capacitar a população a identificar fake news, permitindo assim que a sociedade volte a debater ideias divergentes com racionalidade e respeito mútuo.");
              }}
              className="text-xs text-accent underline opacity-0 hover:opacity-100"
            >
              Preencher Auto
            </button>
          </div>
          <div className="relative flex-1">
            <textarea 
              className={cn(
                "w-full h-full p-4 border border-border rounded-md text-base outline-none focus:ring-2 focus:ring-accent resize-none leading-relaxed text-text-primary font-serif transition-colors",
                phase !== 'IDLE' && "bg-bg/10"
              )}
              placeholder="Inicie aqui o seu texto..."
              value={currentEssay.content}
              onChange={(e) => setEssayContent(e.target.value)}
              disabled={phase !== 'IDLE'}
            />
            <span className="absolute bottom-3 right-4 text-[10px] text-text-muted font-mono">
              {currentEssay.content.length} / 3000 caracteres
            </span>
          </div>
        </div>

        {phase === 'IDLE' ? (
          <Button 
            onClick={handleAnalyze} 
            className="w-full h-12"
            disabled={isCorrecting || !currentEssay.title || !currentEssay.content}
          >
            {isCorrecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                Analisar Redação &rarr;
              </>
            )}
          </Button>
        ) : (
          <Button 
            variant="secondary"
            onClick={() => {
              setPhase('IDLE');
              setEssayTitle('');
              setEssayContent('');
              setCorrectionError(null);
            }} 
            className="w-full h-12"
          >
            Escrever Nova Redação
          </Button>
        )}
      </section>

      {/* Right Column - Results */}
      <section className="p-4 md:p-8 flex flex-col gap-6 bg-bg/30 lg:overflow-y-auto border-t border-border lg:border-t-0">
        {correctionError && (
          <div className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-danger mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-danger mb-1">Erro na correção</p>
              <p className="text-xs text-danger/80 leading-relaxed">{correctionError}</p>
            </div>
          </div>
        )}
        {phase === 'IDLE' && !isCorrecting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 bg-white border border-border flex items-center justify-center rounded-full mb-6">
              <Search size={32} className="text-text-muted" />
            </div>
            <h4 className="text-lg font-semibold text-text-primary mb-2">Aguardando análise</h4>
            <p className="text-text-muted max-w-[280px] text-sm">Sua análise detalhada aparecerá neste painel assim que você iniciar o processo.</p>
          </div>
        ) : isCorrecting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <Loader2 className="h-12 w-12 text-accent animate-spin mb-6" />
            <h4 className="text-lg font-semibold text-text-primary mb-2">O motor de análise Disserta.ai está avaliando sua redação...</h4>
            <p className="text-text-muted text-sm">Cruzando dados com os critérios da banca {currentEssay.exam}. Isso pode levar alguns segundos.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Score Summary Card */}
            <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">Pontuação Parcial</h3>
                  <div className="text-4xl font-bold text-accent">
                    {lastCorrection!.totalScore} <span className="text-xl text-text-muted font-normal">/ {lastCorrection!.maxTotalScore}</span>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  getScoreVariant(lastCorrection!.totalScore, lastCorrection!.maxTotalScore) === 'success' ? "bg-success/10 text-success" :
                  getScoreVariant(lastCorrection!.totalScore, lastCorrection!.maxTotalScore) === 'warning' ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
                )}>
                  {(() => { const pct = (lastCorrection!.totalScore / lastCorrection!.maxTotalScore) * 100; return pct >= 80 ? 'Excelente' : pct >= 50 ? 'Médio' : 'Insuficiente'; })()}
                </div>
              </div>
              
              <div className="w-full h-1.5 bg-accent-light rounded-full overflow-hidden mb-6">
                <div 
                  className={cn(
                    "h-full transition-all duration-1000 ease-out",
                    getScoreVariant(lastCorrection!.totalScore, lastCorrection!.maxTotalScore) === 'success' ? "bg-success" :
                    getScoreVariant(lastCorrection!.totalScore, lastCorrection!.maxTotalScore) === 'warning' ? "bg-warning" : "bg-danger"
                  )}
                  style={{ width: `${(lastCorrection!.totalScore / lastCorrection!.maxTotalScore) * 100}%` }} 
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {lastCorrection!.competencies.map((comp, idx) => {
                  const shortNames = ['Gramática', 'Tema', 'Lógica', 'Coesão', 'Proposta'];
                  return (
                    <div key={comp.id} className="flex flex-col items-center p-2 bg-bg rounded-md border border-transparent group relative">
                      <span className="text-[10px] font-bold text-text-secondary mb-1">C{idx + 1}</span>
                      <span className={cn(
                        "text-sm font-bold",
                        getScoreVariant(comp.score, comp.maxScore) === 'success' ? "text-success" :
                        getScoreVariant(comp.score, comp.maxScore) === 'warning' ? "text-warning" : "text-danger"
                      )}>{comp.score}</span>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {shortNames[idx]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend for clarity */}
            <div className="bg-bg/50 rounded-lg p-4 border border-border/40">
              <h4 className="text-[10px] font-bold uppercase text-text-muted mb-2 tracking-widest">O que avaliamos:</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: 'C1', desc: 'Gramática e Ortografia' },
                  { label: 'C2', desc: 'Entendimento do Tema' },
                  { label: 'C3', desc: 'Organização e Lógica' },
                  { label: 'C4', desc: 'Uso de Conectivos' },
                  { label: 'C5', desc: 'Proposta de Solução' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-accent bg-accent/10 w-5 h-5 flex items-center justify-center rounded-full shrink-0">{item.label}</span>
                    <span className="text-[10px] text-text-secondary">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step to Correction */}
            {phase === 'ANALYZED' && (
              <div className="bg-accent-light border border-accent/20 rounded-lg p-6 text-center space-y-4">
                <p className="text-sm font-medium text-text-secondary">
                  A análise inicial está pronta. Deseja ver a correção completa com feedbacks detalhados e explicações?
                </p>
                <Button onClick={handleFullCorrection} className="w-full">
                  Corrigir Redação
                </Button>
              </div>
            )}

            {phase === 'CORRECTED' && (
              <>
                {/* Detailed Competencies */}
                <div className="space-y-4">
                  {lastCorrection!.competencies.map((comp) => (
                    <CompetencyCard 
                      key={comp.id} 
                      comp={comp} 
                      variant={getScoreVariant(comp.score, comp.maxScore)}
                    />
                  ))}
                </div>

                {/* General Suggestions */}
                <div className="animate-in fade-in duration-700 delay-300">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 px-1">Explicação & Sugestões</h4>
                  <ul className="space-y-3">
                    {lastCorrection!.generalSuggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="w-5 h-5 bg-accent text-white flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-text-secondary leading-relaxed">{suggestion}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rewritten Essay Button */}
                {lastCorrection!.rewrittenEssay && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 pt-4">
                    <Button 
                      onClick={() => setShowRewrittenModal(true)}
                      className="w-full h-14 bg-gradient-to-r from-success to-emerald-600 hover:from-success-dark hover:to-emerald-700 text-white shadow-lg shadow-success/20 flex items-center justify-center gap-2 group transition-all"
                    >
                      <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
                      Ver Versão Otimizada (Nota Máxima)
                    </Button>
                  </div>
                )}

                {/* Checkmate Card / Congratulations */}
                {(lastCorrection!.whyNotPerfect || lastCorrection!.totalScore === lastCorrection!.maxTotalScore) && (
                  <div className={cn(
                    "rounded-lg overflow-hidden border animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700",
                    lastCorrection!.totalScore === lastCorrection!.maxTotalScore ? "border-success/40" : "border-danger/40"
                  )}>
                    <div className={cn(
                      "px-5 py-3 flex items-center gap-3",
                      lastCorrection!.totalScore === lastCorrection!.maxTotalScore ? "bg-success" : "bg-danger"
                    )}>
                      {lastCorrection!.totalScore === lastCorrection!.maxTotalScore ? (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                          <span className="text-success text-xs font-bold">✓</span>
                        </div>
                      ) : (
                        <AlertCircle size={16} className="text-white shrink-0" />
                      )}
                      <h4 className="text-sm font-bold text-white tracking-wide">
                        {lastCorrection!.totalScore === lastCorrection!.maxTotalScore 
                          ? `Parabéns! Você atingiu a nota máxima para a banca ${lastCorrection!.exam}` 
                          : `Por que você não tirou ${lastCorrection!.maxTotalScore}?`}
                      </h4>
                    </div>
                    <div className={cn(
                      "px-5 py-4 flex items-start gap-3",
                      lastCorrection!.totalScore === lastCorrection!.maxTotalScore ? "bg-success/5" : "bg-danger/5"
                    )}>
                      {lastCorrection!.totalScore !== lastCorrection!.maxTotalScore && (
                        <div className="mt-0.5 text-danger shrink-0 text-lg font-black leading-none">✗</div>
                      )}
                      <p className={cn(
                        "text-sm leading-relaxed font-medium",
                        lastCorrection!.totalScore === lastCorrection!.maxTotalScore ? "text-success-dark text-emerald-800" : "text-danger/90"
                      )}>
                        {lastCorrection!.totalScore === lastCorrection!.maxTotalScore 
                          ? "Você atingiu a nota máxima, você está preparado para o exame. Boa sorte!"
                          : lastCorrection!.whyNotPerfect}
                      </p>
                    </div>
                  </div>
                )}

                {/* Alerta de Linguagem */}
                {lastCorrection!.languageAlerts && lastCorrection!.languageAlerts.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1000">
                    <LanguageAlertPanel alerts={lastCorrection!.languageAlerts} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* Modal Versão Otimizada */}
      {showRewrittenModal && lastCorrection?.rewrittenEssay && (
        <RewrittenEssayViewer 
          essayText={lastCorrection.rewrittenEssay}
          pedagogicalSummary={lastCorrection.pedagogicalSummary}
          onClose={() => setShowRewrittenModal(false)}
          onUseText={(text) => {
            setEssayContent(text);
            setEssayTitle(currentEssay.title || 'Versão Otimizada');
            setPhase('IDLE');
            setCorrectionError(null);
            setShowRewrittenModal(false);
            // Scroll to top of left panel so the user sees the text
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Modal de Dicas de Scanner */}
      {showScannerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-5">
                <Camera size={28} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Escanear Redação</h3>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                Para que a nossa Inteligência Artificial consiga ler seu texto perfeitamente, siga estas dicas rápidas:
              </p>
              
              <ul className="space-y-5 mb-10">
                <li className="flex gap-4">
                  <div className="mt-0.5 text-accent shrink-0"><Sparkles size={18} /></div>
                  <div className="text-sm text-text-primary leading-relaxed">
                    <strong>Boa iluminação:</strong> Tire a foto em um ambiente bem claro, preferencialmente usando a luz do dia.
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-0.5 text-accent shrink-0"><Highlight size={18} /></div>
                  <div className="text-sm text-text-primary leading-relaxed">
                    <strong>Evite sombras:</strong> Posicione o celular de forma que você não faça sombra em cima da folha de papel.
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-0.5 text-accent shrink-0"><Search size={18} /></div>
                  <div className="text-sm text-text-primary leading-relaxed">
                    <strong>Foco e nitidez:</strong> Segure firme para não borrar. Enquadre toda a folha na câmera e veja se as palavras estão legíveis antes de bater a foto.
                  </div>
                </li>
              </ul>

              <div className="flex gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowScannerModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={() => {
                    setShowScannerModal(false);
                    // Um pequeno delay garante que o modal feche suavemente antes de abrir a câmera nativa do aparelho
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                  className="flex-1"
                >
                  Tirar a Foto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompetencyCard({ comp, variant }: { comp: any, variant: 'success' | 'warning' | 'danger' }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const getStatusColor = () => {
    if (variant === 'success') return 'text-success';
    if (variant === 'warning') return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden group transition-all hover:border-accent/40 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-5 flex items-center justify-between hover:bg-bg/40 transition-colors"
      >
        <div className="flex-1">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-[10px]">
              C{comp.id}
            </span>
            {comp.name}
          </h4>
        </div>
        <div className="flex items-center gap-4">
          <span className={cn('text-xs font-bold font-mono', getStatusColor())}>
            {comp.score} / {comp.maxScore}
          </span>
          <Plus size={16} className={cn('text-text-muted transition-transform group-hover:text-accent', isOpen && 'rotate-45')} />
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Parecer do Avaliador</h5>
            <p className="text-sm text-text-secondary leading-relaxed first-letter:text-2xl first-letter:font-serif first-letter:mr-1 first-letter:float-left">
              {comp.feedback}
            </p>
          </div>
          
          {comp.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comp.highlights.map((h: string, i: number) => (
                <span key={i} className="bg-highlight px-2 py-0.5 rounded text-[10px] font-medium text-accent border border-accent/10 italic">
                  "{h}"
                </span>
              ))}
            </div>
          )}

          <div className="bg-bg/40 border-l-4 border-accent p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <AlertCircle size={14} className="text-accent" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[10px] font-bold uppercase text-accent">Ponto de Atenção</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  A nota atribuída reflete sua proficiência técnica em <span className="font-semibold">{comp.name.toLowerCase()}</span>. 
                  Para elevar este índice, observe os destaques em itálico e busque uma transição mais assertiva nas conexões sentenciais.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
