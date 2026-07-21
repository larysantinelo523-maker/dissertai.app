import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, FileText, PlusCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Badge, Button, cn } from '../components/ui/Base';

export function Historico() {
  const { history, deleteEssay, loadHistoryFromSupabase } = useAppStore();
  const navigate = useNavigate();
  const [syncing, setSyncing] = useState(false);

  // Sincroniza com o Supabase ao montar a página
  useEffect(() => {
    setSyncing(true);
    loadHistoryFromSupabase().finally(() => setSyncing(false));
  }, [loadHistoryFromSupabase]);

  const handleViewCorrection = (id: string) => {
    navigate(`/dashboard/minhas-redacoes/${id}`);
  };

  const getScoreVariant = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'success' as const;
    if (pct >= 50) return 'warning' as const;
    return 'danger' as const;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex items-center gap-3">
        <p className="text-text-secondary text-sm">Visualize e gerencie suas redações corrigidas.</p>
        {syncing && (
          <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-medium">
            <RefreshCw size={11} className="animate-spin" />
            Sincronizando...
          </span>
        )}
      </div>

      <div className="bg-white border border-border rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
        {history.length === 0 ? (
          /* ── Estado vazio melhorado ───────────────────────────────────────── */
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-accent-light flex items-center justify-center mb-6">
              <FileText size={36} className="text-accent opacity-70" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Nenhuma redação encontrada
            </h3>
            <p className="text-text-secondary mb-8 max-w-sm text-sm leading-relaxed">
              Você ainda não enviou nenhuma redação para o Disserta.ai. Que tal começar agora e
              descobrir o que falta para tirar a nota máxima?
            </p>
            <Button onClick={() => navigate('/dashboard/nova-redacao')} className="gap-2">
              <PlusCircle size={16} />
              Enviar minha primeira redação
            </Button>
          </div>
        ) : (
          /* ── Tabela de histórico ──────────────────────────────────────────── */
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Banca</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Tema</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Nota Final</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((essay) => {
                  const result = essay.result!;
                  const variant = getScoreVariant(result.totalScore, result.maxTotalScore);
                  const pct = Math.round((result.totalScore / result.maxTotalScore) * 100);

                  return (
                    <tr
                      key={essay.id}
                      className="hover:bg-bg/40 transition-colors group cursor-pointer"
                      onClick={() => handleViewCorrection(essay.id)}
                    >
                      <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                        {new Date(essay.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-1 bg-accent-light text-accent rounded uppercase">
                          {essay.exam}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-text-primary truncate max-w-[260px]">
                          {essay.title}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Badge variant={variant}>
                            {result.totalScore} / {result.maxTotalScore}
                          </Badge>
                          {/* Mini progress bar */}
                          <div className="w-16 h-1 bg-border rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                variant === 'success'
                                  ? 'bg-success'
                                  : variant === 'warning'
                                  ? 'bg-warning'
                                  : 'bg-danger'
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleViewCorrection(essay.id)}
                            className="text-accent hover:underline text-sm font-medium flex items-center gap-1.5 transition-all"
                            aria-label={`Ver correção de ${essay.title}`}
                          >
                            Ver correção
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => deleteEssay(essay.id)}
                            className="text-text-muted hover:text-danger p-2 rounded-md hover:bg-red-50 transition-colors"
                            aria-label="Excluir redação"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
