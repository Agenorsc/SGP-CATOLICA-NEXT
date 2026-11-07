import { Question, Student, ProvaMontadaRegistro } from '@/types';
import { IBaseRepository } from './base/IBaseRepository';

export class ExamRepository implements IBaseRepository<ProvaMontadaRegistro> {
  private fallbackProvas: ProvaMontadaRegistro[] = [
    {
      id: 'prova_demo_1',
      titulo: 'Avaliação Escrita N2 - Teoria Geral do Direito',
      turmaId: 't1',
      turmaNome: 'Direito Civil',
      disciplina: 'Direito Civil',
      semestre: '2026/2',
      ciclo: 'N2',
      totalQuestoes: 8,
      pontuacaoTotal: 10.0,
      shuffleQuestoes: true,
      shuffleAlternativas: true,
      nominalQrCode: true,
      createdAt: new Date().toISOString(),
      questoesSnapshot: [
        {
          id: 'q1',
          tipo: 'objetiva',
          enunciado: 'Marina nasceu com vida em uma maternidade e, desde então, passou a ser titular de direitos e deveres na ordem civil.',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Personalidade'],
          alternativas: [
            { id: 'alt_1_a', letraOriginal: 'A', texto: 'A imagem de uma criança pode ser utilizada livremente por empresas.', correta: false },
            { id: 'alt_1_b', letraOriginal: 'B', texto: 'Os direitos da personalidade protegem atributos como imagem, nome, honra e privacidade.', correta: true },
            { id: 'alt_1_c', letraOriginal: 'C', texto: 'A personalidade civil começa somente quando a pessoa completa 18 anos.', correta: false },
            { id: 'alt_1_d', letraOriginal: 'D', texto: 'Os direitos da personalidade podem ser vendidos definitivamente a terceiros.', correta: false }
          ]
        }
      ]
    }
  ];

  private mockStudents: Student[] = [
    { id: 'alu-01', nome: 'Gabriel Menezes', matricula: '20241001', email: 'gabriel.m@catolicasc.edu.br' },
    { id: 'alu-02', nome: 'Beatriz Ramos', matricula: '20241002', email: 'beatriz.r@catolicasc.edu.br' },
    { id: 'alu-03', nome: 'Lucas Martins', matricula: '20241003', email: 'lucas.m@catolicasc.edu.br' },
    { id: 'alu-04', nome: 'Fernanda Lima', matricula: '20241004', email: 'fernanda.l@catolicasc.edu.br' }
  ];

  private mockQuestions: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual das seguintes camadas isola estritamente o acesso ao banco de dados MySQL?',
      pontuacao: 2.5,
      tags: ['Backend', 'Arquitetura'],
      alternativas: [
        { id: 'alt_1_1', letraOriginal: 'A', texto: 'Repositório (Repository)', correta: true },
        { id: 'alt_1_2', letraOriginal: 'B', texto: 'Controle (Controller)', correta: false },
        { id: 'alt_1_3', letraOriginal: 'C', texto: 'Serviço (Service)', correta: false },
        { id: 'alt_1_4', letraOriginal: 'D', texto: 'Rota (Router)', correta: false },
        { id: 'alt_1_5', letraOriginal: 'E', texto: 'Model (Entidade)', correta: false }
      ]
    }
  ];

  async getStudents(): Promise<Student[]> {
    return this.mockStudents;
  }

  async getQuestions(): Promise<Question[]> {
    return this.mockQuestions;
  }

  async findAll(): Promise<ProvaMontadaRegistro[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/exams', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          this.fallbackProvas = data;
          return this.fallbackProvas;
        }
      } catch (err) {
        console.warn('Falha ao buscar provas da API, usando armazenamento local:', err);
      }
      try {
        const saved = window.localStorage.getItem('sgp-provas-montadas');
        if (saved) {
          this.fallbackProvas = JSON.parse(saved);
        }
      } catch (_) {}
    }
    return [...this.fallbackProvas];
  }

  async findById(id: string): Promise<ProvaMontadaRegistro | undefined> {
    const list = await this.findAll();
    return list.find(p => p.id === id);
  }

  async findByTurmaId(turmaId: string): Promise<ProvaMontadaRegistro[]> {
    const list = await this.findAll();
    return list.filter(p => p.turmaId === turmaId);
  }

  async save(prova: ProvaMontadaRegistro): Promise<ProvaMontadaRegistro> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prova)
        });
        if (res.ok) {
          const savedData = await res.json();
          this.fallbackProvas = [savedData, ...this.fallbackProvas.filter(p => p.id !== savedData.id)];
          this.persistLocalStorage();
          return savedData;
        }
      } catch (err) {
        console.warn('Falha ao salvar prova na API, persistindo localmente:', err);
      }
    }

    const idx = this.fallbackProvas.findIndex(p => p.id === prova.id);
    if (idx >= 0) {
      this.fallbackProvas[idx] = prova;
    } else {
      this.fallbackProvas.unshift(prova);
    }
    this.persistLocalStorage();
    return prova;
  }

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        await fetch(`/api/exams?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (_) {}
    }
    const initialLen = this.fallbackProvas.length;
    this.fallbackProvas = this.fallbackProvas.filter(p => p.id !== id);
    this.persistLocalStorage();
    return this.fallbackProvas.length < initialLen;
  }

  private persistLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('sgp-provas-montadas', JSON.stringify(this.fallbackProvas));
      } catch (_) {}
    }
  }
}
