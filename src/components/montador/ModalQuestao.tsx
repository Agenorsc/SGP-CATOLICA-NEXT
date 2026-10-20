'use client';

import React from 'react';
import { X } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {questaoEmEdicaoId ? 'Editar Questão' : 'Nova Questão do Banco'}
            </h3>
            <p className="text-xs text-slate-500">Organize a questão por Turma e Ciclo Avaliativo (N1, N2, N3 ou N-1)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Organização por Turma e Ciclo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Turma da Questão:</label>
              <select
                value={novaTurmaId}
                onChange={e => setNovaTurmaId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-catolica-primary outline-none"
              >
                <option value="">Banco Geral (Todas as Turmas)</option>
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.semestre})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ciclo Avaliativo:</label>
              <select
                value={novaAvaliacao}
                onChange={e => setNovaAvaliacao(e.target.value as AvaliacaoCiclo)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-catolica-primary outline-none"
              >
                <option value="N1">N1 (1ª Avaliação Bimestral)</option>
                <option value="N2">N2 (2ª Avaliação / Prova OMR)</option>
                <option value="N3">N3 (3ª Avaliação / Projetos)</option>
                <option value="N-1">N-1 (Exame / Prova Substitutiva)</option>
                <option value="GERAL">Geral (Simulado / Treino)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enunciado da Questão:</label>
            <textarea
              required
              rows={3}
              value={novoEnunciado}
              onChange={e => setNovoEnunciado(e.target.value)}
              placeholder="Digite a pergunta ou caso de teste da questão..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-catolica-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Questão:</label>
              <select
                value={novoTipo}
                onChange={e => setNovoTipo(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="objetiva">Objetiva (Múltipla Escolha)</option>
                <option value="discursiva">Discursiva (Texto Aberto)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pontuação (pts):</label>
              <input
                type="number"
                step="0.5"
                value={novaPontuacao}
                onChange={e => setNovaPontuacao(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (separadas por vírgula):</label>
              <input
                type="text"
                value={novasTags}
                onChange={e => setNovasTags(e.target.value)}
                placeholder="Arquitetura, Backend, N2..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {novoTipo === 'objetiva' && (
            <div className="space-y-3 border-t pt-4">
              <span className="text-xs font-bold text-slate-700 uppercase block">Alternativas de Múltipla Escolha:</span>
              {alternativasCadastro.map((alt, idx) => (
                <div key={alt.letra} className="flex items-center gap-3">
                  <span className="font-bold text-xs text-slate-700 w-4">{alt.letra})</span>
                  <input
                    type="text"
                    required
                    placeholder={`Texto da Alternativa ${alt.letra}`}
                    value={alt.texto}
                    onChange={e => {
                      const updated = [...alternativasCadastro];
                      updated[idx].texto = e.target.value;
                      setAlternativasCadastro(updated);
                    }}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-catolica-primary"
                  />
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="correta"
                      checked={alt.correta}
                      onChange={() => {
                        const updated = alternativasCadastro.map((a, i) => ({
                          ...a,
                          correta: i === idx
                        }));
                        setAlternativasCadastro(updated);
                      }}
                      className="accent-emerald-600"
                    />
                    <span className={alt.correta ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                      {alt.correta ? 'Correta' : 'Incorreta'}
                    </span>
                  </label>
                </div>
              ))}
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
              className="px-5 py-2 bg-catolica-primary hover:bg-catolica-dark text-white rounded-xl text-xs font-bold shadow-md shadow-catolica-primary/20 transition"
            >
              {questaoEmEdicaoId ? 'Atualizar Questão' : 'Salvar no Banco'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
