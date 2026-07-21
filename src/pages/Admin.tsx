import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Trash2, Save, ChevronDown, ChevronUp,
  Loader2, CheckCircle2, AlertCircle, GraduationCap, RefreshCw,
} from 'lucide-react';
import { Button, cn } from '../components/ui/Base';
import { ExamType } from '../types';
import {
  fetchAllBancas,
  updateBancaContexto,
  addRedacaoReferencia,
  updateRedacaoReferencia,
  deleteRedacaoReferencia,
  BancaContexto,
  RedacaoReferencia,
} from '../services/supabaseService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EXAM_TABS: ExamType[] = ['ENEM', 'SSA', 'CESAR', 'UNICAP'];

const EXAM_COLOR: Record<ExamType, string> = {
  ENEM: 'bg-emerald-500',
  SSA: 'bg-sky-500',
  CESAR: 'bg-violet-500',
  UNICAP: 'bg-amber-500',
};

const EXAM_DESC: Record<ExamType, string> = {
  ENEM: 'Exame Nacional do Ensino Médio — escala 0–1000',
  SSA: 'UPE — Sistema Seriado de Avaliação — escala 0–100',
  CESAR: 'CESAR School — Redação técnica — escala 0–100',
  UNICAP: 'Universidade Católica de Pernambuco — escala 0–100',
};

function newRef(): RedacaoReferencia {
  return { id: crypto.randomUUID(), tema: '', titulo: '', texto: '', nota: 1000, observacoes: '' };
}

// ─── Card de redação de referência ────────────────────────────────────────────

