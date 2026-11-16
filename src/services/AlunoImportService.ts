import * as XLSX from 'xlsx';

export interface AlunoImportTurma {
  id: string;
  nome?: string;
  codigoConvite?: string;
}

export interface AlunoImportAlunoExistente {
  ra: string;
}

export interface AlunoImportRow {
  linha: number;
  nome: string;
  ra: string;
  turmaInformada: string;
  turmaId?: string;
  turmaNome?: string;
  valido: boolean;
  erros: string[];
}

export interface AlunoImportResult {
  linhas: AlunoImportRow[];
  validos: AlunoImportRow[];
  invalidos: AlunoImportRow[];
}

type Cell = string | number | boolean | Date | null | undefined;

const normalize = (value: unknown): string => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const normalizeHeader = (value: unknown): string => normalize(value).replace(/[^a-z0-9]/g, '');

const normalizeRa = (value: unknown): string => String(value ?? '').trim().toLowerCase();

const cellToString = (value: Cell): string => {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? '').trim();
};

function readRows(file: ArrayBuffer | Uint8Array): Cell[][] {
  const workbook = XLSX.read(file, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<Cell[]>(sheet, {
    header: 1,
    defval: '',
    raw: true,
    blankrows: false
  });
}

function findColumn(headers: string[], aliases: string[]): number {
  return headers.findIndex(header => aliases.includes(header));
}

function findTurma(value: string, turmas: AlunoImportTurma[]): AlunoImportTurma | undefined {
  const normalizedValue = normalize(value);
  return turmas.find(turma => [turma.id, turma.nome, turma.codigoConvite]
    .some(candidate => candidate && normalize(candidate) === normalizedValue));
}

export function importarAlunosDaPlanilha(
  file: ArrayBuffer | Uint8Array,
  turmas: AlunoImportTurma[],
  alunosExistentes: AlunoImportAlunoExistente[] = []
): AlunoImportResult {
  const rows = readRows(file);
  if (rows.length === 0) {
    throw new Error('O arquivo está vazio.');
  }

  const headers = rows[0].map(normalizeHeader);
  const nomeIndex = findColumn(headers, ['nome', 'nomecompleto', 'name']);
  const raIndex = findColumn(headers, ['ra', 'registroacademico', 'registro', 'matricula']);
  const turmaIndex = findColumn(headers, ['turma', 'turmaid', 'codigodaturma', 'codigoconvite']);

  const missingColumns = [
    nomeIndex < 0 ? 'nome' : null,
    raIndex < 0 ? 'ra' : null,
    turmaIndex < 0 ? 'turma' : null
  ].filter(Boolean) as string[];

  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(', ')}.`);
  }

  const existingRas = new Set(alunosExistentes.map(aluno => normalizeRa(aluno.ra)).filter(Boolean));
  const importedRas = new Set<string>();
  const parsedRows: AlunoImportRow[] = [];

  rows.slice(1).forEach((row, index) => {
    const linha = index + 2;
    const nome = cellToString(row[nomeIndex]);
    const ra = cellToString(row[raIndex]);
    const turmaInformada = cellToString(row[turmaIndex]);
    const erros: string[] = [];
    const normalizedRa = normalizeRa(ra);

    if (!nome) erros.push('Nome obrigatório.');
    if (!normalizedRa) erros.push('RA obrigatório.');

    if (normalizedRa && existingRas.has(normalizedRa)) {
      erros.push('RA já cadastrado.');
    } else if (normalizedRa && importedRas.has(normalizedRa)) {
      erros.push('RA duplicado no arquivo.');
    }

    const turma = turmaInformada ? findTurma(turmaInformada, turmas) : undefined;
    if (!turmaInformada) {
      erros.push('Turma obrigatória.');
    } else if (!turma) {
      erros.push('Turma não encontrada ou não pertence à lista disponível.');
    }

    if (normalizedRa) importedRas.add(normalizedRa);

    parsedRows.push({
      linha,
      nome,
      ra,
      turmaInformada,
      turmaId: turma?.id,
      turmaNome: turma?.nome,
      valido: erros.length === 0,
      erros
    });
  });

  const linhas = parsedRows.filter(row => row.nome || row.ra || row.turmaInformada);
  return {
    linhas,
    validos: linhas.filter(row => row.valido),
    invalidos: linhas.filter(row => !row.valido)
  };
}

