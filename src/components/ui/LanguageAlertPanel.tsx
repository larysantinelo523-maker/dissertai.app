import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, BookOpen, MessageCircleWarning } from 'lucide-react';
import { LanguageAlert, LanguageAlertCategory } from '../../types';
import { cn } from './Base';

// ─── Configuração visual por categoria ────────────────────────────────────────
const CATEGORY_CONFIG: Record<
  LanguageAlertCategory,
  { label: string; color: string; bg: string; border: string; icon: string }
> = {
  oralidade: {
    label: 'Marca de Oralidade',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '💬',
  },
  giria: {
    label: 'Gíria / Coloquialismo',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: '🚫',
  },
  concordancia: {
    label: 'Erro de Concordância',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '❌',
  },
  repeticao: {
    label: 'Repetição Viciada',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: '🔁',
  },
};

// ─── Card individual de alerta ────────────────────────────────────────────────
function AlertCard({ alert, index }: { alert: LanguageAlert; index: number }) {
  const [open, setOpen] = useState(index === 0); // primeiro aberto por padrão
  const cfg = CATEGORY_CONFIG[alert.category];

  return (
    <div className={cn('rounded-lg border overflow-hidden', cfg.border)}>
      {/* Header clicável */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full text-left px-4 py-3 flex items-center gap-3 transition-colors',
          cfg.bg,
          'hover:brightness-95'
        )}
      >
        <span className="text-base leading-none">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <span className={cn('text-[10px] font-bold uppercase tracking-wider', cfg.color)}>
            {cfg.label}
          </span>
          <p className="text-xs text-text-primary font-mono mt-0.5 truncate">
            {alert.found}
          </p>
        </div>
        {open ? (
          <ChevronUp size={14} className={cfg.color} />
        ) : (
          <ChevronDown size={14} className={cfg.color} />
        )}
      </button>

      {/* Corpo expansível */}
      {open && (
        <div className="bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-1 duration-200">
          {/* O que foi escrito */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              O que foi escrito
            </p>
            <p className="text-xs font-mono bg-red-50 border border-red-100 text-red-800 px-3 py-2 rounded-md leading-relaxed">
              {alert.found}
            </p>
          </div>

          {/* Por que está errado */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              Por que está errado
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">{alert.reason}</p>
          </div>

          {/* Sugestão de correção */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">
              Sugestão de correção
            </p>
            <p className="text-xs bg-success/8 border border-success/20 text-success px-3 py-2 rounded-md leading-relaxed font-medium">
              {alert.suggestion}
            </p>
          </div>

          {/* Tom de mentor */}
          <div className="flex items-start gap-2 pt-1 border-t border-border/60">
            <BookOpen size={12} className="text-accent mt-0.5 shrink-0" />
            <p className="text-[10px] text-text-muted italic leading-relaxed">
              Lembre-se: para tirar nota máxima, seu vocabulário deve ser formal e acadêmico. Cada
              desvio do registro culto custa pontos reais na banca.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Painel principal ─────────────────────────────────────────────────────────
interface LanguageAlertPanelProps {
  alerts: LanguageAlert[];
  compact?: boolean; // versão compacta para sidebar estreita
}

export function LanguageAlertPanel({ alerts, compact = false }: LanguageAlertPanelProps) {
  const [panelOpen, setPanelOpen] = useState(true);

  if (!alerts || alerts.length === 0) return null;

  const countByCategory = {
    oralidade: alerts.filter((a) => a.category === 'oralidade').length,
    giria: alerts.filter((a) => a.category === 'giria').length,
    concordancia: alerts.filter((a) => a.category === 'concordancia').length,
    repeticao: alerts.filter((a) => a.category === 'repeticao').length,
  };

  const hasC1Penalty = countByCategory.giria > 2 || countByCategory.oralidade > 3;

  return (
    <div className="rounded-lg border border-amber-300/60 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header do painel */}
      <button
        onClick={() => setPanelOpen(!panelOpen)}
        className="w-full bg-amber-50 border-b border-amber-200/70 px-5 py-3 flex items-center gap-3 hover:bg-amber-100/60 transition-colors"
      >
        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
        <div className="flex-1 text-left">
          <h4 className="text-sm font-bold text-amber-800">
            ⚠️ Alerta de Linguagem
          </h4>
          <p className="text-[10px] text-amber-700 mt-0.5">
            {alerts.length} {alerts.length === 1 ? 'problema detectado' : 'problemas detectados'} no seu texto
          </p>
        </div>

        {/* Badges de contagem */}
        {!compact && (
          <div className="flex gap-1.5 mr-2">
            {countByCategory.giria > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                {countByCategory.giria} gíria{countByCategory.giria > 1 ? 's' : ''}
              </span>
            )}
            {countByCategory.oralidade > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                {countByCategory.oralidade} oral
              </span>
            )}
            {countByCategory.concordancia > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                {countByCategory.concordancia} concord.
              </span>
            )}
            {countByCategory.repeticao > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                {countByCategory.repeticao} repet.
              </span>
            )}
          </div>
        )}
        {panelOpen ? <ChevronUp size={14} className="text-amber-600 shrink-0" /> : <ChevronDown size={14} className="text-amber-600 shrink-0" />}
      </button>

      {/* Banner de penalização de C1 */}
      {panelOpen && hasC1Penalty && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-start gap-2">
          <MessageCircleWarning size={14} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-red-700 leading-relaxed font-medium">
            <span className="font-bold">Penalização ativa em C1:</span> Você ultrapassou o limite de
            gírias/oralidade. A nota de Domínio da Norma Culta está limitada a{' '}
            <span className="font-bold">40 pts (ENEM)</span> ou{' '}
            <span className="font-bold">8 pts (demais bancas)</span>.
          </p>
        </div>
      )}

      {/* Lista de alertas */}
      {panelOpen && (
        <div className="p-4 bg-white space-y-3">
          {alerts.map((alert, i) => (
            <AlertCard key={i} alert={alert} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
