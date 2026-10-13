import { LeituraOMRRegistro } from '@/types';
import { IBaseRepository } from './base/IBaseRepository';

export class OmrRepository implements IBaseRepository<LeituraOMRRegistro> {
  private fallbackLeituras: LeituraOMRRegistro[] = [];

  async findAll(): Promise<LeituraOMRRegistro[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/omr');
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
        const res = await fetch(`/api/omr?alunoId=${encodeURIComponent(alunoId)}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Falha ao buscar leituras por aluno da API:', err);
      }
    }
    return this.fallbackLeituras.filter(l => l.alunoId === alunoId);
  }

  async save(registro: LeituraOMRRegistro): Promise<LeituraOMRRegistro> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/omr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registro)
        });
        if (res.ok) {
          const savedData = await res.json();
          this.fallbackLeituras.unshift(savedData);
          return savedData;
        }
      } catch (err) {
        console.warn('Falha ao salvar leitura OMR na API, mantendo em memória:', err);
      }
    }

    this.fallbackLeituras.unshift(registro);
    return registro;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.fallbackLeituras.length;
    this.fallbackLeituras = this.fallbackLeituras.filter(l => l.id !== id);
    return this.fallbackLeituras.length < initialLength;
  }
}
