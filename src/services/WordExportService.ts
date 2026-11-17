
import type { ProvaMontadaRegistro, Question } from '@/types';

/**
 * TSK-53: Exportação de cadernos de questões em Word (.docx).
 * Gera um arquivo OOXML sem dependências adicionais.
 *
 * Codificação UTF-8 compatível com o ambiente de testes Jest.
 */
const encoder = {
  encode: (texto: string): Uint8Array => {
    const bytes = unescape(encodeURIComponent(texto));
    return Uint8Array.from(bytes, caractere => caractere.charCodeAt(0));
  }
};

const xml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const paragraph = (value: unknown, bold = false): string =>
  `<w:p><w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${xml(value)}</w:t></w:r></w:p>`;

/**
 * Calcula o CRC32 necessário para os arquivos ZIP.
 */
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Cria um contêiner ZIP válido para o formato DOCX.
 * Utiliza entradas STORE, sem compressão.
 */
function zip(files: Array<[string, string]>): Uint8Array {
  const chunks: Uint8Array[] = [];
  const directory: Uint8Array[] = [];

  let offset = 0;

  const u16 = (
    view: DataView,
    pos: number,
    value: number
  ): void => {
    view.setUint16(pos, value, true);
  };

  const u32 = (
    view: DataView,
    pos: number,
    value: number
  ): void => {
    view.setUint32(pos, value >>> 0, true);
  };

  for (const [name, content] of files) {
    const filename = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);

    const local = new Uint8Array(30 + filename.length);
    const lv = new DataView(local.buffer);

    u32(lv, 0, 0x04034b50);
    u16(lv, 4, 20);
    u16(lv, 6, 0x0800);

    u32(lv, 14, crc);
    u32(lv, 18, data.length);
    u32(lv, 22, data.length);

    u16(lv, 26, filename.length);
    local.set(filename, 30);

    chunks.push(local, data);

    const central = new Uint8Array(46 + filename.length);
    const cv = new DataView(central.buffer);

    u32(cv, 0, 0x02014b50);
    u16(cv, 4, 20);
    u16(cv, 6, 20);
    u16(cv, 8, 0x0800);

    u32(cv, 16, crc);
    u32(cv, 20, data.length);
    u32(cv, 24, data.length);

    u16(cv, 28, filename.length);
    u32(cv, 42, offset);

    central.set(filename, 46);
    directory.push(central);

    offset += local.length + data.length;
  }

  const directorySize = directory.reduce(
    (sum, chunk) => sum + chunk.length,
    0
  );

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);

  u32(ev, 0, 0x06054b50);
  u16(ev, 8, files.length);
  u16(ev, 10, files.length);

  u32(ev, 12, directorySize);
  u32(ev, 16, offset);

  const result = new Uint8Array(
    offset + directorySize + end.length
  );

  let cursor = 0;

  for (const chunk of [...chunks, ...directory, end]) {
    result.set(chunk, cursor);
    cursor += chunk.length;
  }

  return result;
}

/**
 * Serviço responsável pela exportação de provas em Word.
 */
export class WordExportService {
  /**
   * Constrói o documento DOCX com as questões da prova.
   */
  static construirDocx(
    prova: ProvaMontadaRegistro
  ): Uint8Array {
    if (!prova.questoesSnapshot?.length) {
      throw new Error(
        'A prova não possui questões para exportação.'
      );
    }

    const lines: string[] = [
      paragraph(prova.titulo || 'Avaliação', true),
      paragraph(
        `Turma: ${prova.turmaNome || prova.turmaId || '-'}    ` +
        `Disciplina: ${prova.disciplina || '-'}    ` +
        `Ciclo: ${prova.ciclo}`
      ),
      paragraph(
        'Aluno(a): ____________________________________    Data: ____/____/______'
      ),
      paragraph('')
    ];

    prova.questoesSnapshot.forEach(
      (q: Question, index: number) => {
        const enunciado =
          q.enunciado || q.statement || '';

        lines.push(
          paragraph(
            `${index + 1}. ${enunciado}`,
            true
          )
        );

        const isObjetiva =
          q.tipo === 'objetiva' ||
          q.type === 'OBJECTIVE' ||
          q.type === 'objetiva';

        if (isObjetiva) {
          const alternatives = q.alternativas?.length
            ? q.alternativas.map(a => a.texto)
            : (q.options || []).map(o => o.text);

          alternatives.forEach((alternative, i) => {
            const letra = String.fromCharCode(65 + i);

            lines.push(
              paragraph(`${letra}) ${alternative}`)
            );
          });
        } else {
          lines.push(
            paragraph(
              '____________________________________________________________________________'
            )
          );

          lines.push(
            paragraph(
              '____________________________________________________________________________'
            )
          );
        }

        lines.push(paragraph(''));
      }
    );

    const documentXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
      '<w:body>' +
      lines.join('') +
      '<w:sectPr>' +
      '<w:pgSz w:w="11906" w:h="16838"/>' +
      '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>' +
      '</w:sectPr>' +
      '</w:body>' +
      '</w:document>';

    return zip([
      [
        '[Content_Types].xml',
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
        '</Types>'
      ],
      [
        '_rels/.rels',
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
        '</Relationships>'
      ],
      [
        'word/document.xml',
        documentXml
      ]
    ]);
  }

  /**
   * Faz o download do arquivo Word no navegador.
   */
  static baixarDocx(
    prova: ProvaMontadaRegistro
  ): void {
    const bytes = this.construirDocx(prova);

    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);

    const blob = new Blob(
      [buffer],
      {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;

    const nomeArquivo = (prova.titulo || 'Prova')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .slice(0, 60);

    anchor.download = `Caderno_${nomeArquivo}.docx`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
}
