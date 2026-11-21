import { Contato, Endereco, Filiacao } from '@/types';

export class PessoaModel {
  nome: string;
  dataNascimento: string;
  naturalidade: string;
  estadoNatal: string;
  filiacao: Filiacao;
  contato: Contato;
  endereco: Endereco;

  constructor(data: Partial<PessoaModel> = {}) {
    this.nome = data.nome || '';
    const contatoObj = (data.contato && typeof data.contato === 'object') ? (data.contato as any) : {};
    this.dataNascimento = data.dataNascimento || contatoObj.dataNascimento || '';
    this.naturalidade = data.naturalidade || contatoObj.naturalidade || '';
    this.estadoNatal = data.estadoNatal || contatoObj.estadoNatal || '';

    const filiacaoObj = data.filiacao || contatoObj.filiacao;
    this.filiacao = {
      mae: filiacaoObj?.mae || contatoObj.mae || (data as any)?.mae || '',
      pai: filiacaoObj?.pai || contatoObj.pai || (data as any)?.pai || ''
    };

    this.contato = {
      celular: data.contato?.celular || contatoObj.celular || (data as any)?.celular || ''
    };

    const enderecoObj = (data.endereco && typeof data.endereco === 'object') ? (data.endereco as any) : {};
    this.endereco = {
      cep: enderecoObj.cep || (data as any)?.cep || '',
      logradouro: enderecoObj.logradouro || (data as any)?.logradouro || '',
      numero: enderecoObj.numero || (data as any)?.numero || '',
      bairro: enderecoObj.bairro || (data as any)?.bairro || '',
      cidade: enderecoObj.cidade || (data as any)?.cidade || '',
      estado: enderecoObj.estado || (data as any)?.estado || ''
    };
  }
}
