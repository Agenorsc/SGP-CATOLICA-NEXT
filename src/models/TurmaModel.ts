export class TurmaModel {
  id: string;
  nome: string;
  curso: string;
  semestre: string;
  codigoConvite: string;
  professorId?: string | null;
  professorNome?: string | null;

  constructor(data: Partial<TurmaModel> = {}) {
    this.id = data.id || `turma_${Date.now()}`;
    this.nome = data.nome || '';
    this.curso = data.curso || 'Engenharia de Software';
    this.semestre = data.semestre || '2026/2';
    this.codigoConvite = data.codigoConvite || `CAT-${Math.floor(1000 + Math.random() * 9000)}`;
    this.professorId = data.professorId || undefined;
    this.professorNome = data.professorNome || undefined;
  }
}
