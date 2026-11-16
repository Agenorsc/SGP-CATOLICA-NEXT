'use client';

import React, { useState } from 'react';
import { X, KeyRound, Layers, CheckCircle2, Copy, Check } from 'lucide-react';
import { ProvaMontadaRegistro, CadernoProvaRegistro } from '@/types';

interface ModalGabaritosEmbaralhadosProps {
  prova: ProvaMontadaRegistro;
  onClose: () => void;
}

export function ModalGabaritosEmbaralhados({ prova, onClose }: ModalGabaritosEmbaralhadosProps) {
  const cadernos = prova.cadernos || [];
  const [cadernoSelecionadoId, setCadernoSelecionadoId] = useState<string>(
    cadernos[0]?.id || ''
  );
  const [copiado, setCopiado] = useState(false);

  const cadernoAtual = cadernos.find(c => c.id === cadernoSelecionadoId) || cadernos[0];

  const handleCopiarGabarito = () => {
    if (!cadernoAtual) return;
    const texto = Object.entries(cadernoAtual.gabaritoOficialJson)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([num, letra]) => `Q${num.padStart(2, '0')}: ${letra}`)
      .join(' | ');

    navigator.clipboard.writeText(`${prova.titulo} - ${cadernoAtual.codigoVersao}\n${texto}`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-catolica-primary text-white shadow-md shadow-catolica-primary/20">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Gabaritos Oficiais dos Cadernos Embaralhados
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {prova.titulo} • {prova.disciplina || 'Geral'} ({prova.ciclo})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seletor de Versão de Caderno */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Selecione a Versão do Caderno:
            </label>
            <div className="flex flex-wrap gap-2">
              {cadernos.map(c => {
                const ativo = c.id === cadernoAtual?.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCadernoSelecionadoId(c.id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition border ${
                      ativo
                        ? 'bg-catolica-primary text-white border-catolica-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    {c.codigoVersao}
                    {c.alunoNome && (
                      <span className="text-[10px] opacity-80 font-normal">
                        ({c.alunoNome.split(' ')[0]})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cartão de Detalhes do Caderno Ativo */}
          {cadernoAtual ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
                <div>
                  <span className="text-xs font-black uppercase text-catolica-primary">
                    Versão Selecionada
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {cadernoAtual.codigoVersao}
                    {cadernoAtual.alunoNome && ` — ${cadernoAtual.alunoNome} (RA: ${cadernoAtual.alunoRa || 'N/A'})`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCopiarGabarito}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 transition"
                >
                  {copiado ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar Gabarito</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid de Respostas do Gabarito */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-3">
                  Respostas Corretas por Questão:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2.5">
                  {Object.entries(cadernoAtual.gabaritoOficialJson)
                    .sort((a, b) => Number(a[0]) - Number(b[0]))
                    .map(([qNum, letra]) => (
                      <div
                        key={qNum}
                        className="flex flex-col items-center justify-center rounded-xl bg-white border border-slate-200 p-2.5 shadow-sm text-center"
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Q.{qNum.padStart(2, '0')}
                        </span>
                        <span className="text-lg font-black text-catolica-primary mt-0.5">
                          {letra}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              Nenhum caderno cadastrado para esta prova.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
