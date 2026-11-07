import { LeituraOMRRegistro, EvaluationStage } from '@/types';
import { AlunoModel } from '@/models/AlunoModel';
import { IBaseRepository } from './base/IBaseRepository';

export interface SalvarLeituraResponse {
  leitura: LeituraOMRRegistro;
  aluno: AlunoModel;
}

export class OmrRepository implements IBaseRepository<LeituraOMRRegistro> {
  private fallbackLeituras: LeituraOMRRegistro[] = [];

  async findAll(): Promise<LeituraOMRRegistro[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/omr', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          this.fallbackLeituras = data;
          return this.fallbackLeituras;
        }
      } catch (err) {
        console.warn('Falha ao buscar leituras OMR da API, usando cache local:', err);
      }
    }
    return [...this.fallbackLeituras];
  }

  async findById(id: string): Promise<LeituraOMRRegistro | undefined> {
    const list = await this.findAll();
    return list.find(l => l.id === id);
  }

  async findByAlunoId(alunoId: string): Promise<LeituraOMRRegistro[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/omr?alunoId=${encodeURIComponent(alunoId)}`, { cache: 'no-store' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Falha ao buscar leituras por aluno da API:', err);
      }
    }
    return this.fallbackLeituras.filter(l => l.alunoId === alunoId);
  }

  /**
   * Persiste a leitura OMR via API.
   * Lança erro explicitamente em caso de falha HTTP/Rede (sem fallback silencioso em memória).
   */
  async save(registro: LeituraOMRRegistro, stage?: EvaluationStage): Promise<LeituraOMRRegistro> {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/omr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registro, stage: stage || registro.stage })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || `Erro HTTP ${res.status}: Falha ao persistir a leitura OMR no banco de dados.`;
        throw new Error(msg);
      }

      const data = await res.json();
      const savedData: LeituraOMRRegistro = data.leitura || data;
      this.fallbackLeituras.unshift(savedData);
      return savedData;
    }

    this.fallbackLeituras.unshift(registro);
    return registro;
  }

  /**
   * Grava a leitura OMR e a nota do aluno em uma única transação atômica.
   * Lança erro explicitamente em caso de falha para alertar o professor.
   */
  async saveWithTransaction(
    registro: LeituraOMRRegistro,
    stage?: EvaluationStage
  ): Promise<SalvarLeituraResponse> {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/omr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registro, stage: stage || registro.stage })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.error || `Erro HTTP ${res.status}: Falha na transação ao persistir leitura OMR e nota do aluno no banco de dados.`;
        throw new Error(msg);
      }

      const data = await res.json();
      const savedLeitura: LeituraOMRRegistro = data.leitura || data;
      const alunoAtualizado = new AlunoModel(data.aluno);
      this.fallbackLeituras.unshift(savedLeitura);
      return {
        leitura: savedLeitura,
        aluno: alunoAtualizado
      };
    }

    this.fallbackLeituras.unshift(registro);
    return {
      leitura: registro,
      aluno: new AlunoModel({ id: registro.alunoId, ra: registro.ra, nome: registro.alunoNome })
    };
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.fallbackLeituras.length;
    this.fallbackLeituras = this.fallbackLeituras.filter(l => l.id !== id);
    return this.fallbackLeituras.length < initialLength;
  }
}
