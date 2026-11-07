'use client';

import React from 'react';
import { 
  FileText, 
  Calendar, 
  Printer, 
  BarChart2, 
  Trash2, 
  Eye, 
  Layers, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ProvaMontadaRegistro } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';

interface HistoricoProvasSectionProps {
  provas: ProvaMontadaRegistro[];
  turmaSelecionadaId: string;
  turmas: TurmaModel[];
  onVisualizarEspelho: (prova: ProvaMontadaRegistro) => void;
  onReimprimirProva: (prova: ProvaMontadaRegistro) => void;
  onIrParaRelatorio: (prova: ProvaMontadaRegistro) => void;
  onExcluirProva: (id: string) => void;
  onIrParaMontador: () => void;
}

export function HistoricoProvasSection({
  provas,
  turmaSelecionadaId,
  turmas,
  onVisualizarEspelho,
  onReimprimirProva,
  onIrParaRelatorio,
  onExcluirProva,
  onIrParaMontador
}: HistoricoProvasSectionProps) {
  // Filtra provas pela turma selecionada se especificada
  const provasFiltradas = turmaSelecionadaId && turmaSelecionadaId !== 'TODAS'
    ? provas.filter(p => p.turmaId === turmaSelecionadaId)
    : provas;

  const turmaObj = turmas.find(t => t.id === turmaSelecionadaId);

  if (provasFiltradas.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-catolica-primary/10 text-catolica-primary mb-3">
          <FileText className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          Nenhuma avaliação arquivada para {turmaObj ? `a ${turmaObj.nome}` : 'esta turma'}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
          Ao montar uma prova e clicar em &quot;Gerar Caderno & Gabarito&quot;, a avaliação com o snapshot exato das questões sorteadas ficará automaticamente salva aqui para reimpressões e relatórios analíticos.
        </p>
        <button
          onClick={onIrParaMontador}
          className="inline-flex items-center gap-2 rounded-xl bg-catolica-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-catolica-primary/90 transition shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Montar Nova Avaliação Agora
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-catolica-primary" />
            Histórico de Avaliações Geradas ({provasFiltradas.length})
          </h3>
          <p className="text-xs text-slate-500">
            Provas aplicadas com snapshots salvos de gabaritos e cadernos OMR
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {provasFiltradas.map((prova) => {
          const dataCriacao = new Date(prova.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={prova.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-catolica-primary/40 transition group"
            >
              {/* Topo do Card */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200">
                      {prova.ciclo}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {dataCriacao}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-catolica-primary transition line-clamp-1">
                    {prova.titulo}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {prova.turmaNome || 'Turma'} • {prova.totalQuestoes} Questões (<strong>{prova.pontuacaoTotal.toFixed(1)} pts</strong>)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onExcluirProva(prova.id)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Excluir prova do histórico"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Badges de Configuração */}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-600">
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  {prova.shuffleQuestoes ? '🔀 Questões Embaralhadas' : 'Ordem Fixa'}
                </span>
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  {prova.shuffleAlternativas ? '🔀 Alternativas Embaralhadas' : 'Alternativas Fixas'}
                </span>
                <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                  {prova.nominalQrCode ? '👤 QR Nominal' : 'QR Anônimo'}
                </span>
              </div>

              {/* Botões de Ação Bidirecional */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                {/* 1. Visualizar Gabarito Oficial e Espelho */}
                <button
                  type="button"
                  onClick={() => onVisualizarEspelho(prova)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                  title="Ver espelho de questões e gabarito oficial gerado"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Gabarito
                </button>

                {/* 2. Atalho para Relatórios da Prova */}
                <button
                  type="button"
                  onClick={() => onIrParaRelatorio(prova)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 px-2 text-[11px] font-bold text-slate-700 hover:bg-catolica-primary/10 hover:text-catolica-primary hover:border-catolica-primary/30 transition cursor-pointer"
                  title="Ver desempenho analítico desta avaliação"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-catolica-primary" />
                  Relatório
                </button>

                {/* 3. Reimprimir / Baixar */}
                <button
                  type="button"
                  onClick={() => onReimprimirProva(prova)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 px-2 text-[11px] font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-xs"
                  title="Carregar caderno e gabaritos para reimpressão imediata"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Reimprimir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
