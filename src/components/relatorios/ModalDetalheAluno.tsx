'use client';

import React, { useState } from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { RelatorioIndividualAluno, QuestaoHistoricoAluno } from '@/types';

interface ModalDetalheAlunoProps {
  aluno: RelatorioIndividualAluno | null;
  onClose: () => void;
}

export function ModalDetalheAluno({ aluno, onClose }: ModalDetalheAlunoProps) {
  const [questaoAtiva, setQuestaoAtiva] = useState<QuestaoHistoricoAluno | null>(null);

  if (!aluno) return null;

  const isAcimaDaTurma = aluno.deltaRelativoTurma >= 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Exame':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getStatusItemBadge = (status: string) => {
    switch (status) {
      case 'CORRETA':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500',
          label: 'Acertou',
          icon: CheckCircle2
        };
      case 'INCORRETA':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300',
          dot: 'bg-rose-500',
          label: 'Errou',
          icon: XCircle
        };
      case 'ANULADA':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-300',
          dot: 'bg-amber-500',
          label: 'Anulada',
          icon: AlertCircle
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-600 border-slate-300',
          dot: 'bg-slate-400',
          label: 'Em Branco',
          icon: HelpCircle
        };
    }
  };

  // Coordenadas para o Gráfico SVG de Evolução Temporal
  // SVG viewBox: 0 0 400 160
  // Margens: x = 50 a 350, y = 20 (nota 10) a 140 (nota 0)
  const etapas = aluno.evolucaoTemporal;
  const getY = (nota: number) => 140 - (Math.max(0, Math.min(10, nota)) / 10) * 120;
  const getX = (idx: number) => 60 + idx * 140; // idx 0 (N1: 60), idx 1 (N2: 200), idx 2 (N3: 340)

  const ptsAluno = etapas.map((e, idx) => `${getX(idx)},${getY(e.notaAluno)}`).join(' ');
  const ptsTurma = etapas.map((e, idx) => `${getX(idx)},${getY(e.mediaTurma)}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Cabeçalho do Perfil Acadêmico */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-catolica-primary text-white font-black text-lg shadow-sm">
              {aluno.alunoNome.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{aluno.alunoNome}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(aluno.statusAprovacao)}`}>
                  {aluno.statusAprovacao}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                RA: {aluno.ra} • {aluno.turmaNome} ({aluno.curso})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Cards de Resumo e Comparativo */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Média Final</span>
              <strong className="text-2xl font-black text-slate-900">{aluno.mediaFinal.toFixed(1)}</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">N1: {aluno.n1} | N2: {aluno.n2} | N3: {aluno.n3}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Taxa Individual</span>
              <strong className="text-2xl font-black text-emerald-600">{aluno.taxaAcertoIndividual}%</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Acertos nas provas</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Média da Turma</span>
              <strong className="text-2xl font-black text-slate-700">{aluno.taxaAcertoMediaTurma}%</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Desempenho coletivo</span>
            </div>

            <div className={`p-4 rounded-2xl border ${isAcimaDaTurma ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <span className="text-[10px] font-bold uppercase block mb-1 text-slate-600">Delta vs Turma</span>
              <div className="flex items-center gap-1.5">
                {isAcimaDaTurma ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                )}
                <strong className={`text-2xl font-black ${isAcimaDaTurma ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isAcimaDaTurma ? `+${aluno.deltaRelativoTurma}%` : `${aluno.deltaRelativoTurma}%`}
                </strong>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {isAcimaDaTurma ? 'Acima da média geral' : 'Abaixo da média geral'}
              </span>
            </div>
          </div>

          {/* 1. GRÁFICO DE EVOLUÇÃO TEMPORAL: Linha do Aluno vs Média da Turma */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-catolica-primary" />
                  Evolução Temporal do Desempenho (N1 → N2 → N3)
                </h3>
                <p className="text-xs text-slate-500">Comparação longitudinal da trajetória do aluno com a média da turma</p>
              </div>

              {/* Legenda do Gráfico */}
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-catolica-primary">
                  <span className="w-3 h-3 rounded-full bg-catolica-primary" /> Aluno ({aluno.alunoNome.split(' ')[0]})
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-400 border border-dashed border-slate-400" /> Média da Turma
                </span>
              </div>
            </div>

            {/* Renderização SVG da Linha de Tendência */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 400 160" className="w-full h-44 select-none">
                {/* Linhas de Grade Horizontal (notas 0, 5, 10) */}
                <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="25" y="24" fill="#94a3b8" fontSize="10" textAnchor="end">10.0</text>

                <line x1="40" y1="80" x2="380" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <text x="25" y="84" fill="#94a3b8" fontSize="10" textAnchor="end">5.0</text>

                <line x1="40" y1="140" x2="380" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="25" y="144" fill="#94a3b8" fontSize="10" textAnchor="end">0.0</text>

                {/* Linha da Média da Turma (Tracejada Cinza) */}
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                  points={ptsTurma}
                />

                {/* Linha do Aluno (Vinho / Católica) */}
                <polyline
                  fill="none"
                  stroke="#780016"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={ptsAluno}
                />

                {/* Pontos da Turma */}
                {etapas.map((e, idx) => (
                  <circle
                    key={`turma-${idx}`}
                    cx={getX(idx)}
                    cy={getY(e.mediaTurma)}
                    r="4"
                    fill="#ffffff"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                ))}

                {/* Pontos do Aluno com Valores */}
                {etapas.map((e, idx) => {
                  const cx = getX(idx);
                  const cy = getY(e.notaAluno);
                  return (
                    <g key={`aluno-${idx}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="6"
                        fill="#780016"
                        stroke="#ffffff"
                        strokeWidth="2.5"
                        className="transition hover:r-8 cursor-pointer"
                      />
                      <text
                        x={cx}
                        y={cy - 10}
                        fill="#780016"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {e.notaAluno.toFixed(1)}
                      </text>
                      {/* Rótulo da Etapa */}
                      <text
                        x={cx}
                        y={155}
                        fill="#475569"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Etapa {e.etapa}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 2. MAPA DE CALOR DE QUESTÕES: Detalhamento questão a questão */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-catolica-primary" />
                Mapa de Calor das Questões Realizadas
              </h3>
              <p className="text-xs text-slate-500">
                Visualização atômica item a item. Clique em um quadrante para inspecionar enunciado e distrator assinalado.
              </p>
            </div>

            {aluno.mapaDeQuestoes.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Nenhum detalhamento atômico disponível para este aluno ainda.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {aluno.mapaDeQuestoes.map((item, idx) => {
                  const cfg = getStatusItemBadge(item.status);
                  const Icon = cfg.icon;
                  const isSelecionada = questaoAtiva?.numero === item.numero;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestaoAtiva(item)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${cfg.bg} ${isSelecionada ? 'ring-2 ring-catolica-primary shadow-md scale-105' : 'hover:scale-102'}`}
                    >
                      <span className="font-mono font-bold text-xs">
                        Q.{item.numero < 10 ? `0${item.numero}` : item.numero}
                      </span>
                      <Icon className="w-4 h-4 my-1" />
                      <span className="text-[10px] font-bold">
                        {item.respostaAluno || '—'} / {item.respostaCorreta}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Painel de Inspeção da Questão Selecionada no Mapa de Calor */}
            {questaoAtiva && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    Questão {questaoAtiva.numero < 10 ? `0${questaoAtiva.numero}` : questaoAtiva.numero} ({questaoAtiva.provaTitulo})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                      Pontos: {questaoAtiva.pontuacaoObtida} / {questaoAtiva.pontuacaoMaxima}
                    </span>
                    <button
                      onClick={() => setQuestaoAtiva(null)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 italic">
                  &quot;{questaoAtiva.enunciado}&quot;
                </p>

                <div className="flex items-center gap-4 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Marcada pelo Aluno:</span>
                    <strong className={questaoAtiva.status === 'CORRETA' ? 'text-emerald-700' : 'text-rose-700'}>
                      Alternativa {questaoAtiva.respostaAluno || 'Em Branco'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gabarito Oficial:</span>
                    <strong className="text-emerald-700">
                      Alternativa {questaoAtiva.respostaCorreta}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tópico / Tags:</span>
                    <span className="text-slate-600 font-medium">
                      {questaoAtiva.tags.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Fechar Análise
          </button>
        </div>

      </div>
    </div>
  );
}
