/**
 * supabaseService.ts
 * Camada de acesso ao banco de dados Supabase.
 * Todas as operações têm graceful degradation — nunca quebram o fluxo principal.
 */

import { supabase, getDeviceId } from '../lib/supabase';
import { Essay, CorrectionResult, ExamType } from '../types';

// ─── Tipos do banco ────────────────────────────────────────────────────────────

export interface BancaContexto {
  id?: string;
  nome_banca: string;
  instrucoes_metodologia: string | null;
  redacoes_referencia: RedacaoReferencia[] | null;
}

export interface RedacaoReferencia {
  id: string;          // uuid local (não salvo no banco, só para key do React)
  tema?: string;       // Tema da redação
  titulo: string;
  texto: string;
  nota: number;
  observacoes: string;
}

// ─── bancas_contexto ──────────────────────────────────────────────────────────

export async function fetchBancaContexto(exam: ExamType): Promise<BancaContexto | null> {
  try {
    const { data, error } = await supabase
      .from('bancas_contexto')
      .select('nome_banca, instrucoes_metodologia, redacoes_referencia(*)')
      .eq('nome_banca', exam)
      .maybeSingle();

    if (error || !data) return null;
    return data as BancaContexto;
  } catch {
    return null;
  }
}

/** Busca todas as bancas de uma vez (para a tela Admin). */
export async function fetchAllBancas(): Promise<BancaContexto[]> {
  try {
    const { data, error } = await supabase
      .from('bancas_contexto')
      .select('id, nome_banca, instrucoes_metodologia, redacoes_referencia(*)')
      .order('nome_banca');
    if (error || !data) return [];
    
    // Ordena as redações de referência por data de criação para manter a ordem
    data.forEach((banca: any) => {
      if (banca.redacoes_referencia) {
        banca.redacoes_referencia.sort((a: any, b: any) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });

    return data as BancaContexto[];
  } catch {
    return [];
  }
}

/** Atualiza apenas a metodologia da banca. */
export async function updateBancaContexto(
  nomeBanca: string,
  instrucoes: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('bancas_contexto')
      .update({
        instrucoes_metodologia: instrucoes,
      })
      .eq('nome_banca', nomeBanca);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Erro desconhecido' };
  }
}

// ─── CRUD de Redações de Referência ───────────────────────────────────────────

export async function addRedacaoReferencia(
  nomeBanca: string,
  ref: Omit<RedacaoReferencia, 'id'>
): Promise<{ ok: boolean; data?: RedacaoReferencia; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('redacoes_referencia')
      .insert({
        nome_banca: nomeBanca,
        tema: ref.tema,
        titulo: ref.titulo,
        texto: ref.texto,
        nota: ref.nota,
        observacoes: ref.observacoes
      })
      .select()
      .single();

    if (error) return { ok: false, error: error.message };
    return { ok: true, data: data as RedacaoReferencia };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Erro desconhecido' };
  }
}

export async function updateRedacaoReferencia(
  id: string,
  ref: Omit<RedacaoReferencia, 'id'>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('redacoes_referencia')
      .update({
        tema: ref.tema,
        titulo: ref.titulo,
        texto: ref.texto,
        nota: ref.nota,
        observacoes: ref.observacoes
      })
      .eq('id', id);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Erro desconhecido' };
  }
}

export async function deleteRedacaoReferencia(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('redacoes_referencia')
      .delete()
      .eq('id', id);

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Erro desconhecido' };
  }
}

// ─── redacoes ─────────────────────────────────────────────────────────────────

/**
 * Salva o resultado de uma correção no Supabase.
 * Opera em background — erros são silenciosos para não bloquear a UI.
 */
export async function saveRedacao(essay: Essay, userId?: string): Promise<void> {
  if (!essay.result) return;
  const r = essay.result;
  
  const { data: { user } } = await supabase.auth.getUser();
  const ownerId = userId || user?.id || getDeviceId();

  try {
    await supabase.from('redacoes').upsert(
      {
        id: essay.id,
        device_id: ownerId,
        exam: essay.exam,
        title: essay.title,
        content: essay.content,
        total_score: r.totalScore,
        max_total_score: r.maxTotalScore,
        competencies: r.competencies,
        general_suggestions: r.generalSuggestions,
        rewritten_essay: r.rewrittenEssay ?? null,
        why_not_perfect: r.whyNotPerfect ?? null,
        language_alerts: r.languageAlerts ?? null,
        created_at: essay.createdAt,
      },
      { onConflict: 'id' }
    );
  } catch {
    // silent — localStorage continua como fallback
  }
}

/**
 * Busca o histórico de redações do dispositivo atual, do mais recente ao mais antigo.
 * Retorna [] em caso de erro.
 */
export async function fetchRedacoes(userId?: string): Promise<Essay[]> {
  const { data: { user } } = await supabase.auth.getUser();
  const ownerId = userId || user?.id || getDeviceId();

  try {
    const { data, error } = await supabase
      .from('redacoes')
      .select('*')
      .eq('device_id', ownerId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row: any): Essay => ({
      id: row.id,
      title: row.title,
      content: row.content,
      exam: row.exam as ExamType,
      createdAt: row.created_at,
      status: 'CORRECTED',
      result: {
        id: row.id,
        essayTitle: row.title,
        exam: row.exam as ExamType,
        totalScore: row.total_score,
        maxTotalScore: row.max_total_score,
        competencies: row.competencies ?? [],
        generalSuggestions: row.general_suggestions ?? [],
        rewrittenEssay: row.rewritten_essay ?? undefined,
        whyNotPerfect: row.why_not_perfect ?? undefined,
        languageAlerts: row.language_alerts ?? undefined,
        createdAt: row.created_at,
      },
    }));
  } catch {
    return [];
  }
}

/**
 * Remove uma redação do Supabase (apenas do device_id correto, por segurança).
 */
export async function deleteRedacao(id: string, userId?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const ownerId = userId || user?.id || getDeviceId();
  
  try {
    await supabase
      .from('redacoes')
      .delete()
      .eq('id', id)
      .eq('device_id', ownerId);
  } catch {
    // silent
  }
}
