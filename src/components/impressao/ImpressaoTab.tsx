'use client';

import React, { useState } from 'react';
import { Printer, CheckSquare } from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { Question } from '@/types';
import { QRCodeWrapper } from '@/components/common/QRCodeWrapper';

interface ImpressaoTabProps {
  alunosDaTurmaSelecionada: AlunoModel[];
  selectedVersionIdx: number;
  setSelectedVersionIdx: (idx: number) => void;
  alunoAtual: AlunoModel;
  tituloProva: string;
  turmaSelecionadaId: string;
  withId: boolean;
  questoesEmbaralhadas: Question[];
}

export function ImpressaoTab({
  alunosDaTurmaSelecionada,
  selectedVersionIdx,
  setSelectedVersionIdx,
  alunoAtual,
  tituloProva,
  turmaSelecionadaId,
  withId,
  questoesEmbaralhadas
}: ImpressaoTabProps) {
  // Controle de Frente e Verso (Gera página de verso em branco para destacar o gabarito sem perder questões)
  const [modoFrenteVerso, setModoFrenteVerso] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden sm:flex-row sm:items-center sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-xs font-bold text-slate-700 uppercase">Estudante / Versão:</label>
            <select
              value={selectedVersionIdx}
              onChange={(e) => setSelectedVersionIdx(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none sm:w-auto"
            >
              {alunosDaTurmaSelecionada.map((aluno, idx) => (
                <option key={aluno.id} value={idx}>
                  {aluno.nome} — RA: {aluno.ra} (Versão {String.fromCharCode(65 + (idx % 4))})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700 hover:text-slate-900 transition">
            <input
              type="checkbox"
              checked={modoFrenteVerso}
              onChange={(e) => setModoFrenteVerso(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-catolica-primary focus:ring-catolica-primary"
            />
            <span className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-catolica-primary" />
              Imprimir Frente e Verso (Duplex)
            </span>
          </label>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 rounded-xl bg-catolica-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-catolica-primary/20 transition hover:bg-catolica-dark"
        >
          <Printer className="w-4 h-4" /> Imprimir Prova Completa {modoFrenteVerso ? '(Frente/Verso)' : '(Apenas Frente)'}
        </button>
      </div>

      <div className="space-y-8 print:space-y-0">
        {/* PÁGINA 1: FOLHA DE RESPOSTA OMR - FRENTE */}
        <div className="rounded-xl border-2 border-slate-300 bg-white p-3 shadow-lg print:border-none print:p-0 print:m-0 print:shadow-none sm:p-8 print:break-after-page">
          <div className="mb-6 flex flex-col gap-1 border-b-2 border-dashed border-slate-400 pb-3 text-xs font-bold uppercase text-slate-500 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <span>✂️ Destaque aqui — Entregar somente este gabarito ao professor</span>
            <span>Folha de Respostas OMR (Frente Única)</span>
          </div>

          <div className="relative min-h-[500px] border-4 border-slate-900 p-4 sm:p-6 print:border-4 print:border-black">
            {/* Marcadores Ópticos de Calibração */}
            <div className="absolute top-2 left-2 w-4 h-4 bg-black print:bg-black" />
            <div className="absolute top-2 right-2 w-4 h-4 bg-black print:bg-black" />
            <div className="absolute bottom-2 left-2 w-4 h-4 bg-black print:bg-black" />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-black print:bg-black" />

            <div className="mb-6 flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-4 print:border-black">
              <div>
                <h3 className="text-base font-black uppercase text-slate-900">CATÓLICA SC - CENTRO UNIVERSITÁRIO</h3>
                <p className="text-xs font-semibold text-slate-700">Folha de Respostas Óptica • Avaliação Individual</p>
                <p className="text-xs font-bold text-catolica-primary mt-1">Matéria: {tituloProva}</p>

                {withId ? (
                  <div className="mt-2 text-xs">
                    <p><strong>Estudante:</strong> {alunoAtual?.nome}</p>
                    <p><strong>Registro Acadêmico (RA):</strong> {alunoAtual?.ra}</p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs">
                    <p><strong>Estudante:</strong> __________________________________________</p>
                    <p><strong>RA:</strong> ____________________</p>
                  </div>
                )}
              </div>
              <div className="border-2 border-slate-900 p-2 text-center text-xs print:border-black">
                <span className="block font-bold">VERSÃO</span>
                <strong className="text-2xl font-black">{String.fromCharCode(65 + (selectedVersionIdx % 4))}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* GERADOR DE QR CODE CLIENT-SIDE */}
              <div className="border-2 border-slate-900 p-3 text-center font-mono text-xs flex flex-col items-center justify-center bg-white rounded-xl print:border-2 print:border-black">
                <div className="p-2 bg-white rounded border border-slate-200 print:border-none flex justify-center items-center">
                  <QRCodeWrapper
                    value={JSON.stringify({
                      system: 'SGP-CATOLICA',
                      examId: `EXAM-${turmaSelecionadaId || 'T1'}`,
                      studentId: alunoAtual?.id || 'alu-01',
                      ra: withId ? (alunoAtual?.ra || '1328834') : 'ANONIMO',
                      name: withId ? (alunoAtual?.nome || 'AGENOR ALVISE') : 'ANONIMO',
                      turmaId: turmaSelecionadaId || 't1',
                      examVersion: String.fromCharCode(65 + (selectedVersionIdx % 4))
                    })}
                    size={135}
                  />
                </div>
                <span className="text-[11px] font-black text-slate-900 mt-2 block print:text-black">
                  {withId ? `RA: ${alunoAtual?.ra}` : 'PROVA ANÔNIMA'} • VERSÃO {String.fromCharCode(65 + (selectedVersionIdx % 4))}
                </span>
                <span className="text-[9px] text-slate-500 block print:text-black">
                  Identificação Óptica Automática
                </span>
              </div>

              {/* QUADRO DE RESPOSTAS OMR EM FORMATO QUADRADO */}
              <div className="border-2 border-slate-900 p-4 bg-white rounded-xl print:border-2 print:border-black space-y-2.5">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1.5 print:border-black">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-black inline-block print:bg-black" />
                    <span className="text-xs font-black uppercase text-slate-900 print:text-black tracking-wide">
                      Quadro de Respostas (Preencha o Quadrado a Caneta)
                    </span>
                  </div>
                  <span className="w-3 h-3 bg-black inline-block print:bg-black" />
                </div>

                <div className="space-y-2">
                  {questoesEmbaralhadas.filter(q => q.tipo === 'objetiva').map((q, idx) => (
                    <div key={q.id || idx} className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-black w-7 text-slate-900 print:text-black">Q.{idx + 1}:</span>
                      <div className="flex items-center gap-1.5">
                        {['A', 'B', 'C', 'D', 'E'].map(letra => (
                          <div
                            key={letra}
                            className="w-7 h-7 border-2 border-slate-900 rounded-none flex items-center justify-center font-black text-xs print:border-2 print:border-black print:text-black bg-white"
                          >
                            {letra}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-300 print:border-black text-[9px] text-slate-600 print:text-black font-mono">
                  <span className="w-3 h-3 bg-black inline-block print:bg-black" />
                  <span>Preencha totalmente o quadrado: [ ■ ]</span>
                  <span className="w-3 h-3 bg-black inline-block print:bg-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PÁGINA 2: VERSO DO CARTÃO GABARITO (PÁGINA EM BRANCO INTENCIONAL) */}
        {modoFrenteVerso && (
          <div className="hidden print:flex print:flex-col print:justify-center print:items-center print:h-[240mm] print:break-after-page">
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 text-xs uppercase p-8 text-center space-y-3 rounded-2xl">
              <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center font-bold text-lg">✂️</div>
              <p className="font-bold text-sm tracking-wide text-slate-600">PÁGINA EM BRANCO INTENCIONAL</p>
              <p className="text-[11px] font-bold text-slate-400">VERSO DO CARTÃO DE RESPOSTAS</p>
              <p className="text-[10px] text-slate-400 max-w-sm normal-case leading-relaxed">
                Esta página é mantida em branco para que o estudante possa destacar a folha de respostas e entregá-la ao professor sem rasgar o caderno de questões.
              </p>
            </div>
          </div>
        )}

        {/* PÁGINA 3 EM DIANTE: CADERNO DE QUESTÕES */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg print:border-none print:shadow-none print:p-0 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 border-b-2 border-slate-900 pb-3 sm:flex-row sm:items-start sm:justify-between print:border-black">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase">CATÓLICA SC - CADERNO DE QUESTÕES</h3>
              <p className="text-xs text-slate-600">{tituloProva} • Versão {String.fromCharCode(65 + (selectedVersionIdx % 4))}</p>
            </div>
          </div>

          <div className="space-y-6">
            {questoesEmbaralhadas.map((q, idx) => (
              <div key={q.id || idx} className="text-xs space-y-2 border-b border-slate-100 pb-4 print:break-inside-avoid">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Questão {idx + 1} ({q.pontuacao?.toFixed(1) || '2.5'} pts) - {q.tipo?.toUpperCase()}:</span>
                </div>
                <p className="text-slate-800 leading-relaxed">{q.enunciado}</p>

                {q.tipo === 'objetiva' && q.alternativas && (
                  <div className="space-y-1.5 pl-2 pt-1">
                    {q.alternativas.map((alt, altIdx) => (
                      <div key={alt.id || altIdx} className="flex gap-2">
                        <span className="font-bold">({String.fromCharCode(65 + altIdx)})</span>
                        <span>{alt.texto}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
