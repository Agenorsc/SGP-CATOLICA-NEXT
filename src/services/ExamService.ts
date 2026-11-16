import { ExamRepository } from '@/repositories/ExamRepository';
import { PrismaTurmaRepository } from '@/repositories/prisma/PrismaTurmaRepository';
import { PrismaCadernoRepository } from '@/repositories/prisma/PrismaCadernoRepository';
import { CadernoRepository } from '@/repositories/CadernoRepository';
import { prisma } from '@/lib/prisma';
import { ExamModel } from '@/models/ExamModel';
import { 
  ExamVersionLayout, 
  GenerateExamConfig, 
  Question, 
  ProvaMontadaRegistro,
  CadernoProvaRegistro
} from '@/types';
import { shuffleArray } from '@/lib/shuffle';
import { UserSession } from '@/lib/session';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export class ExamService {
  constructor(
    private examRepository: any = new ExamRepository(),
    private turmaRepository: any = new PrismaTurmaRepository(),
    private cadernoRepository: any = new PrismaCadernoRepository()
  ) {}

  // Algoritmo determinístico de embaralhamento
  public shuffleArray<T>(array: T[], seed: number): T[] {
    return shuffleArray(array, seed);
  }

  async listarProvas(turmaId?: string): Promise<ProvaMontadaRegistro[]> {
    if (turmaId && turmaId !== 'TODAS') {
      return this.examRepository.findByTurmaId(turmaId);
    }
    return this.examRepository.findAll();
  }

  async listarProvasComEscopo(options?: {
    turmaId?: string | null;
    session?: UserSession | null;
  }): Promise<ProvaMontadaRegistro[]> {
    const { turmaId, session } = options || {};

    if (session?.role === 'PROFESSOR' && turmaId && turmaId !== 'TODAS') {
      const turma = await this.turmaRepository.findById(turmaId);
      if (!turma || turma.professorId !== session.id) {
        throw new ForbiddenError('Acesso negado a esta turma.');
      }
    }

    try {
      let where: any = {};
      if (session?.role === 'PROFESSOR') {
        if (turmaId && turmaId !== 'TODAS') {
          where = {
            turmaId,
            OR: [
              { professorId: session.id },
              { turma: { professorId: session.id } }
            ]
          };
        } else {
          where = {
            OR: [
              { professorId: session.id },
              { turma: { professorId: session.id } }
            ]
          };
        }
      } else {
        if (turmaId && turmaId !== 'TODAS') {
          where.turmaId = turmaId;
        }
      }

      const records = await (prisma as any).provaMontada?.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { 
          turma: true,
          cadernos: true
        }
      });

      if (records) {
        return records.map((r: any) => ({
          id: r.id,
          titulo: r.titulo,
          disciplina: r.disciplina || r.turma?.curso || r.turma?.nome || 'Geral',
          semestre: r.semestre || r.turma?.semestre || '2026/2',
          ciclo: r.ciclo,
          turmaId: r.turmaId,
          turmaNome: r.turma?.nome,
          professorId: r.professorId,
          questoesSnapshot: r.questoesSnapshot || [],
          totalQuestoes: r.totalQuestoes,
          pontuacaoTotal: r.pontuacaoTotal,
          shuffleQuestoes: r.shuffleQuestoes,
          shuffleAlternativas: r.shuffleAlternativas,
          nominalQrCode: r.nominalQrCode,
          status: r.status || 'PRONTA_PARA_APLICAR',
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          cadernos: (r.cadernos || []).map((c: any) => ({
            id: c.id,
            provaMontadaId: c.provaMontadaId,
            codigoVersao: c.codigoVersao,
            alunoNome: c.alunoNome,
            alunoRa: c.alunoRa,
            mapaQuestoesJson: c.mapaQuestoesJson,
            gabaritoOficialJson: c.gabaritoOficialJson,
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined
          }))
        }));
      }
    } catch (dbErr) {
      console.warn('Banco relacional inacessível no momento, servindo fallback de provas:', dbErr);
    }

    let res: ProvaMontadaRegistro[] = await this.examRepository.findAll();
    if (session?.role === 'PROFESSOR') {
      res = res.filter(p => p.professorId === session.id);
    }
    if (turmaId && turmaId !== 'TODAS') {
      res = res.filter(p => p.turmaId === turmaId);
    }
    return res;
  }

  async obterCadernoPorId(
    cadernoId: string, 
    session?: UserSession | null
  ): Promise<CadernoProvaRegistro | null> {
    try {
      const caderno = await this.cadernoRepository.findById(cadernoId);
      if (!caderno) return null;

      // Validação de Escopo por Professor (TSK-57)
      if (session?.role === 'PROFESSOR') {
        const prova = await (prisma as any).provaMontada?.findUnique({
          where: { id: caderno.provaMontadaId },
          include: { turma: true }
        });
        if (prova) {
          if (prova.professorId !== session.id && prova.turma?.professorId !== session.id) {
            throw new ForbiddenError('Acesso negado. Este caderno pertence a outra prova ou professor.');
          }
        }
      }

      return caderno;
    } catch (error: any) {
      if (error instanceof ForbiddenError) throw error;
      console.warn('Erro ao obter caderno por ID:', error);
      return null;
    }
  }

  /**
   * Gera os cadernos de prova embaralhados (snapshots imutáveis)
   * com seus respectivos gabaritos oficiais pré-calculados
   */
  public gerarCadernosEmbaralhados(
    provaId: string,
    questoes: Question[],
    config: {
      shuffleQuestoes: boolean;
      shuffleAlternativas: boolean;
      nominalQrCode?: boolean;
    },
    alunos?: Array<{ id: string; nome: string; ra: string }>
  ): CadernoProvaRegistro[] {
    const cadernos: CadernoProvaRegistro[] = [];
    const baseQuestions = JSON.parse(JSON.stringify(questoes)) as Question[];

    if (config.nominalQrCode && alunos && alunos.length > 0) {
      alunos.forEach((aluno, index) => {
        const seedBase = index + 1;
        let questoesCaderno = JSON.parse(JSON.stringify(baseQuestions)) as Question[];

        if (config.shuffleQuestoes) {
          questoesCaderno = this.shuffleArray(questoesCaderno, seedBase * 17);
        }

        const gabaritoOficial: Record<string, string> = {};

        questoesCaderno.forEach((q, qIndex) => {
          if (q.tipo === 'objetiva' && q.alternativas && q.alternativas.length > 0) {
            if (config.shuffleAlternativas) {
              q.alternativas = this.shuffleArray(q.alternativas, seedBase * 100 + qIndex * 7 + 3);
            }
            const letras = ['A', 'B', 'C', 'D', 'E'];
            let letraCorreta = 'A';
            q.alternativas.forEach((alt, aIdx) => {
              const letra = letras[aIdx] || 'A';
              if (alt.correta) {
                letraCorreta = letra;
              }
              alt.letraOriginal = letra;
            });
            gabaritoOficial[String(qIndex + 1)] = letraCorreta;
          }
        });

        cadernos.push({
          id: `cad_${provaId}_alu_${aluno.ra || aluno.id}`.replace(/[^a-zA-Z0-9_-]/g, '_'),
          provaMontadaId: provaId,
          codigoVersao: `ALUNO-${aluno.ra || index + 1}`,
          alunoNome: aluno.nome,
          alunoRa: aluno.ra,
          mapaQuestoesJson: questoesCaderno,
          gabaritoOficialJson: gabaritoOficial,
          createdAt: new Date().toISOString()
        });
      });
    }

    // Sempre disponibiliza 4 cadernos universais A, B, C, D
    const letrasVersao = ['CADERNO-A', 'CADERNO-B', 'CADERNO-C', 'CADERNO-D'];
    letrasVersao.forEach((codigoVersao, index) => {
      const seedBase = index + 1;
      let questoesCaderno = JSON.parse(JSON.stringify(baseQuestions)) as Question[];

      if (config.shuffleQuestoes) {
        questoesCaderno = this.shuffleArray(questoesCaderno, seedBase * 23);
      }

      const gabaritoOficial: Record<string, string> = {};

      questoesCaderno.forEach((q, qIndex) => {
        if (q.tipo === 'objetiva' && q.alternativas && q.alternativas.length > 0) {
          if (config.shuffleAlternativas) {
            q.alternativas = this.shuffleArray(q.alternativas, seedBase * 50 + qIndex * 13 + 5);
          }
          const letras = ['A', 'B', 'C', 'D', 'E'];
          let letraCorreta = 'A';
          q.alternativas.forEach((alt, aIdx) => {
            const letra = letras[aIdx] || 'A';
            if (alt.correta) {
              letraCorreta = letra;
            }
            alt.letraOriginal = letra;
          });
          gabaritoOficial[String(qIndex + 1)] = letraCorreta;
        }
      });

      cadernos.push({
        id: `cad_${provaId}_${codigoVersao.toLowerCase()}`.replace(/[^a-zA-Z0-9_-]/g, '_'),
        provaMontadaId: provaId,
        codigoVersao,
        alunoNome: null,
        alunoRa: null,
        mapaQuestoesJson: questoesCaderno,
        gabaritoOficialJson: gabaritoOficial,
        createdAt: new Date().toISOString()
      });
    });

    return cadernos;
  }

  async salvarProvaMontada(prova: ProvaMontadaRegistro): Promise<ProvaMontadaRegistro> {
    return this.examRepository.save(prova);
  }

  async salvarProvaComEscopo(
    body: ProvaMontadaRegistro,
    session?: UserSession | null,
    alunosDaTurma?: Array<{ id: string; nome: string; ra: string }>
  ): Promise<ProvaMontadaRegistro> {
    if (session?.role === 'PROFESSOR') {
      body.professorId = session.id;
      if (body.turmaId) {
        const turma = await this.turmaRepository.findById(body.turmaId);
        if (turma && turma.professorId && turma.professorId !== session.id) {
          throw new ForbiddenError('Acesso negado. A turma informada pertence a outro professor.');
        }
      }
    }

    const provaId = body.id || `prova_${Date.now()}`;
    const cadernosGerados = (body.cadernos && body.cadernos.length > 0)
      ? body.cadernos
      : this.gerarCadernosEmbaralhados(
          provaId,
          body.questoesSnapshot || [],
          {
            shuffleQuestoes: body.shuffleQuestoes ?? true,
            shuffleAlternativas: body.shuffleAlternativas ?? true,
            nominalQrCode: body.nominalQrCode ?? true
          },
          alunosDaTurma
        );

    const novaProva: ProvaMontadaRegistro = {
      ...body,
      id: provaId,
      cadernos: cadernosGerados,
      status: body.status || 'PRONTA_PARA_APLICAR',
      createdAt: body.createdAt || new Date().toISOString()
    };

    try {
      // 1. Resolução segura de turmaId com integridade relacional no banco Supabase
      let turmaIdReal = novaProva.turmaId;
      const turmaExiste = turmaIdReal ? await (prisma as any).turma?.findUnique({ where: { id: turmaIdReal } }) : null;
      if (!turmaExiste) {
        const turmaFallback = await (prisma as any).turma?.findFirst({
          where: session?.id ? { professorId: session.id } : undefined
        }) || await (prisma as any).turma?.findFirst();
        if (turmaFallback) {
          turmaIdReal = turmaFallback.id;
        }
      }

      // 2. Resolução segura de professorId
      let professorIdReal = novaProva.professorId || session?.id || null;
      if (professorIdReal) {
        const usuarioExiste = await (prisma as any).usuario?.findUnique({ where: { id: professorIdReal } });
        if (!usuarioExiste) {
          professorIdReal = null;
        }
      }

      // 3. Montagem do payload relacional Prisma estritamente conforme schema
      const dataToCreate: any = {
        titulo: novaProva.titulo,
        disciplina: novaProva.disciplina || 'Geral',
        semestre: novaProva.semestre || '2026/2',
        ciclo: novaProva.ciclo || 'N2',
        turmaId: turmaIdReal,
        professorId: professorIdReal,
        questoesSnapshot: novaProva.questoesSnapshot as any,
        totalQuestoes: novaProva.totalQuestoes || novaProva.questoesSnapshot.length,
        pontuacaoTotal: novaProva.pontuacaoTotal || 10.0,
        shuffleQuestoes: novaProva.shuffleQuestoes ?? true,
        shuffleAlternativas: novaProva.shuffleAlternativas ?? true,
        nominalQrCode: novaProva.nominalQrCode ?? true,
        status: novaProva.status || 'PRONTA_PARA_APLICAR',
        cadernos: {
          create: cadernosGerados.map(c => ({
            codigoVersao: c.codigoVersao,
            alunoNome: c.alunoNome || null,
            alunoRa: c.alunoRa || null,
            mapaQuestoesJson: c.mapaQuestoesJson as any,
            gabaritoOficialJson: c.gabaritoOficialJson as any
          }))
        }
      };

      const saved = await (prisma as any).provaMontada?.create({
        data: dataToCreate,
        include: {
          cadernos: true
        }
      });

      if (saved) {
        novaProva.id = saved.id;
        if (saved.cadernos && saved.cadernos.length > 0) {
          novaProva.cadernos = saved.cadernos.map((c: any) => ({
            id: c.id,
            provaMontadaId: c.provaMontadaId,
            codigoVersao: c.codigoVersao,
            alunoNome: c.alunoNome,
            alunoRa: c.alunoRa,
            mapaQuestoesJson: c.mapaQuestoesJson,
            gabaritoOficialJson: c.gabaritoOficialJson,
            createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined
          }));
        }
        await this.examRepository.save(novaProva);
        return novaProva;
      }
    } catch (dbErr) {
      console.warn('Banco relacional offline para INSERT de prova com cadernos, salvando via repositório:', dbErr);
      await this.cadernoRepository.saveMany(cadernosGerados);
      await this.examRepository.save(novaProva);
      return novaProva;
    }

    await this.examRepository.save(novaProva);
    return novaProva;
  }

  async excluirProvaMontada(id: string): Promise<boolean> {
    return this.examRepository.delete(id);
  }

  async excluirProvaComEscopo(id: string, session?: UserSession | null): Promise<boolean> {
    if (session?.role === 'PROFESSOR') {
      const prova = await (prisma as any).provaMontada?.findUnique({
        where: { id },
        include: { turma: true }
      });
      if (prova) {
        if (prova.professorId !== session.id && prova.turma?.professorId !== session.id) {
          throw new ForbiddenError('Acesso negado. Você só pode excluir suas próprias provas.');
        }
      }
    }

    try {
      await (prisma as any).provaMontada?.delete({ where: { id } });
    } catch (_) {}

    return this.examRepository.delete(id);
  }

  /**
   * Trava Rígida de Pontuação Total: exatamente 10.0 pts para autorizar o gabarito
   */
  validarPontuacaoExame(questoes: Question[]): { valida: boolean; total: number; mensagem?: string } {
    const total = Number(questoes.reduce((acc, q) => acc + (q.pontuacao ?? q.points ?? 0), 0).toFixed(1));
    if (Math.abs(total - 10.0) > 0.05) {
      return {
        valida: false,
        total,
        mensagem: `A soma das questões deve ser exatamente 10.0 pontos para gerar o gabarito. Pontuação atual: ${total.toFixed(1)} pts`
      };
    }
    return { valida: true, total: 10.0 };
  }

  async generateVersions(config: GenerateExamConfig): Promise<ExamVersionLayout[]> {
    const students = await this.examRepository.getStudents();
    const baseQuestions = await this.examRepository.getQuestions();

    if (baseQuestions.length === 0) {
      throw new Error('Adicione ao menos 1 questão ao caderno para gerar a avaliação.');
    }

    if (baseQuestions.length > 30) {
      throw new Error('O limite máximo permitido por prova é de 30 questões.');
    }

    return students.map((student: any, index: number) => {
      let versionQuestions = JSON.parse(JSON.stringify(baseQuestions)) as Question[];

      if (config.shuffleQuestions) {
        versionQuestions = this.shuffleArray(versionQuestions, index + 1);
      }

      if (config.shuffleAlternatives) {
        versionQuestions.forEach((q, qIndex) => {
          if (q.tipo === 'objetiva' && q.alternativas) {
            q.alternativas = this.shuffleArray(q.alternativas, index * 10 + qIndex + 1);
          }
        });
      }

      return ExamModel.createVersionLayout(index + 1, student, versionQuestions, config);
    });
  }
}
