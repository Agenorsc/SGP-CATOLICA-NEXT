import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalTurma, OPCOES_FASES_DISCIPLINA } from '@/components/cadastros/ModalTurma';
import { TurmasGrid } from '@/components/cadastros/TurmasGrid';
import { TurmaModel } from '@/models/TurmaModel';

describe('Cadastro de Turmas/Disciplinas - Campo de Fases (1ª Fase a 10ª Fase)', () => {
  it('1. exibe o campo "Fase da Disciplina" com as 10 fases disponíveis no ModalTurma', () => {
    const setFormTurma = jest.fn();
    const formTurma = {
      nome: 'Direito Civil',
      curso: 'Direito',
      semestre: '2026/2',
      fase: '1ª Fase'
    };

    render(
      <ModalTurma
        isOpen={true}
        onClose={jest.fn()}
        isEditing={true}
        formTurma={formTurma}
        setFormTurma={setFormTurma}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.getByText(/Fase da Disciplina/i)).toBeInTheDocument();

    const selectFase = screen.getByRole('combobox');
    expect(selectFase).toBeInTheDocument();
    expect(selectFase).toHaveValue('1ª Fase');

    // Verifica que todas as 10 fases estão presentes como opções
    OPCOES_FASES_DISCIPLINA.forEach(fase => {
      expect(screen.getByRole('option', { name: fase })).toBeInTheDocument();
    });
    expect(OPCOES_FASES_DISCIPLINA.length).toBe(10);
  });

  it('2. permite selecionar uma fase diferente (ex: 5ª Fase) e atualiza o estado', () => {
    const setFormTurma = jest.fn();
    const formTurma = {
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      fase: '1ª Fase'
    };

    render(
      <ModalTurma
        isOpen={true}
        onClose={jest.fn()}
        isEditing={false}
        formTurma={formTurma}
        setFormTurma={setFormTurma}
        onSubmit={jest.fn()}
      />
    );

    const selectFase = screen.getByRole('combobox');
    fireEvent.change(selectFase, { target: { value: '5ª Fase' } });

    expect(setFormTurma).toHaveBeenCalledWith({
      ...formTurma,
      fase: '5ª Fase'
    });
  });

  it('3. TurmasGrid exibe o badge da fase cadastrada no card da disciplina', () => {
    const mockTurmas: TurmaModel[] = [
      new TurmaModel({
        id: 't-1',
        nome: 'Direito Penal',
        curso: 'Direito',
        semestre: '2026/2',
        fase: '3ª Fase'
      }),
      new TurmaModel({
        id: 't-2',
        nome: 'Cálculo Numérico',
        curso: 'Engenharia de Software',
        semestre: '2026/2',
        fase: '2ª Fase'
      })
    ];

    render(
      <TurmasGrid
        turmas={mockTurmas}
        alunos={[]}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText('3ª Fase')).toBeInTheDocument();
    expect(screen.getByText('2ª Fase')).toBeInTheDocument();
  });
});
