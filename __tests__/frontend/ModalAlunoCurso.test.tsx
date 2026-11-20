import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalAluno, FormAlunoState } from '@/components/cadastros/ModalAluno';
import { CadastrosTab } from '@/components/cadastros/CadastrosTab';
import { TurmaModel } from '@/models/TurmaModel';
import { AlunoModel } from '@/models/AlunoModel';

describe('Frontend Integration — ModalAluno & CadastrosTab (Seleção de Curso)', () => {
  const mockTurmas: TurmaModel[] = [
    new TurmaModel({
      id: 'turma-direito',
      nome: 'Direito Civil',
      curso: 'Direito',
      semestre: '2026/2'
    }),
    new TurmaModel({
      id: 'turma-psi',
      nome: 'Psicologia Geral',
      curso: 'Psicologia',
      semestre: '2026/2'
    }),
    new TurmaModel({
      id: 'turma-eng',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2'
    })
  ];

  const mockAlunos: AlunoModel[] = [
    new AlunoModel({
      id: 'aluno-1',
      nome: 'Aluno 10',
      ra: 'RA1001',
      curso: 'Direito',
      turmaId: 'turma-direito'
    }),
    new AlunoModel({
      id: 'aluno-2',
      nome: 'Aluno 11',
      ra: 'RA1002',
      curso: 'Psicologia',
      turmaId: 'turma-psi'
    })
  ];

  it('exibe botões de cursos cadastrados no ModalAluno e permite selecionar com 1 clique', () => {
    let formState: FormAlunoState = {
      nome: 'Aluno 11',
      ra: 'RA1002',
      curso: '',
      turno: 'Noturno',
      turmaId: 'turma-psi',
      dataNascimento: '',
      naturalidade: '',
      estadoNatal: '',
      mae: '',
      pai: '',
      celular: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    };

    const setFormState = jest.fn((updater) => {
      if (typeof updater === 'function') {
        formState = updater(formState);
      } else {
        formState = updater;
      }
    });

    render(
      <ModalAluno
        isOpen={true}
        onClose={jest.fn()}
        isEditing={true}
        formAluno={formState}
        setFormAluno={setFormState}
        onSubmit={jest.fn()}
        turmas={mockTurmas}
        alunosExistentes={mockAlunos}
      />
    );

    // Botões dos cursos das turmas devem estar visíveis
    expect(screen.getByRole('button', { name: 'Direito' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Psicologia' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Engenharia de Software' })).toBeInTheDocument();

    // Clicar no botão 'Psicologia'
    const btnPsi = screen.getByRole('button', { name: 'Psicologia' });
    fireEvent.click(btnPsi);

    expect(setFormState).toHaveBeenCalled();
  });

  it('sincroniza o curso ao alterar a Disciplina / Turma no select', () => {
    let formState: FormAlunoState = {
      nome: 'Aluno 11',
      ra: 'RA1002',
      curso: 'Psicologia',
      turno: 'Noturno',
      turmaId: 'turma-psi',
      dataNascimento: '',
      naturalidade: '',
      estadoNatal: '',
      mae: '',
      pai: '',
      celular: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    };

    const setFormState = jest.fn();

    render(
      <ModalAluno
        isOpen={true}
        onClose={jest.fn()}
        isEditing={true}
        formAluno={formState}
        setFormAluno={setFormState}
        onSubmit={jest.fn()}
        turmas={mockTurmas}
        alunosExistentes={mockAlunos}
      />
    );

    const selectTurma = screen.getByRole('combobox', { name: /disciplina \/ turma/i });
    fireEvent.change(selectTurma, { target: { value: 'turma-direito' } });

    expect(setFormState).toHaveBeenCalledWith(expect.any(Function));
  });

  it('exibe a aba de Cursos Acadêmicos no CadastrosTab e permite filtrar', () => {
    const onOpenNovoAluno = jest.fn();

    render(
      <CadastrosTab
        alunos={mockAlunos}
        turmas={mockTurmas}
        onOpenNovoAluno={onOpenNovoAluno}
        onOpenNovaTurma={jest.fn()}
        onEditAluno={jest.fn()}
        onDeleteAluno={jest.fn()}
        onImportComplete={jest.fn()}
        onEditTurma={jest.fn()}
        onDeleteTurma={jest.fn()}
      />
    );

    // Deve renderizar o botão da aba Cursos Acadêmicos
    const tabCursos = screen.getByRole('button', { name: /Cursos Acadêmicos/i });
    expect(tabCursos).toBeInTheDocument();

    // Alternar para a aba de cursos
    fireEvent.click(tabCursos);

    expect(screen.getAllByText('Direito').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Psicologia').length).toBeGreaterThan(0);

    // Botão de Cadastrar Aluno no curso Direito
    const btnCadastrarDireito = screen.getAllByRole('button', { name: /Cadastrar Aluno/i })[1];
    fireEvent.click(btnCadastrarDireito);
    expect(onOpenNovoAluno).toHaveBeenCalledWith('Direito');
  });
});
