'use client';

import React from 'react';
import { QRCodeWrapper } from '@/components/common/QRCodeWrapper';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { Question } from '@/types';

export interface FolhaRespostaA4Props {
  provaId: string;
  cadernoId: string;
  turmaNome: string;
  disciplina: string;
  avaliacaoTitulo: string;
  dataProva: string;
  versaoLetra: string;
  aluno?: AlunoModel | { id?: string; nome?: string; ra?: string };
  totalQuestoes?: number;
  questoes?: Question[];
  pontosPorQuestao?: number;
  orientacoes?: string[];
  duracaoHoras?: number;
}

export function FolhaRespostaA4({
  provaId,
  cadernoId,
  turmaNome = 'Direito Civil',
  disciplina = 'Direito Civil',
  avaliacaoTitulo = 'Avaliação Escrita 01',
  dataProva = new Date().toLocaleDateString('pt-BR'),
  versaoLetra = 'A',
  aluno,
  totalQuestoes = 10,
  questoes = [],
  pontosPorQuestao = 1.0,
  orientacoes = [
    'Sobre a mesa, o estudante deverá manter somente o material necessário para a realização da prova, sendo estes caneta, lápis, borracha, corretivo e material admitido para consulta.',
    'Cada questão tem a pontuação indicada.',
    'As questões objetivas deverão ser respondidas no gabarito aposto ao lado, sob pena de serem desconsideradas.',
    'As provas deverão ser respondidas à caneta, preta ou azul, sob pena de serem desconsideradas as respostas à lápis.',
    'Será admitida a consulta apenas a materiais previamente autorizados pelo docente.',
    'Não é permitida qualquer consulta a equipamentos eletrônicos nem comunicação entre os estudantes.',
    'A interpretação das questões faz parte da prova e da avaliação.'
  ],
  duracaoHoras = 3
}: FolhaRespostaA4Props) {
  // Payload compacto para máxima legibilidade do QR Code (Pelo menos 32mm x 32mm e nível H)
  const qrPayload = JSON.stringify({
    p: provaId,
    c: cadernoId,
    a: aluno?.nome || '',
    r: aluno?.ra || ''
  });

  const numQuestoes = Math.min(30, Math.max(1, questoes.length || totalQuestoes || 10));
  const isDuasColunas = numQuestoes > 15;
  const col1Count = isDuasColunas ? 15 : numQuestoes;
  const col2Count = isDuasColunas ? numQuestoes - 15 : 0;
  const opcoesLetras = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="sgp-answer-sheet bg-white p-6 sm:p-8 font-sans text-slate-900 print:text-black print:p-0 print:m-0 w-full max-w-[210mm] mx-auto box-border">
      
      {/* 1. CABEÇALHO INSTITUCIONAL COM QR CODE DE ALTA REDUNDÂNCIA (NÍVEL H - 32mm) */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-slate-900 pb-3 print:border-black">
        {/* Lado Esquerdo: Logo Católica SC + Curso */}
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 text-slate-900 print:text-black shrink-0" viewBox="0 0 48 48" fill="currentColor">
            <path d="M6 14 L22 6 L22 34 L6 42 Z" opacity="0.95" />
            <path d="M26 6 L42 14 L42 42 L26 34 Z" opacity="0.8" />
            <path d="M22 6 L24 4 L26 6 L26 34 L22 34 Z" opacity="0.6" />
          </svg>
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 print:text-black leading-tight">
                Católica SC
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-600 print:text-black">
                CENTRO UNIVERSITÁRIO
              </span>
            </div>
            <div className="h-8 w-[1.5px] bg-slate-400 print:bg-black mx-1" />
            <div className="text-sm font-black text-slate-900 print:text-black leading-tight">
              {turmaNome}
            </div>
          </div>
        </div>

        {/* Lado Central: QR Code de Alta Legibilidade (Mínimo 32mm x 32mm, Nível H - 30%) */}
        <div className="flex flex-col items-center justify-center shrink-0 px-2 py-0.5 border border-slate-300 print:border-black rounded-lg bg-white">
          <div className="w-[32mm] h-[32mm] min-w-[32mm] min-h-[32mm] flex items-center justify-center p-1 bg-white">
            <QRCodeWrapper
              value={qrPayload}
              size={124}
              level="H"
              includeMargin={true}
            />
          </div>
          <span className="text-[8px] font-mono font-bold tracking-tight text-slate-800 print:text-black mt-0.5">
            QR ALTA PRECISÃO • {versaoLetra}
          </span>
        </div>

        {/* Lado Direito: Nome da Disciplina e Avaliação */}
        <div className="text-right">
          <h2 className="text-xs sm:text-sm font-black uppercase text-slate-900 print:text-black tracking-wide">
            {disciplina.toUpperCase()}
          </h2>
          <p className="text-[11px] font-bold uppercase text-slate-700 print:text-black mt-0.5">
            {avaliacaoTitulo.toUpperCase()}
          </p>
        </div>
      </div>

      {/* 2. DADOS DO ESTUDANTE + CAIXA DE NOTA */}
      <div className="flex items-end justify-between gap-4 border-b border-slate-900 pb-2.5 pt-2 print:border-black text-xs font-bold text-slate-900 print:text-black">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-6 text-[11px]">
            <span>DATA: <strong>{dataProva}</strong></span>
            <span>VERSÃO: <strong>{versaoLetra}</strong></span>
            {aluno?.ra && <span>RA: <strong>{aluno.ra}</strong></span>}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 uppercase text-xs">ESTUDANTE:</span>
            <span className="flex-1 border-b border-slate-900 print:border-black font-semibold text-slate-800 print:text-black pb-0.5 uppercase tracking-wide">
              {aluno?.nome || '____________________________________________________________________'}
            </span>
          </div>
        </div>

        {/* Caixa de NOTA Oficial */}
        <div className="border-2 border-slate-900 print:border-black w-24 h-14 flex flex-col shrink-0 text-center bg-white">
          <div className="bg-slate-100 print:bg-slate-200 border-b border-slate-900 print:border-black text-[10px] font-black uppercase py-0.5">
            NOTA
          </div>
          <div className="flex-1 flex items-center justify-center font-mono text-xl font-bold text-slate-300 print:text-transparent">
            {/* Espaço para preenchimento docente */}
          </div>
        </div>
      </div>

      {/* 3. CORPO PRINCIPAL EM DUAS SEÇÕES: ORIENTAÇÕES À ESQUERDA | GABARITO ÓPTICO À DIREITA */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
        
        {/* COLUNA ESQUERDA: ORIENTAÇÕES DA PROVA */}
        <div className="md:col-span-5 space-y-2 text-[10px] leading-snug text-slate-800 print:text-black text-justify font-sans">
          <p className="font-black uppercase tracking-wide text-slate-900 print:text-black text-[11px]">
            - ORIENTAÇÕES PARA A REALIZAÇÃO DA PROVA:
          </p>
          <ol className="list-decimal pl-3.5 space-y-1.5 marker:font-bold">
            {orientacoes.map((item, idx) => (
              <li key={idx}>
                {item.replace('{pontos}', `${pontosPorQuestao} ponto(s)`)}
              </li>
            ))}
          </ol>
          <p className="font-black text-center pt-3 tracking-widest text-slate-900 print:text-black text-xs">
            BOA PROVA!
          </p>

          <div className="border border-slate-900 print:border-black p-2 rounded text-[9px] space-y-1 mt-3">
            <p className="font-black text-center uppercase tracking-wider text-[9.5px] pb-0.5 border-b border-slate-300 print:border-black">
              ORIENTAÇÕES SOBRE O PREENCHIMENTO DO GABARITO
            </p>
            <p className="pt-0.5">✓ Preencha totalmente a bolinha com caneta azul ou preta;</p>
            <p>✓ Rasuras ou dupla marcação anularão a questão correspondente;</p>
            <p>✓ Não dobre, amasse ou rasure as 4 marcas pretas dos cantos do gabarito.</p>
          </div>
        </div>

        {/* COLUNA DIREITA: BLOCO DO GABARITO DELIMITADO PELAS 4 MARCAS FIDUCIAIS (8mm x 8mm) */}
        <div className="md:col-span-7 flex flex-col items-center">
          
          {/* ÁREA FIDUCIAL RETIFICÁVEL POR HOMOGRAFIA */}
          <div 
            id="area-gabarito-fiduciais" 
            className="relative border-2 border-slate-900 print:border-black bg-white rounded-md p-6 w-full max-w-[125mm]"
          >
            {/* 4 ÂNCORAS FIDUCIAIS EXATAS DE 8mm x 8mm COM RESPIRO BRANCO */}
            {/* Top-Left */}
            <div 
              data-fiducial="TL"
              className="absolute top-2 left-2 w-[8mm] h-[8mm] min-w-[8mm] min-h-[8mm] bg-black print:bg-black rounded-none shadow-xs print:shadow-none"
              title="Marca Fiducial Top-Left (8mm x 8mm)"
            />

            {/* Top-Right */}
            <div 
              data-fiducial="TR"
              className="absolute top-2 right-2 w-[8mm] h-[8mm] min-w-[8mm] min-h-[8mm] bg-black print:bg-black rounded-none shadow-xs print:shadow-none"
              title="Marca Fiducial Top-Right (8mm x 8mm)"
            />

            {/* Bottom-Left */}
            <div 
              data-fiducial="BL"
              className="absolute bottom-2 left-2 w-[8mm] h-[8mm] min-w-[8mm] min-h-[8mm] bg-black print:bg-black rounded-none shadow-xs print:shadow-none"
              title="Marca Fiducial Bottom-Left (8mm x 8mm)"
            />

            {/* Bottom-Right */}
            <div 
              data-fiducial="BR"
              className="absolute bottom-2 right-2 w-[8mm] h-[8mm] min-w-[8mm] min-h-[8mm] bg-black print:bg-black rounded-none shadow-xs print:shadow-none"
              title="Marca Fiducial Bottom-Right (8mm x 8mm)"
            />

            {/* CABEÇALHO DO BLOCO INTERNO DE RESPOSTAS */}
            <div className="text-center pb-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-900 print:text-black">
                FOLHA DE RESPOSTAS ÓPTICA (OMR)
              </span>
              <p className="text-[8.5px] font-mono text-slate-500 print:text-black">
                Versão: {versaoLetra} • Caderno: {cadernoId}
              </p>
            </div>

            {/* GRADE PADRONIZADA DE BOLINHAS (CÍRCULOS COM LETRAS INTERNAS) */}
            <div className={`pt-2 pb-2 px-6 flex justify-around gap-6 ${isDuasColunas ? 'flex-row' : 'flex-col items-center'}`}>
              
              {/* Coluna 1: Questões 1 até col1Count */}
              <div className="space-y-2">
                {/* Rótulo superior das alternativas */}
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 print:text-black font-mono">
                  <span className="w-10 text-right pr-2">Q:</span>
                  {opcoesLetras.map(letra => (
                    <span key={letra} className="w-6 text-center">{letra}</span>
                  ))}
                </div>

                {/* Linhas das questões da Coluna 1 */}
                {Array.from({ length: col1Count }).map((_, qIdx) => {
                  const num = qIdx + 1;
                  const numStr = num < 10 ? `0${num}` : `${num}`;
                  return (
                    <div key={num} className="flex items-center gap-2 font-mono">
                      <span className="w-10 text-right pr-2 text-[10.5px] font-bold text-slate-900 print:text-black">
                        Q.{numStr}:
                      </span>
                      {opcoesLetras.map(letra => (
                        <div
                          key={letra}
                          data-question={num}
                          data-option={letra}
                          className="w-6 h-6 rounded-full border border-slate-900 print:border-black flex items-center justify-center text-[10px] font-black text-slate-900 print:text-black bg-white select-none"
                        >
                          {letra}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Coluna 2: Questões 16 até numQuestoes (se houver mais de 15 questões) */}
              {isDuasColunas && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-800 print:text-black font-mono">
                    <span className="w-10 text-right pr-2">Q:</span>
                    {opcoesLetras.map(letra => (
                      <span key={letra} className="w-6 text-center">{letra}</span>
                    ))}
                  </div>

                  {Array.from({ length: col2Count }).map((_, qIdx) => {
                    const num = 16 + qIdx;
                    return (
                      <div key={num} className="flex items-center gap-2 font-mono">
                        <span className="w-10 text-right pr-2 text-[10.5px] font-bold text-slate-900 print:text-black">
                          Q.{num}:
                        </span>
                        {opcoesLetras.map(letra => (
                          <div
                            key={letra}
                            data-question={num}
                            data-option={letra}
                            className="w-6 h-6 rounded-full border border-slate-900 print:border-black flex items-center justify-center text-[10px] font-black text-slate-900 print:text-black bg-white select-none"
                          >
                            {letra}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rodapé da Grade */}
            <div className="pt-2 border-t border-slate-200 print:border-black text-center">
              <span className="text-[8px] font-mono font-bold text-slate-600 print:text-black">
                PROVA: {provaId} • CADERNO: {cadernoId}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
