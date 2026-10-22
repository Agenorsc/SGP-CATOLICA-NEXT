'use client';

import React, { useState, useEffect } from 'react';
import { X, GraduationCap, Mail, LockKeyhole, BookOpen, Save, Loader2 } from 'lucide-react';
import { UsuarioModel } from '@/models/UsuarioModel';

interface ModalProfessorProps {
  isOpen: boolean;
  onClose: () => void;
  professorEmEdicao: UsuarioModel | null;
  onSave: (dados: { nome: string; email: string; senha?: string; disciplina: string }) => Promise<void>;
}

export function ModalProfessor({
  isOpen,
  onClose,
  professorEmEdicao,
  onSave
}: ModalProfessorProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('admin');
  const [disciplina, setDisciplina] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (professorEmEdicao) {
      setNome(professorEmEdicao.nome);
      setEmail(professorEmEdicao.email);
      setSenha(professorEmEdicao.senha || 'admin');
      setDisciplina(professorEmEdicao.disciplina || '');
    } else {
      setNome('');
      setEmail('');
      setSenha('admin');
      setDisciplina('');
    }
    setErro('');
  }, [professorEmEdicao, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Informe o nome do professor.');
      return;
    }

    if (!email.trim()) {
      setErro('Informe o e-mail institucional.');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senha.trim() || 'admin',
        disciplina: disciplina.trim()
      });
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Falha ao salvar professor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-catolica-primary text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {professorEmEdicao ? 'Editar Professor' : 'Cadastrar Novo Professor'}
              </h3>
              <p className="text-xs text-slate-500">
                {professorEmEdicao ? 'Atualize as informações do docente' : 'Insira os dados do novo professor e sua disciplina'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {erro && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nome Completo</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Prof. Roberto Carlos"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mail Institucional</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="Ex: prof.roberto@catolica.edu.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Senha de Acesso</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
              <LockKeyhole className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: admin ou senha123"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full text-xs outline-none bg-transparent font-mono"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Padrão do sistema: <strong>admin</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Disciplina Principal / Área</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-catolica-primary focus-within:ring-2 focus-within:ring-catolica-primary/10">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Banco de Dados II ou Engenharia de Software"
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                className="w-full text-xs outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-catolica-primary hover:bg-catolica-dark text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-catolica-primary/25 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Professor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
