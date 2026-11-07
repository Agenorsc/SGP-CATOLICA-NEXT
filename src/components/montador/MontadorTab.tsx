'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  Printer, 
  Layers, 
  GraduationCap, 
  Globe,
  AlertCircle,
  Clock,
  Sparkles,
  History
} from 'lucide-react';
import { Question, AvaliacaoCiclo, ProvaMontadaRegistro } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';
import { ContagemCiclos } from '@/services/QuestionService';
import { HistoricoProvasSection } from './HistoricoProvasSection';
import { ModalEspelhoProva } from './ModalEspelhoProva';

interface MontadorTabProps {
  bancoQuestoes: Question[];
  questoesFiltradas: Question[];
  questoesSelecionadas: Question[];
  turmas: TurmaModel[];
  turmaSelecionadaId: string;
  setTurmaSelecionadaId: (id: string) => void;
  tituloProva: string;
  setTituloProva: (titulo: string) => void;
  buscaQuestao: string;
  setBuscaQuestao: (busca: string) => void;
  cicloSelecionado: AvaliacaoCiclo | 'TODAS';
  setCicloSelecionado: (ciclo: AvaliacaoCiclo | 'TODAS') => void;
  filtroApenasTurma: boolean;
  setFiltroApenasTurma: (val: boolean) => void;
  contagemCiclos: ContagemCiclos;
  shuffleQ: boolean;
  setShuffleQ: (shuffle: boolean) => void;
  shuffleAlt: boolean;
  setShuffleAlt: (shuffle: boolean) => void;
  withId: boolean;
  setWithId: (val: boolean) => void;
  pontuacaoTotal: number;
  provasMontadas?: ProvaMontadaRegistro[];
  onSalvarProva?: (prova: ProvaMontadaRegistro) => void;
  onExcluirProva?: (id: string) => void;
  onCarregarProvaParaReimpressao?: (prova: ProvaMontadaRegistro) => void;
  onIrParaRelatorioDaTurma?: (turmaId: string) => void;
  onOpenNovaQuestao: () => void;
  onEditQuestao: (q: Question) => void;
  onDeleteQuestao: (id: string) => void;
  onAdicionarNaProva: (q: Question) => void;
  onRemoverDaProva: (id: string) => void;
  onIrParaImpressao: () => void;
}

