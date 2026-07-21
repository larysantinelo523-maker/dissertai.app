import OpenAI from 'openai';
import { CorrectionResult, ExamType, LanguageAlert } from '../types';
import { sanitizeAndAudit } from '../utils/languageAudit';
import { fetchBancaContexto, saveRedacao } from './supabaseService';

// ─── Cliente interno ───────────────────────────────────────────────────────────
const _client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Textos abaixo deste limite recebem penalização por extensão insuficiente
const SHORT_TEXT_THRESHOLD = 300;

// ─── Configurações por banca ───────────────────────────────────────────────────
const EXAM_CONFIG: Record<
  ExamType,
  { maxTotal: number; maxPerComp: number; competencies: string[]; examInstructions: string }
> = {
  ENEM: {
    maxTotal: 1000,
    maxPerComp: 200,
    competencies: [
      'Domínio da Norma Culta',
      'Compreensão da Proposta',
      'Seleção e Organização de Argumentos',
      'Coesão Textual',
      'Proposta de Intervenção',
    ],
    examInstructions: `
BANCA: ENEM — Nota total 1000 (5 x 200). Valores válidos por competência: 0, 40, 80, 120, 160, 200.

C1 — DOMÍNIO DA NORMA CULTA (0–200)
Reflete o domínio da modalidade escrita formal. Avalie por quantidade e gravidade de desvios.
  • Excelente domínio, nenhum ou apenas 1 desvio não reincidente → 200.
  • Bom domínio, poucos desvios esporádicos (2–4 erros) → 160.
  • Domínio mediano, alguns desvios (5–8 erros) → 120.
  • Domínio insuficiente, muitos desvios (9–12 erros) → 80.
  • Domínio precário, desvios diversificados e freqüentes (>12) → 40.
  • Desconhecimento total da modalidade escrita → 0.
  ATENÇÃO: marcas de oralidade clara (gírias, “eu acho”, “né”) reduzem 1 nível.

C2 — COMPREENSÃO DA PROPOSTA E RESERVATÓRIO SOCIOCULTURAL (0–200)
Avalia se o aluno entendeu o recorte específico do tema E trouxe reporttório legítimo.
  • Fuga total ao tema ou ausência de estrutura dissertativa → 0 (anula a redação).
  • Tangenciamento do tema → máx 80.
  • Argumentação genérica sem nenhum reservatório externo → máx 120.
  • Argumentação consistente com reservatório produtivo (filósofo/lei/dado/evento) → 160–200.
  Reservatório válido: dados do IBGE, filósofos (com nome), leis, obras literárias, eventos históricos com data.
  Reservatório inválido: “como todos sabem”, “a Bíblia diz”, “visto em filmes” sem especificar qual.

C3 — SELEÇÃO E ORGANIZAÇÃO DOS ARGUMENTOS (0–200)
Avalia clareza da tese, encadeamento lógico e originalidade argumentativa.
  • Argumentação consistente, organizada, com autoria clara → 200.
  • Argumentação organizada com indícios de autoria → 160.
  • Argumentação limitada aos textos motivadores, razoavelmente organizada → 120.
  • Argumentação desorganizada ou apenas repetindo ideias dos textos motivadores → 80.
  • Informações pouco relacionadas, incoerentes, sem ponto de vista → 40.
  • Sem relação com o tema → 0.

C4 — COESÃO TEXTUAL (0–200)
Avalia uso de conectivos, pronomes de retomada e progressão temática.
  • Boa articulação, reservatório coesivo variado e bem usado → 200.
  • Articulação com poucas inadequações, reservatório diversificado → 160.
  • Articulação mediana, inadequações e reservatório pouco diversificado → 120.
  • Articulação insuficiente, muitas inadequações → 80.
  • Articulação precária → 40. Sem articulação alguma → 0.
  ATENÇÃO: a existência de conectivos como “adeimáis”, “outrossim”, “todavia”, “entretanto”,
  “pois”, “demais”, “porém” é sinal POSITIVO, não negativo. Não penalize connectívos corretos.

C5 — PROPOSTA DE INTERVENÇÃO (0–200)
Avalia se a conclusão apresenta uma solução concreta, conectada à tese, respeitando DH.
Os 5 elementos: Agente + Ação + Meio/Modo + Finalidade + Detalhamento.
  • Proposta detalhada com todos os 5 elementos → 200.
  • Proposta bem elaborada com 4 elementos → 160.
  • Proposta mediada com 3 elementos → 120.
  • Proposta insuficiente com 2 elementos → 80.
  • Proposta vaga ou apenas 1 elemento → 40.
  • Sem proposta ou viola direitos humanos → 0.
  IMPORTANTE: o nível de detalhamento exigido para C5=200 é que os 5 elementos estejam
  presentes e identificáveis. NÃO exija informações burocráticas (de onde vem a verba,
  mecanismo de fiscalização etc.) que não fazem parte da cartilha oficial do INEP.`,
  },

  SSA: {
    maxTotal: 100,
    maxPerComp: 20,
    competencies: [
      'Norma Gramatical',
      'Adequação ao Tema',
      'Estrutura Dissertativa',
      'Coesão e Coerência',
      'Vocabulário e Estilo',
    ],
    examInstructions: `
BANCA: SSA/UPE — Nota total 100 (5 × 20). Valores válidos: 0, 4, 8, 12, 16, 20.

DITADURA DA NORMA CULTA (critério diferencial da UPE):
A UPE é implacável com pontuação e concordância. Aplique RIGOR MÁXIMO:
  • 2 erros gramaticais DISTINTOS → IMPEDE nota máxima em C1 (máx 16).
  • 1 vírgula mal colocada em posição estrutural (antes de sujeito, após verbo sem adjunto)
    → penaliza -4 pts em C1.
  • Marcas de oralidade → TETO 8 em C1.
  • Concordância nominal/verbal errada → -4 por ocorrência.

C1 – NORMA GRAMATICAL (0–20): [aplicar ditadura acima]
C2 – ADEQUAÇÃO AO TEMA (0–20):
  • Texto < 15 linhas → TETO 8.
  • Pobreza de repertório (exemplos genéricos sem autor/dado) → máx 12.
C3 – ESTRUTURA DISSERTATIVA (0–20):
  • Estrutura "lista de problemas" sem aprofundar causas → corte 40% (máx 12).
  • Falta de tese explícita → máx 12. Sem progressão LINEAR → máx 12.
C4 – COESÃO E COERÊNCIA (0–20):
  • Ausência de conectivo interparágrafo → TETO 8.
  • Contradição interna → máx 8.
C5 – VOCABULÁRIO E ESTILO (0–20):
  • Clichês ("desde os primórdios", "é notório que") → máx 16.
  • Repetição > 3× da mesma palavra num parágrafo → máx 12.`,
  },

  CESAR: {
    maxTotal: 100,
    maxPerComp: 20,
    competencies: [
      'Clareza e Objetividade',
      'Argumentação e Evidências',
      'Originalidade',
      'Organização Textual',
      'Capacidade de Síntese',
    ],
    examInstructions: `
BANCA: CESAR School — Nota total 100 (5 × 20). Valores válidos: 0, 4, 8, 12, 16, 20.

FOCO: Lógica pura, impessoalidade e originalidade. Sentimentalismo é penalizado.
  • Linguagem emocional ("é triste ver que", "todos sofrem com") → -4 pts em C1.
  • Argumento de autoridade sem dado ("todos sabem que") → TETO 8 em C2.
  • Estrutura "lista de problemas" → corte 40% em C2.

C1 – CLAREZA E OBJETIVIDADE (0–20):
  • Texto impessoal, direto, sem redundância. Frases > 3 orações subordinadas → máx 12.
C2 – ARGUMENTAÇÃO E EVIDÊNCIAS (0–20):
  • Argumento sem evidência → -4 por ocorrência. "Senso comum" → TETO 8.
C3 – ORIGINALIDADE (0–20):
  • Tese clichê ("tecnologia é boa e ruim") → máx 8.
C4 – ORGANIZAÇÃO TEXTUAL (0–20):
  • Ausência de conclusão identificável → máx 12.
C5 – CAPACIDADE DE SÍNTESE (0–20):
  • Conclusão que repete a introdução → máx 8.`,
  },

  UNICAP: {
    maxTotal: 100,
    maxPerComp: 20,
    competencies: [
      'Adequação Gramatical',
      'Tema e Gênero Textual',
      'Argumentação',
      'Articulação Textual',
      'Proposta de Ação Social',
    ],
    examInstructions: `
BANCA: UNICAP — Nota total 100 (5 × 20). Valores válidos: 0, 4, 8, 12, 16, 20.

C1 – ADEQUAÇÃO GRAMATICAL (0–20):
  • Marcas de oralidade → TETO 8. Cada bloco de 3 erros distintos → -4. > 8 erros → máx 4.
C2 – TEMA E GÊNERO TEXTUAL (0–20):
  • Texto narrativo/poético → 0. Texto < 15 linhas → TETO 8.
C3 – ARGUMENTAÇÃO (0–20):
  • Sentimentalismo sem dado → TETO 8. "Senso comum" → TETO 8.
  • Pobreza de repertório (sem autor/fato datado) → máx 12.
C4 – ARTICULAÇÃO TEXTUAL (0–20):
  • Ausência de conectivo interparágrafo → TETO 8.
  • Parágrafos que repetem a mesma ideia → máx 12.
C5 – PROPOSTA DE AÇÃO SOCIAL (0–20):
  • Proposta vaga (sem agente + ação + impacto) → TETO 8. Ausente → 0.
  • Texto < 1000 chars → TETO 8.`,
  },
};

