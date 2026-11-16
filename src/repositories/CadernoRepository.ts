import { CadernoProvaRegistro } from '@/types';
import { IBaseRepository } from './base/IBaseRepository';

export class CadernoRepository implements IBaseRepository<CadernoProvaRegistro> {
  private cadernos: CadernoProvaRegistro[] = [];

  async findAll(): Promise<CadernoProvaRegistro[]> {
    return [...this.cadernos];
  }

  async findById(id: string): Promise<CadernoProvaRegistro | undefined> {
    return this.cadernos.find(c => c.id === id);
  }

  async findByProvaMontadaId(provaMontadaId: string): Promise<CadernoProvaRegistro[]> {
    return this.cadernos.filter(c => c.provaMontadaId === provaMontadaId);
  }

  async save(item: CadernoProvaRegistro): Promise<CadernoProvaRegistro> {
    const index = this.cadernos.findIndex(c => c.id === item.id);
    if (index >= 0) {
      this.cadernos[index] = item;
    } else {
      this.cadernos.push(item);
    }
    return item;
  }

  async saveMany(items: CadernoProvaRegistro[]): Promise<CadernoProvaRegistro[]> {
    for (const item of items) {
      await this.save(item);
    }
    return items;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.cadernos.length;
    this.cadernos = this.cadernos.filter(c => c.id !== id);
    return this.cadernos.length < initialLength;
  }
}
