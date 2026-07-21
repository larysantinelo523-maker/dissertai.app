/**
 * languageAudit.ts
 * Motor de detecção client-side de vícios de linguagem.
 * Roda localmente (sem API) antes do envio — zero latência adicional.
 */

import { LanguageAlert, LanguageAlertCategory } from '../types';

// ─── Definição da watchlist ────────────────────────────────────────────────────

interface WatchRule {
  pattern: RegExp;
  category: LanguageAlertCategory;
  reason: string;
  buildSuggestion: (match: string) => string;
}

const WATCH_RULES: WatchRule[] = [
  // ── MARCAS DE ORALIDADE ────────────────────────────────────────────────────
  {
    pattern: /\bné\b|\bné,\b/gi,
    category: 'oralidade',
    reason: 'Marcador conversacional típico da fala informal. Proibido em textos dissertativos.',
    buildSuggestion: () => 'Substitua por uma conjunção adversativa ou adversativa: "contudo", "entretanto", "no entanto".',
  },
  {
    pattern: /\btá\b|\btô\b|\btão\b(?! [a-záéíóúâêîôûãõàü])/gi,
    category: 'oralidade',
    reason: 'Contração verbal informal de "está/estou". Inadequada para o registro culto escrito.',
    buildSuggestion: (m) =>
      m.toLowerCase().startsWith('tô') ? 'Substitua por "estou".' : 'Substitua por "está" ou "estão".',
  },
  {
    pattern: /\btipo assim\b|\btipo que\b/gi,
    category: 'oralidade',
    reason: '"Tipo assim" é marcador de hesitação da fala coloquial, sem valor semântico em textos formais.',
    buildSuggestion: () => 'Remova completamente ou reescreva a frase com clareza objetiva.',
  },
  {
    pattern: /\baí\b(?!\s*(?:em\b|está\b|vai\b|vem\b))/gi,
    category: 'oralidade',
    reason: '"Aí" usado como conector sequencial é marca de oralidade. Correto apenas como advérbio de lugar.',
    buildSuggestion: () => 'Substitua por "portanto", "dessa forma", "nesse contexto" ou "assim".',
  },
  {
    pattern: /\bdaí\b(?!\s*(?:em\b|pra\b))/gi,
    category: 'oralidade',
    reason: '"Daí" sequencial é coloquialismo. Inadequado em redações formais.',
    buildSuggestion: () => 'Substitua por "consequentemente", "desse modo" ou "logo".',
  },
  {
    pattern: /\bentão\b(?=\s*,)/gi,
    category: 'oralidade',
    reason: '"Então," no início de frases é padrão da fala oral. Em texto escrito, deve ser evitado como conector de abertura.',
    buildSuggestion: () => 'Substitua por "portanto," ou "dessa maneira,".',
  },
  {
    pattern: /\ba gente\b/gi,
    category: 'oralidade',
    reason: '"A gente" como substituto de "nós" é marca de oralidade e deve ser evitado em redações formais.',
    buildSuggestion: () => 'Substitua por "nós" (com o verbo na 1ª pessoa do plural) ou use construção impessoal.',
  },
  {
    pattern: /\beu acho\b|\bacho que\b/gi,
    category: 'oralidade',
    reason: 'Expressão de subjetividade informal. Redações dissertativas exigem impessoalidade.',
    buildSuggestion: () => 'Substitua por "é possível afirmar que", "nota-se que" ou elimine e construa o argumento de forma objetiva.',
  },
  {
    pattern: /\bpra\b|\bpra\s/gi,
    category: 'oralidade',
    reason: '"Pra" é contração informal de "para". Inadequada em textos escritos formais.',
    buildSuggestion: () => 'Substitua por "para".',
  },

  // ── GÍRIAS E EXPRESSÕES COLOQUIAIS ─────────────────────────────────────────
  {
    pattern: /\bpaia\b|\bpaiando\b/gi,
    category: 'giria',
    reason: 'Gíria informal sem correspondente no registro culto. Uso inadmissível em redações.',
    buildSuggestion: () => 'Descreva o conceito formalmente: "ineficaz", "inábil", "despreparado".',
  },
  {
    pattern: /\bmoscando\b|\bmoscar\b/gi,
    category: 'giria',
    reason: 'Gíria coloquial sem valor semântico preciso em contexto formal.',
    buildSuggestion: () => 'Substitua por "negligenciando", "omitindo-se", "deixando de agir".',
  },
  {
    pattern: /\bbagulho\b/gi,
    category: 'giria',
    reason: '"Bagulho" é gíria popular sem lugar em textos dissertativos acadêmicos.',
    buildSuggestion: () => 'Use o substantivo específico que se refere ao objeto/conceito: "fenômeno", "problema", "situação".',
  },
  {
    pattern: /\bé nois\b|\bé nós\b(?!\s+que)/gi,
    category: 'giria',
    reason: 'Expressão gíria de pertencimento. Completamente inadequada em redações formais.',
    buildSuggestion: () => 'Remova. Reescreva o trecho com argumento formal.',
  },
  {
    pattern: /\bgalera\b/gi,
    category: 'giria',
    reason: '"Galera" é gíria para grupo de pessoas. Inadmissível em textos formais.',
    buildSuggestion: () => 'Substitua por "a população", "os jovens", "os cidadãos" ou o grupo específico referido.',
  },
  {
    pattern: /\bnem liga\b/gi,
    category: 'giria',
    reason: '"Nem liga" é expressão gíria de indiferença.',
    buildSuggestion: () => 'Substitua por "ignora", "é indiferente a" ou "desconsidera".',
  },
  {
    pattern: /\bmó\b|\bmonstro\b(?!\s+(?:de|do|da))/gi,
    category: 'giria',
    reason: 'Gíria intensificadora informal.',
    buildSuggestion: () => 'Substitua pelo adjetivo formal adequado: "extremamente", "significativo", "relevante".',
  },
  {
    pattern: /\bvia de regra\b/gi,
    category: 'oralidade',
    reason: '"Via de regra" é clichê de linguagem burocrática/oral que enfraquece o texto dissertativo.',
    buildSuggestion: () => 'Substitua por "geralmente", "em geral" ou reescreva sem o bordão.',
  },

  // ── ERROS DE CONCORDÂNCIA ──────────────────────────────────────────────────
  {
    pattern: /\bas\s+terra\b|\ba\s+terra\b(?!\s+[A-ZÁÉÍÓÚ])/gi,
    category: 'concordancia',
    reason: 'Erro de concordância nominal: o substantivo "terras" exige plural concordante.',
    buildSuggestion: () => 'Corrija para "as terras" (plural) ou "a terra" (singular com artigo correto).',
  },
  {
    pattern: /\bas\s+água\b/gi,
    category: 'concordancia',
    reason: 'Erro de concordância nominal: "água" no plural exige "as águas".',
    buildSuggestion: () => 'Corrija para "as águas".',
  },
  {
    pattern: /\bos\s+filho\b(?!\s+[a-záéíóú])/gi,
    category: 'concordancia',
    reason: 'Erro de concordância nominal: o artigo "os" exige o substantivo no plural "filhos".',
    buildSuggestion: () => 'Corrija para "os filhos".',
  },
  {
    pattern: /\bhaverão\b(?=\s+(?:muitos|mais|menos|tantos|vários))/gi,
    category: 'concordancia',
    reason: '"Haver" no sentido de "existir" é impessoal — não flexiona no plural. Erro grave de concordância.',
    buildSuggestion: () => 'Substitua "haverão" por "haverá".',
  },
  {
    pattern: /\bfazem\s+(?:\w+\s+)?anos?\b/gi,
    category: 'concordancia',
    reason: '"Fazer" no sentido de "decorrer tempo" é impessoal. Uso no plural é erro de concordância.',
    buildSuggestion: () => 'Substitua por "faz ... anos" (singular).',
  },

  // ── REPETIÇÕES VICIADAS ─────────────────────────────────────────────────────
  {
    // Detecta "e" repetido mais de 3 vezes em sequência curta (ex: "X e Y e Z e W")
    pattern: /(?:\w[\w\s,]{1,30}\s+e\s+){3,}/gi,
    category: 'repeticao',
    reason: 'Encadeamento excessivo com "e" cria frases longas e monótonas, caracterizando oralidade.',
    buildSuggestion: () => 'Quebre em frases menores ou use conectivos variados: "além disso", "ademais", "somado a isso".',
  },
  {
    // "que" repetido em cadeia (ex: "sei que acho que parece que")
    pattern: /(?:que\s+\w+\s+){3,}/gi,
    category: 'repeticao',
    reason: 'Encadeamento de orações com "que" consecutivo é vício estilístico que empobrece o texto.',
    buildSuggestion: () => 'Reestruture as orações evitando mais de dois "que" por período.',
  },
  {
    pattern: /\bporque\b.{1,60}\bporque\b/gi,
    category: 'repeticao',
    reason: 'Repetição de "porque" em curto intervalo fragiliza a coesão e o estilo.',
    buildSuggestion: () => 'Substitua um dos "porque" por "visto que", "uma vez que" ou "dado que".',
  },
];

