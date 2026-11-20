'use client';

import React, { useState, useMemo, useRef } from 'react';
import { ItemEstatisticaQuestao } from '@/types';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Info,
  ChevronDown, 
  ChevronUp, 
  ArrowUpDown, 
  Layers, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  Eye,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Maximize2
} from 'lucide-react';

interface CockpitAnaliseQuestoesProps {
  questoes: ItemEstatisticaQuestao[];
  turmaNome: string;
  modoInicial?: 'integrado' | 'distratores' | 'dificuldade';
}

export function CockpitAnaliseQuestoes({
  questoes,
  turmaNome,
  modoInicial = 'integrado'
}: CockpitAnaliseQuestoesProps) {
  // 1. Estados de Navegação e Interatividade
  const [visaoFoco, setVisaoFoco] = useState<'integrado' | 'distratores' | 'dificuldade'>(modoInicial);
  const [tipoLayout, setTipoLayout] = useState<'cards' | 'lista' | 'focoIndividual'>('lista');
  const [questaoHoverId, setQuestaoHoverId] = useState<number | null>(null);
  const [questaoSelecionada, setQuestaoSelecionada] = useState<number | null>(null);
  const [questaoExpandida, setQuestaoExpandida] = useState<number | null>(null);
  const [ordenacao, setOrdenacao] = useState<'NUMERO' | 'MAIS_ACERTADAS' | 'MAIS_ERRADAS' | 'PEGADINHA'>('NUMERO');
  const [filtroDistrator, setFiltroDistrator] = useState<'TODAS' | 'PEGADINHA_FORTE' | 'DISTRATOR_ZERO'>('TODAS');

  const containerQuestoesRef = useRef<HTMLDivElement>(null);

  // 2. Estatísticas Consolidadas
  const totalQuestoes = questoes.length;
  const faceis = useMemo(() => questoes.filter(q => q.taxaAcerto >= 70).length, [questoes]);
  const medias = useMemo(() => questoes.filter(q => q.taxaAcerto >= 45 && q.taxaAcerto < 70).length, [questoes]);
  const criticas = useMemo(() => questoes.filter(q => q.taxaAcerto < 45).length, [questoes]);
  const pegadinhasFortes = useMemo(() => {
    return questoes.filter(q => {
      if (q.distratorCritico && q.distratorCritico.percentual >= 25) return true;
      if (q.distribuicaoOpcoes) {
        return Object.entries(q.distribuicaoOpcoes).some(([letra, d]) => letra !== q.gabaritoOficial && d.percentual >= 25);
      }
      return false;
    }).length;
  }, [questoes]);

  const mediaTurmaAcerto = useMemo(() => {
    if (totalQuestoes === 0) return 0;
    return Number((questoes.reduce((acc, q) => acc + q.taxaAcerto, 0) / totalQuestoes).toFixed(1));
  }, [questoes, totalQuestoes]);

  // 3. Questões Ordenadas e Filtradas
  const questoesProcessadas = useMemo(() => {
    let list = [...questoes];

    // Filtros de distratores se ativo
    if (visaoFoco === 'distratores' || filtroDistrator !== 'TODAS') {
      if (filtroDistrator === 'PEGADINHA_FORTE') {
        list = list.filter(q => {
          if (q.distratorCritico && q.distratorCritico.percentual >= 25) return true;
          if (q.distribuicaoOpcoes) {
            return Object.entries(q.distribuicaoOpcoes).some(([letra, d]) => letra !== q.gabaritoOficial && d.percentual >= 25);
          }
          return false;
        });
      } else if (filtroDistrator === 'DISTRATOR_ZERO') {
        list = list.filter(q => {
          if (!q.distribuicaoOpcoes) return false;
          return Object.entries(q.distribuicaoOpcoes).some(([letra, d]) => letra !== q.gabaritoOficial && d.quantidade === 0);
        });
      }
    }

    // Ordenação
    if (ordenacao === 'MAIS_ACERTADAS') {
      list.sort((a, b) => b.taxaAcerto - a.taxaAcerto);
    } else if (ordenacao === 'MAIS_ERRADAS') {
      list.sort((a, b) => a.taxaAcerto - b.taxaAcerto);
    } else if (ordenacao === 'PEGADINHA') {
      list.sort((a, b) => (b.distratorCritico?.percentual || 0) - (a.distratorCritico?.percentual || 0));
    } else {
      list.sort((a, b) => a.numero - b.numero);
    }

    return list;
  }, [questoes, visaoFoco, filtroDistrator, ordenacao]);

  // Se não houver questões
  if (!questoes || questoes.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-bold text-slate-700">Nenhuma avaliação OMR corrigida para esta turma ainda.</p>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Realize a leitura dos gabaritos na aba Leitura & Correção para gerar as métricas de dificuldade e taxas de acerto por questão.
        </p>
      </div>
    );
  }

  // Questão em foco para o modo individual
  const questaoFocoAtual = questoes.find(q => q.numero === (questaoSelecionada ?? questoes[0]?.numero)) || questoes[0];
  const indiceFocoAtual = questoes.findIndex(q => q.numero === questaoFocoAtual.numero);

  const irParaAnterior = () => {
    if (indiceFocoAtual > 0) {
      setQuestaoSelecionada(questoes[indiceFocoAtual - 1].numero);
    }
  };

  const irParaProxima = () => {
    if (indiceFocoAtual < questoes.length - 1) {
      setQuestaoSelecionada(questoes[indiceFocoAtual + 1].numero);
    }
  };

  const selecionarQuestaoDoGrafico = (num: number) => {
    setQuestaoSelecionada(num);
    setQuestaoExpandida(num);
    // Rolagem suave até o elemento se estiver em modo lista ou cards
    if (tipoLayout !== 'focoIndividual') {
      setTimeout(() => {
        const el = document.getElementById(`card-questao-${num}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  // Helper de Dificuldade
  const getDificuldadeStyle = (taxa: number) => {
    if (taxa >= 70) {
      return {
        label: 'Fácil',
        corTexto: 'text-emerald-700',
        corBg: 'bg-emerald-50',
        corBorda: 'border-emerald-200',
        corBarra: 'bg-emerald-500',
        corGradiente: 'from-emerald-500 to-emerald-600',
        dot: 'bg-emerald-500'
      };
    }
    if (taxa >= 45) {
      return {
        label: 'Média',
        corTexto: 'text-amber-700',
        corBg: 'bg-amber-50',
        corBorda: 'border-amber-200',
        corBarra: 'bg-amber-500',
        corGradiente: 'from-amber-500 to-amber-600',
        dot: 'bg-amber-500'
      };
    }
    return {
      label: 'Crítica',
      corTexto: 'text-rose-700',
      corBg: 'bg-rose-50',
      corBorda: 'border-rose-200',
      corBarra: 'bg-rose-500',
      corGradiente: 'from-rose-500 to-rose-600',
      dot: 'bg-rose-500'
    };
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
      
      {/* 1. TOPO: TÍTULO, CONTEXTO PEDAGÓGICO & SELETOR DE MODO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-catolica-primary text-white rounded-2xl shadow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Raio-X Pedagógico por Questão
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-700">
                  {totalQuestoes} Questões
                </span>
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                  Média da Avaliação: {mediaTurmaAcerto}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Taxa de absorção do conteúdo e diagnóstico de pegadinhas assinaladas na <strong>{turmaNome}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES DE MODO DE ANÁLISE COM FEEDBACK IMEDIATO */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setVisaoFoco('integrado')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                visaoFoco === 'integrado'
                  ? 'bg-white text-catolica-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Visualização unificada de acertos e distratores em um único painel claro"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Raio-X Integrado</span>
            </button>

            <button
              type="button"
              onClick={() => setVisaoFoco('dificuldade')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                visaoFoco === 'dificuldade'
                  ? 'bg-white text-catolica-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Foco em ranking de dificuldade e taxa de acerto"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Dificuldade</span>
            </button>

            <button
              type="button"
              onClick={() => setVisaoFoco('distratores')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                visaoFoco === 'distratores'
                  ? 'bg-white text-catolica-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Foco nas alternativas incorretas e pegadinhas que atraíram estudantes"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Pegadinhas & Distratores</span>
            </button>
          </div>

          {/* ALTERNADOR DE LAYOUT (LISTA, GRADE DE CARDS OU FOCO INDIVIDUAL) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setTipoLayout('lista')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                tipoLayout === 'lista' ? 'bg-white text-catolica-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Layout em Lista Expandível"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setTipoLayout('cards')}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                tipoLayout === 'cards' ? 'bg-white text-catolica-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Layout em Grade de Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setTipoLayout('focoIndividual');
                if (!questaoSelecionada && questoes.length > 0) {
                  setQuestaoSelecionada(questoes[0].numero);
                }
              }}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                tipoLayout === 'focoIndividual' ? 'bg-white text-catolica-primary shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Foco em 1 Questão com Navegação Passo a Passo"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. GUIA VISUAL: O QUE CADA ANÁLISE MOSTRA (CLAREZA TOTAL PARA O PROFESSOR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0 text-xs">
            %
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block">Taxa de Acerto (Dificuldade do Item)</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Mede se a turma dominou o conceito cobrado. Questões com taxa &lt; 45% apontam conteúdo crítico que merece revisão em sala.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center shrink-0 text-xs">
            🎯
          </div>
          <div>
            <span className="font-extrabold text-slate-900 block">Análise de Distratores (Pegadinhas)</span>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Revela <em>onde</em> os alunos erraram. Se uma alternativa incorreta atraiu &gt; 25% da turma, havia um erro conceitual comum ou ambiguidade.
            </p>
          </div>
        </div>
      </div>

      {/* 3. GRÁFICO INTERATIVO DE DESEMPENHO NO TOPO (HISTOGRAMA COM HOVER & CLIQUE) */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 sm:p-5 text-white shadow-inner relative overflow-hidden">
        
        {/* Cabeçalho do Histograma */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Histograma da Prova • Todas as Questões
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
              Passe o mouse para ver detalhes • Clique para focar no item
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Fácil (≥70%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Média (45-69%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Crítica (&lt;45%)
            </span>
            <span className="flex items-center gap-1 text-amber-300 font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-amber-400/50" /> Pegadinha Forte
            </span>
          </div>
        </div>

        {/* BARRAS DO HISTOGRAMA SVG / CSS */}
        <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1 relative">
          
          {/* Linha de Referência da Média da Turma */}
          <div 
            className="absolute left-0 right-0 border-t border-dashed border-slate-600 pointer-events-none z-0"
            style={{ bottom: `${mediaTurmaAcerto}%` }}
          >
            <span className="absolute right-1 -top-4 text-[9px] font-mono text-slate-400 bg-slate-900/90 px-1 rounded">
              Média: {mediaTurmaAcerto}%
            </span>
          </div>

          {questoes.map((q) => {
            const numStr = q.numero < 10 ? `0${q.numero}` : `${q.numero}`;
            const isHover = questaoHoverId === q.numero;
            const isSelected = questaoSelecionada === q.numero;
            const dif = getDificuldadeStyle(q.taxaAcerto);
            const temPegadinha = (q.distratorCritico?.percentual ?? 0) >= 25;

            // Cor da barra no tema escuro
            const corBarra = q.taxaAcerto >= 70
              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
              : q.taxaAcerto >= 45
                ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                : 'bg-gradient-to-t from-rose-600 to-rose-400';

            return (
              <div 
                key={q.numero}
                className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                onMouseEnter={() => setQuestaoHoverId(q.numero)}
                onMouseLeave={() => setQuestaoHoverId(null)}
                onClick={() => selecionarQuestaoDoGrafico(q.numero)}
              >
                {/* Marcador de Pegadinha no topo da barra */}
                {temPegadinha && (
                  <div 
                    className="absolute z-10 transition-transform group-hover:scale-125"
                    style={{ bottom: `calc(${q.taxaAcerto}% + 4px)` }}
                    title={`Questão ${q.numero} tem distrator agressivo: Alternativa ${q.distratorCritico?.letra}`}
                  >
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 text-slate-900 text-[8px] font-black shadow-xs ring-2 ring-slate-900">
                      !
                    </span>
                  </div>
                )}

                {/* Coluna da Barra */}
                <div 
                  className="w-full max-w-[40px] rounded-t-lg transition-all duration-200 relative overflow-hidden"
                  style={{ 
                    height: `${Math.max(q.taxaAcerto, 6)}%`,
                    filter: isHover || isSelected ? 'brightness(1.2)' : 'none',
                    transform: isHover || isSelected ? 'scaleY(1.03)' : 'none'
                  }}
                >
                  <div className={`w-full h-full ${corBarra} ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`} />
                </div>

                {/* Rótulo inferior da questão */}
                <span className={`text-[10px] font-mono font-bold mt-1.5 transition ${
                  isSelected ? 'text-catolica-secondary font-black scale-110' : isHover ? 'text-white' : 'text-slate-400'
                }`}>
                  Q.{numStr}
                </span>

                {/* TOOLTIP DINÂMICO AO PASSAR O MOUSE */}
                {isHover && (
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-30 w-52 p-2.5 rounded-xl bg-slate-950 text-white border border-slate-700 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                      <span className="font-black text-xs text-white">Questão {numStr}</span>
                      <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Gabarito: {q.gabaritoOficial}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Taxa de Acerto:</span>
                        <span className={`font-black ${dif.corTexto}`}>{q.taxaAcerto}%</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Desempenho:</span>
                        <span>{q.totalAcertos}/{q.totalSubmissoes} estudantes</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400">Dificuldade:</span>
                        <span className="font-bold">{dif.label}</span>
                      </div>
                      {q.distratorCritico && (
                        <div className="pt-1 mt-1 border-t border-slate-800 text-amber-300 flex items-center justify-between text-[10px]">
                          <span>Pegadinha ({q.distratorCritico.letra}):</span>
                          <span className="font-bold">{q.distratorCritico.percentual}% erros</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Barra de Ação Rápida sob o Histograma */}
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>Fáceis: <strong className="text-emerald-400">{faceis}</strong></span>
            <span>Médias: <strong className="text-amber-400">{medias}</strong></span>
            <span>Críticas: <strong className="text-rose-400">{criticas}</strong></span>
            <span>Pegadinhas Fortes: <strong className="text-amber-300">{pegadinhasFortes}</strong></span>
          </div>

          {questaoSelecionada && (
            <button
              type="button"
              onClick={() => {
                setQuestaoSelecionada(null);
                setQuestaoExpandida(null);
              }}
              className="text-[11px] text-catolica-secondary hover:underline cursor-pointer"
            >
              Limpar seleção (ver todas)
            </button>
          )}
        </div>
      </div>

      {/* 4. CONTROLES SECUNDÁRIOS: ORDENAÇÃO E FILTROS RÁPIDOS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de Ordenação */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold text-[11px]">Ordenar:</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="NUMERO">Ordem Original da Prova (Q.01 → Q.{totalQuestoes})</option>
              <option value="MAIS_ERRADAS">Mais Erradas Primeiro (Críticas)</option>
              <option value="MAIS_ACERTADAS">Mais Acertadas Primeiro (Fáceis)</option>
              <option value="PEGADINHA">Maiores Pegadinhas Primeiro</option>
            </select>
          </div>

          {/* Filtros para Pegadinhas se em modo Distratores ou Integrado */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setFiltroDistrator('TODAS')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                filtroDistrator === 'TODAS' ? 'bg-white text-catolica-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({totalQuestoes})
            </button>
            <button
              type="button"
              onClick={() => setFiltroDistrator('PEGADINHA_FORTE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
                filtroDistrator === 'PEGADINHA_FORTE' ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              Pegadinha &gt; 25% ({pegadinhasFortes})
            </button>
            <button
              type="button"
              onClick={() => setFiltroDistrator('DISTRATOR_ZERO')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                filtroDistrator === 'DISTRATOR_ZERO' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Distratores 0%
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          Exibindo {questoesProcessadas.length} de {totalQuestoes} questões
        </span>
      </div>

      {/* 5. VISUALIZAÇÃO DOS ITENS: TRÊS LAYOUTS (FOCO INDIVIDUAL, GRADE DE CARDS OU LISTA) */}

      {/* A. MODO FOCO INDIVIDUAL (SLIDE / INSPEÇÃO PROFUNDA 1 A 1) */}
      {tipoLayout === 'focoIndividual' && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 space-y-6">
          {/* Navegação entre Questões */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <button
              type="button"
              onClick={irParaAnterior}
              disabled={indiceFocoAtual === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Questão Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">
                Item {indiceFocoAtual + 1} de {questoes.length}
              </span>
              <div className="flex gap-1">
                {questoes.map(q => (
                  <button
                    key={q.numero}
                    type="button"
                    onClick={() => setQuestaoSelecionada(q.numero)}
                    className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                      q.numero === questaoFocoAtual.numero
                        ? 'bg-catolica-primary text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {q.numero}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={irParaProxima}
              disabled={indiceFocoAtual === questoes.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-xs"
            >
              <span>Próxima Questão</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Principal da Questão em Foco */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 font-mono text-sm font-black text-white shadow-xs">
                  Q.{questaoFocoAtual.numero < 10 ? `0${questaoFocoAtual.numero}` : questaoFocoAtual.numero}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Gabarito Oficial: <strong>Alternativa {questaoFocoAtual.gabaritoOficial}</strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getDificuldadeStyle(questaoFocoAtual.taxaAcerto).corBg} ${getDificuldadeStyle(questaoFocoAtual.taxaAcerto).corTexto} ${getDificuldadeStyle(questaoFocoAtual.taxaAcerto).corBorda}`}>
                      Dificuldade: {getDificuldadeStyle(questaoFocoAtual.taxaAcerto).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Taxa de Acerto</span>
                <span className="text-2xl font-black text-slate-900">
                  {questaoFocoAtual.taxaAcerto}% <span className="text-xs font-normal text-slate-500">({questaoFocoAtual.totalAcertos}/{questaoFocoAtual.totalSubmissoes} alunos)</span>
                </span>
              </div>
            </div>

            {/* Enunciado */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Texto da Questão</span>
              <p className="text-slate-800 leading-relaxed font-serif text-sm">
                &quot;{questaoFocoAtual.enunciado}&quot;
              </p>
            </div>

            {/* Distribuição Visual das Alternativas (A, B, C, D) */}
            <div className="space-y-3">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-xs block">
                Distribuição das Respostas Assinaladas pelos Alunos
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['A', 'B', 'C', 'D'].map(letra => {
                  const isGabarito = letra === questaoFocoAtual.gabaritoOficial;
                  const dados = questaoFocoAtual.distribuicaoOpcoes?.[letra] || {
                    quantidade: isGabarito ? questaoFocoAtual.totalAcertos : 0,
                    percentual: isGabarito ? questaoFocoAtual.taxaAcerto : 0
                  };
                  const isDistratorForte = !isGabarito && dados.percentual >= 25;

                  let cardStyle = 'border-slate-200 bg-white';
                  let badgeStyle = 'bg-slate-100 text-slate-700';
                  let barColor = 'bg-slate-300';

                  if (isGabarito) {
                    cardStyle = 'border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-400';
                    badgeStyle = 'bg-emerald-600 text-white';
                    barColor = 'bg-emerald-500';
                  } else if (isDistratorForte) {
                    cardStyle = 'border-rose-300 bg-rose-50/50 ring-1 ring-rose-400';
                    badgeStyle = 'bg-rose-600 text-white';
                    barColor = 'bg-rose-500';
                  }

                  return (
                    <div key={letra} className={`p-4 rounded-2xl border ${cardStyle} space-y-2`}>
                      <div className="flex items-center justify-between">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${badgeStyle}`}>
                          {letra}
                        </span>
                        {isGabarito ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Correta
                          </span>
                        ) : isDistratorForte ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Pegadinha
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Distrator
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="font-mono font-extrabold text-slate-900">{dados.percentual}%</span>
                          <span className="text-[11px] text-slate-500">{dados.quantidade} alunos</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} rounded-full transition-all duration-300`}
                            style={{ width: `${dados.percentual}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. MODO GRADE DE CARDS (PANORAMA GERAL MODERNO) */}
      {tipoLayout === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" ref={containerQuestoesRef}>
          {questoesProcessadas.map(q => {
            const numStr = q.numero < 10 ? `0${q.numero}` : `${q.numero}`;
            const dif = getDificuldadeStyle(q.taxaAcerto);
            const isSelected = questaoSelecionada === q.numero;
            const distrator = q.distratorCritico;

            return (
              <div
                key={q.numero}
                id={`card-questao-${q.numero}`}
                onClick={() => selecionarQuestaoDoGrafico(q.numero)}
                className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer space-y-3 bg-white ${
                  isSelected 
                    ? 'border-catolica-primary ring-2 ring-catolica-primary/20 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-9 items-center justify-center rounded-lg bg-slate-900 font-mono text-xs font-black text-white">
                      Q.{numStr}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Gabarito: {q.gabaritoOficial}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${dif.corBg} ${dif.corTexto} ${dif.corBorda}`}>
                    {dif.label}
                  </span>
                </div>

                <p className="text-xs text-slate-700 line-clamp-2 font-serif italic">
                  &quot;{q.enunciado}&quot;
                </p>

                {/* Barra de Taxa de Acerto */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] font-semibold text-slate-500">Taxa de Acerto:</span>
                    <span className="font-extrabold text-slate-900">{q.taxaAcerto}% ({q.totalAcertos}/{q.totalSubmissoes})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${dif.corBarra} rounded-full`}
                      style={{ width: `${q.taxaAcerto}%` }}
                    />
                  </div>
                </div>

                {/* Mini Linha de Alternativas A, B, C, D */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Distribuição:</span>
                  <div className="flex gap-1.5 font-mono">
                    {['A', 'B', 'C', 'D'].map(l => {
                      const isGabarito = l === q.gabaritoOficial;
                      const dados = q.distribuicaoOpcoes?.[l];
                      const isDistratorForte = !isGabarito && (dados?.percentual ?? 0) >= 25;

                      return (
                        <span 
                          key={l}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isGabarito 
                              ? 'bg-emerald-600 text-white' 
                              : isDistratorForte 
                                ? 'bg-rose-600 text-white' 
                                : 'bg-slate-100 text-slate-600'
                          }`}
                          title={`${l}: ${dados?.percentual ?? 0}%`}
                        >
                          {l}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Aviso de Distrator Crítico */}
                {distrator && distrator.percentual >= 25 && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span>Pegadinha na Alternativa <strong>{distrator.letra}</strong> ({distrator.percentual}% dos erros)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* C. MODO LISTA EXPANDÍVEL (PADRÃO PROFISSIONAL COM DETALHAMENTO TOTAL) */}
      {tipoLayout === 'lista' && (
        <div className="space-y-3" ref={containerQuestoesRef}>
          {questoesProcessadas.map(q => {
            const numStr = q.numero < 10 ? `0${q.numero}` : `${q.numero}`;
            const dif = getDificuldadeStyle(q.taxaAcerto);
            const isExpandida = questaoExpandida === q.numero;
            const isSelected = questaoSelecionada === q.numero;
            const distrator = q.distratorCritico;
            const isDistratorForte = distrator && distrator.percentual >= 25;

            return (
              <div
                key={q.numero}
                id={`card-questao-${q.numero}`}
                className={`rounded-2xl border transition-all duration-200 bg-white ${
                  isSelected 
                    ? 'border-catolica-primary ring-2 ring-catolica-primary/20 shadow-md' 
                    : isDistratorForte
                      ? 'border-rose-200 bg-rose-50/10 hover:border-rose-300'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Linha Resumo da Questão */}
                <div 
                  className="p-4 cursor-pointer space-y-3"
                  onClick={() => {
                    setQuestaoSelecionada(q.numero);
                    setQuestaoExpandida(prev => prev === q.numero ? null : q.numero);
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-xs font-black text-white shadow-xs">
                        Q.{numStr}
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-xl">
                          {q.enunciado}
                        </span>
                        {q.tags && q.tags.length > 0 && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {q.tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {/* Gabarito */}
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Gabarito: <strong>{q.gabaritoOficial}</strong>
                      </span>

                      {/* Dificuldade */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${dif.corBg} ${dif.corTexto} ${dif.corBorda} flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dif.dot}`} />
                        {dif.label}
                      </span>

                      {/* Botão de Expandir */}
                      <button
                        type="button"
                        aria-label="Expandir detalhes da questão"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      >
                        {isExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Barra de Progresso e Mini-distribuição de Alternativas */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
                    
                    {/* Barra de Acerto (8 colunas) */}
                    <div className="md:col-span-7 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {q.totalAcertos} estudantes acertaram ({q.taxaAcerto}%)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {q.totalErros} erraram ({q.taxaErro}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${dif.corBarra} rounded-full transition-all duration-300`}
                          style={{ width: `${q.taxaAcerto}%` }}
                        />
                      </div>
                    </div>

                    {/* Mini Distribuição de Alternativas A, B, C, D (5 colunas) */}
                    <div className="md:col-span-5 flex items-center justify-end gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Escolhas:
                      </span>
                      {['A', 'B', 'C', 'D'].map(l => {
                        const isGabarito = l === q.gabaritoOficial;
                        const dados = q.distribuicaoOpcoes?.[l];
                        const pct = dados?.percentual ?? (isGabarito ? q.taxaAcerto : 0);
                        const isForte = !isGabarito && pct >= 25;

                        return (
                          <div 
                            key={l}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                              isGabarito 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400' 
                                : isForte 
                                  ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-400' 
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                            title={`${l}: ${pct}% dos alunos`}
                          >
                            <span>{l}</span>
                            <span className="text-[9px] opacity-80">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* GAVETA EXPANSÍVEL: DIAGNÓSTICO PROFUNDO PEDAGÓGICO */}
                {isExpandida && (
                  <div className="border-t border-slate-100 bg-slate-50/70 p-5 rounded-b-2xl space-y-4 animate-in fade-in duration-200">
                    
                    {/* Enunciado Integral */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1.5">
                        <BookOpen className="w-4 h-4 text-catolica-primary" />
                        <span>Texto Integral da Questão {numStr}:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100 font-serif">
                        &quot;{q.enunciado}&quot;
                      </p>
                    </div>

                    {/* Comparação Pedagógica: Acerto vs Pegadinha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Gabarito Oficial: Alternativa {q.gabaritoOficial}</span>
                        </div>
                        <p className="text-emerald-800 text-[11px]">
                          <strong>{q.totalAcertos} estudantes</strong> ({q.taxaAcerto}%) marcaram corretamente esta alternativa.
                        </p>
                      </div>

                      <div className={`p-3.5 rounded-xl text-xs space-y-1 border ${
                        distrator && distrator.percentual >= 25
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-slate-100/70 border-slate-200'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <AlertTriangle className={`w-4 h-4 ${distrator && distrator.percentual >= 25 ? 'text-rose-600' : 'text-slate-400'}`} />
                          <span>Principal Distrator Assinalado</span>
                        </div>
                        {distrator ? (
                          <p className="text-rose-900 text-[11px]">
                            Alternativa <strong>{distrator.letra}</strong> atraiu <strong>{distrator.quantidade} estudantes</strong> ({distrator.percentual}% de todos os erros).
                          </p>
                        ) : (
                          <p className="text-slate-600 text-[11px]">
                            Não houve concentração anormal de respostas em alternativas erradas.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
