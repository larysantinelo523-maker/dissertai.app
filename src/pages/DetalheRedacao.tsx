import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, AlertCircle, PlusCircle,
  Minus, Plus, ChevronRight,
} from 'lucide-react';
import { Button, Badge, cn } from '../components/ui/Base';
import { LanguageAlertPanel } from '../components/ui/LanguageAlertPanel';
import { useAppStore } from '../store/useAppStore';
import { CorrectionResult, CompetencyScore } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getScoreVariant(score: number, max: number): 'success' | 'warning' | 'danger' {
  const pct = (score / max) * 100;
  if (pct >= 80) return 'success';
  if (pct >= 50) return 'warning';
  return 'danger';
}

function ScoreLabel({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100;
  const label = pct >= 80 ? 'Excelente' : pct >= 50 ? 'Médio' : 'Insuficiente';
  const cls =
    pct >= 80
      ? 'bg-success/10 text-success'
      : pct >= 50
      ? 'bg-warning/10 text-warning'
      : 'bg-danger/10 text-danger';
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-bold', cls)}>{label}</span>
  );
}

// ─── Competency Card (reutilizado da NovaRedacao) ─────────────────────────────
function CompetencyCard({
  comp,
  variant,
}: {
  comp: CompetencyScore;
  variant: 'success' | 'warning' | 'danger';
}) {
  const [isOpen, setIsOpen] = useState(false);
  const color =
    variant === 'success'
      ? 'text-success'
      : variant === 'warning'
      ? 'text-warning'
      : 'text-danger';

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
          <span className={cn('text-xs font-bold font-mono', color)}>
            {comp.score} / {comp.maxScore}
          </span>
          <Plus
            size={16}
            className={cn(
              'text-text-muted transition-transform group-hover:text-accent',
              isOpen && 'rotate-45'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              Parecer do Avaliador
            </h5>
            <p className="text-sm text-text-secondary leading-relaxed first-letter:text-2xl first-letter:font-serif first-letter:mr-1 first-letter:float-left">
              {comp.feedback}
            </p>
          </div>

          {comp.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comp.highlights.map((h, i) => (
                <span
                  key={i}
                  className="bg-highlight px-2 py-0.5 rounded text-[10px] font-medium text-accent border border-accent/10 italic"
                >
                  "{h}"
                </span>
              ))}
            </div>
          )}

          <div className="bg-bg/40 border-l-4 border-accent p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={14} className="text-accent mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-[10px] font-bold uppercase text-accent">Ponto de Atenção</h5>
                <p className="text-xs text-text-secondary leading-relaxed">
                  A nota atribuída reflete sua proficiência em{' '}
                  <span className="font-semibold">{comp.name.toLowerCase()}</span>. Observe os
                  destaques em itálico e busque maior precisão nas conexões sentenciais.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Painel de resultado completo ─────────────────────────────────────────────
function CorrectionPanel({ correction }: { correction: CorrectionResult }) {
  const shortNames = ['Gramática', 'Tema', 'Lógica', 'Coesão', 'Proposta'];

  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Pontuação Final
            </h3>
            <div className="text-4xl font-bold text-accent">
              {correction.totalScore}{' '}
              <span className="text-xl text-text-muted font-normal">/ {correction.maxTotalScore}</span>
            </div>
          </div>
          <ScoreLabel score={correction.totalScore} max={correction.maxTotalScore} />
        </div>

        <div className="w-full h-1.5 bg-accent-light rounded-full overflow-hidden mb-6">
          <div
            className={cn(
              'h-full transition-all duration-1000 ease-out',
              getScoreVariant(correction.totalScore, correction.maxTotalScore) === 'success'
                ? 'bg-success'
                : getScoreVariant(correction.totalScore, correction.maxTotalScore) === 'warning'
                ? 'bg-warning'
                : 'bg-danger'
            )}
            style={{ width: `${(correction.totalScore / correction.maxTotalScore) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {correction.competencies.map((comp, idx) => (
            <div
              key={comp.id}
              className="flex flex-col items-center p-2 bg-bg rounded-md border border-transparent group relative"
            >
              <span className="text-[10px] font-bold text-text-secondary mb-1">C{idx + 1}</span>
              <span
                className={cn(
                  'text-sm font-bold',
                  getScoreVariant(comp.score, comp.maxScore) === 'success'
                    ? 'text-success'
                    : getScoreVariant(comp.score, comp.maxScore) === 'warning'
                    ? 'text-warning'
                    : 'text-danger'
                )}
              >
                {comp.score}
              </span>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {shortNames[idx]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competency Cards */}
      <div className="space-y-4">
        {correction.competencies.map((comp) => (
          <CompetencyCard
            key={comp.id}
            comp={comp}
            variant={getScoreVariant(comp.score, comp.maxScore)}
          />
        ))}
      </div>

      {/* General Suggestions */}
      {correction.generalSuggestions.length > 0 && (
        <div className="animate-in fade-in duration-700">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 px-1">
            Explicação &amp; Sugestões
          </h4>
          <ul className="space-y-3">
            {correction.generalSuggestions.map((suggestion, idx) => (
              <li key={idx} className="flex gap-3 text-sm">
                <span className="w-5 h-5 bg-accent text-white flex-shrink-0 flex items-center justify-center rounded-full text-[10px] font-bold">
                  {idx + 1}
                </span>
                <p className="text-text-secondary leading-relaxed">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewritten Essay */}
      {correction.rewrittenEssay && (
        <div className="bg-white border border-accent/20 rounded-lg overflow-hidden animate-in fade-in duration-700">
          <div className="bg-accent p-4 flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={16} />
              Sugestão de Reescrita (Upgrade Nota 1000)
            </h4>
            <Badge className="bg-white/20 text-white border-none">Versão Otimizada</Badge>
          </div>
          <div className="p-6 bg-accent-light/30">
            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-text-primary">
              {correction.rewrittenEssay}
            </pre>
            <div className="mt-4 pt-4 border-t border-accent/10 flex items-center gap-2 text-[10px] text-accent font-semibold italic">
              <PlusCircle size={12} />
              Dica: As marcações "✓" indicam alterações sugeridas para elevar sua pontuação.
            </div>
          </div>
        </div>
      )}

      {/* Checkmate Card */}
      {correction.whyNotPerfect && (
        <div className="rounded-lg overflow-hidden border border-danger/40 animate-in fade-in duration-700">
          <div className="bg-danger px-5 py-3 flex items-center gap-3">
            <AlertCircle size={16} className="text-white shrink-0" />
            <h4 className="text-sm font-bold text-white tracking-wide">
              Por que você não tirou 1000?
            </h4>
          </div>
          <div className="bg-danger/5 px-5 py-4 flex items-start gap-3">
            <div className="mt-0.5 text-danger shrink-0 text-lg font-black leading-none">✗</div>
            <p className="text-sm text-danger/90 leading-relaxed font-medium">
              {correction.whyNotPerfect}
            </p>
          </div>
        </div>
      )}

      {/* Alerta de Linguagem */}
      {correction.languageAlerts && correction.languageAlerts.length > 0 && (
        <LanguageAlertPanel alerts={correction.languageAlerts} />
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function DetalheRedacao() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getEssayById = useAppStore((s) => s.getEssayById);

  const essay = id ? getEssayById(id) : undefined;

  if (!essay || !essay.result) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <FileText size={48} className="text-text-muted mb-4 opacity-40" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">Redação não encontrada</h3>
        <p className="text-text-secondary text-sm mb-6 max-w-sm">
          Esta correção não foi encontrada. Ela pode ter sido excluída.
        </p>
        <Button variant="secondary" onClick={() => navigate('/dashboard/minhas-redacoes')}>
          <ArrowLeft size={16} className="mr-2" />
          Voltar ao Histórico
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-full">
      {/* Header */}
      <div className="px-4 md:px-8 py-4 md:py-5 border-b border-border bg-white flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate('/dashboard/minhas-redacoes')}
          className="text-text-muted hover:text-accent transition-colors p-1.5 rounded-md hover:bg-accent/10"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-muted mb-0.5 uppercase tracking-widest font-semibold">
            {essay.exam} · {new Date(essay.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </p>
          <h2 className="text-base font-bold text-text-primary truncate">{essay.title}</h2>
        </div>
        <Badge variant={essay.result.totalScore > essay.result.maxTotalScore * 0.8 ? 'success' : 'warning'}>
          {essay.result.totalScore} / {essay.result.maxTotalScore}
        </Badge>
      </div>

      {/* Content: stack on mobile, two columns on lg */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 lg:divide-x lg:divide-border lg:flex-1 lg:overflow-hidden">
        {/* Left: original essay */}
        <section className="p-4 md:p-8 lg:overflow-y-auto bg-white border-b border-border lg:border-b-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
            Texto Original
          </h3>
          <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-text-primary">
            {essay.content}
          </pre>
        </section>

        {/* Right: correction panel */}
        <section className="p-4 md:p-8 lg:overflow-y-auto bg-bg/30">
          <CorrectionPanel correction={essay.result} />
        </section>
      </div>
    </div>
  );
}
