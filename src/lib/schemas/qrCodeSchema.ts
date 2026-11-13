/**
 * Schema e Validador de Segurança para Payloads de QR Code (SGP Católica SC)
 * 
 * Validação estrita de:
 * 1. Campos obrigatórios e integridade estrutural
 * 2. Tipos de dados (rejeição de injeção de tipos arbitrários)
 * 3. Limites de tamanho (proteção contra Buffer Overflow e DoS)
 * 4. Padrões de segurança contra adulteração e injeções (XSS, SQLi, Prototype Pollution)
 * 5. Consistência semântica e limites de domínio acadêmico (questões, etapas, notas)
 */

import { CardPayload, EvaluationStage, SecureQrPayload } from '@/types';

export const QR_SCHEMA_LIMITS = {
  MAX_RAW_PAYLOAD_BYTES: 4096,
  MAX_SYSTEM_ID_LENGTH: 20,
  MAX_EXAM_ID_LENGTH: 100,
  MAX_CLASS_ID_LENGTH: 100,
  MAX_CLASS_NAME_LENGTH: 150,
  MAX_TEACHER_ID_LENGTH: 100,
  MAX_STUDENT_ID_LENGTH: 100,
  MAX_STUDENT_NAME_LENGTH: 150,
  MIN_STUDENT_NAME_LENGTH: 2,
  MAX_STUDENT_RA_LENGTH: 30,
  MIN_STUDENT_RA_LENGTH: 3,
  MAX_EXAM_VERSION_LENGTH: 10,
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 30,
  MAX_PT_STRING_LENGTH: 250
} as const;

export const VALID_STAGES: readonly EvaluationStage[] = ['N1', 'N2', 'N3', 'N-1'];

// Expressões regulares de segurança para detecção de injeções maliciosas
const INJECTION_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: 'XSS / Script Tag', regex: /<\s*script[^>]*>/i },
  { name: 'HTML Injection', regex: /<\s*(img|iframe|body|svg|input|link)[^>]+on\w+\s*=/i },
  { name: 'JavaScript URI', regex: /javascript\s*:/i },
  { name: 'Event Handler Injection', regex: /on(error|load|click|mouse|key)\s*=/i },
  { name: 'SQL Injection (DROP/UNION/INSERT)', regex: /\b(DROP\s+TABLE|UNION(\s+ALL)?\s+SELECT|INSERT\s+INTO|DELETE\s+FROM)\b/i },
  { name: 'SQL Injection (Tautologia)', regex: /'\s*OR\s*['"]?1['"]?\s*=\s*['"]?1/i },
  { name: 'Path Traversal', regex: /\.\.[\/\\]/ },
  { name: 'Null Byte Injection', regex: /\x00/ }
];

const STUDENT_RA_REGEX = /^[A-Za-z0-9\-_.]+$/;
const EXAM_VERSION_REGEX = /^[A-Za-z0-9\-_]+$/;
const ANSWER_KEY_LETTERS_REGEX = /^[A-Za-z]+$/;
const ANSWER_OPTIONS_REGEX = /^[2-5]+$/;

export interface QrCodeSchemaValidationResult {
  valido: boolean;
  adulterado: boolean;
  erros: string[];
  motivo?: string;
  cardPayload?: CardPayload;
  securePayload?: SecureQrPayload;
  camposValidados?: string[];
}

/**
 * Analisa se um texto contém padrões maliciosos de injeção.
 */
export function detectarInjecao(texto: string): { detectada: boolean; padrao?: string } {
  for (const { name, regex } of INJECTION_PATTERNS) {
    if (regex.test(texto)) {
      return { detectada: true, padrao: name };
    }
  }
  return { detectada: false };
}

/**
 * Validação rigorosa de Schema de Payload QR Code.
 */
