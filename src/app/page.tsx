'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { OmrSheet } from '@/components/omr/OmrSheet';
import { ExamVersionLayout, Question } from '@/types';
import { 
  BookOpen, 
  Users, 
  Sliders, 
  Printer, 
  BarChart3, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  FileText,
  ArrowRight,
  Trash2,
  GripVertical,
  Check,
  Tag,
  GraduationCap
} from 'lucide-react';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<'montador' | 'turmas' | 'impressao' | 'relatorios'>('montador');
  
  // Estado do Banco de Questões
  const [bancoQuestoes, setBancoQuestoes] = useState<Question[]>([
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual camada é responsável exclusiva pelo isolamento do acesso ao banco de dados MySQL?',
      pontuacao: 2.5,
      tags: ['Arquitetura', 'Backend'],
      alternativas: [
        { id: 'alt_1_1', letraOriginal: 'A', texto: 'Repositório (Repository)', correta: true },
        { id: 'alt_1_2', letraOriginal: 'B', texto: 'Controle (Controller)', correta: false },
        { id: 'alt_1_3', letraOriginal: 'C', texto: 'Serviço (Service)', correta: false },
        { id: 'alt_1_4', letraOriginal: 'D', texto: 'Rota (Router)', correta: false },
        { id: 'alt_1_5', letraOriginal: 'E', texto: 'Model (Entidade)', correta: false }
      ]
    },
    {
      id: 'q2',
      tipo: 'objetiva',
      enunciado: 'No contexto de persistência de versões (ExamVersion), por que a ordem das alternativas deve ser materializada no banco?',
      pontuacao: 2.5,
      tags: ['Persistência', 'OMR'],
      alternativas: [
        { id: 'alt_2_1', letraOriginal: 'A', texto: 'Para o leitor óptico relacionar a letra assinalada com a alternativa correta.', correta: true },
        { id: 'alt_2_2', letraOriginal: 'B', texto: 'Para reduzir o tamanho do banco de dados.', correta: false },
        { id: 'alt_2_3', letraOriginal: 'C', texto: 'Apenas para formatar a margem visual da folha de prova.', correta: false },
        { id: 'alt_2_4', letraOriginal: 'D', texto: 'Não é necessário persistir o layout gerado.', correta: false }
      ]
    },
    {
      id: 'q3',
      tipo: 'objetiva',
      enunciado: 'Qual estratégia permite o funcionamento offline da leitura de gabaritos sem falha de concorrência?',
      pontuacao: 2.5,
      tags: ['Mobile', 'Offline'],
      alternativas: [
        { id: 'alt_3_1', letraOriginal: 'A', texto: 'Cache local de gabarito e sincronização idempotente via clientCorrectionId.', correta: true },
        { id: 'alt_3_2', letraOriginal: 'B', texto: 'Bloqueio total do aplicativo até restabelecer a conexão.', correta: false },
        { id: 'alt_3_3', letraOriginal: 'C', texto: 'Processamento exclusivo na nuvem em tempo real.', correta: false }
      ]
    },
    {
      id: 'q4',
      tipo: 'discursiva',
      enunciado: 'Explique a diferença de fluxo entre provas geradas "Com Identificação" e "Sem Identificação" nominal.',
      pontuacao: 2.5,
      tags: ['LGPD', 'Fluxo']
    }
  ]);

  // Questões Selecionadas para a Prova em Montagem
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<Question[]>([bancoQuestoes[0], bancoQuestoes[1]]);
  const [tituloProva, setTituloProva] = useState('Avaliação Escrita N1 - Arquitetura de Software');
  const [turmaDestino, setTurmaDestino] = useState('turma-101');
  const [buscaQuestao, setBuscaQuestao] = useState('');

  // Configurações de Impressão e Versões
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleAlt, setShuffleAlt] = useState(true);
  const [withId, setWithId] = useState(true);
  const [versions, setVersions] = useState<ExamVersionLayout[]>([]);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);

  // Modal de Nova Questão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novoEnunciado, setNovoEnunciado] = useState('');
  const [novoTipo, setNovoTipo] = useState<'objetiva' | 'discursiva'>('objetiva');
  const [novaPontuacao, setNovaPontuacao] = useState(2.5);
  const [novasTags, setNovasTags] = useState('Geral');
  const [alternativasTemp, setAlternativasTemp] = useState([
    { texto: '', correta: true },
    { texto: '', correta: false },
    { texto: '', correta: false },
    { texto: '', correta: false }
  ]);

  const pontuacaoTotal = questoesSelecionadas.reduce((acc, q) => acc + q.pontuacao, 0);

  const adicionarNaProva = (q: Question) => {
    if (questoesSelecionadas.some(item => item.id === q.id)) return;
    if (questoesSelecionadas.length >= 20) {
      alert('Limite máximo de 20 questões por prova atingido!');
      return;
    }
    setQuestoesSelecionadas([...questoesSelecionadas, q]);
  };

  const removerDaProva = (id: string) => {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== id));
  };

  const salvarNovaQuestao = () => {
    if (!novoEnunciado.trim()) return;

    const novaQ: Question = {
      id: `q_${Date.now()}`,
      tipo: novoTipo,
      enunciado: novoEnunciado,
      pontuacao: novaPontuacao,
      tags: novasTags.split(',').map(t => t.trim()),
      alternativas: novoTipo === 'objetiva' ? alternativasTemp.map((alt, idx) => ({
        id: `alt_${Date.now()}_${idx}`,
        letraOriginal: String.fromCharCode(65 + idx),
        texto: alt.texto || `Alternativa ${String.fromCharCode(65 + idx)}`,
        correta: alt.correta
      })) : undefined
    };

    setBancoQuestoes([novaQ, ...bancoQuestoes]);
    setIsModalOpen(false);
    setNovoEnunciado('');
  };

  const gerarVersoesProva = async () => {
    try {
      const res = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shuffleQuestions: shuffleQ,
          shuffleAlternatives: shuffleAlt,
          withStudentIdentification: withId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
        setCurrentTab('impressao');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const questoesFiltradas = bancoQuestoes.filter(q => 
    q.enunciado.toLowerCase().includes(buscaQuestao.toLowerCase()) ||
    q.tags.some(t => t.toLowerCase().includes(buscaQuestao.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* SIDEBAR DE NAVEGAÇÃO */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between shrink-0 print:hidden shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5">
            <div className="w-10 h-10 rounded-xl bg-catolica-primary flex items-center justify-center font-black text-white text-xl shadow-lg shadow-catolica-primary/40">
              C
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white">SGP Católica</h2>
              <p className="text-[11px] text-slate-400 font-medium">Gestão & OMR Studio</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'montador', label: 'Montador de Provas', icon: BookOpen },
              { id: 'turmas', label: 'Gestão de Turmas', icon: Users },
              { id: 'impressao', label: 'Gabaritos & Impressão', icon: Printer },
              { id: 'relatorios', label: 'Relatórios de Notas', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? 'bg-catolica-primary text-white shadow-md shadow-catolica-primary/30 translate-x-1' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300">Católica SC - Campus Jaraguá</p>
          <p>Projeto de Arquitetura de Software</p>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        <div className="print:hidden">
          <Header currentTab={currentTab} />
        </div>

        {/* ========================================================================= */}
        {/* ABA 1: MONTADOR SPLIT-SCREEN (NOTA 10) */}
        {/* ========================================================================= */}
        {currentTab === 'montador' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUNA ESQUERDA: BANCO DE QUESTÕES */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Banco de Questões</h3>
                    <p className="text-xs text-slate-500">Selecione para incluir no caderno da prova</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-catolica-primary text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-catolica-dark transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nova Questão
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Filtrar questões por enunciado ou tag..."
                    value={buscaQuestao}
                    onChange={(e) => setBuscaQuestao(e.target.value)}
                    className="bg-transparent text-xs w-full outline-none"
                  />
                </div>
              </div>

              {/* LISTA DE CARDS DO BANCO */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {questoesFiltradas.map((q) => {
                  const jaAdicionada = questoesSelecionadas.some(item => item.id === q.id);
                  return (
                    <div 
                      key={q.id}
                      className={`bg-white p-5 rounded-2xl border transition-all ${
                        jaAdicionada ? 'border-catolica-primary/40 bg-catolica-light/30' : 'border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                            {q.id.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {q.tipo}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            {q.pontuacao.toFixed(1)} pts
                          </span>
                        </div>

                        <button
                          onClick={() => adicionarNaProva(q)}
                          disabled={jaAdicionada}
                          className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition ${
                            jaAdicionada 
                              ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                              : 'bg-slate-900 text-white hover:bg-catolica-primary'
                          }`}
                        >
                          {jaAdicionada ? <><Check className="w-3 h-3" /> Na Prova</> : <><Plus className="w-3 h-3" /> Adicionar</>}
                        </button>
                      </div>

                      <p className="text-xs text-slate-800 font-medium leading-relaxed mb-3">
                        {q.enunciado}
                      </p>

                      <div className="flex gap-1.5 flex-wrap">
                        {q.tags.map(t => (
                          <span key={t} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLUNA DIREITA: MONTADOR DA AVALIAÇÃO EM TEMPO REAL */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                
                {/* CABEÇALHO DO MONITOR */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Resumo da Avaliação</h3>
                    <p className="text-xs text-slate-500">Configuração de turma e embaralhamento</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block uppercase">Pontuação Total:</span>
                    <strong className={`text-lg font-black ${pontuacaoTotal === 10 ? 'text-emerald-600' : 'text-catolica-primary'}`}>
                      {pontuacaoTotal.toFixed(1)} / 10.0 pts
                    </strong>
                  </div>
                </div>

                {/* INPUTS DE METADADOS */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Título da Avaliação:</label>
                    <input 
                      type="text" 
                      value={tituloProva}
                      onChange={(e) => setTituloProva(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-catolica-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Turma:</label>
                      <select 
                        value={turmaDestino}
                        onChange={(e) => setTurmaDestino(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 outline-none"
                      >
                        <option value="turma-101">Engenharia de Software IV (2026/2)</option>
                        <option value="turma-102">Sistemas de Informação II (2026/2)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Status da Prova:</label>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl w-full">
                        ● Rascunho (Draft)
                      </span>
                    </div>
                  </div>
                </div>

                {/* OPÇÕES DE EMBARALHAMENTO */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Regras de Versões & OMR:</span>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={shuffleQ} 
                      onChange={(e) => setShuffleQ(e.target.checked)} 
                      className="w-3.5 h-3.5 accent-catolica-primary" 
                    />
                    Embaralhar ordem das questões
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={shuffleAlt} 
                      onChange={(e) => setShuffleAlt(e.target.checked)} 
                      className="w-3.5 h-3.5 accent-catolica-primary" 
                    />
                    Embaralhar alternativas (A, B, C, D, E)
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={withId} 
                      onChange={(e) => setWithId(e.target.checked)} 
                      className="w-3.5 h-3.5 accent-catolica-primary" 
                    />
                    Identificação Nominal com QR Code do Estudante
                  </label>
                </div>

                {/* LISTA DE QUESTÕES ADICIONADAS */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase">
                      Questões no Caderno ({questoesSelecionadas.length} / 20):
                    </span>
                  </div>

                  {questoesSelecionadas.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                      Nenhuma questão adicionada. Selecione questões na coluna esquerda.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {questoesSelecionadas.map((q, idx) => (
                        <div 
                          key={q.id}
                          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs hover:border-slate-300 transition"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <span className="font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[280px]">{q.enunciado}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-catolica-primary">{q.pontuacao.toFixed(1)} pts</span>
                            <button 
                              onClick={() => removerDaProva(q.id)}
                              className="text-slate-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTÃO DE GERAÇÃO */}
                <button
                  onClick={gerarVersoesProva}
                  disabled={questoesSelecionadas.length === 0}
                  className="w-full bg-catolica-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-catolica-dark transition shadow-lg shadow-catolica-primary/30 disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" /> Gerar Prova Consolidada & Gabaritos OMR
                </button>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: TURMAS */}
        {/* ========================================================================= */}
        {currentTab === 'turmas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800">Turmas & Matrículas</h3>
                <p className="text-xs text-slate-500">Gestão de códigos de convite e estudantes matriculados</p>
              </div>
              <button 
                onClick={() => alert('Criação de turma conectada na N2')}
                className="bg-catolica-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Criar Turma
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold bg-catolica-light text-catolica-primary px-3 py-1 rounded-lg border border-catolica-primary/20">
                    2026/2
                  </span>
                  <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg border text-slate-700">
                    Código: <strong>CAT-8842</strong>
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-800">Engenharia de Software IV</h4>
                <p className="text-xs text-slate-500">Arquitetura e Projeto de Software</p>
                <div className="border-t pt-3 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Alunos Matriculados:</span>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p>• Gabriel Menezes (20241001)</p>
                    <p>• Beatriz Ramos (20241002)</p>
                    <p>• Lucas Martins (20241003)</p>
                    <p>• Fernanda Lima (20241004)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: GABARITOS & IMPRESSÃO */}
        {/* ========================================================================= */}
        {currentTab === 'impressao' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-700 uppercase">Selecionar Versão / Aluno:</label>
                <select
                  value={selectedVersionIdx}
                  onChange={(e) => setSelectedVersionIdx(Number(e.target.value))}
                  className="p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 outline-none"
                >
                  {versions.map((v, idx) => (
                    <option key={idx} value={idx}>
                      {v.student ? `${v.student.nome} — Versão ${v.versionLetter}` : `Versão ${v.versionLetter} (Anônima)`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="bg-catolica-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-catolica-dark transition shadow-md shadow-catolica-primary/20"
              >
                <Printer className="w-4 h-4" /> Imprimir Folha de Resposta / Prova
              </button>
            </div>

            {versions[selectedVersionIdx] ? (
              <OmrSheet version={versions[selectedVersionIdx]} />
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Gere a prova no montador para visualizar o layout OMR.
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: RELATÓRIOS */}
        {/* ========================================================================= */}
        {currentTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800">Relatório de Correções Automatizadas</h3>
                  <p className="text-xs text-slate-500">Notas atribuídas via leitura óptica OMR</p>
                </div>
                <button 
                  onClick={() => alert('Download do CSV disparado')}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Planilha (.CSV)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Média da Turma:</span>
                  <strong className="text-xl font-black text-slate-900">7.75</strong>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Taxa de Acertos Q1:</span>
                  <strong className="text-xl font-black text-emerald-600">75%</strong>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Distrator mais marcado (Q1):</span>
                  <strong className="text-xl font-black text-catolica-primary">B (Controller)</strong>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE CRIAÇÃO DE QUESTÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Cadastrar Nova Questão</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Enunciado da Questão:</label>
                <textarea 
                  rows={3}
                  value={novoEnunciado}
                  onChange={(e) => setNovoEnunciado(e.target.value)}
                  placeholder="Digite o enunciado detalhado aqui..."
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-catolica-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo:</label>
                  <select 
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                    className="w-full p-2.5 border rounded-xl bg-slate-50 outline-none"
                  >
                    <option value="objetiva">Múltipla Escolha (Objetiva)</option>
                    <option value="discursiva">Discursiva</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pontuação:</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={novaPontuacao}
                    onChange={(e) => setNovaPontuacao(Number(e.target.value))}
                    className="w-full p-2.5 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tags:</label>
                  <input 
                    type="text" 
                    value={novasTags}
                    onChange={(e) => setNovasTags(e.target.value)}
                    className="w-full p-2.5 border rounded-xl outline-none"
                  />
                </div>
              </div>

              {novoTipo === 'objetiva' && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="block font-bold text-slate-700">Alternativas (Marque a correta):</label>
                  {alternativasTemp.map((alt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="altCorreta" 
                        checked={alt.correta}
                        onChange={() => {
                          const updated = alternativasTemp.map((a, i) => ({ ...a, correta: i === idx }));
                          setAlternativasTemp(updated);
                        }}
                        className="accent-catolica-primary"
                      />
                      <span className="font-bold text-slate-500 w-4">{String.fromCharCode(65 + idx)}:</span>
                      <input 
                        type="text" 
                        placeholder={`Texto da alternativa ${String.fromCharCode(65 + idx)}`}
                        value={alt.texto}
                        onChange={(e) => {
                          const updated = [...alternativasTemp];
                          updated[idx].texto = e.target.value;
                          setAlternativasTemp(updated);
                        }}
                        className="flex-1 p-2 border rounded-lg outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarNovaQuestao}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-catolica-primary text-white hover:bg-catolica-dark transition"
              >
                Salvar Questão
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}