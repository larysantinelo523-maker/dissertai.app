import { X, Sparkles, CheckCircle2, BookOpen, GraduationCap, Copy, Check } from 'lucide-react';
import { Button } from './Base';
import { useMemo, useState } from 'react';

interface RewrittenEssayViewerProps {
  essayText: string;
  pedagogicalSummary?: string;
  onClose: () => void;
  onUseText?: (text: string) => void;
}

interface EssaySegment {
  id: string;
  type: 'text' | 'comment';
  content: string;
  commentIndex?: number;
}

export function RewrittenEssayViewer({ essayText, pedagogicalSummary, onClose, onUseText }: RewrittenEssayViewerProps) {
  const [activeComment, setActiveComment] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Strip all comment markers to produce clean copyable text
  const cleanText = useMemo(() => {
    if (!essayText) return '';
    return essayText
      .replace(/(?:\[✓\s*Comentário:\s*.*?\]|✓\s*\[Comentário:\s*.*?\])/ig, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }, [essayText]);

  const handleCopyCleanText = async () => {
    try {
      await navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = cleanText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Process the text to extract comments
  // The AI sends markers like "[✓ Comentário: reason]" or "✓ [Comentário: reason]"
  const segments = useMemo(() => {
    if (!essayText) return [];

    // Matches both formats:
    // 1. [✓ Comentário: text] — checkmark inside brackets
    // 2. ✓ [Comentário: text] — checkmark outside brackets  
    const regex = /(?:\[✓\s*Comentário:\s*(.*?)\]|✓\s*\[Comentário:\s*(.*?)\])/ig;
    
    const parts: EssaySegment[] = [];
    let lastIndex = 0;
    let match;
    let commentIdx = 0;

    while ((match = regex.exec(essayText)) !== null) {
      // Add the text before the comment
      if (match.index > lastIndex) {
        const textContent = essayText.slice(lastIndex, match.index).trim();
        if (textContent) {
          parts.push({
            id: `text-${lastIndex}`,
            type: 'text',
            content: textContent
          });
        }
      }

      // Add the comment — either from group 1 or group 2
      const commentText = (match[1] || match[2] || '').trim();
      if (commentText) {
        parts.push({
          id: `comment-${match.index}`,
          type: 'comment',
          content: commentText,
          commentIndex: commentIdx++
        });
      }

      lastIndex = regex.lastIndex;
    }

    // Add any remaining text
    if (lastIndex < essayText.length) {
      const remaining = essayText.slice(lastIndex).trim();
      if (remaining) {
        parts.push({
          id: `text-${lastIndex}`,
          type: 'text',
          content: remaining
        });
      }
    }

    // If no comments were found, treat the whole text as a single text block
    if (parts.length === 0) {
      parts.push({ id: 'text-0', type: 'text', content: essayText });
    }

    return parts;
  }, [essayText]);

  const comments = segments.filter(s => s.type === 'comment');
  const hasComments = comments.length > 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#f8f7f4] w-full max-w-5xl h-[95vh] md:h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center text-white shadow-md shadow-success/30">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Versão Otimizada — Nota Máxima</h2>
              <p className="text-[11px] text-text-muted">
                {hasComments 
                  ? `${comments.length} melhorias identificadas — clique nos cards verdes para entender cada uma`
                  : 'Leia e estude o texto corrigido pela IA'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasComments && (
              <div className="hidden md:flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-3 py-1">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-[10px] font-bold text-success uppercase tracking-wider">
                  {comments.length} melhorias
                </span>
              </div>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg text-text-muted hover:text-text-primary transition-colors border border-transparent hover:border-border"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

          {/* Left: Essay text */}
          <div className={`flex-1 overflow-y-auto p-6 md:p-10 ${hasComments ? 'md:border-r border-border' : ''}`}>
            <div className="max-w-prose mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={14} className="text-text-muted" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Texto Corrigido</span>
              </div>
              <div className="font-serif text-base leading-8 text-text-primary">
                {segments.map((seg) => {
                  if (seg.type === 'text') {
                    return (
                      <span key={seg.id} className="whitespace-pre-wrap">
                        {seg.content}
                      </span>
                    );
                  } else {
                    // Inline comment marker (a numbered badge in the text)
                    const idx = seg.commentIndex!;
                    const isActive = activeComment === idx;
                    return (
                      <button
                        key={seg.id}
                        onClick={() => setActiveComment(isActive ? null : idx)}
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold mx-1 transition-all cursor-pointer align-middle shrink-0
                          ${isActive 
                            ? 'bg-success text-white scale-110 shadow-md shadow-success/40' 
                            : 'bg-success/20 text-success hover:bg-success hover:text-white hover:scale-110'}`}
                        title="Ver comentário"
                      >
                        {idx + 1}
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          </div>

          {/* Right: Comment Cards + Pedagogical Summary */}
          {hasComments && (
            <div className="w-full md:w-80 lg:w-96 shrink-0 overflow-y-auto p-4 md:p-6 bg-white/60 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-success" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-success">Por que ficou melhor?</span>
              </div>

              {/* Pedagogical Summary */}
              {pedagogicalSummary && (
                <div className="bg-gradient-to-br from-success/8 to-emerald-50 border border-success/25 rounded-xl p-4 mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-success mb-2 flex items-center gap-1.5">
                    <GraduationCap size={13} />
                    Análise do Professor
                  </p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {pedagogicalSummary}
                  </p>
                </div>
              )}
              {comments.map((seg) => {
                const idx = seg.commentIndex!;
                const isActive = activeComment === idx;
                return (
                  <button
                    key={seg.id}
                    onClick={() => setActiveComment(isActive ? null : idx)}
                    className={`w-full text-left rounded-xl border transition-all duration-200 overflow-hidden
                      ${isActive 
                        ? 'border-success shadow-md shadow-success/20 bg-success/5' 
                        : 'border-success/20 bg-white hover:border-success/50 hover:shadow-sm'}`}
                  >
                    <div className="p-3 flex gap-3 items-start">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors
                        ${isActive ? 'bg-success text-white' : 'bg-success/15 text-success'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-relaxed transition-colors
                          ${isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                          {seg.content}
                        </p>
                      </div>
                      <CheckCircle2 size={14} className={`shrink-0 mt-0.5 transition-colors ${isActive ? 'text-success' : 'text-success/40'}`} />
                    </div>
                  </button>
                );
              })}
              <div className="mt-4 pt-4 border-t border-border/60 text-[10px] text-text-muted leading-relaxed">
                💡 Dica: clique nos badges numéricos no texto ou nos cards ao lado para destacar cada melhoria.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-border shrink-0 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={handleCopyCleanText}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200
              ${copied
                ? 'bg-success text-white border-success shadow-md shadow-success/30'
                : 'bg-white text-text-secondary border-border hover:border-success hover:text-success'}`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado!' : 'Copiar texto'}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {onUseText && (
              <Button
                onClick={() => { onUseText(cleanText); onClose(); }}
                className="bg-gradient-to-r from-success to-emerald-600 hover:from-success-dark hover:to-emerald-700 text-white px-5 flex items-center gap-2"
              >
                <span>Usar no editor &rarr;</span>
              </Button>
            )}
            <button onClick={onClose} className="text-sm text-text-muted hover:text-text-primary transition-colors px-3 py-2">
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

