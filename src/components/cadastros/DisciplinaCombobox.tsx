'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, BookOpen, AlertCircle } from 'lucide-react';
import { TurmaModel } from '@/models/TurmaModel';

export interface DisciplinaComboboxProps {
  disciplinas: TurmaModel[];
  value: string; // ID da disciplina (turmaId)
  onChange: (turmaId: string, turma?: TurmaModel) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function DisciplinaCombobox({
  disciplinas = [],
  value,
  onChange,
  disabled = false,
  hasError = false,
  placeholder = 'Selecione ou busque a disciplina...',
  id = 'combobox-disciplina-input',
  name = 'disciplinaId',
  required = false
}: DisciplinaComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Disciplina atualmente selecionada
  const selectedDisciplina = useMemo(() => {
    return disciplinas.find(d => d.id === value);
  }, [disciplinas, value]);

  // Sincroniza o texto do input quando o valor externo muda e o usuário não está ativamente digitando
  useEffect(() => {
    if (!isTyping) {
      setSearchTerm(selectedDisciplina ? selectedDisciplina.nome : '');
    }
  }, [selectedDisciplina, isTyping]);

  // Lista de disciplinas filtradas pela busca
  const disciplinasFiltradas = useMemo(() => {
    if (!isTyping || !searchTerm.trim()) {
      return disciplinas;
    }
    const query = searchTerm.trim().toLowerCase();
    return disciplinas.filter(d => {
      const matchNome = (d.nome || '').toLowerCase().includes(query);
      const matchCurso = (d.curso || '').toLowerCase().includes(query);
      const matchSemestre = (d.semestre || '').toLowerCase().includes(query);
      return matchNome || matchCurso || matchSemestre;
    });
  }, [disciplinas, searchTerm, isTyping]);

  // GATILHO DE ABERTURA NO HOVER (com cancelamento de timer pendente)
  const handleMouseEnter = () => {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  // GATILHO DE FECHAMENTO COM DELAY DE 150ms NO MOUSELEAVE
  const handleMouseLeave = () => {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsTyping(false);
      // Restaura o nome da disciplina selecionada no input se não selecionou nova
      if (selectedDisciplina) {
        setSearchTerm(selectedDisciplina.nome);
      } else {
        setSearchTerm('');
      }
    }, 150);
  };

  // Clique no botão interno (ChevronDown) para alternar abertura
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        inputRef.current?.focus();
      }
      return next;
    });
  };

  // Foco no input abre o menu
  const handleInputFocus = () => {
    if (disabled) return;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  // Digitação no input para filtrar disciplinas
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIsTyping(true);
    setSearchTerm(val);
    if (!isOpen) setIsOpen(true);

    // Se o usuário digitou exatamente o nome de uma disciplina cadastrada, atualiza o valor
    const correspondente = disciplinas.find(
      d => d.nome.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (correspondente) {
      onChange(correspondente.id, correspondente);
    }
  };

  // Seleção de uma disciplina na lista suspensa
  const handleSelectDisciplina = (turma: TurmaModel) => {
    onChange(turma.id, turma);
    setSearchTerm(turma.nome);
    setIsTyping(false);
    setIsOpen(false);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsTyping(false);
        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
          closeTimerRef.current = null;
        }
        if (selectedDisciplina) {
          setSearchTerm(selectedDisciplina.nome);
        } else {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, [selectedDisciplina]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full"
    >
      {/* Campo de Entrada com Botão Interno ChevronDown */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`${id}-dropdown`}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={disciplinas.length === 0 ? 'Nenhuma disciplina cadastrada...' : placeholder}
          disabled={disabled || disciplinas.length === 0}
          autoComplete="off"
          className={`w-full pl-3 pr-9 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold transition outline-none ${
            hasError
              ? 'border-red-500 bg-red-50/50 text-red-900 focus:border-red-600 focus:ring-1 focus:ring-red-600'
              : 'border-[#E2E8F0] text-slate-800 hover:border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
          } ${disabled || disciplinas.length === 0 ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
        />

        {/* Botão interno discreto posicionado na extremidade direita */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled || disciplinas.length === 0}
          onClick={handleToggleClick}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer rounded-md disabled:cursor-not-allowed"
          aria-label="Alternar menu de disciplinas"
          title="Ver disciplinas cadastradas"
        >
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
          />
        </button>
      </div>

      {/* Input hidden para manter conformidade com envio de formulário nativo se necessário */}
      <input type="hidden" name={`${name}_hidden`} value={value || ''} />

      {/* Menu Dropdown Elegante Logo Abaixo do Campo */}
      {isOpen && (
        <div
          id={`${id}-dropdown`}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 py-1 transition-all duration-150 animate-in fade-in slide-in-from-top-1"
        >
          {disciplinas.length === 0 ? (
            <div className="px-3 py-3 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
              <AlertCircle size={16} className="text-amber-500" />
              <span>Nenhuma disciplina cadastrada para este professor</span>
            </div>
          ) : disciplinasFiltradas.length === 0 ? (
            <div className="px-3 py-3 text-center text-slate-400 text-xs">
              Nenhuma disciplina encontrada para &quot;{searchTerm}&quot;
            </div>
          ) : (
            disciplinasFiltradas.map(disciplina => {
              const isSelected = disciplina.id === value;
              return (
                <button
                  type="button"
                  key={disciplina.id}
                  onClick={() => handleSelectDisciplina(disciplina)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 border-l-4 border-blue-600 pl-2 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs truncate font-semibold">
                      {disciplina.nome}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal truncate">
                      {disciplina.curso ? `${disciplina.curso} • ` : ''}
                      {disciplina.semestre || 'Semestre vigente'}
                    </span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-blue-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
