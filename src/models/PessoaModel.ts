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
    this.dataNascimento = data.dataNascimento || '';
    this.naturalidade = data.naturalidade || '';
    this.estadoNatal = data.estadoNatal || '';
    this.filiacao = data.filiacao || { mae: '', pai: '' };
    this.contato = data.contato || { celular: '' };
    this.endereco = data.endereco || {
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    };
  }
}
