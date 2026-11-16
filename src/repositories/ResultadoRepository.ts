import { ResultadoAvaliacaoRegistro } from '@/types';
import { IBaseRepository } from './base/IBaseRepository';

export class ResultadoRepository implements IBaseRepository<ResultadoAvaliacaoRegistro> {
  private resultados: ResultadoAvaliacaoRegistro[] = [];

  async findAll(): Promise<ResultadoAvaliacaoRegistro[]> {
    return [...this.resultados];
  }

  async findById(id: string): Promise<ResultadoAvaliacaoRegistro | undefined> {
    return this.resultados.find(r => r.id === id);
  }

  async findByProfessorId(professorId: string): Promise<ResultadoAvaliacaoRegistro[]> {
    return this.resultados.filter(r => r.professorId === professorId);
  }

  async findByProvaMontadaId(provaMontadaId: string): Promise<ResultadoAvaliacaoRegistro[]> {
    return this.resultados.filter(r => r.provaMontadaId === provaMontadaId);
  }

  async save(item: ResultadoAvaliacaoRegistro): Promise<ResultadoAvaliacaoRegistro> {
    const index = this.resultados.findIndex(r => r.id === item.id);
    if (index >= 0) {
      this.resultados[index] = item;
    } else {
      this.resultados.push(item);
    }
    return item;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.resultados.length;
    this.resultados = this.resultados.filter(r => r.id !== id);
    return this.resultados.length < initialLength;
  }
}
