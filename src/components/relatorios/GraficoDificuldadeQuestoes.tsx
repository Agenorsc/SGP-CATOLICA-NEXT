'use client';

import React, { useState, useMemo } from 'react';
import { ItemEstatisticaQuestao } from '@/types';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface GraficoDificuldadeQuestoesProps {
  questoes: ItemEstatisticaQuestao[];
  turmaNome: string;
}

export function GraficoDificuldadeQuestoes({ questoes, turmaNome }: GraficoDificuldadeQuestoesProps) {
  const [questaoExpandida, setQuestaoExpandida] = useState<number | null>(null);
  const [ordenacao, setOrdenacao] = useState<'CRITICAS_PRIMEIRO' | 'MAIS_ACERTADAS' | 'NUMERO_ORIGINAL'>('MAIS_ACERTADAS');

  // Ordenação das questões memoizada antes de qualquer return
  const questoesOrdenadas = useMemo(() => {
    if (!questoes || questoes.length === 0) return [];
    const list = [...questoes];
    if (ordenacao === 'CRITICAS_PRIMEIRO') {
      return list.sort((a, b) => a.taxaAcerto - b.taxaAcerto);
    }
    if (ordenacao === 'MAIS_ACERTADAS') {
      return list.sort((a, b) => b.taxaAcerto - a.taxaAcerto);
    }
    return list.sort((a, b) => a.numero - b.numero);
  }, [questoes, ordenacao]);

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

  // Estatísticas consolidadas para os cards de resumo
  const totalQuestoes = questoes.length;
  const faceis = questoes.filter(q => q.taxaAcerto >= 70).length;
  const medias = questoes.filter(q => q.taxaAcerto >= 45 && q.taxaAcerto < 70).length;
  const criticas = questoes.filter(q => q.taxaAcerto < 45).length;
  const mediaGeralAcerto = totalQuestoes > 0
    ? Number((questoes.reduce((acc, q) => acc + q.taxaAcerto, 0) / totalQuestoes).toFixed(1))
    : 0;

  const toggleExpandir = (numero: number) => {
    setQuestaoExpandida(prev => prev === numero ? null : numero);
  };

  const getDificuldadeConfig = (taxaAcerto: number) => {
    if (taxaAcerto >= 70) {
      return {
        label: 'Fácil',
        sublabel: 'Alta Retenção',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        barGradient: 'from-emerald-500 to-emerald-600',
        barShadow: 'shadow-emerald-500/20',
        trackBg: 'bg-emerald-50/60',
        dotColor: 'bg-emerald-500',
        icon: TrendingUp,
        iconColor: 'text-emerald-600'
      };
    }
    if (taxaAcerto >= 45) {
      return {
        label: 'Média',
        sublabel: 'Atenção Moderada',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        barGradient: 'from-amber-500 to-amber-600',
        barShadow: 'shadow-amber-500/20',
        trackBg: 'bg-amber-50/60',
        dotColor: 'bg-amber-500',
        icon: AlertTriangle,
        iconColor: 'text-amber-600'
      };
    }
    return {
      label: 'Crítica',
      sublabel: 'Baixa Retenção',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      barGradient: 'from-rose-500 to-rose-600',
      barShadow: 'shadow-rose-500/20',
      trackBg: 'bg-rose-50/60',
      dotColor: 'bg-rose-500',
      icon: TrendingDown,
      iconColor: 'text-rose-600'
    };
  };

  return (
    <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      
      {/* 1. CABEÇALHO DO GRÁFICO & CONTROLES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-catolica-primary/10 rounded-xl text-catolica-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Taxa de Acerto e Dificuldade por Questão</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  {totalQuestoes} Questões
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Desempenho discriminativo dos itens na <strong>{turmaNome}</strong> (Média da Avaliação: <strong>{mediaGeralAcerto}%</strong>)
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Ordenação & Legenda */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Seletor de Ordenação */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-semibold text-slate-500">Ordem:</span>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="MAIS_ACERTADAS">Mais Acertadas Primeiro</option>
              <option value="CRITICAS_PRIMEIRO">Mais Erradas (Críticas) Primeiro</option>
              <option value="NUMERO_ORIGINAL">
                Ordem da Prova (Q.01 a Q.{totalQuestoes < 10 ? '0' + totalQuestoes : totalQuestoes})
              </option>
            </select>
          </div>

          {/* Legenda de Faixas */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ≥70% Fácil
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 45-69% Média
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt;45% Crítica
            </span>
          </div>
        </div>
      </div>

      {/* 2. CARDS DE RESUMO PEDAGÓGICO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Média Geral de Acertos</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-slate-900">{mediaGeralAcerto}%</span>
            <span className="text-[10px] font-bold text-slate-600">da turma</span>
          </div>
        </div>

        <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Fáceis (≥ 70%)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-800">{faceis}</span>
            <span className="text-[10px] font-bold text-emerald-600">{((faceis / totalQuestoes) * 100).toFixed(0)}% dos itens</span>
          </div>
        </div>

        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Médias (45% - 69%)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-amber-800">{medias}</span>
            <span className="text-[10px] font-bold text-amber-600">{((medias / totalQuestoes) * 100).toFixed(0)}% dos itens</span>
          </div>
        </div>

        <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Críticas (&lt; 45%)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-rose-800">{criticas}</span>
            <span className="text-[10px] font-bold text-rose-600">{((criticas / totalQuestoes) * 100).toFixed(0)}% dos itens</span>
          </div>
        </div>
      </div>

      {/* 3. LISTA DE BARRAS ROBUSTAS COM DIAGNÓSTICO INTEGRADO */}
      <div className="space-y-3 pt-1">
        {questoesOrdenadas.map((q) => {
          const config = getDificuldadeConfig(q.taxaAcerto);
          const isExpandida = questaoExpandida === q.numero;
          const numFormatado = q.numero < 10 ? `0${q.numero}` : q.numero;
          const totalErros = q.totalSubmissoes - q.totalAcertos;

          return (
            <div
              key={q.numero}
              className={`rounded-2xl border transition-all duration-200 ${
                isExpandida 
                  ? 'border-catolica-primary/40 bg-white shadow-md ring-1 ring-catolica-primary/20' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Linha Principal do Item */}
              <div 
                className="p-4 cursor-pointer space-y-3"
                onClick={() => toggleExpandir(q.numero)}
              >
                {/* Linha Superior: Q.XX, Enunciado Snippet, Tags e Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-mono text-xs font-black text-white shadow-xs">
                      Q.{numFormatado}
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

                  <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                    {/* Badge do Gabarito Oficial */}
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Gabarito: <strong>{q.gabaritoOficial}</strong>
                    </span>

                    {/* Badge de Dificuldade */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${config.badgeClass} flex items-center gap-1`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                      {config.label} ({q.taxaAcerto}%)
                    </span>

                    {/* Botão de Expandir */}
                    <span className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition">
                      {isExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </div>
                </div>

                {/* BARRA DE PROGRESSO ROBUSTA & ESPESSA (h-6.5 / 26px) */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    {/* Track da Barra com Altura Substancial */}
                    <div className="flex-1 bg-slate-100 rounded-xl h-6 p-0.5 relative overflow-hidden border border-slate-200/80 shadow-inner flex items-center">
                      <div
                        className={`h-full rounded-lg transition-all duration-700 ease-out bg-gradient-to-r ${config.barGradient} ${config.barShadow} flex items-center justify-end px-2.5`}
                        style={{ width: `${Math.max(8, q.taxaAcerto)}%` }}
                      >
                        {q.taxaAcerto >= 18 && (
                          <span className="text-[11px] font-black text-white tracking-wide drop-shadow-xs">
                            {q.taxaAcerto}%
                          </span>
                        )}
                      </div>

                      {q.taxaAcerto < 18 && (
                        <span className="ml-2 text-[11px] font-black text-slate-700">
                          {q.taxaAcerto}%
                        </span>
                      )}
                    </div>

                    {/* Totais de Alunos Alinhados */}
                    <div className="w-32 shrink-0 text-right">
                      <span className="text-xs font-mono font-extrabold text-slate-900">
                        {q.totalAcertos}/{q.totalSubmissoes}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 ml-1">
                        acertos
                      </span>
                    </div>
                  </div>

                  {/* Linha Resumo Inferior: Indicador Rápido de Erro e Distrator */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-700 font-bold">
                        {q.totalAcertos} estudantes acertaram ({q.taxaAcerto}%)
                      </span>
                      {totalErros > 0 && (
                        <span className="text-slate-400">
                          • {totalErros} erraram ({q.taxaErro}%)
                        </span>
                      )}
                    </span>

                    {q.distratorCritico ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                        Mais assinalada nos erros: Alternativa <strong>{q.distratorCritico.letra}</strong> ({q.distratorCritico.quantidade} alunos • {q.distratorCritico.percentual}%)
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium">
                        Nenhum distrator dominante registrado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. GAVETA EXPANSÍVEL DE DETALHES PEDAGÓGICOS */}
              {isExpandida && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-5 rounded-b-2xl space-y-4 animate-in fade-in duration-200">
                  
                  {/* Enunciado Completo */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1.5">
                      <BookOpen className="w-4 h-4 text-catolica-primary" />
                      <span>Texto Integral da Questão {numFormatado}:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100 font-serif">
                      &quot;{q.enunciado}&quot;
                    </p>
                  </div>

                  {/* Diagnóstico Comparativo de Gabarito e Distratores */}
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
                      q.distratorCritico
                        ? 'bg-rose-50/70 border-rose-200'
                        : 'bg-slate-100/70 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <AlertTriangle className={`w-4 h-4 ${q.distratorCritico ? 'text-rose-600' : 'text-slate-400'}`} />
                        <span>Principal Distrator Assinalado</span>
                      </div>
                      {q.distratorCritico ? (
                        <p className="text-rose-900 text-[11px]">
                          Alternativa <strong>{q.distratorCritico.letra}</strong> atraiu <strong>{q.distratorCritico.quantidade} alunos</strong> ({q.distratorCritico.percentual}% de todos os erros).
                        </p>
                      ) : (
                        <p className="text-slate-600 text-[11px]">
                          Não houve concentração anormal de respostas em alternativas erradas.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Gráfico de Distribuição por Alternativa (A, B, C, D, E) se disponível */}
                  {q.distribuicaoOpcoes && Object.keys(q.distribuicaoOpcoes).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Distribuição de Escolhas dos Alunos:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                        {Object.entries(q.distribuicaoOpcoes).map(([letra, dados]) => {
                          const isCorreta = letra === q.gabaritoOficial;
                          const isDistrator = q.distratorCritico?.letra === letra;

                          let bgBox = 'bg-white border-slate-200';
                          let pillColor = 'bg-slate-200 text-slate-700';
                          let barColor = 'bg-slate-400';

                          if (isCorreta) {
                            bgBox = 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400';
                            pillColor = 'bg-emerald-600 text-white';
                            barColor = 'bg-emerald-500';
                          } else if (isDistrator) {
                            bgBox = 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-400';
                            pillColor = 'bg-rose-600 text-white';
                            barColor = 'bg-rose-500';
                          }

                          return (
                            <div key={letra} className={`p-2.5 rounded-xl border ${bgBox} space-y-1.5`}>
                              <div className="flex items-center justify-between">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono font-black text-[10px] ${pillColor}`}>
                                  {letra}
                                </span>
                                <span className="font-mono font-bold text-xs text-slate-800">
                                  {dados.quantidade} ({dados.percentual}%)
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                  style={{ width: `${Math.max(4, dados.percentual)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
