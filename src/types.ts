export type ExamType = 'ENEM' | 'SSA' | 'CESAR' | 'UNICAP';

export interface CompetencyScore {
  id: number;
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
  highlights: string[];
}

export type LanguageAlertCategory = 'oralidade' | 'giria' | 'concordancia' | 'repeticao';

export interface LanguageAlert {
  found: string;      // trecho exato detectado
  reason: string;     // por que está errado
  suggestion: string; // versão formal correta
  category: LanguageAlertCategory;
}

export interface CorrectionResult {
  id: string;
  totalScore: number;
  maxTotalScore: number;
  competencies: CompetencyScore[];
  generalSuggestions: string[];
  rewrittenEssay?: string;
  pedagogicalSummary?: string;
  whyNotPerfect?: string;
  languageAlerts?: LanguageAlert[];
  essayTitle: string;
  exam: ExamType;
  createdAt: string;
}

export interface Essay {
  id: string;
  title: string;
  content: string;
  exam: ExamType;
  createdAt: string;
  status: 'PENDING' | 'CORRECTED';
  result?: CorrectionResult;
}
