import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';

export class ExportService {
  static gerarCsvNotas(alunos: AlunoModel[], turmas: TurmaModel[], tituloProva: string): void {
    let csv = 'Aluno;RA;Turma;Materia;N1;N2;N3;Media;Status\n';

    alunos.forEach(r => {
      const turmaObj = turmas.find(t => t.id === r.turmaId);
      csv += `${r.nome};${r.ra};${turmaObj?.nome || '-'};${tituloProva};${r.n1.toFixed(1)};${r.n2.toFixed(1)};${r.n3.toFixed(1)};${r.media.toFixed(1)};${r.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio_notas_historico_catolica.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
