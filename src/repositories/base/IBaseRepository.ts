export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | undefined>;
  save(item: T): Promise<T>;
  delete(id: string): Promise<boolean>;
}