// ─── Aviso para textos curtos ──────────────────────────────────────────────────
function buildShortTextWarning(charCount: number): string {
  if (charCount < 100) {
    return `\n⚠️ ALERTA CRÍTICO: texto com apenas ${charCount} caracteres (extremamente curto ou letras soltas). A nota DEVE SER ZERO em todas as competências. Texto insuficiente para avaliação.\n`;
  }
  if (charCount < 600) {
    return `\n⚠️ ALERTA: texto com ${charCount} caracteres. Aplique penalização proporcional à extensão. Nota total NÃO pode ultrapassar 60% do máximo.\n`;
  }
  return `\n⚠️ ALERTA: texto com ${charCount} caracteres (abaixo do ideal de 600+). Mencione o impacto da extensão no feedback.\n`;
}

// ─── Injeção de audit de linguagem no prompt ──────────────────────────────────
function buildLanguageAuditBlock(promptSummary: string, c1PenaltyFlag: boolean): string {
  if (!promptSummary) return '';
  return `\n${promptSummary}\n${c1PenaltyFlag ? 'INSTRUÇÃO REFORÇADA: C1/Norma Culta TETO 40 (ENEM) ou 8 (demais) está ATIVO por excesso de marcas de oralidade/gírias.' : ''}\n`;
}