// ─── Função principal de auditoria ────────────────────────────────────────────

/**
 * Percorre o texto do aluno antes do envio para a API.
 * Retorna a lista de alertas detectados e o resumo para injeção no prompt.
 */
export function sanitizeAndAudit(text: string): {
  alerts: LanguageAlert[];
  promptSummary: string;
  c1PenaltyFlag: boolean; // true se > 2 gírias ou > 3 marcas de oralidade → teto C1
} {
  const alerts: LanguageAlert[] = [];
  const seen = new Set<string>(); // evita duplicatas do mesmo trecho

  for (const rule of WATCH_RULES) {
    const matches = [...text.matchAll(rule.pattern)];
    for (const m of matches) {
      const found = m[0].trim();
      const key = `${rule.category}::${found.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Extrai contexto (até 60 chars ao redor do match)
      const start = Math.max(0, (m.index ?? 0) - 20);
      const end = Math.min(text.length, (m.index ?? 0) + found.length + 40);
      const context = text.slice(start, end).replace(/\n/g, ' ').trim();

      alerts.push({
        found: context.length > found.length ? `"...${context}..."` : `"${found}"`,
        reason: rule.reason,
        suggestion: rule.buildSuggestion(found),
        category: rule.category,
      });
    }
  }

  // Contagem para flag de penalização
  const girias = alerts.filter((a) => a.category === 'giria').length;
  const oralidade = alerts.filter((a) => a.category === 'oralidade').length;
  const c1PenaltyFlag = girias > 2 || oralidade > 3;

  // Resumo compacto para injetar no system prompt da API
  const promptSummary =
    alerts.length === 0
      ? ''
      : `
PRÉ-ANÁLISE AUTOMÁTICA DE LINGUAGEM (detectado antes da avaliação):
${alerts
  .map(
    (a, i) =>
      `${i + 1}. [${a.category.toUpperCase()}] ${a.found} → ${a.reason}`
  )
  .join('\n')}
${c1PenaltyFlag ? '\n⚠️ FLAG C1: mais de 2 gírias ou 3 marcas de oralidade detectadas → C1 TETO 40 (ENEM) / 8 (demais).' : ''}
Use esses achados para CONFIRMAR ou REFINAR sua avaliação de C1. NÃO os ignore.
`;

  return { alerts, promptSummary, c1PenaltyFlag };
}
