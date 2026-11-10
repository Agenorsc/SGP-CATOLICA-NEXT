'use client';

import React, { useState, useMemo } from 'react';
import { ItemEstatisticaQuestao } from '@/types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  HelpCircle, 
  Info,
  Filter,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BarChart2
} from 'lucide-react';

interface PainelAnaliseDistratoresProps {
  questoes: ItemEstatisticaQuestao[];
  turmaNome: string;
}

export function PainelAnaliseDistratores({ questoes, turmaNome }: PainelAnaliseDistratoresProps) {
  const [filtroTipo, setFiltroTipo] = useState<'TODAS' | 'CRITICAS' | 'DISTRATOR_FORTE' | 'DISTRATOR_INEFICAZ'>('TODAS');
  const [questaoExpandida, setQuestaoExpandida] = useState<number | null>(null);

  // Filtra as questões com base no critério selecionado
  const questoesFiltradas = useMemo(() => {
    if (!questoes || questoes.length === 0) return [];

    return questoes.filter(q => {
      if (filtroTipo === 'CRITICAS') {
        return q.taxaAcerto < 50;
      }
      if (filtroTipo === 'DISTRATOR_FORTE') {
        // Distrator que atraiu mais de 25% do total de alunos
        if (!q.distribuicaoOpcoes) return !!q.distratorCritico;
        const opcoes = Object.entries(q.distribuicaoOpcoes);
        return opcoes.some(([letra, dados]) => letra !== q.gabaritoOficial && dados.percentual >= 25);
      }
      if (filtroTipo === 'DISTRATOR_INEFICAZ') {
        // Ao menos um distrator com 0 votos
        if (!q.distribuicaoOpcoes) return false;
        const opcoes = Object.entries(q.distribuicaoOpcoes);
        return opcoes.some(([letra, dados]) => letra !== q.gabaritoOficial && dados.quantidade === 0);
      }
      return true;
    });
  }, [questoes, filtroTipo]);

  // Contadores para o resumo do painel
  const totalQuestoes = questoes.length;
  const totalDistratoresFortes = useMemo(() => {
    return questoes.filter(q => {
      if (!q.distribuicaoOpcoes) return !!q.distratorCritico;
      return Object.entries(q.distribuicaoOpcoes).some(([letra, d]) => letra !== q.gabaritoOficial && d.percentual >= 25);
    }).length;
  }, [questoes]);

  const totalCriticas = useMemo(() => {
    return questoes.filter(q => q.taxaAcerto < 50).length;
  }, [questoes]);

  if (!questoes || questoes.length === 0) {
    return null;
  }

  const toggleExpandir = (numero: number) => {
    setQuestaoExpandida(prev => prev === numero ? null : numero);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      
      {/* 1. CABEÇALHO DO PAINEL DE DISTRATORES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-catolica-primary" />
            <h3 className="font-bold text-slate-900 text-sm">Painel de Análise de Distratores & Discriminação</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
              {questoes.length} Questões Avaliadas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento da alternativa mais assinalada por questão, atratividade de erros e eficácia pedagógica na {turmaNome}
          </p>
        </div>

        {/* Filtros rápidos do Painel */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setFiltroTipo('TODAS')}
            className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
              filtroTipo === 'TODAS'
                ? 'bg-white text-catolica-primary shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({totalQuestoes})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('DISTRATOR_FORTE')}
            className={`px-3 py-1 rounded-lg font-bold transition text-[11px] flex items-center gap-1 ${
              filtroTipo === 'DISTRATOR_FORTE'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Distrator Forte &gt; 25% ({totalDistratoresFortes})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('CRITICAS')}
            className={`px-3 py-1 rounded-lg font-bold transition text-[11px] flex items-center gap-1 ${
              filtroTipo === 'CRITICAS'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
            Alto Erro &gt; 50% ({totalCriticas})
          </button>
          <button
            type="button"
            onClick={() => setFiltroTipo('DISTRATOR_INEFICAZ')}
            className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
              filtroTipo === 'DISTRATOR_INEFICAZ'
                ? 'bg-white text-slate-800 shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Distratores 0%
          </button>
        </div>
      </div>

      {/* 2. LISTA DETALHADA DE QUESTÕES COM DISTRATORES */}
      {questoesFiltradas.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          <HelpCircle className="w-8 h-8 mx-auto mb-1 text-slate-300" />
          <p className="text-xs font-bold text-slate-600">Nenhuma questão encontrada para este filtro de distrator.</p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {questoesFiltradas.map((q) => {
            const isExpandida = questaoExpandida === q.numero;
            const gabarito = q.gabaritoOficial;
            const distrator = q.distratorCritico;
            const distribuicao = q.distribuicaoOpcoes || {};
            const letras = Object.keys(distribuicao).length > 0
              ? Object.keys(distribuicao)
              : ['A', 'B', 'C', 'D'];

            // Verifica se o distrator mais assinalado tem alta atratividade
            const distratorDados = distrator ? distribuicao[distrator.letra] : null;
            const isDistratorAgressivo = (distratorDados?.percentual ?? distrator?.percentual ?? 0) >= 25;
            
            // Distratores com 0 votos
            const distratoresZerados = letras.filter(l => l !== gabarito && (distribuicao[l]?.quantidade === 0));

            return (
              <div
                key={q.numero}
                className={`rounded-2xl border transition-all ${
                  isDistratorAgressivo 
                    ? 'border-rose-200 bg-rose-50/15' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Linha Resumo da Questão */}
                <div 
                  className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  onClick={() => toggleExpandir(q.numero)}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-mono text-xs font-black text-slate-800">
                      Q.{q.numero < 10 ? `0${q.numero}` : q.numero}
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 line-clamp-1">
                          {q.enunciado}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {q.tags.join(', ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Gabarito: Alternativa {gabarito} ({q.taxaAcerto}% acertos)
                        </span>

                        {distrator ? (
                          <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border ${
                            isDistratorAgressivo
                              ? 'text-rose-700 bg-rose-100 border-rose-300'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}>
                            <AlertTriangle className="w-3.5 h-3.5" /> Mais Marcada: Alternativa {distrator.letra} ({distrator.quantidade} alunos • {distrator.percentual}% dos erros)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600">
                            Sem distratores assinalados
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {q.totalAcertos}/{q.totalSubmissoes}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                      aria-label="Expandir detalhes de distratores"
                    >
                      {isExpandida ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Área Expandida com Barras de Frequência e Diagnóstico Pedagógico */}
                {isExpandida && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-4 rounded-b-2xl space-y-4 animate-in fade-in duration-200">
                    
                    {/* Enunciado Completo */}
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      <strong className="block text-slate-900 mb-1">Enunciado da Questão:</strong>
                      <p className="italic text-slate-600">&quot;{q.enunciado}&quot;</p>
                    </div>

                    {/* Distribuição de Frequência de Cada Alternativa */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                        Distribuição de Respostas por Alternativa (Total: {q.totalSubmissoes} estudantes)
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {letras.map((letra) => {
                          const dados = distribuicao[letra] || { quantidade: 0, percentual: 0 };
                          const isCorreta = letra === gabarito;
                          const isDistratorCritico = distrator && letra === distrator.letra;
                          const isZerada = dados.quantidade === 0 && !isCorreta;

                          let borderCard = 'border-slate-200 bg-white';
                          let barColor = 'bg-slate-300';
                          let badgeText = 'Distrator';
                          let badgeClass = 'bg-slate-100 text-slate-600';

                          if (isCorreta) {
                            borderCard = 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-400';
                            barColor = 'bg-emerald-500';
                            badgeText = 'Gabarito Oficial';
                            badgeClass = 'bg-emerald-100 text-emerald-800 font-black';
                          } else if (isDistratorCritico) {
                            borderCard = 'border-rose-300 bg-rose-50/50 ring-1 ring-rose-400';
                            barColor = 'bg-rose-500';
                            badgeText = 'Distrator Mais Assinalado';
                            badgeClass = 'bg-rose-100 text-rose-800 font-black';
                          } else if (isZerada) {
                            borderCard = 'border-dashed border-slate-200 bg-slate-50/50 opacity-70';
                            badgeText = 'Não Funcional (0)';
                            badgeClass = 'bg-slate-100 text-slate-400';
                          }

                          return (
                            <div key={letra} className={`p-3 rounded-xl border transition ${borderCard}`}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                                    isCorreta ? 'bg-emerald-600 text-white' : (isDistratorCritico ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700')
                                  }`}>
                                    {letra}
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${badgeClass}`}>
                                    {badgeText}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-xs text-slate-800">
                                  {dados.quantidade} ({dados.percentual}%)
                                </span>
                              </div>

                              {/* Barra de Progresso Relativa */}
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

                    {/* Alertas e Diagnóstico Pedagógico */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Sparkles className="w-4 h-4 text-catolica-primary" />
                        <span>Diagnóstico Pedagógico Automatizado:</span>
                      </div>

                      <div className="space-y-1 text-slate-600 text-[11px]">
                        {isDistratorAgressivo && distrator && (
                          <p className="flex items-start gap-1.5 text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                            <span>
                              <strong>Atenção de Distrator Forte:</strong> A alternativa <strong>{distrator.letra}</strong> atraiu {distrator.quantidade} estudantes ({distrator.percentual}% dos erros). Verifique se o distrator apresenta termos dúbios, formulação similar à correta ou se aponta para uma falha conceitual recorrente da turma.
                            </span>
                          </p>
                        )}

                        {distratoresZerados.length > 0 && (
                          <p className="flex items-start gap-1.5 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                            <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                            <span>
                              <strong>Distratores Não Funcionais:</strong> A(s) alternativa(s) <strong>{distratoresZerados.join(', ')}</strong> não foi(ram) escolhida(s) por nenhum aluno. Para ciclos futuros, considere substituí-la(s) por opções mais verossímeis para aumentar o poder de discriminação do item.
                            </span>
                          </p>
                        )}

                        {q.taxaAcerto >= 75 && (
                          <p className="flex items-start gap-1.5 text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                            <span>
                              <strong>Item de Alta Acurácia ({q.taxaAcerto}%):</strong> Conceito amplamente consolidado entre os estudantes.
                            </span>
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
