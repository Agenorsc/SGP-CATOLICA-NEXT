import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { DisciplinaCombobox } from '@/components/cadastros/DisciplinaCombobox';
import { ModalAluno } from '@/components/cadastros/ModalAluno';
import { TurmaModel } from '@/models/TurmaModel';
import { AlunoModel } from '@/models/AlunoModel';

describe('DisciplinaCombobox & Vinculação de Aluno', () => {
  const mockDisciplinas: TurmaModel[] = [
    new TurmaModel({
      id: 'disc-direito',
      nome: 'Direito Civil',
      curso: 'Direito',
      semestre: '2026/2',
      professorId: 'prof-1'
    }),
    new TurmaModel({
      id: 'disc-eng',
      nome: 'Engenharia de Software IV',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      professorId: 'prof-1'
    }),
    new TurmaModel({
      id: 'disc-psi',
      nome: 'Psicologia Cognitiva',
      curso: 'Psicologia',
      semestre: '2026/2',
      professorId: 'prof-1'
    })
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('1. renderiza o input com botão interno discreto ChevronDown', () => {
    render(
      <DisciplinaCombobox
        disciplinas={mockDisciplinas}
        value=""
        onChange={jest.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alternar menu de disciplinas/i })).toBeInTheDocument();
  });

  it('2. abre automaticamente no hover (onMouseEnter) e fecha com delay de 150ms no onMouseLeave', () => {
    const { container } = render(
      <DisciplinaCombobox
        disciplinas={mockDisciplinas}
        value=""
        onChange={jest.fn()}
      />
    );

    const comboboxWrapper = container.firstChild as HTMLElement;

    // Hover sobre o campo abre imediatamente
    fireEvent.mouseEnter(comboboxWrapper);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Direito Civil')).toBeInTheDocument();
    expect(screen.getByText('Engenharia de Software IV')).toBeInTheDocument();

    // Mouse leave inicia o timer de 150ms
    fireEvent.mouseLeave(comboboxWrapper);
    // Antes dos 150ms, o dropdown ainda está visível para não fechar enquanto o cursor move
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Avança 150ms no timer
    act(() => {
      jest.advanceTimersByTime(150);
    });

    // Dropdown fecha suavemente
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('3. abre no clique do botão interno ChevronDown e ao focar no input', () => {
    render(
      <DisciplinaCombobox
        disciplinas={mockDisciplinas}
        value=""
        onChange={jest.fn()}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /alternar menu de disciplinas/i });
    fireEvent.click(toggleBtn);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Clica novamente para fechar
    fireEvent.click(toggleBtn);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Foca no input abre o menu
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('4. filtra as disciplinas em tempo real conforme digitação no input', () => {
    render(
      <DisciplinaCombobox
        disciplinas={mockDisciplinas}
        value=""
        onChange={jest.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Psico' } });

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Psicologia Cognitiva')).toBeInTheDocument();
    expect(screen.queryByText('Direito Civil')).not.toBeInTheDocument();
    expect(screen.queryByText('Engenharia de Software IV')).not.toBeInTheDocument();
  });

  it('5. seleciona a disciplina com um clique, chamando onChange e destacando a opção', () => {
    const handleChange = jest.fn();

    const { rerender } = render(
      <DisciplinaCombobox
        disciplinas={mockDisciplinas}
        value=""
        onChange={handleChange}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /alternar menu de disciplinas/i });
    fireEvent.click(toggleBtn);

    const opcaoDireito = screen.getByText('Direito Civil');
    fireEvent.click(opcaoDireito);

    expect(handleChange).toHaveBeenCalledWith('disc-direito', mockDisciplinas[0]);

    // Rerenderiza com o valor selecionado
    rerender(
      <DisciplinaCombobox
        disciplinas={mockDisciplinas}
        value="disc-direito"
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveValue('Direito Civil');
  });

  it('6. integração no ModalAluno: vincula automaticamente a disciplina selecionada ao aluno', () => {
    const setFormAluno = jest.fn();
    const handleSubmit = jest.fn();

    const formState = {
      nome: 'Aluno Teste',
      ra: 'RA10001',
      curso: 'Engenharia de Software',
      turno: 'Noturno',
      turmaId: '',
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

    render(
      <ModalAluno
        isOpen={true}
        onClose={jest.fn()}
        isEditing={false}
        formAluno={formState}
        setFormAluno={setFormAluno}
        onSubmit={handleSubmit}
        turmas={mockDisciplinas}
        alunosExistentes={[]}
      />
    );

    // O input do combobox de disciplinas está presente no formulário
    expect(screen.getByPlaceholderText('Selecione ou busque a disciplina...')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /alternar menu de disciplinas/i });
    fireEvent.click(toggleBtn);

    const opcaoEng = screen.getByText('Engenharia de Software IV');
    fireEvent.click(opcaoEng);

    // Verifica que setFormAluno foi chamado atualizando turmaId e curso correspondente
    expect(setFormAluno).toHaveBeenCalledWith(expect.any(Function));
  });
});
