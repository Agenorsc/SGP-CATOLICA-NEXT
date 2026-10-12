'use client';

import React from 'react';
import { 
  Scan, 
  AlertCircle, 
  Camera, 
  VideoOff, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { LeituraOMRRegistro } from '@/types';

interface LeituraTabProps {
  cameraAtiva: boolean;
  cameraErro: string | null;
  isSimulatingScan: boolean;
  iniciarCameraLeitura: () => Promise<void>;
  pararCameraLeitura: () => Promise<void>;
  alunoSelecionadoLeitura: string;
  setAlunoSelecionadoLeitura: (id: string) => void;
  alunos: AlunoModel[];
  processarLeituraOMR: (alunoId: string) => void;
  scanSucesso: LeituraOMRRegistro | null;
  leiturasOMR: LeituraOMRRegistro[];
}

export function LeituraTab({
  cameraAtiva,
  cameraErro,
  isSimulatingScan,
  iniciarCameraLeitura,
  pararCameraLeitura,
  alunoSelecionadoLeitura,
  setAlunoSelecionadoLeitura,
  alunos,
  processarLeituraOMR,
  scanSucesso,
  leiturasOMR
}: LeituraTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Scan className="text-catolica-primary" /> Módulo Leitor de Cartão OMR & QR Code
        </h2>
        <p className="text-xs text-slate-500">
          Ligue a câmera e aponte para a folha impressa ou faça a simulação de correção.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Digitalizador de Provas (Câmera Ativa)</h3>

          {cameraErro && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
              <AlertCircle size={16} /> {cameraErro}
            </div>
          )}

          <div className="relative min-h-[280px] bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border-4 border-slate-800 shadow-inner">
            <div id="reader-omr" className={`w-full h-full ${cameraAtiva ? 'block' : 'hidden'}`} />

            {!cameraAtiva && !isSimulatingScan && (
              <div className="flex flex-col items-center space-y-2 p-6 text-center">
                <Camera className="w-12 h-12 text-slate-500" />
                <span className="text-xs font-bold">Câmera Desligada</span>
                <p className="text-[10px] text-slate-400">Clique no botão abaixo para permitir o uso da câmera</p>
              </div>
            )}

            {isSimulatingScan && (
              <div className="flex flex-col items-center space-y-3 z-10 bg-slate-900/90 inset-0 absolute items-center justify-center">
                <RefreshCw className="w-10 h-10 animate-spin text-catolica-primary" />
                <span className="text-xs font-bold">Lendo QR Code e Analisando Bolhas...</span>
              </div>
            )}

            {cameraAtiva && (
              <div className="absolute inset-8 border-2 border-dashed border-catolica-primary/60 rounded-xl pointer-events-none" />
            )}
          </div>

          <div className="flex gap-2">
            {!cameraAtiva ? (
              <button
                onClick={iniciarCameraLeitura}
                className="flex-1 bg-catolica-primary hover:bg-catolica-dark text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-catolica-primary/30 transition cursor-pointer"
              >
                <Camera size={16} /> Ligar Câmera para Leitura Real
              </button>
            ) : (
              <button
                onClick={pararCameraLeitura}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <VideoOff size={16} /> Desligar Câmera
              </button>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase">Simular Leitura Direta sem Câmera:</label>
            <div className="flex gap-2">
              <select
                value={alunoSelecionadoLeitura}
                onChange={(e) => setAlunoSelecionadoLeitura(e.target.value)}
                className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-xs font-bold outline-none"
              >
                {alunos.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nome} — RA: {a.ra}
                  </option>
                ))}
              </select>

              <button
                onClick={() => processarLeituraOMR(alunoSelecionadoLeitura)}
                disabled={isSimulatingScan}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
              >
                <Scan size={14} /> Corrigir
              </button>
            </div>
          </div>

          {scanSucesso && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 size={16} /> QR Code Lido e Respostas OMR Processadas!
              </div>
              <div className="text-xs space-y-1 pt-1">
                <p><strong>Estudante:</strong> {scanSucesso.alunoNome} (RA: {scanSucesso.ra})</p>
                <p><strong>Matéria:</strong> {scanSucesso.materia}</p>
                <p><strong>Turma:</strong> {scanSucesso.turmaNome}</p>
                <p><strong>Acertos:</strong> {scanSucesso.acertos} de {scanSucesso.totalQuestoes} questões</p>
                <p>
                  <strong>Nota N2 Calculada:</strong>{' '}
                  <span className="text-base font-black text-emerald-700">{scanSucesso.notaCalculada.toFixed(1)}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Provas Processadas ({leiturasOMR.length})</h3>
            <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-bold">
              Integração Automática com N2
            </span>
          </div>

          {leiturasOMR.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Scan className="w-8 h-8 mx-auto opacity-40" />
              <p>Nenhuma prova digitalizada nesta sessão.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {leiturasOMR.map(l => (
                <div key={l.id} className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">{l.alunoNome}</span>
                    <span className="text-[10px] text-slate-600 font-semibold block">{l.materia}</span>
                    <span className="text-[10px] text-slate-500 font-mono">RA: {l.ra} • {l.turmaNome}</span>
                    <span className="text-[10px] text-slate-400 block">Horário: {l.dataLeitura}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">NOTA N2</span>
                    <strong className="text-lg font-black text-catolica-primary">{l.notaCalculada.toFixed(1)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
