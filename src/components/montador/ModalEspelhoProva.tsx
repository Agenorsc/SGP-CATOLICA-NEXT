'use client';

import React from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  Layers, 
  Award,
  BarChart2,
  Tag
} from 'lucide-react';
import { ProvaMontadaRegistro } from '@/types';

interface ModalEspelhoProvaProps {
  prova: ProvaMontadaRegistro | null;
  onClose: () => void;
  onReimprimir: (prova: ProvaMontadaRegistro) => void;
  onVerRelatorio: (prova: ProvaMontadaRegistro) => void;
}

export function ModalEspelhoProva({
  prova,
  onClose,
  onReimprimir,
  onVerRelatorio
}: ModalEspelhoProvaProps) {
  if (!prova) return null;

  const dataFormatada = new Date(prova.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-catolica-primary text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">{prova.titulo}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                  {prova.ciclo}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {prova.turmaNome || 'Turma'} • Criada em {dataFormatada} • {prova.totalQuestoes} Questões ({prova.pontuacaoTotal.toFixed(1)} pts)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* 1. Grade do Gabarito Oficial */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Espelho do Gabarito Oficial Gerado
            </h3>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {prova.questoesSnapshot.map((q, idx) => {
                const correta = q.alternativas?.find(a => a.correta)?.letraOriginal || 
                  q.options?.find(o => o.isCorrect)?.letter || 'A';

                return (
                  <div key={idx} className="flex flex-col items-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs">
                    <span className="text-[10px] font-mono text-slate-400">Q.{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                    <strong className="text-base font-black text-emerald-600 font-mono mt-0.5">
                      {correta}
                    </strong>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {(q.pontuacao ?? q.points ?? 1.25).toFixed(1)} pt
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Lista de Questões Sorteadas (Snapshot) */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-catolica-primary" />
              Espelho das Questões no Snapshot Arquivado
            </h3>

            <div className="space-y-3">
              {prova.questoesSnapshot.map((q, idx) => (
                <div key={q.id || idx} className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-white">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-catolica-primary bg-catolica-primary/10 px-2 py-0.5 rounded">
                        Q.{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {q.tipo}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {(q.pontuacao ?? q.points ?? 1.25).toFixed(1)} pts
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {q.enunciado || q.statement}
                  </p>

                  {/* Alternativas */}
                  {(q.alternativas || q.options) && (
                    <div className="space-y-1.5 pl-2 text-xs">
                      {(q.alternativas || q.options)?.map((alt: any, aIdx: number) => {
                        const letra = alt.letraOriginal || alt.letter || String.fromCharCode(65 + aIdx);
                        const texto = alt.texto || alt.text || '';
                        const correta = alt.correta ?? alt.isCorrect;

                        return (
                          <div 
                            key={aIdx} 
                            className={`flex items-start gap-2 p-1.5 rounded-xl border ${correta ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold' : 'border-transparent text-slate-600'}`}
                          >
                            <span className={`w-5 h-5 shrink-0 rounded flex items-center justify-center font-bold text-[10px] ${correta ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                              {letra}
                            </span>
                            <span className="text-xs pt-0.5 leading-snug">{texto}</span>
                            {correta && (
                              <span className="ml-auto text-[9px] font-bold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                Gabarito Oficial
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {q.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[9px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Rodapé com Atalhos de Ação */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onVerRelatorio(prova);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BarChart2 className="w-4 h-4 text-catolica-primary" />
            Ver Relatórios desta Avaliação
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              Fechar
            </button>

            <button
              onClick={() => {
                onClose();
                onReimprimir(prova);
              }}
              className="rounded-xl bg-catolica-primary px-4 py-2 text-xs font-bold text-white hover:bg-catolica-primary/90 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Reimprimir Caderno & Gabarito OMR
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
