import { LeituraOMRRegistro, OMRQuestionResult, EvaluationStage } from '@/types';

export interface ContagemAlternativa { alternativa: string; quantidade: number; percentual: number; }
export interface DistratorMaisMarcado { alternativa: string; quantidade: number; percentual: number; }
export interface EstatisticaPorQuestao {
  numero: number;
  gabaritoOficial: string;
  totalSubmissoes: number;
  totalAcertos: number;
  percentualAcerto: number;
  totalErros: number;
  totalEmBranco: number;
  totalAnuladas: number;
  contagemPorAlternativa: ContagemAlternativa[];
  distratorMaisMarcado?: DistratorMaisMarcado;
}
export interface FiltrosEstatisticaQuestoes { turmaId?: string; provaMontadaId?: string; stage?: EvaluationStage; }
export interface EstatisticasQuestoesResponse { totalLeituras: number; questoes: EstatisticaPorQuestao[]; }

const STATUSES = ['CORRETA', 'INCORRETA', 'ANULADA', 'EM_BRANCO'] as const;
type Status = typeof STATUSES[number];
const percentual = (parte: number, total: number) => total === 0 ? 0 : Number(((parte / total) * 100).toFixed(1));

function normalizarStatus(detalhe: OMRQuestionResult): Status {
  if (STATUSES.includes(detalhe.status)) return detalhe.status;
  if (!detalhe.respostaMarcada) return 'EM_BRANCO';
  return detalhe.correta ? 'CORRETA' : 'INCORRETA';
}

export class QuestionStatisticsService {
  static gerar(leituras: LeituraOMRRegistro[], filtros: FiltrosEstatisticaQuestoes = {}): EstatisticasQuestoesResponse {
    const leiturasFiltradas = leituras.filter(leitura => {
      if (filtros.turmaId && leitura.turmaId !== filtros.turmaId) return false;
      if (filtros.provaMontadaId && leitura.provaMontadaId !== filtros.provaMontadaId && leitura.examId !== filtros.provaMontadaId) return false;
      if (filtros.stage && leitura.stage && leitura.stage !== filtros.stage) return false;
      return true;
    });
    const porQuestao = new Map<number, { gabarito: string; total: number; acertos: number; erros: number; emBranco: number; anuladas: number; alternativas: Map<string, number>; distratores: Map<string, number> }>();

    leiturasFiltradas.forEach(leitura => (leitura.detalhesQuestoes || []).forEach(detalhe => {
      if (!Number.isInteger(detalhe.numero) || detalhe.numero < 1) return;
      const atual = porQuestao.get(detalhe.numero) || { gabarito: detalhe.respostaCorreta || '', total: 0, acertos: 0, erros: 0, emBranco: 0, anuladas: 0, alternativas: new Map(), distratores: new Map() };
      const status = normalizarStatus(detalhe);
      const alternativa = detalhe.respostaMarcada?.trim().toUpperCase();
      atual.total++;
      if (detalhe.respostaCorreta) atual.gabarito = detalhe.respostaCorreta.toUpperCase();
      if (alternativa) atual.alternativas.set(alternativa, (atual.alternativas.get(alternativa) || 0) + 1);
      if (status === 'CORRETA') atual.acertos++;
      else if (status === 'EM_BRANCO') atual.emBranco++;
      else if (status === 'ANULADA') atual.anuladas++;
      else {
        atual.erros++;
        if (alternativa) atual.distratores.set(alternativa, (atual.distratores.get(alternativa) || 0) + 1);
      }
      porQuestao.set(detalhe.numero, atual);
    }));

    const questoes = [...porQuestao.entries()].sort(([a], [b]) => a - b).map(([numero, dados]) => {
      const contagemPorAlternativa = [...dados.alternativas.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([alternativa, quantidade]) => ({ alternativa, quantidade, percentual: percentual(quantidade, dados.total) }));
      const distrator = [...dados.distratores.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
      return {
        numero, gabaritoOficial: dados.gabarito, totalSubmissoes: dados.total, totalAcertos: dados.acertos,
        percentualAcerto: percentual(dados.acertos, dados.total), totalErros: dados.erros, totalEmBranco: dados.emBranco,
        totalAnuladas: dados.anuladas, contagemPorAlternativa,
        distratorMaisMarcado: distrator ? { alternativa: distrator[0], quantidade: distrator[1], percentual: percentual(distrator[1], dados.erros) } : undefined
      };
    });
    return { totalLeituras: leiturasFiltradas.length, questoes };
  }
}