export function MontadorTab({
  bancoQuestoes,
  questoesFiltradas,
  questoesSelecionadas,
  turmas,
  turmaSelecionadaId,
  setTurmaSelecionadaId,
  tituloProva,
  setTituloProva,
  buscaQuestao,
  setBuscaQuestao,
  cicloSelecionado,
  setCicloSelecionado,
  filtroApenasTurma,
  setFiltroApenasTurma,
  contagemCiclos,
  shuffleQ,
  setShuffleQ,
  shuffleAlt,
  setShuffleAlt,
  withId,
  setWithId,
  pontuacaoTotal,
  provasMontadas = [],
  onSalvarProva,
  onExcluirProva,
  onCarregarProvaParaReimpressao,
  onIrParaRelatorioDaTurma,
  onOpenNovaQuestao,
  onEditQuestao,
  onDeleteQuestao,
  onAdicionarNaProva,
  onRemoverDaProva,
  onIrParaImpressao
}: MontadorTabProps) {
  const [subAbaAtiva, setSubAbaAtiva] = useState<'montador' | 'historico'>('montador');
  const [avisoValidacao, setAvisoValidacao] = useState('');
  const [provaEspelhoSelecionada, setProvaEspelhoSelecionada] = useState<ProvaMontadaRegistro | null>(null);

  const turmaSelecionada = turmas.find(t => t.id === turmaSelecionadaId);
  const provasDaTurma = provasMontadas.filter(p => p.turmaId === turmaSelecionadaId);

  useEffect(() => {
    if (questoesSelecionadas.length > 0 && Math.abs(pontuacaoTotal - 10.0) < 0.05 && avisoValidacao) {
      setAvisoValidacao('');
    }
  }, [questoesSelecionadas.length, pontuacaoTotal, avisoValidacao]);

  const handleGerarCaderno = () => {
    if (questoesSelecionadas.length === 0) {
      setAvisoValidacao('Adicione ao menos 1 questão ao caderno para gerar a avaliação e o gabarito.');
      return;
    }

    if (Math.abs(pontuacaoTotal - 10.0) >= 0.05) {
      setAvisoValidacao(
        `A soma das questões deve ser exatamente 10.0 pontos para gerar o gabarito. Pontuação atual: ${pontuacaoTotal.toFixed(1)} pts`
      );
      return;
    }

    setAvisoValidacao('');

    // Arquivamento Automático da Prova Gerada com Snapshot
    if (onSalvarProva) {
      const novaProva: ProvaMontadaRegistro = {
        id: `prova_${Date.now()}`,
        titulo: tituloProva,
        turmaId: turmaSelecionadaId,
        turmaNome: turmaSelecionada?.nome || 'Turma',
        disciplina: turmaSelecionada?.curso || 'Direito / Engenharia',
        semestre: turmaSelecionada?.semestre || '2026/2',
        ciclo: cicloSelecionado === 'TODAS' ? 'N2' : cicloSelecionado,
        questoesSnapshot: JSON.parse(JSON.stringify(questoesSelecionadas)),
        totalQuestoes: questoesSelecionadas.length,
        pontuacaoTotal: Number(pontuacaoTotal.toFixed(1)),
        shuffleQuestoes: shuffleQ,
        shuffleAlternativas: shuffleAlt,
        nominalQrCode: withId,
        createdAt: new Date().toISOString()
      };
      onSalvarProva(novaProva);
    }

    onIrParaImpressao();
  };

  const getBadgeCiclo = (ciclo?: string) => {
    const c = (ciclo || 'N2').toUpperCase();
    switch (c) {
      case 'N1':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            N1
          </span>
        );
      case 'N2':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
            N2
          </span>
        );
      case 'N3':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            N3
          </span>
        );
      case 'N-1':
      case 'EXAME':
        return (
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            Exame (N-1)
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Geral
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-catolica-primary" /> Montador de Avaliações
          </h2>
          <p className="text-xs text-slate-500">
            Crie avaliações com gabaritos OMR dinâmicos e consulte o histórico de provas geradas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNovaQuestao}
            className="flex items-center gap-2 bg-catolica-primary hover:bg-catolica-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-catolica-primary/20 transition cursor-pointer"
          >
            <PlusCircle size={16} /> Nova Questão
          </button>
        </div>
      </header>

      {/* 1. SELETOR DE TURMAS DO PROFESSOR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-catolica-primary" />
            Turmas / Disciplinas do Professor:
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            {turmas.length} {turmas.length === 1 ? 'turma disponível' : 'turmas disponíveis'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {turmas.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhuma turma atribuída ao professor.</p>
          ) : (
            turmas.map(t => {
              const isSelected = turmaSelecionadaId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTurmaSelecionadaId(t.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-catolica-primary text-white shadow-md shadow-catolica-primary/25 ring-2 ring-catolica-primary/30'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{t.nome}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {t.semestre}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* SUB-ABAS: MONTADOR VS HISTÓRICO DE PROVAS GERADAS */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => setSubAbaAtiva('montador')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subAbaAtiva === 'montador'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Montar Nova Avaliação
          </button>

          <button
            type="button"
            onClick={() => setSubAbaAtiva('historico')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subAbaAtiva === 'historico'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico de Provas Geradas
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              subAbaAtiva === 'historico' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {provasDaTurma.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. CONTEÚDO DA SUB-ABA HISTÓRICO DE PROVAS GERADAS */}
      {subAbaAtiva === 'historico' && (
        <HistoricoProvasSection
          provas={provasMontadas}
          turmaSelecionadaId={turmaSelecionadaId}
          turmas={turmas}
          onVisualizarEspelho={(p) => setProvaEspelhoSelecionada(p)}
          onReimprimirProva={(p) => {
            if (onCarregarProvaParaReimpressao) onCarregarProvaParaReimpressao(p);
          }}
          onIrParaRelatorio={(p) => {
            if (onIrParaRelatorioDaTurma) onIrParaRelatorioDaTurma(p.turmaId);
          }}
          onExcluirProva={(id) => {
            if (onExcluirProva) onExcluirProva(id);
          }}
          onIrParaMontador={() => setSubAbaAtiva('montador')}
        />
      )}

      {/* 3. CONTEÚDO DA SUB-ABA MONTADOR ATIVO */}
      {subAbaAtiva === 'montador' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA ESQUERDA: BANCO DE QUESTÕES ORGANIZADO POR TURMA E CICLO */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-catolica-primary" /> Banco de Questões
                  </h3>
                  <p className="text-xs text-slate-500">
                    {turmaSelecionada ? `Turma: ${turmaSelecionada.nome}` : 'Todas as Turmas'}
                  </p>
                </div>
                <span className="text-xs bg-slate-100 font-bold px-3 py-1 rounded-lg text-slate-700 self-start sm:self-auto">
                  {questoesFiltradas.length} / {bancoQuestoes.length} disponíveis
                </span>
              </div>

              {/* Sub-abas de Ciclo Avaliativo: N1, N2, N3 e N-1 com Destaque Visual */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
                {[
                  { 
                    id: 'TODAS', 
                    label: 'Todas', 
                    count: contagemCiclos.todas,
                    activeClass: 'bg-slate-900 text-white shadow-md shadow-slate-900/20 ring-2 ring-slate-900/30',
                    inactiveClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
                    activeBadge: 'bg-white/20 text-white',
                    inactiveBadge: 'bg-slate-200 text-slate-700'
                  },
                  { 
                    id: 'N1', 
                    label: 'N1', 
                    count: contagemCiclos.n1,
                    activeClass: 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-600/30',
                    inactiveClass: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
                    activeBadge: 'bg-white/25 text-white',
                    inactiveBadge: 'bg-blue-200 text-blue-800'
                  },
                  { 
                    id: 'N2', 
                    label: 'N2', 
                    count: contagemCiclos.n2,
                    activeClass: 'bg-purple-700 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-700/30',
                    inactiveClass: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200',
                    activeBadge: 'bg-white/25 text-white',
                    inactiveBadge: 'bg-purple-200 text-purple-800'
                  },
                  { 
                    id: 'N3', 
                    label: 'N3', 
                    count: contagemCiclos.n3,
                    activeClass: 'bg-amber-600 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-600/30',
                    inactiveClass: 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200',
                    activeBadge: 'bg-white/25 text-white',
                    inactiveBadge: 'bg-amber-200 text-amber-900'
                  },
                  { 
                    id: 'N-1', 
                    label: 'Exame (N-1)', 
                    count: contagemCiclos.exame,
                    activeClass: 'bg-rose-600 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-600/30',
                    inactiveClass: 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200',
                    activeBadge: 'bg-white/25 text-white',
                    inactiveBadge: 'bg-rose-200 text-rose-900'
                  }
                ].map(tab => {
                  const isActive = cicloSelecionado === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCicloSelecionado(tab.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isActive ? tab.activeClass : tab.inactiveClass
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? tab.activeBadge : tab.inactiveBadge
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Barra de Busca e Filtro de Turma */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Buscar por enunciado ou tags..."
                    value={buscaQuestao}
                    onChange={(e) => setBuscaQuestao(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-catolica-primary"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFiltroApenasTurma(!filtroApenasTurma)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    filtroApenasTurma
                      ? 'bg-catolica-primary/10 border-catolica-primary/30 text-catolica-primary'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{filtroApenasTurma ? 'Apenas desta Turma' : 'Ver Todas do Banco'}</span>
                </button>
              </div>

              {/* Lista de Questões Filtradas */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {questoesFiltradas.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-600">Nenhuma questão encontrada com estes filtros.</p>
                    <p>Adicione novas questões ou selecione outra etapa avaliativa.</p>
                  </div>
                ) : (
                  questoesFiltradas.map((q) => {
                    const isSelected = questoesSelecionadas.some(item => item.id === q.id);

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border transition space-y-3 ${
                          isSelected ? 'bg-slate-50 border-catolica-primary/40' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                              {q.tipo}
                            </span>
                            {getBadgeCiclo(q.avaliacao)}
                            <span className="text-xs font-bold text-catolica-primary">
                              {q.pontuacao.toFixed(1)} pts
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditQuestao(q)}
                              className="text-slate-400 hover:text-catolica-primary p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                              title="Editar Questão"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => onDeleteQuestao(q.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition cursor-pointer"
                              title="Excluir Questão"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 line-clamp-3">
                          {q.enunciado}
                        </p>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          <div className="flex flex-wrap gap-1">
                            {q.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => isSelected ? onRemoverDaProva(q.id) : onAdicionarNaProva(q)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-slate-200 text-slate-700 hover:bg-red-100 hover:text-red-700'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                            }`}
                          >
                            {isSelected ? (
                              <><Check size={14} /> Na Prova</>
                            ) : (
                              <><Plus size={14} /> Adicionar</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: COMPOSIÇÃO DA AVALIAÇÃO ATIVA */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-catolica-primary" /> Caderno de Prova & Gabarito Ativo
                </h3>
                <p className="text-xs text-slate-500">
                  Configure os parâmetros e visualize as questões selecionadas
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Título da Avaliação:
                  </label>
                  <input
                    type="text"
                    value={tituloProva}
                    onChange={(e) => setTituloProva(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-catolica-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Pontuação Total:</span>
                    <span className="text-[11px] text-slate-500">Soma rigorosa para gerar o gabarito</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black ${
                      Math.abs(pontuacaoTotal - 10.0) < 0.05 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {pontuacaoTotal.toFixed(1)} / 10.0 pts
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400">
                      {Math.abs(pontuacaoTotal - 10.0) < 0.05 ? '✅ Exatamente 10.0 pts' : '⚠️ Obrigatório 10.0 pts'}
                    </span>
                  </div>
                </div>

                {/* Opções de Embaralhamento e Identificação */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Opções Anti-Cola & Impressão:
                  </span>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleQ}
                      onChange={(e) => setShuffleQ(e.target.checked)}
                      className="w-3.5 h-3.5 accent-catolica-primary"
                    />
                    Embaralhar ordem das questões por versão de caderno
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shuffleAlt}
                      onChange={(e) => setShuffleAlt(e.target.checked)}
                      className="w-3.5 h-3.5 accent-catolica-primary"
                    />
                    Embaralhar alternativas (A, B, C, D, E)
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withId}
                      onChange={(e) => setWithId(e.target.checked)}
                      className="w-3.5 h-3.5 accent-catolica-primary"
                    />
                    QR Code Nominal (com Matrícula e Nome do Aluno)
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Questões no Caderno ({questoesSelecionadas.length} / 30):
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Máximo: 30 questões • Mínimo: 1
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {questoesSelecionadas.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-600">Nenhuma questão no caderno.</p>
                        <p>Adicione questões do banco ao lado para compor a avaliação.</p>
                      </div>
                    ) : (
                      questoesSelecionadas.map((q, idx) => (
                        <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs hover:border-slate-300 transition">
                          <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                            <span className="font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                            <span className="max-w-[160px] truncate font-semibold text-slate-800 sm:max-w-[280px]">
                              {q.enunciado}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {getBadgeCiclo(q.avaliacao)}
                            <span className="font-bold text-catolica-primary">{q.pontuacao.toFixed(1)} pts</span>
                            <button
                              type="button"
                              onClick={() => onRemoverDaProva(q.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition ml-1 cursor-pointer"
                              title="Remover do Caderno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Aviso condicional exibido ao tentar gerar sem questões */}
              {avisoValidacao && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{avisoValidacao}</span>
                </div>
              )}

              {/* Botão de Geração com Salvamento Automático e Validação Condicional */}
              <button
                type="button"
                onClick={handleGerarCaderno}
                className="w-full bg-catolica-primary hover:bg-catolica-dark text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg shadow-catolica-primary/30 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Salvar, Arquivar e Gerar Gabarito OMR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DE ESPELHO DA PROVA E GABARITO OFICIAL */}
      <ModalEspelhoProva
        prova={provaEspelhoSelecionada}
        onClose={() => setProvaEspelhoSelecionada(null)}
        onReimprimir={(p) => {
          if (onCarregarProvaParaReimpressao) onCarregarProvaParaReimpressao(p);
        }}
        onVerRelatorio={(p) => {
          if (onIrParaRelatorioDaTurma) onIrParaRelatorioDaTurma(p.turmaId);
        }}
      />
    </div>
  );
}