// ─── Bloco de contexto dinâmico do Supabase ─────────────────────────────────
function buildSupabaseContextBlock(
  metodologia: string | null,
  exemplos: any[] | null
): string {
  if (!metodologia && (!exemplos || exemplos.length === 0)) return '';

  const parts: string[] = [];
  if (metodologia) {
    parts.push(`DIRETRIZES DE CORREÇÃO (manual oficial da banca):\n${metodologia}`);
  }
  if (exemplos && exemplos.length > 0) {
    const exemplosTxt = exemplos
      .slice(0, 3) // máx 3 exemplos para não explodir o contexto
      .map((ex: any, i: number) => {
        if (typeof ex === 'string') return `Exemplo ${i + 1}:\n${ex}`;
        return `[REFERÊNCIA ${i + 1} - PADRÃO OURO]\nTema: ${ex.tema}\nTítulo: ${ex.titulo || 'N/A'}\nTexto: "${ex.texto}"\nNota Recebida: ${ex.nota}\n-> MOTIVO DA NOTA (Atenção IA: Aprenda com esta observação e aplique a MESMA regra para o texto do aluno): ${ex.observacoes}`;
      })
      .join('\n\n');
    parts.push(`REFERÊNCIAS DE NOTA MÁXIMA:\n${exemplosTxt}`);
  }

  return `\n\n${'='.repeat(60)}\nCONTEXTO OFICIAL DA BANCA (Supabase):\n${parts.join('\n\n')}\n${'='.repeat(60)}\n`;
}

