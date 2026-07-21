import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Essay, ExamType, CorrectionResult } from '../types';
import { fetchRedacoes, deleteRedacao } from '../services/supabaseService';

// Histórico de mensagens da sessão atual
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AppState {
  currentEssay: {
    title: string;
    content: string;
    exam: ExamType;
  };
  lastCorrection: CorrectionResult | null;
  history: Array<Essay>;          // persisted in localStorage
  isCorrecting: boolean;
  phase: 'IDLE' | 'ANALYZED' | 'CORRECTED';
  sidebarCollapsed: boolean;
  conversationHistory: ConversationMessage[];
  correctionError: string | null;

  setEssayTitle: (title: string) => void;
  setEssayContent: (content: string) => void;
  setExam: (exam: ExamType) => void;
  setCorrecting: (isCorrecting: boolean) => void;
  setPhase: (phase: 'IDLE' | 'ANALYZED' | 'CORRECTED') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  addCorrection: (result: CorrectionResult) => void;
  deleteEssay: (id: string) => void;
  addConversationMessage: (message: ConversationMessage) => void;
  clearConversation: () => void;
  setCorrectionError: (error: string | null) => void;
  getEssayById: (id: string) => Essay | undefined;
  loadHistoryFromSupabase: () => Promise<void>;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentEssay: { title: '', content: '', exam: 'ENEM' },
      lastCorrection: null,
      history: [],
      isCorrecting: false,
      phase: 'IDLE',
      sidebarCollapsed: false,
      conversationHistory: [],
      correctionError: null,

      setEssayTitle: (title) =>
        set((state) => ({ currentEssay: { ...state.currentEssay, title } })),

      setEssayContent: (content) =>
        set((state) => ({ currentEssay: { ...state.currentEssay, content } })),

      setExam: (exam) =>
        set((state) => ({ currentEssay: { ...state.currentEssay, exam } })),

      setCorrecting: (isCorrecting) => set({ isCorrecting }),
      setPhase: (phase) => set({ phase }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setCorrectionError: (correctionError) => set({ correctionError }),

      addCorrection: (result) =>
        set((state) => {
          const newEssay: Essay = {
            id: result.id,
            title: result.essayTitle,
            content: state.currentEssay.content,
            exam: result.exam,
            createdAt: result.createdAt,
            status: 'CORRECTED',
            result,
          };

          const userMsg: ConversationMessage = {
            role: 'user',
            content: `Tema: ${result.essayTitle}\nBanca: ${result.exam}\nConteúdo: ${state.currentEssay.content}`,
            timestamp: result.createdAt,
          };
          const assistantMsg: ConversationMessage = {
            role: 'assistant',
            content: `Correção realizada. Nota: ${result.totalScore}/${result.maxTotalScore}. Competências: ${result.competencies.map((c) => `${c.name}: ${c.score}`).join(', ')}.`,
            timestamp: new Date().toISOString(),
          };

          return {
            lastCorrection: result,
            history: [newEssay, ...state.history],
            conversationHistory: [...state.conversationHistory, userMsg, assistantMsg],
          };
        }),

      deleteEssay: (id) =>
        set((state) => {
          // Remove do Supabase em background
          deleteRedacao(id).catch(() => {});
          return { history: state.history.filter((e) => e.id !== id) };
        }),

      addConversationMessage: (message) =>
        set((state) => ({ conversationHistory: [...state.conversationHistory, message] })),

      clearConversation: () => set({ conversationHistory: [] }),
      clearHistory: () => set({ history: [] }),

      // Selector helper — usado pela tela de detalhe
      getEssayById: (id: string) => get().history.find((e) => e.id === id),

      // Sincroniza histórico com o Supabase e mescla com cache local
      loadHistoryFromSupabase: async () => {
        try {
          const remoteEssays = await fetchRedacoes();
          if (remoteEssays.length === 0) return;

          set((state) => {
            // Constrói mapa do cache local
            const localMap = new Map(state.history.map((e) => [e.id, e]));
            // Supabase tem prioridade em conflitos
            for (const essay of remoteEssays) {
              localMap.set(essay.id, essay);
            }
            // Reordena por data decrescente
            const merged = Array.from(localMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            return { history: merged };
          });
        } catch {
          // silent — localStorage continua como fallback
        }
      },
    }),
    {
      name: 'disserta-ai-storage', // chave no localStorage
      storage: createJSONStorage(() => localStorage),
      // Persiste apenas o histórico e a preferência de sidebar
      partialize: (state) => ({
        history: state.history,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
