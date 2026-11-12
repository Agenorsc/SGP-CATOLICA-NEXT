import { validarSchemaQrCode, QR_SCHEMA_LIMITS } from '../../src/lib/schemas/qrCodeSchema';
import { OmrService } from '../../src/services/OmrService';
import { AlunoModel } from '../../src/models/AlunoModel';

describe('Validação de Schema de QR Code e Rejeição de Leituras Adulteradas (Segurança / OMR)', () => {
  let omrService: OmrService;

  const mockAlunosTurma: AlunoModel[] = [
    new AlunoModel({
      id: 'alu-01',
      nome: 'AGENOR ALVISE',
      ra: '1328834',
      turmaId: 't1'
    }),
    new AlunoModel({
      id: 'alu-02',
      nome: 'Beatriz Ramos',
      ra: '20241002',
      turmaId: 't1'
    })
  ];

  const payloadValidoPadrao = {
    system: 'SGP-CATOLICA',
    examId: 'EXAM-t1',
    classId: 't1',
    className: 'Engenharia de Software IV',
    teacherId: 'prof-01',
    studentId: 'alu-01',
    studentName: 'AGENOR ALVISE',
    studentRa: '1328834',
    stage: 'N2',
    examVersion: 'A',
    nq: 4,
    op: '5555',
    k: 'ABCDE',
    pt: '2.5,2.5,2.5,2.5'
  };

  beforeEach(() => {
    omrService = new OmrService();
  });

  describe('1. Validação de Estrutura e Conformidade com o Schema', () => {
    it('deve aprovar com sucesso um payload legítimo e completo', () => {
      const res = validarSchemaQrCode(JSON.stringify(payloadValidoPadrao));

      expect(res.valido).toBe(true);
      expect(res.adulterado).toBe(false);
      expect(res.erros).toHaveLength(0);
      expect(res.cardPayload).toBeDefined();
      expect(res.cardPayload?.studentName).toBe('AGENOR ALVISE');
      expect(res.cardPayload?.studentRa).toBe('1328834');
      expect(res.cardPayload?.stage).toBe('N2');
    });

    it('deve rejeitar payload com campos obrigatórios ausentes', () => {
      const semRa = { ...payloadValidoPadrao, studentRa: undefined, ra: undefined };
      const res = validarSchemaQrCode(JSON.stringify(semRa));

      expect(res.valido).toBe(false);
      expect(res.erros.some(e => e.includes('studentRa / ra'))).toBe(true);
    });

    it('deve rejeitar quando a raiz do JSON for um array em vez de objeto', () => {
      const res = validarSchemaQrCode(JSON.stringify(['item1', 'item2']));

      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.motivo).toContain('não é um objeto');
    });

    it('deve rejeitar quando a entrada for um primitivo ou nulo', () => {
      expect(validarSchemaQrCode('12345').valido).toBe(false);
      expect(validarSchemaQrCode(null).valido).toBe(false);
    });
  });

  describe('2. Validação Estrita de Tipos de Dados', () => {
    it('deve rejeitar quando studentRa for número em vez de string', () => {
      const payloadInvalido = {
        ...payloadValidoPadrao,
        studentRa: 1328834 // número não permitido
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('tipo inválido (number)'))).toBe(true);
    });

    it('deve rejeitar quando studentName for um objeto (tentativa de injeção)', () => {
      const payloadInvalido = {
        ...payloadValidoPadrao,
        studentName: { $regex: '.*' } // NoSQL injection pattern
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('studentName'))).toBe(true);
    });

    it('deve rejeitar quando stage não for uma string permitida', () => {
      const payloadInvalido = {
        ...payloadValidoPadrao,
        stage: true // booleano inválido
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
    });

    it('deve rejeitar quando nq for string em vez de inteiro', () => {
      const payloadInvalido = {
        ...payloadValidoPadrao,
        nq: '4' // string em vez de number
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('nq'))).toBe(true);
    });
  });

  describe('3. Limites de Tamanho e Proteção contra DoS / Buffer Overflow', () => {
    it('deve rejeitar payload bruto maior que 4096 caracteres', () => {
      const payloadEnorme = JSON.stringify({
        ...payloadValidoPadrao,
        campoInutil: 'X'.repeat(5000)
      });

      const res = validarSchemaQrCode(payloadEnorme);
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.motivo).toContain('buffer overflow/DoS');
    });

    it('deve rejeitar studentName que exceda 150 caracteres', () => {
      const payloadNomeLongo = {
        ...payloadValidoPadrao,
        studentName: 'A'.repeat(151)
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadNomeLongo));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('excede o tamanho máximo de 150'))).toBe(true);
    });

    it('deve rejeitar studentRa que exceda 30 caracteres', () => {
      const payloadRaLongo = {
        ...payloadValidoPadrao,
        studentRa: '9'.repeat(31)
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadRaLongo));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('excede o tamanho máximo de 30'))).toBe(true);
    });

    it('deve rejeitar campos com tamanho inferior ao mínimo aceitável', () => {
      const payloadNomeCurto = {
        ...payloadValidoPadrao,
        studentName: 'A' // Mínimo é 2
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadNomeCurto));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('tamanho inferior ao mínimo'))).toBe(true);
    });
  });

  describe('4. Rejeição de Leituras Adulteradas e Injeções Maliciosas', () => {
    it('deve rejeitar tentativa de injeção XSS em studentName', () => {
      const payloadXss = {
        ...payloadValidoPadrao,
        studentName: '<script>alert("hack")</script>'
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadXss));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('Injeção maliciosa'))).toBe(true);
    });

    it('deve rejeitar injeção HTML com manipulador de evento', () => {
      const payloadHtml = {
        ...payloadValidoPadrao,
        studentName: '<img src=x onerror=alert(1)>'
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadHtml));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
    });

    it('deve rejeitar tentativa de SQL Injection em studentRa', () => {
      const payloadSql = {
        ...payloadValidoPadrao,
        studentRa: "1328834' OR '1'='1"
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadSql));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
    });

    it('deve rejeitar tentativa de SQL Injection com DROP TABLE', () => {
      const payloadDrop = {
        ...payloadValidoPadrao,
        className: 'Engenharia; DROP TABLE alunos;'
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadDrop));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
    });

    it('deve rejeitar tentativa de Prototype Pollution (__proto__)', () => {
      const payloadPollution = '{"system":"SGP-CATOLICA","examId":"EXAM-1","studentRa":"1328834","studentName":"Teste","classId":"t1","__proto__":{"isAdmin":true}}';

      const res = validarSchemaQrCode(payloadPollution);
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.motivo).toContain('Prototype Pollution');
    });

    it('deve rejeitar quando houver inconsistência entre aliases (ex: studentRa diferente de ra)', () => {
      const payloadInconsistente = {
        ...payloadValidoPadrao,
        studentRa: '1328834',
        ra: '9999999' // divergente
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadInconsistente));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('Inconsistência de integridade'))).toBe(true);
    });

    it('deve rejeitar etapa avaliativa (stage) forjada ou inexistente', () => {
      const payloadStageInvalido = {
        ...payloadValidoPadrao,
        stage: 'PROVA_FINAL_HACK'
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadStageInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('Etapa avaliativa'))).toBe(true);
    });
  });

  describe('5. Validação de Gabarito Embutido contra Fraude Acadêmica', () => {
    it('deve rejeitar número de questões fora dos limites da instituição (1 a 30)', () => {
      const payloadQZero = { ...payloadValidoPadrao, nq: 0 };
      expect(validarSchemaQrCode(JSON.stringify(payloadQZero)).adulterado).toBe(true);

      const payloadQ31 = { ...payloadValidoPadrao, nq: 31 };
      expect(validarSchemaQrCode(JSON.stringify(payloadQ31)).adulterado).toBe(true);
    });

    it('deve rejeitar op com quantidade de alternativas inválidas (não entre 2 e 5)', () => {
      const payloadOpInvalido = {
        ...payloadValidoPadrao,
        nq: 4,
        op: '5595' // '9' não é válido (apenas 2 a 5)
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadOpInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('caracteres inválidos'))).toBe(true);
    });

    it('deve rejeitar quando o tamanho de op divergir de nq', () => {
      const payloadOpCurto = {
        ...payloadValidoPadrao,
        nq: 4,
        op: '55' // Apenas 2 itens para 4 questões
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadOpCurto));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('Incompatibilidade no layout'))).toBe(true);
    });

    it('deve rejeitar chave de gabarito (k) menor que o número de questões nq', () => {
      const payloadKCurto = {
        ...payloadValidoPadrao,
        nq: 4,
        k: 'AB' // Faltam alternativas para as questões 3 e 4
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadKCurto));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('tamanho insuficiente'))).toBe(true);
    });

    it('deve rejeitar chave de gabarito (k) contendo caracteres não alfabéticos', () => {
      const payloadKInvalido = {
        ...payloadValidoPadrao,
        nq: 4,
        k: 'AB1@'
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadKInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
    });

    it('deve rejeitar pontuações (pt) contendo valores negativos ou NaN', () => {
      const payloadPtInvalido = {
        ...payloadValidoPadrao,
        pt: '2.5,-1.0,2.5,2.5'
      };

      const res = validarSchemaQrCode(JSON.stringify(payloadPtInvalido));
      expect(res.valido).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erros.some(e => e.includes('pontuação (pt)'))).toBe(true);
    });
  });

  describe('6. Integração com OmrService.validarPayloadQrCode', () => {
    it('deve rejeitar leitura adulterada através do OmrService informando o motivo de segurança', () => {
      const payloadXss = JSON.stringify({
        ...payloadValidoPadrao,
        studentName: '<script>alert(1)</script>'
      });

      const res = omrService.validarPayloadQrCode(payloadXss, mockAlunosTurma, 't1');

      expect(res.sucesso).toBe(false);
      expect(res.adulterado).toBe(true);
      expect(res.erro).toContain('Filtro de Segurança: QR Code adulterado!');
      expect(res.detalhesValidacao).toBeDefined();
      expect(res.detalhesValidacao?.erros.length).toBeGreaterThan(0);
    });

    it('deve processar e aprovar payload legítimo com integridade confirmada', () => {
      const res = omrService.validarPayloadQrCode(JSON.stringify(payloadValidoPadrao), mockAlunosTurma, 't1');

      expect(res.sucesso).toBe(true);
      expect(res.adulterado).toBe(false);
      expect(res.aluno).toBeDefined();
      expect(res.aluno?.nome).toBe('AGENOR ALVISE');
      expect(res.cardPayload?.examVersion).toBe('A');
    });
  });
});
