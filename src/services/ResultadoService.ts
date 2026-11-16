import { PrismaResultadoRepository } from '@/repositories/prisma/PrismaResultadoRepository';
import { ResultadoRepository } from '@/repositories/ResultadoRepository';
import { PrismaAlunoRepository } from '@/repositories/prisma/PrismaAlunoRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { prisma } from '@/lib/prisma';
import { ResultadoAvaliacaoRegistro, UserSession } from '@/types';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export class ResultadoService {
  constructor(
    private resultadoRepository: any = new PrismaResultadoRepository(),
    private alunoRepository: any = new PrismaAlunoRepository(),
    private turmaRepository: any = new PrismaTurmaRepository()
  ) {}

  async listarResultadosComEscopo(options?: {
    turmaId?: string | null;
    provaMontadaId?: string | null;
    session?: UserSession | null;
  }): Promise<ResultadoAvaliacaoRegistro[]> {
    const { turmaId, provaMontadaId, session } = options || {};

    if (session?.role === 'PROFESSOR' && turmaId && turmaId !== 'TODAS') {
      const turma = await this.turmaRepository.findById(turmaId);
      if (!turma || turma.professorId !== session.id) {
        throw new ForbiddenError('Acesso negado a esta turma.');
      }
    }

    try {
      let where: any = {};
      if (session?.role === 'PROFESSOR') {
        where.professorId = session.id;
      }
      if (provaMontadaId && provaMontadaId !== 'TODAS') {
        where.provaMontadaId = provaMontadaId;
      }
      if (turmaId && turmaId !== 'TODAS') {
        where.provaMontada = {
          turmaId
        };
      }

      const records = await (prisma as any).resultadoAvaliacao?.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          provaMontada: {
            include: { turma: true }
          },
          cadernoProva: true
        }
      });

      if (records) {
        return records.map((record: any) => ({
          id: record.id,
          professorId: record.professorId,
          provaMontadaId: record.provaMontadaId,
          cadernoProvaId: record.cadernoProvaId,
          alunoNome: record.alunoNome,
          alunoRa: record.alunoRa,
          respostasMarcadasJson: record.respostasMarcadasJson as any,
          acertos: record.acertos,
          totalQuestoes: record.totalQuestoes,
          notaFinal: Number(record.notaFinal),
          lidoViaMobile: Boolean(record.lidoViaMobile),
          createdAt: record.createdAt?.toISOString(),
          provaTitulo: record.provaMontada?.titulo,
          turmaNome: record.provaMontada?.turma?.nome,
          codigoVersao: record.cadernoProva?.codigoVersao
        }));
      }
    } catch (dbErr) {
      console.warn('Banco relacional inacessível no momento, usando fallback de resultados:', dbErr);
    }

    let resultados: ResultadoAvaliacaoRegistro[] = await this.resultadoRepository.findAll();
    if (session?.role === 'PROFESSOR') {
      resultados = resultados.filter(r => r.professorId === session.id);
    }
    if (provaMontadaId && provaMontadaId !== 'TODAS') {
      resultados = resultados.filter(r => r.provaMontadaId === provaMontadaId);
    }
    return resultados;
  }

  async salvarResultadoComEscopo(
    dados: Partial<ResultadoAvaliacaoRegistro>,
    session?: UserSession | null
  ): Promise<ResultadoAvaliacaoRegistro> {
    const professorId = session?.role === 'PROFESSOR' ? session.id : (dados.professorId || session?.id || 'admin');

    if (!dados.provaMontadaId) {
      throw new Error('ID da Prova Montada é obrigatório para registrar a nota.');
    }
    if (!dados.alunoNome) {
      throw new Error('Nome do Aluno é obrigatório para registrar a nota.');
    }

    // Valida se a prova pertence ao professor autenticado
    if (session?.role === 'PROFESSOR') {
      const prova = await (prisma as any).provaMontada?.findUnique({
        where: { id: dados.provaMontadaId },
        include: { turma: true }
      });
      if (prova) {
        if (prova.professorId !== session.id && prova.turma?.professorId !== session.id) {
          throw new ForbiddenError('Acesso negado. A prova pertence a outro docente.');
        }
      }
    }

    const id = dados.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const novoResultado: ResultadoAvaliacaoRegistro = {
      id,
      professorId,
      provaMontadaId: dados.provaMontadaId,
      cadernoProvaId: dados.cadernoProvaId || null,
      alunoNome: dados.alunoNome,
      alunoRa: dados.alunoRa || null,
      respostasMarcadasJson: dados.respostasMarcadasJson || {},
      acertos: dados.acertos ?? 0,
      totalQuestoes: dados.totalQuestoes ?? 10,
      notaFinal: Number(Number(dados.notaFinal || 0).toFixed(2)),
      lidoViaMobile: dados.lidoViaMobile ?? true,
      createdAt: dados.createdAt || new Date().toISOString()
    };

    // 1. Persiste no repositório de Resultados de Avaliação
    let saved: ResultadoAvaliacaoRegistro;
    try {
      saved = await this.resultadoRepository.save(novoResultado);
    } catch {
      saved = novoResultado;
    }

    // 2. Atualiza atomicamente a nota correspondente no cadastro do estudante se RA existir
    if (dados.alunoRa) {
      try {
        const aluno = await this.alunoRepository.findByRa(dados.alunoRa);
        if (aluno) {
          const prova = await (prisma as any).provaMontada?.findUnique({
            where: { id: dados.provaMontadaId }
          });
          const ciclo = (prova?.ciclo || 'N2').toUpperCase();

          const updateData: any = {};
          if (ciclo === 'N1') updateData.n1 = novoResultado.notaFinal;
          else if (ciclo === 'N2') updateData.n2 = novoResultado.notaFinal;
          else if (ciclo === 'N3') updateData.n3 = novoResultado.notaFinal;

          if (Object.keys(updateData).length > 0) {
            await (prisma as any).aluno?.update({
              where: { id: aluno.id },
              data: updateData
            });
          }
        }
      } catch (err) {
        console.warn('Aviso: Não foi possível atualizar a nota no cadastro do estudante:', err);
      }
    }

    return saved;
  }

  async excluirResultadoComEscopo(
    id: string,
    session?: UserSession | null
  ): Promise<{ success: boolean; id: string; alunoNome: string; notaFinal: number }> {
    const resultado = await this.resultadoRepository.findById(id);
    if (!resultado) {
      // Tenta direto no Prisma
      const rDb = await (prisma as any).resultadoAvaliacao?.findUnique({
        where: { id },
        include: { provaMontada: true }
      });
      if (!rDb) {
        throw new NotFoundError('Registro de nota não encontrado.');
      }
      if (session?.role === 'PROFESSOR' && rDb.professorId !== session.id) {
        throw new ForbiddenError('Acesso negado. Você só pode excluir notas lançadas por você.');
      }

      await (prisma as any).resultadoAvaliacao.delete({ where: { id } });

      // Se houver RA, zera a nota do ciclo correspondente para permitir re-escaneamento limpo
      if (rDb.alunoRa && rDb.provaMontada) {
        try {
          const ciclo = (rDb.provaMontada.ciclo || 'N2').toUpperCase();
          const aluno = await this.alunoRepository.findByRa(rDb.alunoRa);
          if (aluno) {
            const updateData: any = {};
            if (ciclo === 'N1') updateData.n1 = 0.0;
            else if (ciclo === 'N2') updateData.n2 = 0.0;
            else if (ciclo === 'N3') updateData.n3 = 0.0;

            await (prisma as any).aluno?.update({
              where: { id: aluno.id },
              data: updateData
            });
          }
        } catch (_) {}
      }

      return {
        success: true,
        id,
        alunoNome: rDb.alunoNome,
        notaFinal: Number(rDb.notaFinal)
      };
    }

    // Se achou no repositório
    if (session?.role === 'PROFESSOR' && resultado.professorId !== session.id) {
      throw new ForbiddenError('Acesso negado. Você só pode excluir notas lançadas por você.');
    }

    await this.resultadoRepository.delete(id);

    // Também remove do banco relacional se conectado
    try {
      const rDb = await (prisma as any).resultadoAvaliacao?.findUnique({
        where: { id },
        include: { provaMontada: true }
      });
      if (rDb) {
        await (prisma as any).resultadoAvaliacao?.delete({ where: { id } });
        if (rDb.alunoRa && rDb.provaMontada) {
          const ciclo = (rDb.provaMontada.ciclo || 'N2').toUpperCase();
          const aluno = await this.alunoRepository.findByRa(rDb.alunoRa);
          if (aluno) {
            const updateData: any = {};
            if (ciclo === 'N1') updateData.n1 = 0.0;
            else if (ciclo === 'N2') updateData.n2 = 0.0;
            else if (ciclo === 'N3') updateData.n3 = 0.0;

            await (prisma as any).aluno?.update({
              where: { id: aluno.id },
              data: updateData
            });
          }
        }
      }
    } catch (_) {}

    return {
      success: true,
      id,
      alunoNome: resultado.alunoNome,
      notaFinal: resultado.notaFinal
    };
  }
}
