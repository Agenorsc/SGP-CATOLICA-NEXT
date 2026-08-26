import React from 'react';
import { ExamVersionLayout } from '@/types';

interface OmrSheetProps {
  version: ExamVersionLayout;
}

export const OmrSheet: React.FC<OmrSheetProps> = ({ version }) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto border-2 border-black relative text-black shadow-lg">
      {/* Marcadores de Calibração nos Cantos */}
      <div className="absolute top-2 left-2 w-4 h-4 bg-black" />
      <div className="absolute top-2 right-2 w-4 h-4 bg-black" />
      <div className="absolute bottom-2 left-2 w-4 h-4 bg-black" />
      <div className="absolute bottom-2 right-2 w-4 h-4 bg-black" />

      {/* Cabeçalho */}
      <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-black tracking-wider">CATÓLICA SC - CENTRO UNIVERSITÁRIO</h2>
          <p className="text-sm">Engenharia de Software | Arquitetura de Software</p>
          <p className="text-xs text-slate-600 font-semibold">Avaliação Escrita Individual</p>
        </div>
        <div className="border-2 border-black w-24 h-16 flex flex-col items-center justify-center font-bold text-xs">
          NOTA
        </div>
      </div>

      {/* Identificação */}
      <div className="border border-dashed border-slate-700 p-3 mb-6 flex justify-between text-sm">
        <div><strong>ESTUDANTE:</strong> {version.student ? version.student.nome : '________________________________________________'}</div>
        <div><strong>MATRÍCULA:</strong> {version.student ? version.student.matricula : '________'}</div>
        <div><strong>VERSÃO:</strong> {version.versionLetter}</div>
      </div>

      {/* Grade Gabarito OMR e QR Code */}
      <div className="border-2 border-black p-4 grid grid-cols-[160px_1fr] gap-6 items-center">
        <div className="flex flex-col items-center justify-center border-r border-slate-300 pr-4">
          <div className="w-32 h-32 border-2 border-black bg-slate-100 flex items-center justify-center text-center p-2 text-xs font-mono font-bold">
            [QR CODE]<br />{version.qrPayload}
          </div>
          <span className="text-[10px] text-slate-500 mt-2 text-center">Leitura exclusiva App Professor</span>
        </div>

        <div>
          <span className="text-xs font-bold block mb-3">QUADRO DE RESPOSTAS (Preencha os quadrados a caneta):</span>
          <div className="space-y-2">
            {version.questions.map((q, idx) => {
              if (q.tipo !== 'objetiva') return null;
              return (
                <div key={q.id} className="flex items-center gap-4 text-xs font-bold">
                  <span className="w-10">Q.{idx + 1}:</span>
                  <div className="flex gap-2">
                    {letters.map((letra) => (
                      <div
                        key={letra}
                        className="w-6 h-6 border-2 border-black rounded flex items-center justify-center text-[10px]"
                      >
                        {letra}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caderno de Questões */}
      <div className="mt-8 pt-6 border-t border-slate-300 space-y-6">
        {version.questions.map((q, idx) => (
          <div key={q.id} className="text-sm">
            <h4 className="font-bold mb-1">
              Questão {idx + 1} ({q.pontuacao.toFixed(1)} pts) - {q.tipo.toUpperCase()}:
            </h4>
            <p className="mb-2 text-slate-800">{q.enunciado}</p>
            {q.tipo === 'objetiva' && q.alternativas && (
              <ul className="pl-4 space-y-1">
                {q.alternativas.map((alt, altIdx) => (
                  <li key={alt.id} className="text-slate-700">
                    <strong>({letters[altIdx]})</strong> {alt.texto}
                  </li>
                ))}
              </ul>
            )}
            {q.tipo === 'discursiva' && (
              <div className="h-20 border-b border-dotted border-slate-400 mt-2" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};