// ─── System Prompt principal ───────────────────────────────────────────────────
function buildSystemPrompt(
  exam: ExamType,
  isShortText: boolean,
  charCount: number,
  auditBlock: string,
  supabaseContextBlock: string
): string {
  const cfg = EXAM_CONFIG[exam];
  const shortWarn = isShortText ? buildShortTextWarning(charCount) : '';
  const validScores = Array.from({ length: 6 }, (_, i) => i * (cfg.maxPerComp / 5)).join(', ');

  return `Você é o Corretor Especialista do Disserta.ai para a banca ${exam}.
Metodologia: 4 pilares — Nota Geral, Pontos de Destaque, Plano de Ação, Texto Comentado.
Utilize o rigor máximo definido pela metodologia de Marcelo Martins.
${shortWarn}${auditBlock}
${cfg.examInstructions}

CRITÉRIOS UNIVERSAIS DE PENALIZAÇÃO (aplicar em TODAS as bancas):
1. MARCAS DE ORALIDADE: "eu acho", "brigas", "muito feio/ruim", "né", "aí", gírias
   → C1/Norma TETO 40 pts (ENEM) ou 8 pts (demais bancas).
2. POBREZA DE REPERTÓRIO: "visto em filmes", "diz a Bíblia", "na sociedade atual",
   "como todos sabem", sem autor identificado + obra/fato datado
   → C2/Adequação TETO 120 pts (ENEM) ou 12 pts (demais).
3. ESTRUTURA "LISTA DE COMPRAS": apenas enumera problemas sem aprofundar CAUSAS
   → C3/Argumentação perde 40% (teto 120 ENEM / 12 demais).
4. FALHA DE COESÃO: ausência de conectivo interparágrafo E intraparágrafo
   → C4/Coesão TETO 100 pts (ENEM) ou 8 pts (demais).
5. SENTIMENTALISMO (CESAR/UNICAP/FGV): linguagem emocional em texto técnico
   → penaliza C1 e C3.
6. SENSO COMUM PURO: "o governo precisa fazer algo", "as pessoas precisam de consciência"
   → C3 TETO 80 (ENEM)/8 (demais) e IMPEDE total > 360 (ENEM) ou > 36% (demais).
7. TEXTO CURTO (< 1000 chars): nota total NÃO pode exceder 40% do máximo.
8. TEXTO EM BRANCO/GIBBERISH (< 100 chars ou letras soltas como "sqw"): A nota DEVE SER ZERO (0) EM TODAS as competências. Nenhuma competência pode receber mais que 0.

TOM OBRIGATÓRIO DO FEEDBACK (mentor de elite):
Cada campo "feedback" DEVE seguir este modelo:
"Este texto receberia [nota] na banca real porque [critério técnico exato violado].
Para chegar ao nível de nota máxima, você precisa substituir [X literal do texto] por [Y específico]."

FORMATO DE RESPOSTA — SOMENTE JSON VÁLIDO, zero texto fora do JSON:
{
  "totalScore": <soma exata das 5 competências>,
  "competencies": [
    {
      "id": 1,
      "name": "<nome da competência>",
      "score": <múltiplo de ${cfg.maxPerComp / 5}>,
      "maxScore": ${cfg.maxPerComp},
      "feedback": "<diagnóstico técnico no tom mentor de elite>",
      "highlights": ["<trecho literal ≤ 6 palavras>", "<trecho2>", "<trecho3>"]
    }
  ],
  "generalSuggestions": [
    "✅ DESTAQUE 1: <ponto positivo concreto e específico>",
    "✅ DESTAQUE 2: <segundo ponto positivo>",
    "🎯 AÇÃO 1: <instrução cirúrgica — qual trecho, qual substituição, efeito na nota>",
    "🎯 AÇÃO 2: <segunda instrução prioritária>",
    "🎯 AÇÃO 3: <terceira ação focada no gap mais crítico da banca ${exam}>"
  ],
  "rewrittenEssay": "<MISSÃO CRÍTICA: produza a versão deste texto que tiraria ${cfg.maxTotal}/${cfg.maxTotal}. REGRAS: (1) Parta do original, mantendo ideias e estrutura. (2) Corrija TODOS os erros gramaticais (C1=200). (3) Substitua repertório vago por referências legítimas: filósofo+obra, dado do IBGE, lei específica (C2=200). (4) Garanta tese clara e argumentos progressivos (C3=200). (5) Adicione/substitua conectivos para coesão impecável (C4=200). (6) REESCREVA COMPLETAMENTE o último parágrafo com os 5 elementos de C5: Agente específico + Ação + Meio/Modo + Finalidade + Detalhamento (C5=200). MARCADORES OBRIGATÓRIOS: você DEVE inserir de 3 a 8 marcadores [✓ Comentário: texto explicativo aqui] IMEDIATAMENTE ANTES de cada trecho que você modificou. NUNCA omita os marcadores. Trechos sem modificação: copie exatamente.>",
  "pedagogicalSummary": "<Escreva 3 a 5 frases em tom de professor mentor explicando por que as alterações marcadas com [✓ Comentário] elevam a nota. REGRAS: (1) NUNCA invente nem cite exemplos de 'palavra X → palavra Y' onde ambas são iguais ou onde a correção não aparece no rewrittenEssay. (2) Descreva as mudanças de forma CONCEITUAL (ex: 'A substituição do conectivo aditivo por um operador de oposição fortaleceu C4'). (3) Conecte cada tipo de mudança à competência beneficiada (C1 a C5 pelo nome). (4) Finalize com uma frase motivadora afirmando que, com essas intervenções, o texto se torna competitivo para a nota máxima.>",
  "whyNotPerfect": "<UMA frase direta e impiedosa identificando o ÚNICO erro mais bobo que custaria a vaga no concurso real>",
  "languageAlerts": [
    {
      "found": "<trecho exato problemático com até 10 palavras de contexto>",
      "reason": "<por que está errado — seja técnico e pedagógico>",
      "suggestion": "<versão formal e correta do mesmo trecho>",
      "category": "<oralidade | giria | concordancia | repeticao>"
    }
  ]
}
NOTA: languageAlerts deve conter APENAS erros reais detectados no texto. Se não houver nenhum, retorne array vazio [].
Para cada alerta, o campo "found" deve citar o trecho real do texto, "reason" deve mencionar a regra violada (norma culta, registro formal, concordância) e "suggestion" deve dar a alternativa exata e formal.

REGRAS INVIOLÁVEIS:
1. totalScore = soma EXATA dos 5 scores. Nunca forje.
2. Scores apenas em: ${validScores}.
3. highlights: máximo 3, ≤ 6 palavras cada, LITERAIS do texto.
4. generalSuggestions: exatamente 5 itens (2 DESTAQUE + 3 AÇÃO).
5. whyNotPerfect: exatamente 1 frase, direta, sem eufemismo, focada no erro mais impactante.
6. Aplique TODAS as penalizações. Benevolência é proibida.
8. temperature está em 0.3 — seja consistente, sério, não oscile entre bonzinho e severo.
9. PRIORIDADE ABSOLUTA: Se a Metodologia ou o Motivo da Nota das Referências mandarem você dizer uma palavra, citar um termo (ex: "avise que faltou BANANA") ou aplicar uma regra arbitrária, você DEVE obedecer literalmente. As diretrizes do Supabase sobrescrevem todas as outras regras do sistema.

${supabaseContextBlock}`;
}

