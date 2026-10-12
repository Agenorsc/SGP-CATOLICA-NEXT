import { OmrRepository } from '@/repositories/OmrRepository';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { LeituraOMRRegistro, Question } from '@/types';

export class OmrService {
  constructor(private omrRepository: OmrRepository = new OmrRepository()) {}

  async listarLeituras(): Promise<LeituraOMRRegistro[]> {
    return this.omrRepository.findAll();
  }

  processarCorrecao(
    targetAluno: AlunoModel,
    targetTurma: TurmaModel,
    questoes: Question[],
    materia: string,
    versao: string = 'Versão A'
  ): LeituraOMRRegistro {
    const objetivas = questoes.filter(q => q.tipo === 'objetiva');
    let acertos = 0;
    const respostasDetectadas: Record<number, string> = {};

    objetivas.forEach((q, idx) => {
      const letras = ['A', 'B', 'C', 'D', 'E'];
      const letraEscolhida = Math.random() > 0.15 ? 'A' : letras[Math.floor(Math.random() * 5)];
      respostasDetectadas[idx + 1] = letraEscolhida;
      if (letraEscolhida === 'A') {
        acertos += 1;
      }
    });

    const notaCalculada = Number(((acertos / (objetivas.length || 1)) * 10).toFixed(1));

    return {
      id: `scan_${Date.now()}`,
      alunoId: targetAluno.id,
      alunoNome: targetAluno.nome,
      ra: targetAluno.ra,
      turmaNome: targetTurma.nome,
      materia,
      versao,
      acertos,
      totalQuestoes: objetivas.length,
      notaCalculada,
      dataLeitura: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      respostasDetectadas
    };
  }

  extrairRaDoQrCode(qrCodeString: string): string {
    try {
      const parsed = JSON.parse(qrCodeString);
      return parsed.ra || '1328834';
    } catch {
      return qrCodeString;
    }
  }

  async registrarLeitura(registro: LeituraOMRRegistro): Promise<LeituraOMRRegistro> {
    return this.omrRepository.save(registro);
  }
}
