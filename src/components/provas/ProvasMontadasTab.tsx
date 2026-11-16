'use client';

import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Printer, 
  Smartphone, 
  KeyRound, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  GraduationCap,
  AlertCircle
} from 'lucide-react';
import { ProvaMontadaRegistro, AvaliacaoCiclo } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';
import { ModalGabaritosEmbaralhados } from './ModalGabaritosEmbaralhados';

interface ProvasMontadasTabProps {
  provas: ProvaMontadaRegistro[];
  turmas: TurmaModel[];
  turmaSelecionadaId: string;
  setTurmaSelecionadaId: (id: string) => void;
  onReimprimirProva: (prova: ProvaMontadaRegistro) => void;
  onAbrirScannerMobile: (prova?: ProvaMontadaRegistro) => void;
  onExcluirProva: (id: string) => Promise<void> | void;
  onNovaProva: () => void;
}

export function ProvasMontadasTab({
  provas,
  turmas,
  turmaSelecionadaId,
  setTurmaSelecionadaId,
  onReimprimirProva,
  onAbrirScannerMobile,
  onExcluirProva,
  onNovaProva
}: ProvasMontadasTabProps) {
  const [busca, setBusca] = useState('');
  const [etapaFiltro, setEtapaFiltro] = useState<AvaliacaoCiclo | 'TODAS'>('TODAS');
  const [turmaFiltro, setTurmaFiltro] = useState<string>('TODAS');
  const [provaGabaritoModal, setProvaGabaritoModal] = useState<ProvaMontadaRegistro | null>(null);
  const [provaExclusaoId, setProvaExclusaoId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtragem: por padrão exibe todas as provas do docente e permite filtrar por turma específica
  const provasFiltradas = useMemo(() => {
    return provas.filter(p => {
      if (turmaFiltro !== 'TODAS' && p.turmaId !== turmaFiltro) {
        return false;
      }
      if (etapaFiltro !== 'TODAS' && p.ciclo !== etapaFiltro) {
        return false;
      }
      if (busca) {
        const termo = busca.toLowerCase();
        const matchTitulo = p.titulo?.toLowerCase().includes(termo);
        const matchTurma = p.turmaNome?.toLowerCase().includes(termo);
        const matchDisc = p.disciplina?.toLowerCase().includes(termo);
        if (!matchTitulo && !matchTurma && !matchDisc) return false;
      }
      return true;
    });
  }, [provas, turmaFiltro, etapaFiltro, busca]);

  const handleConfirmarExclusao = async () => {
    if (!provaExclusaoId) return;
    try {
      setIsDeleting(true);
      await onExcluirProva(provaExclusaoId);
      setProvaExclusaoId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getBadgeCiclo = (ciclo?: string) => {
    const c = (ciclo || 'N2').toUpperCase();
    switch (c) {
      case 'N1':
        return (
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            N1 (1ª Etapa)
          </span>
        );
      case 'N2':
        return (
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            N2 (Prova OMR)
          </span>
        );
      case 'N3':
        return (
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            N3 (Práticas)
          </span>
        );
      case 'N-1':
      case 'EXAME':
        return (
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            Exame (N-1)
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {c}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. CABEÇALHO COM AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-catolica-primary text-white shadow-lg shadow-catolica-primary/20">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Provas Montadas & Snapshots Imutáveis
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Gerencie versões congeladas, gabaritos embaralhados e integração direta com o Scanner Mobile.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onAbrirScannerMobile()}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <Smartphone className="h-4 w-4" />
            Abrir Scanner no Celular
          </button>

          <button
            type="button"
            onClick={onNovaProva}
            className="inline-flex items-center gap-2 rounded-2xl bg-catolica-primary px-4 py-3 text-xs font-bold text-white shadow-md shadow-catolica-primary/20 hover:bg-catolica-hover transition"
          >
            <Plus className="h-4 w-4" />
            Montar Nova Prova
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título ou disciplina..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-catolica-primary focus:outline-none focus:ring-1 focus:ring-catolica-primary"
          />
        </div>

        {/* Filtro por Turma */}
        <div>
          <select
            value={turmaFiltro}
            onChange={(e) => {
              setTurmaFiltro(e.target.value);
              if (e.target.value !== 'TODAS') {
                setTurmaSelecionadaId(e.target.value);
              }
            }}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-catolica-primary focus:outline-none focus:ring-1 focus:ring-catolica-primary font-medium"
          >
            <option value="TODAS">Todas as Turmas</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome} - {t.curso}</option>
            ))}
          </select>
        </div>

        {/* Filtro por Etapa */}
        <div>
          <select
            value={etapaFiltro}
            onChange={(e) => setEtapaFiltro(e.target.value as any)}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:border-catolica-primary focus:outline-none focus:ring-1 focus:ring-catolica-primary font-medium"
          >
            <option value="TODAS">Todas as Etapas</option>
            <option value="N1">Etapa N1</option>
            <option value="N2">Etapa N2 (Prova Integrada OMR)</option>
            <option value="N3">Etapa N3 (Projetos / Práticas)</option>
            <option value="N-1">Exame Semestral (N-1)</option>
          </select>
        </div>
      </div>

      {/* 3. LISTAGEM DE CARDS DE PROVAS */}
      {provasFiltradas.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">Nenhuma Prova Montada Encontrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
            Monte e salve uma prova no construtor para gerar snapshots imutáveis, cadernos embaralhados e gabaritos oficiais.
          </p>
          <button
            type="button"
            onClick={onNovaProva}
            className="inline-flex items-center gap-2 rounded-xl bg-catolica-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-catolica-hover transition"
          >
            <Plus className="h-4 w-4" />
            Ir para o Montador de Provas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {provasFiltradas.map(prova => {
            const cadernos = prova.cadernos || [];
            return (
              <div
                key={prova.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                {/* Top: Título, Ciclo e Status */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getBadgeCiclo(prova.ciclo)}
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {prova.status || 'PRONTA_PARA_APLICAR'}
                        </span>
                      </div>
                      <h2 className="text-base font-black text-slate-900 line-clamp-1">
                        {prova.titulo}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => setProvaExclusaoId(prova.id)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="Excluir prova"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Informações da Turma e Disciplina */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Turma:</span>
                      <strong className="text-slate-800 truncate block">{prova.turmaNome || 'Turma'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Disciplina:</span>
                      <strong className="text-slate-800 truncate block">{prova.disciplina || 'Geral'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Questões & Valor:</span>
                      <strong className="text-slate-800">
                        {prova.totalQuestoes} questões • {prova.pontuacaoTotal.toFixed(1)} pts
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Cadernos Gerados:</span>
                      <strong className="text-catolica-primary font-black">
                        {cadernos.length > 0 ? `${cadernos.length} cadernos` : '4 versões padrão'}
                      </strong>
                    </div>
                  </div>

                  {/* Badges de Regras */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      Embaralhar Questões: {prova.shuffleQuestoes ? 'Sim' : 'Não'}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      Embaralhar Alternativas: {prova.shuffleAlternativas ? 'Sim' : 'Não'}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      QR Nominal: {prova.nominalQrCode ? 'Sim' : 'Anônimo'}
                    </span>
                  </div>
                </div>

                {/* Bottom: Botões de Ação */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setProvaGabaritoModal(prova)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-catolica-primary" />
                    Ver Gabaritos
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onReimprimirProva(prova)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Reimprimir A4
                    </button>

                    <button
                      type="button"
                      onClick={() => onAbrirScannerMobile(prova)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                      Scanner Mobile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE GABARITOS EMBARALHADOS */}
      {provaGabaritoModal && (
        <ModalGabaritosEmbaralhados
          prova={provaGabaritoModal}
          onClose={() => setProvaGabaritoModal(null)}
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {provaExclusaoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Excluir Prova Montada</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deseja realmente excluir esta prova montada? Todos os cadernos gerados e gabaritos vinculados serão excluídos permanentemente.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProvaExclusaoId(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmarExclusao}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
