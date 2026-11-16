/** @jest-environment node */

import { AlunoController } from '@/controllers/AlunoController';

describe('POST /api/alunos/importar', () => {
  it('retorna 400 quando o arquivo não é enviado', async () => {
    const controller = new AlunoController({ importarAlunos: jest.fn() } as any);
    const response = await controller.importAlunos(new Request('http://localhost/api/alunos/importar', {
      method: 'POST',
      body: new FormData()
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Envie um arquivo no campo "file".' });
  });

  it('encaminha o arquivo ao serviço e retorna o relatório da importação', async () => {
    const importarAlunos = jest.fn().mockResolvedValue({
      linhas: [],
      validos: [],
      invalidos: [],
      importados: 0
    });
    const controller = new AlunoController({ importarAlunos } as any);
    const formData = new FormData();
    formData.append('file', new Blob(['nome,ra,turma\nAluno,RA-01,T1'], { type: 'text/csv' }), 'alunos.csv');

    const response = await controller.importAlunos(new Request('http://localhost/api/alunos/importar', {
      method: 'POST',
      body: formData
    }));

    expect(response.status).toBe(200);
    expect(importarAlunos).toHaveBeenCalledWith(expect.any(ArrayBuffer), null);
    expect(await response.json()).toMatchObject({ importados: 0 });
  });
});