function RefCard({
  nomeBanca,
  ref: r,
  index,
  isNew = false,
  onSaveComplete,
  onRemoveComplete,
}: {
  nomeBanca: string;
  ref: RedacaoReferencia;
  index: number;
  isNew?: boolean;
  onSaveComplete: () => void;
  onRemoveComplete: () => void;
}) {
  const [open, setOpen] = useState(index === 0 || isNew);
  const [data, setData] = useState<RedacaoReferencia>(r);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle');

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    let result;
    
    if (isNew) {
      result = await addRedacaoReferencia(nomeBanca, data);
    } else {
      result = await updateRedacaoReferencia(data.id, data);
    }
    
    setSaving(false);
    if (result.ok) {
      setStatus('ok');
      setTimeout(() => setStatus('idle'), 2000);
      onSaveComplete(); // trigger reload list
    } else {
      setStatus('error');
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      onRemoveComplete(); // Just remove from screen
      return;
    }
    
    if (!confirm('Tem certeza que deseja excluir esta redação de referência?')) return;
    
    setDeleting(true);
    const result = await deleteRedacaoReferencia(data.id);
    if (result.ok) {
      onRemoveComplete();
    } else {
      setDeleting(false);
      alert('Erro ao excluir: ' + result.error);
    }
  };

  return (
    <div className={cn("border rounded-xl overflow-hidden bg-white shadow-sm transition-colors", status === 'ok' ? 'border-success/50' : 'border-border')}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-bg/40 border-b border-border/60">
        <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">
          {isNew ? '*' : index + 1}
        </span>
        <div className="flex flex-col flex-1 gap-2">
          <input
            className="bg-transparent text-sm font-bold text-text-primary outline-none placeholder:text-text-muted"
            placeholder="Tema da redação (ex: Os desafios da saúde pública)"
            value={data.tema || ''}
            onChange={(e) => setData({ ...data, tema: e.target.value })}
          />
          <input
            className="w-full bg-white border border-border rounded-md px-3 py-1.5 text-sm text-text-secondary outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-text-muted/60"
            placeholder="Título da redação (Opcional)"
            value={data.titulo}
            onChange={(e) => setData({ ...data, titulo: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={1000}
            className="w-20 text-xs text-center border border-border rounded-md px-2 py-1 font-mono text-accent font-bold outline-none focus:ring-2 focus:ring-accent/40"
            value={data.nota}
            onChange={(e) => setData({ ...data, nota: Number(e.target.value) })}
            title="Nota desta redação"
          />
          
          <Button onClick={handleSave} disabled={saving} size="sm" className="h-8 px-3 text-xs gap-1.5">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {isNew ? 'Salvar nova' : 'Atualizar'}
          </Button>

          <button
            onClick={() => setOpen(!open)}
            className="text-text-muted hover:text-accent p-1.5 rounded transition-colors ml-1"
          >
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-text-muted hover:text-danger p-1.5 rounded transition-colors"
            title="Excluir redação"
          >
             {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-1 duration-200 bg-white">
          {/* Texto */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">
              Texto completo da redação
            </label>
            <textarea
              rows={10}
              className="w-full p-3 border border-border rounded-lg text-sm font-serif leading-relaxed text-text-primary outline-none focus:ring-2 focus:ring-accent/40 resize-y"
              placeholder="Cole aqui o texto completo da redação nota máxima..."
              value={data.texto}
              onChange={(e) => setData({ ...data, texto: e.target.value })}
            />
          </div>
          {/* Observações */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">
              Observações do corretor (por que tirou nota máxima?)
            </label>
            <textarea
              rows={3}
              className="w-full p-3 border border-border rounded-lg text-sm text-text-secondary outline-none focus:ring-2 focus:ring-accent/40 resize-none"
              placeholder="Ex: Destaque os pontos fortes que justificam a nota máxima..."
              value={data.observacoes}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Painel de uma banca ──────────────────────────────────────────────────────

function BancaPanel({ banca: initial, onReload }: { banca: BancaContexto, onReload: () => void }) {
  const [instrucoes, setInstrucoes] = useState(initial.instrucoes_metodologia ?? '');
  const [savingInstrucoes, setSavingInstrucoes] = useState(false);
  const [statusInstrucoes, setStatusInstrucoes] = useState<'idle' | 'ok' | 'error'>('idle');
  
  const [newRefs, setNewRefs] = useState<RedacaoReferencia[]>([]);

  // Update internal state when initial changes
  useEffect(() => {
    setInstrucoes(initial.instrucoes_metodologia ?? '');
    setNewRefs([]);
  }, [initial]);

  const handleSaveInstrucoes = async () => {
    setSavingInstrucoes(true);
    setStatusInstrucoes('idle');
    const result = await updateBancaContexto(initial.nome_banca, instrucoes);
    setSavingInstrucoes(false);
    if (result.ok) {
      setStatusInstrucoes('ok');
      setTimeout(() => setStatusInstrucoes('idle'), 3000);
      onReload();
    } else {
      setStatusInstrucoes('error');
    }
  };

  const addNewRefForm = () => setNewRefs((prev) => [...prev, newRef()]);

  const refs = initial.redacoes_referencia || [];

  return (
    <div className="space-y-10">
      {/* Metodologia */}
      <section className="bg-bg/20 p-5 rounded-2xl border border-border">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-accent" />
          <h3 className="text-sm font-bold text-text-primary">Instruções de Metodologia</h3>
          <span className="ml-auto text-[10px] text-text-muted">{instrucoes.length} chars</span>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Estas instruções serão injetadas no sistema de IA como o "Manual do Corretor" desta banca.
        </p>
        <textarea
          rows={10}
          className="w-full p-4 border border-border rounded-xl text-sm leading-relaxed text-text-primary outline-none focus:ring-2 focus:ring-accent/40 resize-y bg-white font-mono mb-4"
          placeholder="Descreva todos os critérios de avaliação desta banca..."
          value={instrucoes}
          onChange={(e) => setInstrucoes(e.target.value)}
        />
        <div className="flex items-center gap-4 justify-end">
          {statusInstrucoes === 'ok' && (
            <span className="text-sm text-success font-medium flex items-center gap-1.5">
              <CheckCircle2 size={16} /> Instruções salvas!
            </span>
          )}
          {statusInstrucoes === 'error' && (
            <span className="text-sm text-danger font-medium flex items-center gap-1.5">
              <AlertCircle size={16} /> Erro ao salvar
            </span>
          )}
          <Button onClick={handleSaveInstrucoes} disabled={savingInstrucoes} className="gap-2">
            {savingInstrucoes ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Salvar Instruções
          </Button>
        </div>
      </section>

      <hr className="border-border" />

      {/* Redações de referência */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} className="text-accent" />
          <h3 className="text-sm font-bold text-text-primary">
            Redações de Referência ({refs.length})
          </h3>
          <button
            onClick={addNewRefForm}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-accent hover:bg-accent/10 px-3 py-1.5 rounded-lg transition-colors border border-accent/20"
          >
            <Plus size={14} />
            Adicionar nova redação
          </button>
        </div>
        <p className="text-xs text-text-muted mb-6">
          Insira redações que tiraram nota máxima. Cada uma é salva de forma independente.
        </p>

        <div className="space-y-6">
          {/* Existing references */}
          {refs.map((r, i) => (
            <RefCard
              key={r.id}
              nomeBanca={initial.nome_banca}
              ref={r}
              index={i}
              onSaveComplete={onReload}
              onRemoveComplete={onReload}
            />
          ))}

          {/* New unsubmitted references */}
          {newRefs.map((r, i) => (
            <RefCard
              key={r.id}
              nomeBanca={initial.nome_banca}
              ref={r}
              index={refs.length + i}
              isNew={true}
              onSaveComplete={onReload}
              onRemoveComplete={() => setNewRefs(prev => prev.filter(x => x.id !== r.id))}
            />
          ))}

          {refs.length === 0 && newRefs.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
              <GraduationCap size={32} className="text-text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-text-muted mb-4">Nenhuma redação de referência cadastrada ainda.</p>
              <button
                onClick={addNewRefForm}
                className="flex items-center gap-2 text-sm font-semibold text-accent hover:underline mx-auto"
              >
                <Plus size={15} /> Adicionar primeira redação
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Página principal Admin ───────────────────────────────────────────────────

export function Admin() {
  const [activeTab, setActiveTab] = useState<ExamType>('ENEM');
  const [bancas, setBancas] = useState<Record<string, BancaContexto>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const all = await fetchAllBancas();

      if (!all || all.length === 0) {
        setLoadError('Nenhuma banca encontrada no banco de dados. Verifique a chave e se as tabelas existem.');
      } else {
        const map: Record<string, BancaContexto> = {};
        for (const b of all) map[b.nome_banca] = b;
        setBancas(map);
      }
    } catch (e: any) {
      setLoadError(e?.message || 'Erro desconhecido ao carregar.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 md:p-8 max-w-4xl md:mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <p className="text-text-secondary text-sm">
          Gerencie as instruções e redações de referência de cada banca. As alterações entram em vigor imediatamente na correção dos alunos.
        </p>
      </div>

      {/* Tabs das bancas */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {EXAM_TABS.map((exam) => (
          <button
            key={exam}
            onClick={() => setActiveTab(exam)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border',
              activeTab === exam
                ? 'bg-accent text-white border-accent shadow-md scale-105'
                : 'bg-white text-text-secondary border-border hover:border-accent/40 hover:text-accent'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', EXAM_COLOR[exam])} />
            {exam}
          </button>
        ))}
        <button
          onClick={load}
          disabled={loading}
          className="ml-auto flex items-center gap-1.5 text-xs text-text-muted hover:text-accent px-3 py-2 rounded-full border border-border hover:border-accent/40 transition-colors"
          title="Recarregar dados"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Carregando...' : 'Recarregar'}
        </button>
      </div>

      {/* Descrição da banca ativa */}
      <div className={cn('rounded-xl px-5 py-3 mb-6 flex items-center gap-3', EXAM_COLOR[activeTab] + '/10 border border-' + activeTab.toLowerCase() + '/20')}>
        <span className={cn('w-3 h-3 rounded-full shrink-0', EXAM_COLOR[activeTab])} />
        <p className="text-sm text-text-secondary">{EXAM_DESC[activeTab]}</p>
      </div>

      {/* Conteúdo */}
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="text-sm text-text-muted">Carregando dados do Supabase...</p>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <AlertCircle size={32} className="text-danger" />
            <p className="text-sm text-text-secondary font-medium">Não foi possível carregar os dados.</p>
            <p className="text-xs text-text-muted max-w-sm font-mono bg-bg/50 p-2 rounded border border-border mt-2">
              Detalhe do erro: {loadError}
            </p>
            <Button variant="secondary" onClick={load} className="gap-2 mt-4">
              <RefreshCw size={14} /> Tentar novamente
            </Button>
          </div>
        ) : bancas[activeTab] ? (
          <BancaPanel key={activeTab} banca={bancas[activeTab]} onReload={load} />
        ) : (
          <div className="py-20 text-center text-text-muted text-sm">
            Banca "{activeTab}" não encontrada no banco de dados.
          </div>
        )}
      </div>
    </div>
  );
}
