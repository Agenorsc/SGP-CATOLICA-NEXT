'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { TurmaModel } from '@/models/TurmaModel';
import { AlunoModel } from '@/models/AlunoModel';

export interface FormAlunoState {
  nome: string;
  ra: string;
  curso: string;
  turno: string;
  turmaId: string;
  dataNascimento: string;
  naturalidade: string;
  estadoNatal: string;
  mae: string;
  pai: string;
  celular: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface ModalAlunoProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formAluno: FormAlunoState;
  setFormAluno: React.Dispatch<React.SetStateAction<FormAlunoState>>;
  onSubmit: (e: React.FormEvent) => void;
  turmas: TurmaModel[];
  alunosExistentes?: AlunoModel[];
  alunoEmEdicaoId?: string | null;
  onAlertaErro?: (mensagem: string) => void;
}

export function ModalAluno({
  isOpen,
  onClose,
  isEditing,
  formAluno,
  setFormAluno,
  onSubmit,
  turmas,
  alunosExistentes = [],
  alunoEmEdicaoId = null,
  onAlertaErro
}: ModalAlunoProps) {
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidarESubmeter = (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao(null);

    // 1. Validação Obrigatória de Turma
    if (turmas.length === 0 || !formAluno.turmaId || formAluno.turmaId.trim() === '') {
      const msg = 'Cadastre a turma antes!';
      setErroValidacao(msg);
      if (onAlertaErro) onAlertaErro(msg);
      return;
    }

    // 2. Validação de RA Duplicado
    const raTrim = formAluno.ra.trim();
    if (!raTrim) {
      const msg = 'Informe o Registro Acadêmico (RA).';
      setErroValidacao(msg);
      if (onAlertaErro) onAlertaErro(msg);
      return;
    }

    const raDuplicado = alunosExistentes.some(aluno => {
      const raExistente = aluno.ra ? String(aluno.ra).trim() : '';
      const mesmoId = alunoEmEdicaoId && aluno.id === alunoEmEdicaoId;
      return !mesmoId && raExistente.toLowerCase() === raTrim.toLowerCase();
    });

    if (raDuplicado) {
      const msg = 'RA duplicado!';
      setErroValidacao(msg);
      if (onAlertaErro) onAlertaErro(msg);
      return;
    }

    // Se passar por todas as validações, prossegue com o envio
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isEditing ? 'Editar Aluno' : 'Cadastro do Aluno'}
            </h3>
            <p className="text-xs text-slate-500">Estrutura baseada no Portal Acadêmico Católica SC</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setErroValidacao(null);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* ALERTA VISUAL DE ERRO DE VALIDAÇÃO (TOAST/POP-UP INLINE) */}
        {erroValidacao && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-center justify-between gap-3 text-red-800 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wide">{erroValidacao}</span>
            </div>
            <button
              type="button"
              onClick={() => setErroValidacao(null)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {turmas.length === 0 && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-amber-800 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Nenhuma turma cadastrada no seu perfil. <strong>Cadastre a turma antes!</strong></span>
          </div>
        )}

        <form onSubmit={handleValidarESubmeter} className="space-y-4">
          <div className="border-b pb-3">
            <span className="text-xs font-bold text-catolica-primary uppercase block mb-2">
              Dados Acadêmicos & Identificação
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: AGENOR ALVISE"
                  value={formAluno.nome}
                  onChange={e => {
                    setErroValidacao(null);
                    setFormAluno({ ...formAluno, nome: e.target.value });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-catolica-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Registro Acadêmico (RA) <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ex: 1328834"
                  value={formAluno.ra}
                  onChange={e => {
                    setErroValidacao(null);
                    setFormAluno({ ...formAluno, ra: e.target.value });
                  }}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold focus:border-catolica-primary outline-none ${
                    erroValidacao === 'RA duplicado!' ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Disciplina / Turma <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formAluno.turmaId}
                  onChange={e => {
                    setErroValidacao(null);
                    setFormAluno({ ...formAluno, turmaId: e.target.value });
                  }}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold focus:border-catolica-primary outline-none ${
                    erroValidacao === 'Cadastre a turma antes!' ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                  }`}
                >
                  <option value="">Selecione uma turma obrigatória...</option>
                  {turmas.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.semestre})
                    </option>
                  ))}
                </select>
                {turmas.length === 0 && (
                  <p className="mt-1 text-[10px] font-bold text-red-600">
                    Cadastre a turma antes!
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Curso
                </label>
                <input
                  type="text"
                  value={formAluno.curso}
                  onChange={e => setFormAluno({ ...formAluno, curso: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Turno
                </label>
                <select
                  value={formAluno.turno}
                  onChange={e => setFormAluno({ ...formAluno, turno: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Noturno">Noturno</option>
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  value={formAluno.dataNascimento}
                  onChange={e => setFormAluno({ ...formAluno, dataNascimento: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-3">
            <span className="text-xs font-bold text-catolica-primary uppercase block mb-2">
              Filiação & Contato
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Nome da Mãe</label>
                <input
                  type="text"
                  value={formAluno.mae}
                  onChange={e => setFormAluno({ ...formAluno, mae: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Nome do Pai</label>
                <input
                  type="text"
                  value={formAluno.pai}
                  onChange={e => setFormAluno({ ...formAluno, pai: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Celular / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(47) 99999-9999"
                  value={formAluno.celular}
                  onChange={e => setFormAluno({ ...formAluno, celular: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={() => {
                setErroValidacao(null);
                onClose();
              }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-catolica-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-catolica-dark transition cursor-pointer"
            >
              {isEditing ? 'Atualizar Aluno' : 'Salvar Aluno'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
