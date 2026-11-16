'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { AlunoModel } from '@/models/AlunoModel';
import { TurmaModel } from '@/models/TurmaModel';
import { importarAlunosDaPlanilha, AlunoImportResult } from '@/services/AlunoImportService';

interface ImportarAlunosProps {
  alunos: AlunoModel[];
  turmas: TurmaModel[];
  onImportComplete: () => Promise<void> | void;
}

export function ImportarAlunos({ alunos, turmas, onImportComplete }: ImportarAlunosProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aberto, setAberto] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [resultado, setResultado] = useState<AlunoImportResult | null>(null);
  const [processando, setProcessando] = useState(false);
  const [importado, setImportado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const resetar = () => {
    setArquivo(null);
    setResultado(null);
    setMensagem(null);
    setImportado(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const fechar = () => {
    if (processando) return;
    setAberto(false);
    resetar();
  };

  const selecionarArquivo = async (file: File | undefined) => {
    if (!file) return;
    setMensagem(null);
    setArquivo(file);
    try {
      const parsed = importarAlunosDaPlanilha(await file.arrayBuffer(), turmas, alunos);
      setResultado(parsed);
    } catch (error: any) {
      setResultado(null);
      setMensagem(error?.message || 'Não foi possível ler o arquivo.');
    }
  };

  const baixarModelo = () => {
    const csv = 'nome,ra,turma\nJoão da Silva,20260001,Nome da turma ou código\n';
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo-importacao-alunos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importar = async () => {
    if (!arquivo || !resultado || resultado.validos.length === 0) return;
    setProcessando(true);
    setMensagem(null);
    try {
      const formData = new FormData();
      formData.append('file', arquivo);
      const response = await fetch('/api/alunos/importar', { method: 'POST', body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Falha ao importar alunos.');

      await onImportComplete();
      setMensagem(`${body.importados} aluno(s) importado(s) com sucesso.`);
      setImportado(true);
      setResultado({ ...resultado, invalidos: body.invalidos || resultado.invalidos });
    } catch (error: any) {
      setMensagem(error?.message || 'Falha ao importar alunos.');
    } finally {
      setProcessando(false);
    }
  };

  const baixarErros = () => {
    if (!resultado || resultado.invalidos.length === 0) return;
    const csv = [
      'linha,nome,ra,turma,erros',
      ...resultado.invalidos.map(row => [
        row.linha,
        row.nome,
        row.ra,
        row.turmaInformada,
        row.erros.join(' | ')
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-erros-importacao-alunos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="bg-white text-catolica-primary border border-catolica-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-catolica-light transition"
      >
        <Upload className="w-4 h-4" /> Importar Alunos
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-900">Importar alunos por planilha</h3>
                <p className="text-xs text-slate-500 mt-1">Use as colunas nome, RA e turma.</p>
              </div>
              <button onClick={fechar} className="p-1 text-slate-400 hover:text-slate-700" aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <button onClick={baixarModelo} className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 hover:bg-slate-200">
                <Download size={15} /> Baixar modelo CSV
              </button>
              <label className="px-3 py-2 rounded-lg bg-catolica-primary text-white text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-catolica-dark">
                <FileSpreadsheet size={15} /> Selecionar arquivo
                <input ref={inputRef} type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={event => selecionarArquivo(event.target.files?.[0])} />
              </label>
              {arquivo && <span className="text-xs text-slate-500">{arquivo.name}</span>}
            </div>

            {mensagem && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">{mensagem}</div>
            )}

            {resultado && (
              <>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 border p-3"><strong className="block text-lg text-slate-900">{resultado.linhas.length}</strong>Total de linhas</div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3"><strong className="block text-lg text-emerald-700">{resultado.validos.length}</strong>Válidas</div>
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3"><strong className="block text-lg text-red-700">{resultado.invalidos.length}</strong>Com erro</div>
                </div>

                <div className="border rounded-xl overflow-hidden">
                  <div className="max-h-72 overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-slate-100 text-slate-500 uppercase">
                        <tr><th className="p-3">Linha</th><th className="p-3">Nome</th><th className="p-3">RA</th><th className="p-3">Turma</th><th className="p-3">Status</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {resultado.linhas.map(row => (
                          <tr key={row.linha}>
                            <td className="p-3">{row.linha}</td><td className="p-3 font-semibold">{row.nome || '—'}</td><td className="p-3 font-mono">{row.ra || '—'}</td><td className="p-3">{row.turmaNome || row.turmaInformada || '—'}</td>
                            <td className="p-3">{row.valido ? <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 size={14} /> Válida</span> : <span className="text-red-700 flex items-start gap-1"><AlertTriangle size={14} /> {row.erros.join(' ')}</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between items-center border-t pt-4">
              <button onClick={baixarErros} disabled={!resultado || resultado.invalidos.length === 0} className="text-xs font-bold text-red-700 disabled:text-slate-300">Baixar relatório de erros</button>
              <div className="flex gap-2">
                <button onClick={fechar} disabled={processando} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">Fechar</button>
                <button onClick={importar} disabled={processando || importado || !resultado || resultado.validos.length === 0} className="px-4 py-2 rounded-lg bg-catolica-primary text-white text-xs font-bold disabled:opacity-50">{processando ? 'Importando...' : importado ? 'Importação concluída' : 'Confirmar importação'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

