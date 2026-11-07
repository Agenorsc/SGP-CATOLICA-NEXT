'use client';

import React, { useState } from 'react';
import { ItemEstatisticaQuestao } from '@/types';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  TrendingDown,
  Info
} from 'lucide-react';

interface GraficoDificuldadeQuestoesProps {
  questoes: ItemEstatisticaQuestao[];
  turmaNome: string;
}

export function GraficoDificuldadeQuestoes({ questoes, turmaNome }: GraficoDificuldadeQuestoesProps) {
  const [hoveredQuestao, setHoveredQuestao] = useState<ItemEstatisticaQuestao | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!questoes || questoes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        <BarChart3 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p className="text-sm font-bold text-slate-600">Nenhuma avaliação OMR corrigida para esta turma ainda.</p>
        <p className="text-xs text-slate-400 mt-1">Realize a leitura dos gabaritos na aba Leitura & Correção para gerar as métricas de dificuldade.</p>
      </div>
    );
  }

  const getBarColor = (taxaAcerto: number) => {
    if (taxaAcerto >= 70) return 'bg-emerald-500 hover:bg-emerald-600';
    if (taxaAcerto >= 45) return 'bg-amber-500 hover:bg-amber-600';
    return 'bg-rose-500 hover:bg-rose-600';
  };

  const getBadgeClass = (taxaAcerto: number) => {
    if (taxaAcerto >= 70) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (taxaAcerto >= 45) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  const handleMouseMove = (e: React.MouseEvent, q: ItemEstatisticaQuestao) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX,
      y: rect.top - 10
    });
    setHoveredQuestao(q);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-catolica-primary" />
            <h3 className="font-bold text-slate-900 text-sm">Taxa de Acerto e Dificuldade por Questão</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ordenado de forma decrescente: da <strong>mais acertada</strong> à <strong>mais errada (crítica)</strong> na {turmaNome}
          </p>
        </div>

        {/* Legenda de Dificuldade */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ≥ 70% (Fácil)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 45% - 69% (Média)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt; 45% (Crítica)
          </span>
        </div>
      </div>

      {/* Grid de Barras Responsivo */}
      <div className="space-y-2.5 pt-2">
        {questoes.map((q, idx) => {
          const isCritica = idx === questoes.length - 1 && q.taxaAcerto < 50;

          return (
            <div
              key={q.numero}
              className="group relative flex items-center gap-3 text-xs cursor-pointer p-2 rounded-xl transition hover:bg-slate-50"
              onMouseEnter={(e) => handleMouseMove(e, q)}
              onMouseMove={(e) => handleMouseMove(e, q)}
              onMouseLeave={() => setHoveredQuestao(null)}
            >
              {/* Rótulo da Questão */}
              <div className="w-14 shrink-0 font-mono font-bold text-slate-700 flex items-center gap-1">
                <span>Q.{q.numero < 10 ? `0${q.numero}` : q.numero}</span>
                {isCritica && (
                  <span title="Questão com maior índice de erro" className="inline-flex">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  </span>
                )}
              </div>

              {/* Barra de Progresso / Porcentagem */}
              <div className="flex-1 bg-slate-100 rounded-full h-4.5 overflow-hidden p-0.5 relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(q.taxaAcerto)}`}
                  style={{ width: `${Math.max(6, q.taxaAcerto)}%` }}
                />
                <span className="absolute right-2 top-0 bottom-0 flex items-center text-[10px] font-black text-slate-600">
                  {q.taxaAcerto}%
                </span>
              </div>

              {/* Badge de Acertos Absolutos */}
              <div className="w-24 shrink-0 text-right">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getBadgeClass(q.taxaAcerto)}`}>
                  {q.totalAcertos}/{q.totalSubmissoes} alunos
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip Dinâmico Rico Flutuante / Detalhado */}
      {hoveredQuestao && (
        <div 
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full w-80 bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs animate-in fade-in zoom-in-95 duration-150"
          style={{ 
            left: Math.max(170, Math.min(window.innerWidth - 170, mousePos.x)), 
            top: Math.max(10, mousePos.y - 12) 
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-bold text-catolica-primary flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Questão {hoveredQuestao.numero < 10 ? `0${hoveredQuestao.numero}` : hoveredQuestao.numero}
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-emerald-400">
              Gabarito: {hoveredQuestao.gabaritoOficial}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 line-clamp-3 mb-2.5 italic">
            &quot;{hoveredQuestao.enunciado}&quot;
          </p>

          <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-2 rounded-xl mb-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">Acertos Absolutos:</span>
              <strong className="text-emerald-400">{hoveredQuestao.totalAcertos} de {hoveredQuestao.totalSubmissoes} ({hoveredQuestao.taxaAcerto}%)</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Erros / Brancos:</span>
              <strong className="text-rose-400">{hoveredQuestao.totalErros} erros ({hoveredQuestao.taxaErro}%)</strong>
            </div>
          </div>

          {hoveredQuestao.distratorCritico ? (
            <div className="bg-rose-950/60 border border-rose-900/60 p-2 rounded-xl text-[10px] text-rose-200">
              <span className="font-bold block text-rose-300 mb-0.5">⚠️ Principal Distrator Assinalado:</span>
              Alternativa <strong>{hoveredQuestao.distratorCritico.letra}</strong> assinalada por {hoveredQuestao.distratorCritico.quantidade} estudantes ({hoveredQuestao.distratorCritico.percentual}% dos erros).
            </div>
          ) : (
            <div className="text-[10px] text-emerald-300 text-center py-1">
              🎉 Nenhum distrator dominante registrado nesta questão!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
