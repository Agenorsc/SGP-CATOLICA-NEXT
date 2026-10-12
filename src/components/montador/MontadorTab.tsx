'use client';

import React from 'react';
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  Printer 
} from 'lucide-react';
import { Question } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';

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
  shuffleQ: boolean;
  setShuffleQ: (shuffle: boolean) => void;
  shuffleAlt: boolean;
  setShuffleAlt: (shuffle: boolean) => void;
  withId: boolean;
  setWithId: (val: boolean) => void;
  pontuacaoTotal: number;
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
  shuffleQ,
  setShuffleQ,
  shuffleAlt,
  setShuffleAlt,
  withId,
  setWithId,
  pontuacaoTotal,
  onOpenNovaQuestao,
  onEditQuestao,
  onDeleteQuestao,
  onAdicionarNaProva,
  onRemoverDaProva,
  onIrParaImpressao
}: MontadorTabProps) {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="text-catolica-primary" /> Montador de Avaliações
          </h2>
          <p className="text-xs text-slate-500">Selecione a turma e monte a avaliação com as questões do banco.</p>
        </div>
        <button
          onClick={onOpenNovaQuestao}
          className="flex items-center gap-2 bg-catolica-primary hover:bg-catolica-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-catolica-primary/20 transition cursor-pointer"
        >
          <PlusCircle size={16} /> Nova Questão
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Banco de Questões</h3>
                <p className="text-xs text-slate-500">Selecione para incluir no caderno</p>
              </div>
              <span className="text-xs bg-slate-100 font-bold px-3 py-1 rounded-lg text-slate-600">
                {bancoQuestoes.length} disponíveis
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filtrar por enunciado ou tag..."
                value={buscaQuestao}
                onChange={(e) => setBuscaQuestao(e.target.value)}
                className="bg-transparent text-xs w-full outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {questoesFiltradas.map((q, idx) => {
              const jaAdicionada = questoesSelecionadas.some(item => item.id === q.id);
              return (
                <div
                  key={q.id}
                  className={`bg-white p-5 rounded-2xl border transition-all ${
                    jaAdicionada
                      ? 'border-catolica-primary/40 bg-catolica-light/30'
                      : 'border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                        Q{idx + 1} - {q.tipo.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {q.pontuacao.toFixed(1)} pts
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEditQuestao(q)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Editar Questão"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteQuestao(q.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Questão"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => onAdicionarNaProva(q)}
                        disabled={jaAdicionada}
                        className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition ml-1 ${
                          jaAdicionada
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : 'bg-slate-900 text-white hover:bg-catolica-primary'
                        }`}
                      >
                        {jaAdicionada ? (
                          <><Check className="w-3 h-3" /> No Caderno</>
                        ) : (
                          <><Plus className="w-3 h-3" /> Adicionar</>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed mb-3">
                    {q.enunciado}
                  </p>

                  <div className="flex gap-1.5 flex-wrap">
                    {q.tags.map(t => (
                      <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                Turma Destino da Prova:
              </label>
              <select
                value={turmaSelecionadaId}
                onChange={(e) => setTurmaSelecionadaId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-catolica-primary outline-none"
              >
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} — {t.curso} ({t.semestre})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Resumo da Avaliação</h3>
                <p className="text-xs text-slate-500">Configuração de caderno e gabarito</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 block uppercase">Pontuação Total:</span>
                <strong className={`text-lg font-black ${pontuacaoTotal === 10 ? 'text-emerald-600' : 'text-catolica-primary'}`}>
                  {pontuacaoTotal.toFixed(1)} / 10.0 pts
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Matéria / Título da Prova:
                </label>
                <input
                  type="text"
                  value={tituloProva}
                  onChange={(e) => setTituloProva(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-catolica-primary"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Regras de Impressão e Embaralhamento:
                </span>
                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQ}
                    onChange={(e) => setShuffleQ(e.target.checked)}
                    className="w-3.5 h-3.5 accent-catolica-primary"
                  />
                  Embaralhar ordem das questões
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
                <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                  Questões no Caderno ({questoesSelecionadas.length} / 20):
                </span>
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {questoesSelecionadas.map((q, idx) => (
                    <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                      <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                        <span className="font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                        <span className="max-w-[160px] truncate font-semibold text-slate-800 sm:max-w-[280px]">
                          {q.enunciado}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-catolica-primary">{q.pontuacao.toFixed(1)} pts</span>
                        <button
                          onClick={() => onRemoverDaProva(q.id)}
                          className="text-slate-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={onIrParaImpressao}
              disabled={questoesSelecionadas.length === 0}
              className="w-full bg-catolica-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-catolica-dark transition shadow-lg shadow-catolica-primary/30"
            >
              <Printer className="w-4 h-4" /> Gerar Caderno Frente/Verso & Gabarito OMR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
