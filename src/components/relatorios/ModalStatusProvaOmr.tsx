'use client';

import React from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  ArrowLeft
} from 'lucide-react';
import { LeituraOMRRegistro, QuestaoHistoricoAluno, EvaluationStage } from '@/types';

export interface ModalStatusProvaOmrProps {
  alunoNome: string;
  alunoRa: string;
  turmaNome: string;
  etapa: 'N1' | 'N2' | 'N3' | 'N-1';
  nota: number;
  leitura?: LeituraOMRRegistro | null;
  questoesHistorico?: QuestaoHistoricoAluno[];
  onClose: () => void;
}

export function ModalStatusProvaOmr({
  alunoNome,
  alunoRa,
  turmaNome,
  etapa,
  nota,
  leitura,
  questoesHistorico = [],
  onClose
}: ModalStatusProvaOmrProps) {
  // 1. Extração estruturada das questões corrigidas
  type ItemQuestaoVisual = {
    numero: number;
    respostaMarcada: string | null;
    respostaCorreta: string;
    status: 'ACERTO' | 'ERRO' | 'DUPLICADA' | 'EM_BRANCO';
    opcoes: string[];
  };

  const questoesVisuais: ItemQuestaoVisual[] = [];

  if (leitura && (leitura.detalhesQuestoes?.length || leitura.respostasDetectadas)) {
    // Reconstrução a partir da leitura OMR direta
    const totalQ = leitura.totalQuestoes || 
      (leitura.detalhesQuestoes?.length ?? 0) || 
      Object.keys(leitura.respostasDetectadas || {}).length || 
      10;

    for (let i = 1; i <= totalQ; i++) {
      const det = leitura.detalhesQuestoes?.find(d => d.numero === i);
      const gab = det?.respostaCorreta || leitura.gabaritoOficial?.[i] || 'A';
      const marc = det ? det.respostaMarcada : (leitura.respostasDetectadas?.[i] ?? null);
      
      let st: 'ACERTO' | 'ERRO' | 'DUPLICADA' | 'EM_BRANCO' = 'EM_BRANCO';
      if (det) {
        if (det.status === 'CORRETA' || det.correta) st = 'ACERTO';
        else if (det.status === 'ANULADA') st = 'DUPLICADA';
        else if (det.status === 'EM_BRANCO' || !det.respostaMarcada) st = 'EM_BRANCO';
        else st = 'ERRO';
      } else {
        if (!marc) st = 'EM_BRANCO';
        else if (String(marc).toUpperCase() === String(gab).toUpperCase()) st = 'ACERTO';
        else if (String(marc).includes(';') || String(marc).length > 1) st = 'DUPLICADA';
        else st = 'ERRO';
      }

      questoesVisuais.push({
        numero: i,
        respostaMarcada: marc ? String(marc).toUpperCase() : null,
        respostaCorreta: String(gab).toUpperCase(),
        status: st,
        opcoes: ['A', 'B', 'C', 'D']
      });
    }
  } else if (questoesHistorico.length > 0) {
    // Reconstrução a partir do histórico atômico da etapa
    const questoesDaEtapa = questoesHistorico.filter(q => q.etapa === etapa);
    if (questoesDaEtapa.length > 0) {
      questoesDaEtapa.forEach(q => {
        let st: 'ACERTO' | 'ERRO' | 'DUPLICADA' | 'EM_BRANCO' = 'EM_BRANCO';
        if (q.status === 'CORRETA') st = 'ACERTO';
        else if (q.status === 'ANULADA') st = 'DUPLICADA';
        else if (q.status === 'EM_BRANCO' || !q.respostaAluno) st = 'EM_BRANCO';
        else st = 'ERRO';

        questoesVisuais.push({
          numero: q.numero,
          respostaMarcada: q.respostaAluno ? String(q.respostaAluno).toUpperCase() : null,
          respostaCorreta: String(q.respostaCorreta || 'A').toUpperCase(),
          status: st,
          opcoes: ['A', 'B', 'C', 'D']
        });
      });
    }
  }

  // Se não temos questões individuais mas temos nota registrada > 0
  const temQuestoes = questoesVisuais.length > 0;

  // Contadores
  const totalQuestoes = temQuestoes ? questoesVisuais.length : 10;
  const acertos = temQuestoes 
    ? questoesVisuais.filter(q => q.status === 'ACERTO').length 
    : (leitura?.acertos ?? Math.round((nota / 10) * totalQuestoes));
  const erros = temQuestoes 
    ? questoesVisuais.filter(q => q.status === 'ERRO').length 
    : Math.max(0, totalQuestoes - acertos);
  const duplicadas = temQuestoes 
    ? questoesVisuais.filter(q => q.status === 'DUPLICADA').length 
    : 0;
  const emBranco = temQuestoes 
    ? questoesVisuais.filter(q => q.status === 'EM_BRANCO').length 
    : 0;

  const versao = leitura?.versao || 'A';
  const notaExibida = leitura?.notaCalculada ?? nota;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl flex flex-col space-y-4 p-5 sm:p-6">
        
        {/* 1. TOPO DA INTERFACE COM STATUS E CONTROLES */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-catolica-primary text-white shadow-sm">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Leitor OMR Unificado</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Católica SC
                </span>
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. CARD TOPO: STATUS DA AVALIAÇÃO E NOTA */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                VERSÃO {versao}
              </span>
              <span className="text-xs font-black text-slate-200">
                Avaliação Oficial • Etapa {etapa}
              </span>
            </div>
            <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
              ✓ Prova corrigida e nota registrada
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Nota Calculada</span>
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              {notaExibida.toFixed(1)} <span className="text-sm font-normal text-slate-400">pts</span>
            </span>
          </div>
        </div>

        {/* 3. DADOS DO ESTUDANTE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold mb-0.5">Nome do Aluno:</span>
            <div className="font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
              {alunoNome}
            </div>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold mb-0.5">RA / Matrícula:</span>
            <div className="font-mono font-bold text-white bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700">
              {alunoRa}
            </div>
          </div>
        </div>

        {/* 4. CONTADORES DE DESEMPENHO (PADRÃO MOBILE OMR) */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30">
            <span className="text-[9px] font-black uppercase text-emerald-400 block">Acertos</span>
            <span className="text-lg font-black text-emerald-300">{acertos}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-rose-950/50 border border-rose-500/30">
            <span className="text-[9px] font-black uppercase text-rose-400 block">Erros</span>
            <span className="text-lg font-black text-rose-300">{erros}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-amber-950/50 border border-amber-500/30">
            <span className="text-[9px] font-black uppercase text-amber-400 block">Duplicadas</span>
            <span className="text-lg font-black text-amber-300">{duplicadas}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800 border border-slate-700">
            <span className="text-[9px] font-black uppercase text-slate-400 block">Em Branco</span>
            <span className="text-lg font-black text-slate-200">{emBranco}</span>
          </div>
        </div>

        {/* 5. LISTA DE QUESTÕES COM BOLHAS (IGUAL AO CELULAR / PRINT 1) */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Marcações da Prova • {turmaNome}
            </p>
            <span className="text-[10px] text-slate-400">
              {temQuestoes ? `${questoesVisuais.length} questões avaliadas` : 'Nota lançada'}
            </span>
          </div>

          {temQuestoes ? (
            <div className="grid grid-cols-1 gap-1.5 max-h-[38vh] overflow-y-auto pr-1">
              {questoesVisuais.map(q => {
                const corLinha =
                  q.status === 'ACERTO'
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : q.status === 'ERRO'
                      ? 'border-rose-500/50 bg-rose-500/10'
                      : q.status === 'DUPLICADA'
                        ? 'border-orange-500/50 bg-orange-500/10'
                        : 'border-amber-500/40 bg-amber-500/5';

                const rotulo =
                  q.status === 'ACERTO'
                    ? 'Acerto'
                    : q.status === 'ERRO'
                      ? `Erro (certa: ${q.respostaCorreta})`
                      : q.status === 'DUPLICADA'
                        ? 'Duplicada'
                        : `Em branco (certa: ${q.respostaCorreta})`;

                return (
                  <div
                    key={q.numero}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${corLinha}`}
                  >
                    <span className="font-mono text-[11px] font-black text-white w-9">
                      Q.{String(q.numero).padStart(2, '0')}
                    </span>

                    <div className="flex gap-1.5">
                      {q.opcoes.map(letra => {
                        const marcada = q.respostaMarcada === letra;
                        const correta = letra === q.respostaCorreta;

                        let estilo = 'bg-slate-900 text-slate-400 border-slate-600';
                        if (marcada) {
                          if (q.status === 'ACERTO') {
                            estilo = 'bg-emerald-500 text-white border-emerald-400';
                          } else if (q.status === 'ERRO') {
                            estilo = 'bg-rose-500 text-white border-rose-400';
                          } else {
                            estilo = 'bg-orange-500 text-white border-orange-400';
                          }
                        } else if (correta && q.status !== 'ACERTO') {
                          estilo = 'bg-transparent text-emerald-300 border-emerald-400 border-dashed';
                        }

                        return (
                          <div
                            key={letra}
                            className={`w-7 h-7 rounded-full border-2 text-[11px] font-black flex items-center justify-center ${estilo}`}
                          >
                            {letra}
                          </div>
                        );
                      })}
                    </div>

                    <span className="ml-auto text-[10px] font-bold text-slate-200 text-right leading-tight">
                      {rotulo}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
              <p className="text-xs">
                {notaExibida > 0 
                  ? `Nota de ${notaExibida.toFixed(1)} lançada diretamente no cadastro do estudante.`
                  : `Nenhuma folha de respostas foi escaneada para a Etapa ${etapa} deste estudante.`
                }
              </p>
            </div>
          )}
        </div>

        {/* 6. BOTÃO DE FECHAR */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-catolica-primary hover:bg-catolica-dark text-white font-bold text-xs transition shadow-md cursor-pointer text-center"
          >
            Fechar Conferência
          </button>
        </div>

      </div>
    </div>
  );
}
