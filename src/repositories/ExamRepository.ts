import { Question, Student, ProvaMontadaRegistro } from '@/types';
import { IBaseRepository } from './base/IBaseRepository';

export class ExamRepository implements IBaseRepository<ProvaMontadaRegistro> {
  private fallbackProvas: ProvaMontadaRegistro[] = [
    {
      id: 'prova_demo_1',
      titulo: 'Avaliação Escrita N2 - Teoria Geral do Direito',
      turmaId: 't3',
      turmaNome: 'Direito Civil II',
      disciplina: 'Direito Civil',
      semestre: '2026/2',
      ciclo: 'N2',
      professorId: 'usr-prof-03',
      totalQuestoes: 8,
      pontuacaoTotal: 10.0,
      shuffleQuestoes: true,
      shuffleAlternativas: true,
      nominalQrCode: true,
      createdAt: new Date().toISOString(),
      questoesSnapshot: [
        {
          id: 'q1',
          tipo: 'objetiva',
          enunciado: 'Marina nasceu com vida em uma maternidade e, desde então, passou a ser titular de direitos e deveres na ordem civil.',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Personalidade'],
          alternativas: [
            { id: 'alt_1_a', letraOriginal: 'A', texto: 'A imagem de uma criança pode ser utilizada livremente por empresas sem autorização.', correta: false },
            { id: 'alt_1_b', letraOriginal: 'B', texto: 'Os direitos da personalidade protegem atributos essenciais como imagem, nome, honra e privacidade.', correta: true },
            { id: 'alt_1_c', letraOriginal: 'C', texto: 'A personalidade civil começa somente quando a pessoa física completa 18 anos.', correta: false },
            { id: 'alt_1_d', letraOriginal: 'D', texto: 'Os direitos da personalidade podem ser alienados e vendidos definitivamente a terceiros.', correta: false }
          ]
        },
        {
          id: 'q2',
          tipo: 'objetiva',
          enunciado: 'Em relação à capacidade civil das pessoas naturais no ordenamento jurídico brasileiro:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Capacidade'],
          alternativas: [
            { id: 'alt_2_a', letraOriginal: 'A', texto: 'São absolutamente incapazes de exercer pessoalmente os atos da vida civil os menores de 16 anos.', correta: true },
            { id: 'alt_2_b', letraOriginal: 'B', texto: 'Os pródigos são considerados absolutamente incapazes e não podem casar.', correta: false },
            { id: 'alt_2_c', letraOriginal: 'C', texto: 'A emancipação voluntária concedida pelos pais depende sempre de homologação judicial.', correta: false },
            { id: 'alt_2_d', letraOriginal: 'D', texto: 'Os maiores de 16 e menores de 18 anos são plenamente capazes para todos os atos civis.', correta: false }
          ]
        },
        {
          id: 'q3',
          tipo: 'objetiva',
          enunciado: 'Quanto à validade dos negócios jurídicos e aos defeitos do consentimento previstos no Código Civil:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Negócio Jurídico'],
          alternativas: [
            { id: 'alt_3_a', letraOriginal: 'A', texto: 'O erro substancial não autoriza a anulação do negócio jurídico quando for inescusável.', correta: false },
            { id: 'alt_3_b', letraOriginal: 'B', texto: 'A simulação é causa de mera anulabilidade do negócio jurídico segundo o Código Civil.', correta: false },
            { id: 'alt_3_c', letraOriginal: 'C', texto: 'O dolo de terceiro autoriza a anulação se a parte a quem aproveite dele tinha ou devesse ter conhecimento.', correta: true },
            { id: 'alt_3_d', letraOriginal: 'D', texto: 'A coação moral irresistível convalida-se de pleno direito pelo decurso de 30 dias.', correta: false }
          ]
        },
        {
          id: 'q4',
          tipo: 'objetiva',
          enunciado: 'Uma pessoa emprestou dinheiro a um conhecido e guardou o contrato assinado. Após o vencimento, não tomou providências por muitos anos e o devedor alegou que o prazo previsto em lei já havia transcorrido:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Prescrição'],
          alternativas: [
            { id: 'alt_4_a', letraOriginal: 'A', texto: 'A prescrição atinge o próprio direito material, extinguindo irrevogavelmente o direito subjetivo.', correta: false },
            { id: 'alt_4_b', letraOriginal: 'B', texto: 'A prescrição extingue a pretensão executória, mas não impede o cumprimento voluntário da obrigação natural.', correta: true },
            { id: 'alt_4_c', letraOriginal: 'C', texto: 'Os prazos prescricionais podem ser livremente alterados ou dilatados por convenção entre as partes.', correta: false },
            { id: 'alt_4_d', letraOriginal: 'D', texto: 'A decadência não pode ser conhecida de ofício pelo juiz em nenhuma hipótese legal.', correta: false }
          ]
        },
        {
          id: 'q5',
          tipo: 'objetiva',
          enunciado: 'No direito das obrigações, a respeito da solidariedade passiva entre os devedores:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Obrigações'],
          alternativas: [
            { id: 'alt_5_a', letraOriginal: 'A', texto: 'A solidariedade se presume em todos os contratos de mútuo e comodato.', correta: false },
            { id: 'alt_5_b', letraOriginal: 'B', texto: 'O credor que renuncia à solidariedade em favor de um perde o direito de exigir dos demais.', correta: false },
            { id: 'alt_5_c', letraOriginal: 'C', texto: 'O credor pode demandar apenas um dos devedores pela sua cota-parte proporcional.', correta: false },
            { id: 'alt_5_d', letraOriginal: 'D', texto: 'O credor tem direito a exigir e receber de qualquer um dos codevedores, parcial ou totalmente, a dívida comum.', correta: true }
          ]
        },
        {
          id: 'q6',
          tipo: 'objetiva',
          enunciado: 'Sobre os direitos reais e a aquisição da propriedade imobiliária no ordenamento civil:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Direitos Reais'],
          alternativas: [
            { id: 'alt_6_a', letraOriginal: 'A', texto: 'Transfere-se entre vivos a propriedade imobiliária mediante o competente registro do título no Cartório de Registro de Imóveis.', correta: true },
            { id: 'alt_6_b', letraOriginal: 'B', texto: 'A tradição simples é o ato constitutivo suficiente para transferir a propriedade de bem imóvel.', correta: false },
            { id: 'alt_6_c', letraOriginal: 'C', texto: 'A posse de má-fé confere direito de retenção pelas benfeitorias úteis realizadas no imóvel.', correta: false },
            { id: 'alt_6_d', letraOriginal: 'D', texto: 'O usufruto de imóvel dispensa qualquer registro para produzir efeitos perante terceiros.', correta: false }
          ]
        },
        {
          id: 'q7',
          tipo: 'objetiva',
          enunciado: 'Em matéria de responsabilidade civil extracontratual subjetiva regulada pelo artigo 186 do Código Civil:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Responsabilidade Civil'],
          alternativas: [
            { id: 'alt_7_a', letraOriginal: 'A', texto: 'A obrigação de indenizar prescinde totalmente de culpa ou dolo em qualquer atividade humana.', correta: false },
            { id: 'alt_7_b', letraOriginal: 'B', texto: 'O dano exclusivamente moral não enseja qualquer reparação civil indenizatória autônoma.', correta: false },
            { id: 'alt_7_c', letraOriginal: 'C', texto: 'Aquele que, por ação ou omissão voluntária, negligência ou imprudência, violar direito e causar dano a outrem, comete ato ilícito.', correta: true },
            { id: 'alt_7_d', letraOriginal: 'D', texto: 'O caso fortuito e a força maior não excluem o nexo causal na responsabilidade subjetiva.', correta: false }
          ]
        },
        {
          id: 'q8',
          tipo: 'objetiva',
          enunciado: 'No direito das sucessões, a vocação hereditária na sucessão legítima assegura:',
          pontuacao: 1.25,
          tags: ['Direito Civil', 'Sucessões'],
          alternativas: [
            { id: 'alt_8_a', letraOriginal: 'A', texto: 'A exclusão do cônjuge sobrevivente caso haja descendentes vivos de qualquer regime.', correta: false },
            { id: 'alt_8_b', letraOriginal: 'B', texto: 'São herdeiros necessários os descendentes, os ascendentes e o cônjuge, a quem pertence de pleno direito a metade dos bens da herança.', correta: true },
            { id: 'alt_8_c', letraOriginal: 'C', texto: 'A herança transmite-se aos herdeiros legítimos apenas após o trânsito em julgado da partilha.', correta: false },
            { id: 'alt_8_d', letraOriginal: 'D', texto: 'Os parentes colaterais até 4º grau são herdeiros necessários protegidos pela legítima.', correta: false }
          ]
        }
      ]
    }
  ];

  private mockStudents: Student[] = [
    { id: 'alu-01', nome: 'Gabriel Menezes', matricula: '20241001', email: 'gabriel.m@catolicasc.edu.br' },
    { id: 'alu-02', nome: 'Beatriz Ramos', matricula: '20241002', email: 'beatriz.r@catolicasc.edu.br' },
    { id: 'alu-03', nome: 'Lucas Martins', matricula: '20241003', email: 'lucas.m@catolicasc.edu.br' },
    { id: 'alu-04', nome: 'Fernanda Lima', matricula: '20241004', email: 'fernanda.l@catolicasc.edu.br' }
  ];

  private mockQuestions: Question[] = [
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual das seguintes camadas isola estritamente o acesso ao banco de dados MySQL?',
      pontuacao: 2.5,
      tags: ['Backend', 'Arquitetura'],
      alternativas: [
        { id: 'alt_1_1', letraOriginal: 'A', texto: 'Repositório (Repository)', correta: true },
        { id: 'alt_1_2', letraOriginal: 'B', texto: 'Controle (Controller)', correta: false },
        { id: 'alt_1_3', letraOriginal: 'C', texto: 'Serviço (Service)', correta: false },
        { id: 'alt_1_4', letraOriginal: 'D', texto: 'Rota (Router)', correta: false },
        { id: 'alt_1_5', letraOriginal: 'E', texto: 'Model (Entidade)', correta: false }
      ]
    }
  ];

  async getStudents(): Promise<Student[]> {
    return this.mockStudents;
  }

  async getQuestions(): Promise<Question[]> {
    return this.mockQuestions;
  }

  async findAll(): Promise<ProvaMontadaRegistro[]> {
    let localSaved: ProvaMontadaRegistro[] = [];
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('sgp-provas-montadas');
        if (saved) {
          localSaved = JSON.parse(saved);
        }
      } catch (_) {}

      try {
        const res = await fetch('/api/exams', { cache: 'no-store' });
        if (res.ok) {
          const apiData: ProvaMontadaRegistro[] = await res.json();
          // Mescla segura: preserva tanto os dados vindos do backend quanto provas salvas localmente
          const map = new Map<string, ProvaMontadaRegistro>();
          (apiData || []).forEach(p => {
            if (p.id) map.set(p.id, p);
          });
          localSaved.forEach(p => {
            if (p.id && !map.has(p.id)) {
              map.set(p.id, p);
            }
          });
          this.fallbackProvas = Array.from(map.values());
          this.persistLocalStorage();
          return [...this.fallbackProvas];
        }
      } catch (err) {
        console.warn('Falha ao buscar provas da API, utilizando armazenamento local persistente:', err);
      }

      if (localSaved.length > 0) {
        this.fallbackProvas = localSaved;
        return [...this.fallbackProvas];
      }
    }
    return [...this.fallbackProvas];
  }

  async findById(id: string): Promise<ProvaMontadaRegistro | undefined> {
    const list = await this.findAll();
    return list.find(p => p.id === id);
  }

  async findByTurmaId(turmaId: string): Promise<ProvaMontadaRegistro[]> {
    const list = await this.findAll();
    return list.filter(p => p.turmaId === turmaId);
  }

  async save(prova: ProvaMontadaRegistro): Promise<ProvaMontadaRegistro> {
    // 1. Persistência imediata e síncrona no armazenamento local do navegador
    const idx = this.fallbackProvas.findIndex(p => p.id === prova.id);
    if (idx >= 0) {
      this.fallbackProvas[idx] = prova;
    } else {
      this.fallbackProvas.unshift(prova);
    }
    this.persistLocalStorage();

    // 2. Sincronização com o endpoint da API / banco de dados relacional
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/exams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prova)
        });
        if (res.ok) {
          const savedData = await res.json();
          const serverIdx = this.fallbackProvas.findIndex(p => p.id === prova.id || p.id === savedData.id);
          if (serverIdx >= 0) {
            this.fallbackProvas[serverIdx] = savedData;
          } else {
            this.fallbackProvas.unshift(savedData);
          }
          this.persistLocalStorage();
          return savedData;
        }
      } catch (err) {
        console.warn('Falha ao salvar prova na API, mantida cópia local íntegra:', err);
      }
    }

    return prova;
  }

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        await fetch(`/api/exams?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      } catch (_) {}
    }
    const initialLen = this.fallbackProvas.length;
    this.fallbackProvas = this.fallbackProvas.filter(p => p.id !== id);
    this.persistLocalStorage();
    return this.fallbackProvas.length < initialLen;
  }

  private persistLocalStorage() {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('sgp-provas-montadas', JSON.stringify(this.fallbackProvas));
      } catch (_) {}
    }
  }
}
