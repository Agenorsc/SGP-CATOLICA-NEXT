'use client';

import React from 'react';
import { X, Layers, CheckCircle2 } from 'lucide-react';
import { AlternativaCadastro, AvaliacaoCiclo } from '@/types';
import { TurmaModel } from '@/models/TurmaModel';

interface ModalQuestaoProps {
  isOpen: boolean;
  onClose: () => void;
  questaoEmEdicaoId: string | null;
  novoEnunciado: string;
  setNovoEnunciado: (val: string) => void;
  novoTipo: 'objetiva' | 'discursiva';
  setNovoTipo: (val: 'objetiva' | 'discursiva') => void;
  novaPontuacao: number;
  setNovaPontuacao: (val: number) => void;
  novasTags: string;
  setNovasTags: (val: string) => void;
  novaTurmaId?: string;
  setNovaTurmaId: (val: string) => void;
  novaAvaliacao?: AvaliacaoCiclo;
  setNovaAvaliacao: (val: AvaliacaoCiclo) => void;
  turmas: TurmaModel[];
  alternativasCadastro: AlternativaCadastro[];
  setAlternativasCadastro: React.Dispatch<React.SetStateAction<AlternativaCadastro[]>>;
  onSubmit: (e: React.FormEvent) => void;
}

export function ModalQuestao({
  isOpen,
  onClose,
  questaoEmEdicaoId,
  novoEnunciado,
  setNovoEnunciado,
  novoTipo,
  setNovoTipo,
  novaPontuacao,
  setNovaPontuacao,
  novasTags,
  setNovasTags,
  novaTurmaId = '',
  setNovaTurmaId,
  novaAvaliacao = 'N2',
  setNovaAvaliacao,
  turmas,
  alternativasCadastro,
  setAlternativasCadastro,
  onSubmit
}: ModalQuestaoProps) {
  if (!isOpen) return null;

  const handleMarcarCorreta = (index: number) => {
    setAlternativasCadastro(
      alternativasCadastro.map((alt, idx) => ({
        ...alt,
        correta: idx === index
      }))
    );
  };

  const handleTextoAlternativaChange = (index: number, texto: string) => {
    setAlternativasCadastro(
      alternativasCadastro.map((alt, idx) => 
        idx === index ? { ...alt, texto } : alt
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {questaoEmEdicaoId ? 'Editar Questão' : 'Nova Questão do Banco'}
            </h3>
            <p className="text-xs text-slate-500">
              Vincule a questão à Turma e ao Ciclo Avaliativo (N1, N2 ou N3)
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Organização por Turma de Destino e Ciclo Avaliativo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Turma de Destino:
              </label>
              <select
                required
                value={novaTurmaId}
                onChange={e => setNovaTurmaId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-catolica-primary outline-none"
              >
                {turmas.length === 0 ? (
                  <option value="">Nenhuma turma disponível</option>
                ) : (
                  turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.semestre})
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-[10px] text-slate-400">
                A questão ficará exclusiva para esta turma do professor.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Ciclo Avaliativo:
              </label>
              <select
                required
                value={novaAvaliacao === 'N-1' || novaAvaliacao === 'GERAL' ? 'N2' : novaAvaliacao}
                onChange={e => setNovaAvaliacao(e.target.value as AvaliacaoCiclo)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-catolica-primary outline-none"
              >
                <option value="N1">N1 (1ª Etapa / Avaliação Bimestral)</option>
                <option value="N2">N2 (2ª Etapa / Prova Integrada OMR)</option>
                <option value="N3">N3 (3ª Etapa / Projetos e Práticas)</option>
              </select>
              <p className="mt-1 text-[10px] text-slate-400">
                O Exame N-1 agregará automaticamente todas as questões de N1, N2 e N3.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Enunciado da Questão:
            </label>
            <textarea
              required
              rows={3}
              value={novoEnunciado}
              onChange={e => setNovoEnunciado(e.target.value)}
              placeholder="Digite o enunciado, pergunta ou estudo de caso da questão..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-catolica-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tipo de Questão:
              </label>
              <select
                value={novoTipo}
                onChange={e => setNovoTipo(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="objetiva">Objetiva (Múltipla Escolha A-E)</option>
                <option value="discursiva">Discursiva / Descritiva</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Pontuação (pts):
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="10"
                value={novaPontuacao}
                onChange={e => setNovaPontuacao(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tags (separadas por vírgula):
              </label>
              <input
                type="text"
                placeholder="Ex: N2, Qualidade, Scrum"
                value={novasTags}
                onChange={e => setNovasTags(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Configuração de Alternativas para Questão Objetiva */}
          {novoTipo === 'objetiva' && (
            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-catolica-primary" /> Alternativas e Gabarito Oficial:
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Clique no círculo da esquerda para definir a alternativa correta
                </span>
              </div>

              <div className="space-y-2">
                {alternativasCadastro.map((alt, idx) => (
                  <div
                    key={alt.letra}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                      alt.correta
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleMarcarCorreta(idx)}
                      className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center transition cursor-pointer shrink-0 ${
                        alt.correta
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400'
                      }`}
                      title={alt.correta ? 'Alternativa correta (Gabarito)' : 'Definir como correta'}
                    >
                      {alt.correta ? <CheckCircle2 className="w-4 h-4" /> : alt.letra}
                    </button>
                    <input
                      required={idx < 4}
                      type="text"
                      placeholder={`Texto da alternativa ${alt.letra}...`}
                      value={alt.texto}
                      onChange={e => handleTextoAlternativaChange(idx, e.target.value)}
                      className="w-full bg-transparent text-xs outline-none"
                    />
                    {alt.correta && (
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                        Gabarito
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-catolica-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-catolica-dark transition"
            >
              {questaoEmEdicaoId ? 'Atualizar Questão' : 'Salvar no Banco'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