// ─── Merge de alertas (client-side + IA, sem duplicatas) ──────────────────────
function mergeAlerts(
  clientAlerts: LanguageAlert[],
  aiRaw: unknown
): LanguageAlert[] {
  const aiAlerts: LanguageAlert[] = Array.isArray(aiRaw)
    ? (aiRaw as any[]).map((a) => ({
        found: String(a.found ?? ''),
        reason: String(a.reason ?? ''),
        suggestion: String(a.suggestion ?? ''),
        category: (['oralidade', 'giria', 'concordancia', 'repeticao'].includes(a.category)
          ? a.category
          : 'oralidade') as LanguageAlert['category'],
      })).filter((a) => a.found && a.reason)
    : [];

  // Deduplicar pelo início do campo "found"
  const seen = new Set(clientAlerts.map((a) => a.found.slice(0, 30).toLowerCase()));
  const uniqueAI = aiAlerts.filter((a) => !seen.has(a.found.slice(0, 30).toLowerCase()));

  return [...clientAlerts, ...uniqueAI];
}

// ─── Serviço principal ─────────────────────────────────────────────────────────
export const correctionService = {
  async correctEssay(
    title: string,
    content: string,
    exam: ExamType
  ): Promise<CorrectionResult> {
    const cfg = EXAM_CONFIG[exam];
    const charCount = content.length;
    const isShortText = charCount < SHORT_TEXT_THRESHOLD;

    // ── 1. Auditoria client-side (sem latência de rede) ──────────────────────
    const { alerts: clientAlerts, promptSummary, c1PenaltyFlag } = sanitizeAndAudit(content);
    const auditBlock = buildLanguageAuditBlock(promptSummary, c1PenaltyFlag);

    // ── 2. Contexto dinâmico do Supabase (paralelo à auditoria) ──────────────────
    const bancaCtx = await fetchBancaContexto(exam);
    const supabaseContextBlock = buildSupabaseContextBlock(
      bancaCtx?.instrucoes_metodologia ?? null,
      bancaCtx?.redacoes_referencia ?? null
    );

    const shortNote = isShortText
      ? `\n\n⚠️ Este texto tem apenas ${charCount} caracteres. Aplique todas as penalizações para textos curtos.`
      : '';

    const userMessage = `Tema: ${title}\n\nTexto do aluno (${charCount} chars):\n${content}${shortNote}`;

    // ── 3. Chamada à API OpenAI ─────────────────────────────────────────────────────
    let raw = '{}';
    try {
      const response = await _client.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt(exam, isShortText, charCount, auditBlock, supabaseContextBlock) },
          { role: 'user', content: userMessage },
        ],
      });
      raw = response.choices[0].message.content ?? '{}';
    } catch {
      throw new Error(
        'Não foi possível conectar ao motor de análise. Verifique sua conexão e tente novamente.'
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('A análise retornou um formato inesperado. Por favor, tente novamente.');
    }

    const rawTotal: number = (parsed.competencies ?? []).reduce(
      (acc: number, c: any) => acc + (Number(c.score) || 0),
      0
    );

    // Teto de 40% para textos curtos (dupla segurança: prompt + TypeScript)
    const shortCap = isShortText ? Math.floor(cfg.maxTotal * 0.4) : cfg.maxTotal;
    const realTotal = Math.min(rawTotal, shortCap);

    const result: CorrectionResult = {
      id: crypto.randomUUID(),
      essayTitle: title,
      exam,
      totalScore: realTotal,
      maxTotalScore: cfg.maxTotal,
      createdAt: new Date().toISOString(),
      competencies: (parsed.competencies ?? []).map((c: any, i: number) => ({
        id: c.id ?? i + 1,
        name: c.name ?? cfg.competencies[i],
        score: Number(c.score) || 0,
        maxScore: cfg.maxPerComp,
        feedback: c.feedback ?? '',
        highlights: Array.isArray(c.highlights) ? c.highlights : [],
      })),
      generalSuggestions: Array.isArray(parsed.generalSuggestions)
        ? parsed.generalSuggestions
        : [],
      rewrittenEssay: parsed.rewrittenEssay ?? undefined,
      pedagogicalSummary: typeof parsed.pedagogicalSummary === 'string' ? parsed.pedagogicalSummary : undefined,
      whyNotPerfect: typeof parsed.whyNotPerfect === 'string' ? parsed.whyNotPerfect : undefined,
      languageAlerts: mergeAlerts(clientAlerts, parsed.languageAlerts),
    };

    // ── 4. Salvar no Supabase em background (não bloqueia a UI) ──────────────────
    // Monta o objeto Essay completo para persistência
    saveRedacao({
      id: result.id,
      title,
      content,
      exam,
      createdAt: result.createdAt,
      status: 'CORRECTED',
      result,
    }).catch(() => { /* silent — localStorage já garante persistência local */ });

    return result;
  },
};