export function validarSchemaQrCode(rawInput: unknown): QrCodeSchemaValidationResult {
  const erros: string[] = [];
  const camposValidados: string[] = [];
  let adulterado = false;

  // 1. Validação de Tamanho do Payload Bruto
  if (typeof rawInput === 'string') {
    if (rawInput.length > QR_SCHEMA_LIMITS.MAX_RAW_PAYLOAD_BYTES) {
      return {
        valido: false,
        adulterado: true,
        erros: [`Payload bruto excede o limite máximo permitido de ${QR_SCHEMA_LIMITS.MAX_RAW_PAYLOAD_BYTES} caracteres (recebido: ${rawInput.length}).`],
        motivo: 'Estouro de capacidade do payload (tentativa de buffer overflow/DoS).'
      };
    }
  }

  // 2. Parser JSON e verificação de tipo de raiz
  let parsed: any;
  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput.trim());
    } catch {
      return {
        valido: false,
        adulterado: false,
        erros: ['Formato inválido: o payload não é um JSON válido.'],
        motivo: 'Não é um JSON válido.'
      };
    }
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    parsed = rawInput;
  } else {
    return {
      valido: false,
      adulterado: true,
      erros: ['Payload inválido: raiz deve ser um objeto JSON não nulo.'],
      motivo: 'Estrutura raiz incompatível.'
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      valido: false,
      adulterado: true,
      erros: ['A raiz do JSON do QR Code deve ser um objeto estruturado (não pode ser array ou primitivo).'],
      motivo: 'Raiz não é um objeto JSON válido.'
    };
  }

  // 3. Proteção contra Prototype Pollution
  if (
    Object.prototype.hasOwnProperty.call(parsed, '__proto__') ||
    Object.prototype.hasOwnProperty.call(parsed, 'constructor') ||
    Object.prototype.hasOwnProperty.call(parsed, 'prototype')
  ) {
    return {
      valido: false,
      adulterado: true,
      erros: ['Propriedades restritas de Prototype Pollution detectadas no payload.'],
      motivo: 'Tentativa de Prototype Pollution detectada.'
    };
  }

  // 4. Verificação de injeções em todas as strings do objeto
  for (const [chave, valor] of Object.entries(parsed)) {
    if (typeof valor === 'string') {
      const inj = detectarInjecao(valor);
      if (inj.detectada) {
        adulterado = true;
        erros.push(`Injeção maliciosa detectada no campo "${chave}": ${inj.padrao}.`);
      }
    }
  }

  // 5. Validação do Identificador de Sistema
  if (parsed.system !== undefined) {
    if (typeof parsed.system !== 'string') {
      adulterado = true;
      erros.push(`Campo "system" deve ser uma string, recebido: ${typeof parsed.system}.`);
    } else if (parsed.system !== 'SGP-CATOLICA') {
      adulterado = true;
      erros.push(`Identificador de sistema adulterado ou desconhecido: "${parsed.system}". Esperado estritamente "SGP-CATOLICA".`);
    } else {
      camposValidados.push('system');
    }
  }

  // 6. Extração com verificação de tipo para campos essenciais
  const classId = parsed.classId ?? parsed.turmaId;
  const studentRa = parsed.studentRa ?? parsed.ra;
  const studentName = parsed.studentName ?? parsed.name ?? parsed.aluno;
  const studentId = parsed.studentId;
  const examId = parsed.examId;
  const examVersion = parsed.examVersion ?? parsed.versao;
  const stage = parsed.stage;

  // 7. Checagem de tipos estritos
  const checarTipoString = (nome: string, valor: any, maxLen: number, minLen: number = 1, obrigatorio: boolean = true) => {
    if (valor === undefined || valor === null || valor === '') {
      if (obrigatorio) {
        erros.push(`Campo obrigatório "${nome}" ausente ou vazio no schema do QR Code.`);
      }
      return;
    }

    if (typeof valor !== 'string') {
      adulterado = true;
      erros.push(`Campo "${nome}" possui tipo inválido (${typeof valor}). Esperado string.`);
      return;
    }

    const trimmed = valor.trim();
    if (trimmed.length < minLen) {
      adulterado = true;
      erros.push(`Campo "${nome}" tem tamanho inferior ao mínimo de ${minLen} caracteres.`);
    } else if (trimmed.length > maxLen) {
      adulterado = true;
      erros.push(`Campo "${nome}" excede o tamanho máximo de ${maxLen} caracteres (recebido: ${trimmed.length}).`);
    } else {
      camposValidados.push(nome);
    }
  };

  checarTipoString('examId', examId, QR_SCHEMA_LIMITS.MAX_EXAM_ID_LENGTH, 2, true);
  checarTipoString('classId / turmaId', classId, QR_SCHEMA_LIMITS.MAX_CLASS_ID_LENGTH, 1, true);
  checarTipoString('studentRa / ra', studentRa, QR_SCHEMA_LIMITS.MAX_STUDENT_RA_LENGTH, QR_SCHEMA_LIMITS.MIN_STUDENT_RA_LENGTH, true);
  checarTipoString('studentName / name', studentName, QR_SCHEMA_LIMITS.MAX_STUDENT_NAME_LENGTH, QR_SCHEMA_LIMITS.MIN_STUDENT_NAME_LENGTH, true);

  if (studentId !== undefined && studentId !== null) {
    checarTipoString('studentId', studentId, QR_SCHEMA_LIMITS.MAX_STUDENT_ID_LENGTH, 1, false);
  }

  if (examVersion !== undefined && examVersion !== null) {
    checarTipoString('examVersion / versao', examVersion, QR_SCHEMA_LIMITS.MAX_EXAM_VERSION_LENGTH, 1, false);
    if (typeof examVersion === 'string' && !EXAM_VERSION_REGEX.test(examVersion.trim())) {
      adulterado = true;
      erros.push(`Versão da prova contém caracteres inválidos: "${examVersion}".`);
    }
  }

  // 8. Validação de formato específico do RA
  if (typeof studentRa === 'string' && studentRa.trim()) {
    const cleanRa = studentRa.trim();
    if (!STUDENT_RA_REGEX.test(cleanRa)) {
      adulterado = true;
      erros.push(`RA do aluno contém caracteres inválidos ou suspeitos: "${cleanRa}".`);
    }
  }

  // 9. Validação de Consistência Interna (Detecção de Adulteração de Aliases)
  if (parsed.studentRa !== undefined && parsed.ra !== undefined) {
    if (String(parsed.studentRa).trim() !== String(parsed.ra).trim()) {
      adulterado = true;
      erros.push(`Inconsistência de integridade: studentRa ("${parsed.studentRa}") difere do alias ra ("${parsed.ra}").`);
    }
  }
  if (parsed.classId !== undefined && parsed.turmaId !== undefined) {
    if (String(parsed.classId).trim() !== String(parsed.turmaId).trim()) {
      adulterado = true;
      erros.push(`Inconsistência de integridade: classId ("${parsed.classId}") difere do alias turmaId ("${parsed.turmaId}").`);
    }
  }
  if (parsed.studentName !== undefined && parsed.name !== undefined) {
    if (String(parsed.studentName).trim() !== String(parsed.name).trim()) {
      adulterado = true;
      erros.push(`Inconsistência de integridade: studentName difere do alias name.`);
    }
  }

  // 10. Validação do Ciclo / Etapa Avaliativa (stage)
  let stageResolved: EvaluationStage = 'N1';
  if (stage !== undefined && stage !== null) {
    if (typeof stage !== 'string') {
      adulterado = true;
      erros.push(`Tipo inválido para "stage": ${typeof stage}. Esperado string.`);
    } else {
      const stageClean = stage.trim().toUpperCase() as EvaluationStage;
      if (!VALID_STAGES.includes(stageClean)) {
        adulterado = true;
        erros.push(`Etapa avaliativa ("stage") inválida ou forjada: "${stage}". Permitidos: ${VALID_STAGES.join(', ')}.`);
      } else {
        stageResolved = stageClean;
        camposValidados.push('stage');
      }
    }
  }

  // 11. Validação de Gabarito Embutido (nq, op, k, pt) contra Adulteração
  if (parsed.nq !== undefined) {
    if (typeof parsed.nq !== 'number' || !Number.isInteger(parsed.nq)) {
      adulterado = true;
      erros.push(`Número de questões (nq) deve ser um número inteiro, recebido: ${typeof parsed.nq} (${parsed.nq}).`);
    } else if (parsed.nq < QR_SCHEMA_LIMITS.MIN_QUESTIONS || parsed.nq > QR_SCHEMA_LIMITS.MAX_QUESTIONS) {
      adulterado = true;
      erros.push(`Número de questões (nq) fora dos limites suportados pelo sistema (${QR_SCHEMA_LIMITS.MIN_QUESTIONS} a ${QR_SCHEMA_LIMITS.MAX_QUESTIONS}): recebido ${parsed.nq}.`);
    } else {
      camposValidados.push('nq');
      const nq = parsed.nq;

      // Se nq estiver presente, valida consistência com op e k
      if (parsed.op !== undefined) {
        if (typeof parsed.op !== 'string') {
          adulterado = true;
          erros.push(`Opções por questão (op) deve ser string, recebido: ${typeof parsed.op}.`);
        } else if (!ANSWER_OPTIONS_REGEX.test(parsed.op)) {
          adulterado = true;
          erros.push(`Opções por questão (op) possui caracteres inválidos: "${parsed.op}". Apenas dígitos de 2 a 5 são permitidos.`);
        } else if (parsed.op.length !== nq) {
          adulterado = true;
          erros.push(`Incompatibilidade no layout: tamanho de op (${parsed.op.length}) não corresponde ao número de questões nq (${nq}).`);
        } else {
          camposValidados.push('op');
        }
      }

      if (parsed.k !== undefined) {
        if (typeof parsed.k !== 'string') {
          adulterado = true;
          erros.push(`Chave de gabarito embutido (k) deve ser string, recebido: ${typeof parsed.k}.`);
        } else if (!ANSWER_KEY_LETTERS_REGEX.test(parsed.k)) {
          adulterado = true;
          erros.push(`Chave de gabarito embutido (k) possui caracteres inválidos (apenas letras alfabéticas A-Z são permitidas).`);
        } else if (parsed.k.length < nq) {
          adulterado = true;
          erros.push(`Chave de gabarito embutido (k) possui tamanho insuficiente (${parsed.k.length}) para ${nq} questões.`);
        } else {
          camposValidados.push('k');
        }
      }

      if (parsed.pt !== undefined) {
        if (typeof parsed.pt !== 'string') {
          adulterado = true;
          erros.push(`Pontuações embutidas (pt) deve ser string formatada, recebido: ${typeof parsed.pt}.`);
        } else if (parsed.pt.length > QR_SCHEMA_LIMITS.MAX_PT_STRING_LENGTH) {
          adulterado = true;
          erros.push(`Pontuações embutidas (pt) excede o tamanho máximo de ${QR_SCHEMA_LIMITS.MAX_PT_STRING_LENGTH} caracteres.`);
        } else {
          const partes = parsed.pt.split(',').map(Number);
          const pontosInvalidos = partes.some((p: number) => isNaN(p) || p <= 0 || p > 10.0);
          if (pontosInvalidos) {
            adulterado = true;
            erros.push(`Valores numéricos de pontuação (pt) corrompidos ou fora dos limites aceitáveis (0.05 a 10.0).`);
          } else {
            camposValidados.push('pt');
          }
        }
      }
    }
  }

  // 12. Consolidação do Resultado
  if (erros.length > 0) {
    const motivo = adulterado
      ? `Tentativa de adulteração detectada: ${erros[0]}`
      : `Violação de schema: ${erros[0]}`;

    return {
      valido: false,
      adulterado,
      erros,
      motivo
    };
  }

  // 13. Sanitização e Construção dos Payloads Validados
  const cleanClassId = String(classId).trim();
  const cleanRa = String(studentRa).trim();
  const cleanName = String(studentName).trim();
  const cleanExamId = String(examId).trim();
  const cleanExamVersion = String(examVersion || 'A').trim().toUpperCase();
  const cleanStudentId = String(studentId || `alu_${cleanRa}`).trim();
  const cleanClassName = parsed.className ? String(parsed.className).trim() : `Turma ${cleanClassId}`;
  const cleanTeacherId = parsed.teacherId ? String(parsed.teacherId).trim() : '';

  const cardPayload: CardPayload = {
    examId: cleanExamId,
    classId: cleanClassId,
    className: cleanClassName,
    teacherId: cleanTeacherId,
    studentId: cleanStudentId,
    studentName: cleanName,
    studentRa: cleanRa,
    stage: stageResolved,
    system: 'SGP-CATOLICA',
    turmaId: cleanClassId,
    name: cleanName,
    ra: cleanRa,
    examVersion: cleanExamVersion,
    ...(parsed.nq && parsed.k
      ? {
          nq: Number(parsed.nq),
          op: String(parsed.op || ''),
          k: String(parsed.k),
          pt: parsed.pt ? String(parsed.pt) : undefined
        }
      : {})
  };

  const securePayload: SecureQrPayload = {
    system: 'SGP-CATOLICA',
    examId: cleanExamId,
    studentId: cleanStudentId,
    ra: cleanRa,
    name: cleanName,
    turmaId: cleanClassId,
    examVersion: cleanExamVersion,
    classId: cleanClassId,
    className: cleanClassName,
    teacherId: cleanTeacherId,
    studentName: cleanName,
    studentRa: cleanRa,
    stage: stageResolved
  };

  return {
    valido: true,
    adulterado: false,
    erros: [],
    cardPayload,
    securePayload,
    camposValidados
  };
}
