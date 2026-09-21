'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { LoginScreen, UserRole } from '@/components/auth/LoginScreen';
import { Question } from '@/types';
import { 
  BookOpen, 
  Users, 
  Printer, 
  BarChart3, 
  Plus, 
  PlusCircle,
  Search, 
  Download, 
  Trash2, 
  Check, 
  AlertCircle,
  Menu,
  X,
  LogOut,
  FileText,
  Pencil
} from 'lucide-react';

interface AlternativaCadastro {
  letra: string;
  texto: string;
  correta: boolean;
}

export default function Home() {
  const [session, setSession] = useState<{ role: UserRole; name: string } | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'montador' | 'turmas' | 'impressao' | 'relatorios'>('montador');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedSession = window.localStorage.getItem('sgp-mock-session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        window.localStorage.removeItem('sgp-mock-session');
      }
    }
    setSessionLoaded(true);
  }, []);

  const handleLogin = (role: UserRole, name: string) => {
    const newSession = { role, name };
    window.localStorage.setItem('sgp-mock-session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('sgp-mock-session');
    setSession(null);
  };
  
  // Banco de Questões Integrado
  const [bancoQuestoes, setBancoQuestoes] = useState<Question[]>([
    {
      id: 'q1',
      tipo: 'objetiva',
      enunciado: 'Qual camada é responsável exclusiva pelo isolamento do acesso ao banco de dados no padrão em 5 camadas?',
      pontuacao: 2.5,
      tags: ['Arquitetura', 'Backend', 'PostgreSQL'],
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
      enunciado: 'No contexto de persistência de versões de avaliação (ExamVersion), por que a ordem das alternativas deve ser materializada no banco?',
      pontuacao: 2.5,
      tags: ['Persistência', 'OMR', 'Algoritmos'],
      alternativas: [
        { id: 'alt_2_1', letraOriginal: 'A', texto: 'Para o leitor óptico relacionar a letra assinalada com a alternativa original correta.', correta: true },
        { id: 'alt_2_2', letraOriginal: 'B', texto: 'Para economizar memória no cache do aplicativo móvel.', correta: false },
        { id: 'alt_2_3', letraOriginal: 'C', texto: 'Apenas para formatar a margem visual do documento impresso.', correta: false },
        { id: 'alt_2_4', letraOriginal: 'D', texto: 'Para permitir ao estudante visualizar o gabarito antes da publicação.', correta: false }
      ]
    },
    {
      id: 'q3',
      tipo: 'objetiva',
      enunciado: 'Qual estratégia garante que a leitura de cartões-resposta funcione em locais sem acesso à internet no momento da correção?',
      pontuacao: 2.5,
      tags: ['Offline', 'Mobile', 'Sincronização'],
      alternativas: [
        { id: 'alt_3_1', letraOriginal: 'A', texto: 'Cache local prévio do snapshot do gabarito e fila idempotente via clientCorrectionId.', correta: true },
        { id: 'alt_3_2', letraOriginal: 'B', texto: 'Bloqueio total do app até o sinal 4G/Wi-Fi ser restabelecido.', correta: false },
        { id: 'alt_3_3', letraOriginal: 'C', texto: 'Envio assíncrono por e-mail para processamento no servidor.', correta: false },
        { id: 'alt_3_4', letraOriginal: 'D', texto: 'Uso de processamento de visão exclusivamente na nuvem.', correta: false }
      ]
    },
    {
      id: 'q4',
      tipo: 'discursiva',
      enunciado: 'Explique a importância da separação física entre a folha de respostas OMR e o caderno descritivo de questões para o estudante.',
      pontuacao: 2.5,
      tags: ['Pedagógico', 'OMR', 'Avaliação']
    }
  ]);

  // Montador da Avaliação (Questões ativas no Caderno)
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<Question[]>([bancoQuestoes[0], bancoQuestoes[1], bancoQuestoes[2], bancoQuestoes[3]]);
  const [tituloProva, setTituloProva] = useState('Avaliação Escrita N2 - Arquitetura de Software');
  const [buscaQuestao, setBuscaQuestao] = useState('');
  
  // Regras de Impressão e Embaralhamento
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleAlt, setShuffleAlt] = useState(true);
  const [withId, setWithId] = useState(true);

  // Modal de Cadastro/Edição de Questão
  const [modalAberto, setModalAberto] = useState(false);
  const [questaoEmEdicaoId, setQuestaoEmEdicaoId] = useState<string | null>(null);
  const [novoEnunciado, setNovoEnunciado] = useState('');
  const [novoTipo, setNovoTipo] = useState<'objetiva' | 'discursiva'>('objetiva');
  const [novaPontuacao, setNovaPontuacao] = useState(2.5);
  const [novasTags, setNovasTags] = useState('N2, PostgreSQL, Arquitetura');
  const [alternativasCadastro, setAlternativasCadastro] = useState<AlternativaCadastro[]>([
    { letra: 'A', texto: '', correta: true },
    { letra: 'B', texto: '', correta: false },
    { letra: 'C', texto: '', correta: false },
    { letra: 'D', texto: '', correta: false },
    { letra: 'E', texto: '', correta: false }
  ]);

  // Versões e Alunos
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);

  const historicoAlunos = [
    { id: 'alu-01', nome: 'Gabriel Menezes', matricula: '20241001', n1: 9.5, n2: 8.5, n3: 9.0, media: 9.0, status: 'Aprovado' },
    { id: 'alu-02', nome: 'Beatriz Ramos', matricula: '20241002', n1: 7.5, n2: 8.0, n3: 8.5, media: 8.0, status: 'Aprovado' },
    { id: 'alu-03', nome: 'Lucas Martins', matricula: '20241003', n1: 4.5, n2: 5.0, n3: 6.0, media: 5.2, status: 'Exame' },
    { id: 'alu-04', nome: 'Fernanda Lima', matricula: '20241004', n1: 10.0, n2: 9.5, n3: 10.0, media: 9.8, status: 'Aprovado' }
  ];

  const estatisticasQuestoes = [
    {
      id: 'Q1',
      enunciado: 'Isolamento de banco via Repositório (PostgreSQL)',
      totalRespostas: 40,
      taxaAcerto: 77.5,
      taxaErro: 22.5,
      distratorMaisMarcado: 'B (Controller) - 15%',
      diagnostico: 'Alunos confundiram a camada de controle/orquestração com a de persistência.'
    },
    {
      id: 'Q2',
      enunciado: 'Materialização da matriz de layout OMR no banco',
      totalRespostas: 40,
      taxaAcerto: 85.0,
      taxaErro: 15.0,
      distratorMaisMarcado: 'C (Formatação) - 10%',
      diagnostico: 'Excelente compreensão quanto à integridade das alternativas embaralhadas.'
    },
    {
      id: 'Q3',
      enunciado: 'Operação de correção offline e idempotência',
      totalRespostas: 40,
      taxaAcerto: 70.0,
      taxaErro: 30.0,
      distratorMaisMarcado: 'Apenas Cloud - 20%',
      diagnostico: 'Conceito de tolerância a falhas precisa de reforço em sala.'
    }
  ];

  // Algoritmo de Embaralhamento Pseudo-Aleatório Deterministico por Aluno/Versão
  const questoesEmbaralhadas = useMemo(() => {
    let lista = [...questoesSelecionadas];

    if (shuffleQ) {
      const seed = selectedVersionIdx + 1;
      lista = lista.map((q, i) => ({ q, sortKey: Math.sin(seed * (i + 1)) }))
                   .sort((a, b) => a.sortKey - b.sortKey)
                   .map(item => item.q);
    }

    if (shuffleAlt) {
      lista = lista.map((q, qIdx) => {
        if (q.tipo === 'objetiva' && q.alternativas) {
          const altSeed = (selectedVersionIdx + 1) * 10 + (qIdx + 1);
          const altsShuffled = [...q.alternativas]
            .map((alt, aIdx) => ({ alt, sortKey: Math.cos(altSeed * (aIdx + 1)) }))
            .sort((a, b) => a.sortKey - b.sortKey)
            .map(item => item.alt);
          return { ...q, alternativas: altsShuffled };
        }
        return q;
      });
    }

    return lista;
  }, [questoesSelecionadas, shuffleQ, shuffleAlt, selectedVersionIdx]);

  const pontuacaoTotal = questoesSelecionadas.reduce((acc, q) => acc + q.pontuacao, 0);

  const adicionarNaProva = (q: Question) => {
    if (questoesSelecionadas.some(item => item.id === q.id)) return;
    if (questoesSelecionadas.length >= 20) {
      alert('Limite máximo de 20 questões atingido!');
      return;
    }
    setQuestoesSelecionadas([...questoesSelecionadas, q]);
  };

  const removerDaProva = (id: string) => {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== id));
  };

  const abrirModalNovaQuestao = () => {
    setQuestaoEmEdicaoId(null);
    setNovoEnunciado('');
    setNovoTipo('objetiva');
    setNovaPontuacao(2.5);
    setNovasTags('N2, PostgreSQL, Arquitetura');
    setAlternativasCadastro([
      { letra: 'A', texto: '', correta: true },
      { letra: 'B', texto: '', correta: false },
      { letra: 'C', texto: '', correta: false },
      { letra: 'D', texto: '', correta: false },
      { letra: 'E', texto: '', correta: false }
    ]);
    setModalAberto(true);
  };

  const abrirModalEditarQuestao = (q: Question) => {
    setQuestaoEmEdicaoId(q.id);
    setNovoEnunciado(q.enunciado);
    setNovoTipo(q.tipo);
    setNovaPontuacao(q.pontuacao);
    setNovasTags(q.tags.join(', '));
    if (q.tipo === 'objetiva' && q.alternativas) {
      setAlternativasCadastro(
        ['A', 'B', 'C', 'D', 'E'].map((letra, i) => {
          const altExistente = q.alternativas?.[i];
          return {
            letra,
            texto: altExistente ? altExistente.texto : '',
            correta: altExistente ? !!altExistente.correta : i === 0
          };
        })
      );
    }
    setModalAberto(true);
  };

  const excluirQuestao = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta questão do banco?')) {
      setBancoQuestoes(bancoQuestoes.filter(q => q.id !== id));
      setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== id));
    }
  };

  // Cadastrar / Editar Questão
  const handleSaveQuestaoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEnunciado.trim()) return;

    const questaoFormatada: Question = {
      id: questaoEmEdicaoId || `q_${Date.now()}`,
      tipo: novoTipo,
      enunciado: novoEnunciado,
      pontuacao: Number(novaPontuacao),
      tags: novasTags.split(',').map(t => t.trim()).filter(Boolean),
      alternativas: novoTipo === 'objetiva' ? alternativasCadastro.map((alt, idx) => ({
        id: `alt_${Date.now()}_${idx}`,
        letraOriginal: alt.letra,
        texto: alt.texto,
        correta: alt.correta
      })) : undefined
    };

    if (questaoEmEdicaoId) {
      // Edição de questão existente
      setBancoQuestoes(bancoQuestoes.map(q => q.id === questaoEmEdicaoId ? questaoFormatada : q));
      setQuestoesSelecionadas(questoesSelecionadas.map(q => q.id === questaoEmEdicaoId ? questaoFormatada : q));
    } else {
      // Nova questão: Fica SOMENTE no Banco de Questões (Aguardando inclusão pelo professor)
      setBancoQuestoes([questaoFormatada, ...bancoQuestoes]);
    }

    setModalAberto(false);
  };

  const exportarCSV = () => {
    let csv = "Aluno;Matricula;N1;N2;N3;Media;Status\n";
    historicoAlunos.forEach(r => {
      csv += `${r.nome};${r.matricula};${r.n1.toFixed(1)};${r.n2.toFixed(1)};${r.n3.toFixed(1)};${r.media.toFixed(1)};${r.status}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio_notas_historico_catolica.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const questoesFiltradas = bancoQuestoes.filter(q => 
    q.enunciado.toLowerCase().includes(buscaQuestao.toLowerCase()) ||
    q.tags.some(t => t.toLowerCase().includes(buscaQuestao.toLowerCase()))
  );

  const alunoAtual = historicoAlunos[selectedVersionIdx] || historicoAlunos[0];

  if (!sessionLoaded) return <div className="min-h-screen bg-slate-100" />;

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  if (session.role === 'aluno') {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-8 flex items-center justify-center">
        <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xl shadow-slate-900/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-catolica-light text-catolica-primary"><AlertCircle className="h-7 w-7" /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-catolica-primary">Acesso de aluno</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-800">Olá, {session.name}!</h1>
          <p className="mt-4 text-sm leading-6 text-slate-500">Seu login foi realizado com sucesso. As funcionalidades do portal do aluno ainda estão em construção e não há módulos liberados neste ambiente de teste.</p>
          <button onClick={handleLogout} className="mt-8 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-catolica-primary">Sair da conta</button>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans text-slate-900 md:block md:h-screen">
      
      {/* SIDEBAR */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm print:hidden md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col justify-between bg-slate-900 p-6 text-white shadow-2xl transition-transform duration-300 print:hidden md:h-screen md:w-64 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-catolica-primary flex items-center justify-center font-black text-white text-xl shadow-lg shadow-catolica-primary/40">
                C
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-white">SGP Católica</h2>
                <p className="text-[11px] text-slate-400 font-medium">Gestão & OMR Studio (N2)</p>
              </div>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:hidden" aria-label="Fechar menu">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1.5" aria-label="Navegação principal">
            {[
              { id: 'montador', label: 'Montador de Provas', icon: BookOpen },
              { id: 'turmas', label: 'Gestão de Turmas', icon: Users },
              { id: 'impressao', label: 'Caderno & Gabarito OMR', icon: Printer },
              { id: 'relatorios', label: 'Relatórios & Histórico', icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setCurrentTab(item.id as any); setSidebarOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    active 
                      ? 'translate-x-1 bg-catolica-primary text-white shadow-md shadow-catolica-primary/30'
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

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-800/60 p-4 text-[11px] text-slate-400">
          <div className="border-b border-slate-700 pb-3">
            <p className="truncate text-xs font-semibold text-slate-200">{session.name} autenticado(a)</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">Acesso de {session.role}</p>
          </div>
          <p className="font-semibold text-slate-300">Católica SC - Campus Jaraguá</p>
          <p>Projeto de Arquitetura de Software</p>
          <button type="button" onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300 transition hover:border-catolica-primary hover:bg-catolica-primary hover:text-white" title="Sair da conta">
            <LogOut className="h-4 w-4" /> Sair da conta
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="w-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 md:ml-64 md:h-screen md:w-auto print:ml-0 print:h-auto">
        <div className="print:hidden">
          <div className="mb-4 flex items-center rounded-xl bg-slate-900 px-4 py-3 text-white shadow-sm md:hidden">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 transition hover:bg-slate-800" aria-label="Abrir menu" aria-expanded={sidebarOpen}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-2 text-sm font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-catolica-primary">C</span>
              SGP Católica
            </div>
          </div>
          <Header currentTab={currentTab} />
        </div>

        {/* ========================================================================= */}
        {/* ABA 1: MONTADOR SPLIT-SCREEN + CADASTRO BANCO POSTGRESQL */}
        {/* ========================================================================= */}
        {currentTab === 'montador' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center print:hidden">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="text-catolica-primary" /> Montador de Avaliações
                </h2>
                <p className="text-xs text-slate-500">Cadastre, edite e selecione questões integradas ao banco PostgreSQL.</p>
              </div>
              <button 
                onClick={abrirModalNovaQuestao}
                className="flex items-center gap-2 bg-catolica-primary hover:bg-catolica-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-catolica-primary/20 transition"
              >
                <PlusCircle size={16} /> Nova Questão
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* BANCO ESQUERDO */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Banco de Questões</h3>
                      <p className="text-xs text-slate-500">Selecione para incluir no caderno</p>
                    </div>
                    <span className="text-xs bg-slate-100 font-bold px-3 py-1 rounded-lg text-slate-600">
                      {bancoQuestoes.length} disponíveis
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Filtrar por enunciado ou tag..."
                      value={buscaQuestao}
                      onChange={(e) => setBuscaQuestao(e.target.value)}
                      className="bg-transparent text-xs w-full outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {questoesFiltradas.map((q, idx) => {
                    const jaAdicionada = questoesSelecionadas.some(item => item.id === q.id);
                    return (
                      <div 
                        key={q.id}
                        className={`bg-white p-5 rounded-2xl border transition-all ${
                          jaAdicionada ? 'border-catolica-primary/40 bg-catolica-light/30' : 'border-slate-200 hover:border-slate-300 shadow-sm'
                        }`}
                      >
                        <div className="mb-2.5 flex items-start justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-white">
                              Q{idx + 1} - {q.tipo.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {q.pontuacao.toFixed(1)} pts
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => abrirModalEditarQuestao(q)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                              title="Editar Questão"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => excluirQuestao(q.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Excluir Questão"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => adicionarNaProva(q)}
                              disabled={jaAdicionada}
                              className={`text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition ml-1 ${
                                jaAdicionada 
                                  ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                                  : 'bg-slate-900 text-white hover:bg-catolica-primary'
                              }`}
                            >
                              {jaAdicionada ? <><Check className="w-3 h-3" /> No Caderno</> : <><Plus className="w-3 h-3" /> Adicionar</>}
                            </button>
                          </div>
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

              {/* MONTADOR DIREITO */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Resumo da Avaliação</h3>
                      <p className="text-xs text-slate-500">Configuração de caderno e gabarito</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block uppercase">Pontuação Total:</span>
                      <strong className={`text-lg font-black ${pontuacaoTotal === 10 ? 'text-emerald-600' : 'text-catolica-primary'}`}>
                        {pontuacaoTotal.toFixed(1)} / 10.0 pts
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Título da Prova:</label>
                      <input 
                        type="text" 
                        value={tituloProva}
                        onChange={(e) => setTituloProva(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-catolica-primary"
                      />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 uppercase block mb-1">Regras de Impressão e Embaralhamento:</span>
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={shuffleQ} onChange={(e) => setShuffleQ(e.target.checked)} className="w-3.5 h-3.5 accent-catolica-primary" />
                        Embaralhar ordem das questões
                      </label>
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={shuffleAlt} onChange={(e) => setShuffleAlt(e.target.checked)} className="w-3.5 h-3.5 accent-catolica-primary" />
                        Embaralhar alternativas (A, B, C, D, E)
                      </label>
                      <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={withId} onChange={(e) => setWithId(e.target.checked)} className="w-3.5 h-3.5 accent-catolica-primary" />
                        QR Code Nominal (com Matrícula e Nome do Aluno)
                      </label>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
                        Questões no Caderno ({questoesSelecionadas.length} / 20):
                      </span>
                      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                        {questoesSelecionadas.map((q, idx) => (
                          <div key={q.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs">
                            <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
                              <span className="font-bold text-slate-400 w-5 text-center">{idx + 1}.</span>
                              <span className="max-w-[160px] truncate font-semibold text-slate-800 sm:max-w-[280px]">{q.enunciado}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="font-bold text-catolica-primary">{q.pontuacao.toFixed(1)} pts</span>
                              <button onClick={() => removerDaProva(q.id)} className="text-slate-400 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('impressao')}
                    disabled={questoesSelecionadas.length === 0}
                    className="w-full bg-catolica-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-catolica-dark transition shadow-lg shadow-catolica-primary/30"
                  >
                    <Printer className="w-4 h-4" /> Gerar Caderno Frente/Verso & Gabarito OMR
                  </button>
                </div>
              </div>
            </div>

            {/* Modal de Nova ou Edição de Questão */}
            {modalAberto && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {questaoEmEdicaoId ? 'Editar Questão' : 'Cadastrar Nova Questão'}
                      </h3>
                      <p className="text-xs text-slate-500">A questão ficará salva no Banco de Questões aguardando inclusão na prova.</p>
                    </div>
                    <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 transition">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveQuestaoSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Questão</label>
                      <div className="flex gap-4">
                        {(['objetiva', 'discursiva'] as const).map(tipo => (
                          <label key={tipo} className="flex items-center gap-2 text-xs font-semibold cursor-pointer uppercase">
                            <input 
                              type="radio" 
                              name="tipo" 
                              checked={novoTipo === tipo} 
                              onChange={() => setNovoTipo(tipo)}
                              className="accent-catolica-primary h-4 w-4"
                            />
                            {tipo}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enunciado</label>
                      <textarea 
                        required 
                        rows={3} 
                        value={novoEnunciado}
                        onChange={(e) => setNovoEnunciado(e.target.value)}
                        placeholder="Digite o enunciado completo da questão..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-catolica-primary"
                      />
                    </div>

                    {novoTipo === 'objetiva' && (
                      <div className="space-y-2 border-t pt-3">
                        <label className="block text-xs font-bold text-slate-700 uppercase">Alternativas (Marque a Correta)</label>
                        {alternativasCadastro.map((alt, i) => (
                          <div key={alt.letra} className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 text-xs w-4">{alt.letra})</span>
                            <input 
                              type="text" 
                              required
                              value={alt.texto}
                              onChange={(e) => {
                                const newAlts = [...alternativasCadastro];
                                newAlts[i].texto = e.target.value;
                                setAlternativasCadastro(newAlts);
                              }}
                              placeholder={`Texto da alternativa ${alt.letra}`}
                              className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-catolica-primary"
                            />
                            <input 
                              type="radio" 
                              name="alternativaCorreta" 
                              checked={alt.correta}
                              onChange={() => {
                                setAlternativasCadastro(alternativasCadastro.map((a, idx) => ({ ...a, correta: idx === i })));
                              }}
                              className="accent-emerald-600 h-4 w-4"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 border-t pt-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pontuação</label>
                        <input 
                          type="number" 
                          step="0.25"
                          value={novaPontuacao}
                          onChange={(e) => setNovaPontuacao(parseFloat(e.target.value))}
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-catolica-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (separadas por vírgula)</label>
                        <input 
                          type="text" 
                          value={novasTags}
                          onChange={(e) => setNovasTags(e.target.value)}
                          placeholder="Arquitetura, PostgreSQL, N2"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-catolica-primary"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t pt-4">
                      <button 
                        type="button" 
                        onClick={() => setModalAberto(false)}
                        className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-catolica-primary hover:bg-catolica-dark text-white rounded-xl text-xs font-bold shadow-md transition"
                      >
                        {questaoEmEdicaoId ? 'Atualizar Questão' : 'Salvar no Banco'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: TURMAS */}
        {/* ========================================================================= */}
        {currentTab === 'turmas' && (
          <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-6">
              <div>
                <h3 className="font-bold text-slate-800">Turmas & Matrículas</h3>
                <p className="text-xs text-slate-500">Gestão de turmas e códigos de auto-matrícula</p>
              </div>
              <button onClick={() => alert('Cadastro de turmas conectado ao PostgreSQL')} className="bg-catolica-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-catolica-dark transition">
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
                    Convite: <strong>CAT-8842</strong>
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-800">Engenharia de Software IV</h4>
                <p className="text-xs text-slate-500">Arquitetura e Projeto de Software</p>
                <div className="border-t pt-3 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Estudantes Matriculados:</span>
                  <div className="text-xs space-y-1 text-slate-600">
                    {historicoAlunos.map(a => (
                      <div key={a.id} className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                        <span>{a.nome}</span>
                        <span className="font-mono text-slate-500">{a.matricula}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: CADERNO FRENTE/VERSO + GABARITO DESTACADO COM PÁGINA EM BRANCO */}
        {/* ========================================================================= */}
        {currentTab === 'impressao' && (
          <div className="space-y-6">
            <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden sm:flex-row sm:items-center sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <label className="text-xs font-bold text-slate-700 uppercase">Selecione o Estudante / Versão:</label>
                <select
                  value={selectedVersionIdx}
                  onChange={(e) => setSelectedVersionIdx(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold outline-none sm:w-auto"
                >
                  {historicoAlunos.map((aluno, idx) => (
                    <option key={aluno.id} value={idx}>
                      {aluno.nome} — Matrícula: {aluno.matricula} (Versão {String.fromCharCode(65 + (idx % 4))})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl bg-catolica-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-catolica-primary/20 transition hover:bg-catolica-dark"
              >
                <Printer className="w-4 h-4" /> Imprimir Prova Completa (Frente/Verso + Gabarito)
              </button>
            </div>

            <div className="space-y-8">
              
              {/* 1. FOLHA DE RESPOSTA (GABARITO OMR) SEPARADO */}
              <div className="rounded-xl border-2 border-slate-300 bg-white p-3 shadow-lg print:border-none print:p-0 sm:p-8">
                <div className="mb-6 flex flex-col gap-1 border-b-2 border-dashed border-slate-400 pb-3 text-xs font-bold uppercase text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>✂️ Destaque aqui — Entregar somente este gabarito ao professor</span>
                  <span>Folha de Respostas OMR</span>
                </div>

                <div className="relative min-h-[500px] border-4 border-slate-900 p-4 sm:p-6">
                  {/* Marcadores de Calibração OMR */}
                  <div className="absolute top-2 left-2 w-4 h-4 bg-black" />
                  <div className="absolute top-2 right-2 w-4 h-4 bg-black" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-black" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-black" />

                  <div className="mb-6 flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-4">
                    <div>
                      <h3 className="text-base font-black uppercase text-slate-900">CATÓLICA SC - CENTRO UNIVERSITÁRIO</h3>
                      <p className="text-xs font-semibold text-slate-700">Folha de Respostas Óptica • Avaliação Individual</p>
                      
                      {withId ? (
                        <div className="mt-2 text-xs">
                          <p><strong>Estudante:</strong> {alunoAtual.nome}</p>
                          <p><strong>Matrícula:</strong> {alunoAtual.matricula}</p>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs">
                          <p><strong>Estudante:</strong> __________________________________________</p>
                          <p><strong>Matrícula:</strong> ____________________</p>
                        </div>
                      )}
                    </div>
                    <div className="border-2 border-slate-900 p-2 text-center text-xs">
                      <span className="block font-bold">VERSÃO</span>
                      <strong className="text-2xl font-black">{String.fromCharCode(65 + (selectedVersionIdx % 4))}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="border border-slate-900 p-4 text-center font-mono text-xs">
                      <div className="bg-slate-100 p-4 mb-2 font-black text-slate-900 border">
                        [ QR CODE OMR ]<br />
                        APP-CAT-EXAM-V1-{withId ? alunoAtual.matricula : 'ANONIMA'}
                      </div>
                      <span className="text-[10px] text-slate-500">Leitura Exclusiva App Docente</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase block text-slate-800">Quadro de Respostas (Preencha a caneta):</span>
                      {questoesEmbaralhadas.filter(q => q.tipo === 'objetiva').map((q, idx) => (
                        <div key={q.id || idx} className="flex items-center gap-2 text-xs">
                          <span className="font-bold w-7">Q.{idx + 1}:</span>
                          {['A', 'B', 'C', 'D', 'E'].map(letra => (
                            <div key={letra} className="w-6 h-6 border-2 border-slate-900 rounded flex items-center justify-center font-bold text-[11px]">
                              {letra}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PÁGINA EM BRANCO AUTOMÁTICA */}
              <div className="hidden print:block page-break-after">
                <div className="h-[297mm] flex items-center justify-center text-slate-300 text-xs uppercase">
                  [ Verso do Cartão-Resposta em Branco ]
                </div>
              </div>

              {/* 3. CADERNO DE QUESTÕES */}
              <div className="page-break-before rounded-xl border border-slate-200 bg-white p-4 shadow-lg print:border-none print:shadow-none print:p-0 sm:p-8">
                <div className="mb-6 flex flex-col gap-3 border-b-2 border-slate-900 pb-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">CATÓLICA SC - CADERNO DE QUESTÕES</h3>
                    <p className="text-xs text-slate-600">{tituloProva} • Versão {String.fromCharCode(65 + (selectedVersionIdx % 4))}</p>
                  </div>
                  <span className="text-[11px] font-bold bg-slate-100 px-3 py-1 rounded border border-slate-300 text-slate-700">
                    O Estudante pode levar este caderno
                  </span>
                </div>

                <div className="space-y-6">
                  {questoesEmbaralhadas.map((q, idx) => (
                    <div key={q.id || idx} className="text-xs space-y-2 border-b border-slate-100 pb-4">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Questão {idx + 1} ({q.pontuacao?.toFixed(1) || '2.5'} pts) - {q.tipo?.toUpperCase()}:</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{q.enunciado}</p>

                      {q.tipo === 'objetiva' && q.alternativas && (
                        <div className="space-y-1.5 pl-2 pt-1">
                          {q.alternativas.map((alt, altIdx) => (
                            <div key={alt.id || altIdx} className="flex gap-2">
                              <span className="font-bold">({String.fromCharCode(65 + altIdx)})</span>
                              <span>{alt.texto}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {q.tipo === 'discursiva' && (
                        <div className="mt-4 border border-slate-300 rounded p-2 h-28 bg-slate-50 text-[10px] text-slate-400">
                          Espaço reservado para resposta discursiva:
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 4: RELATÓRIOS E HISTÓRICO */}
        {/* ========================================================================= */}
        {currentTab === 'relatorios' && (
          <div className="space-y-6">
            
            {/* CARDS COM MÉTRICAS GERAIS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Média Geral da Turma</span>
                <strong className="text-2xl font-black text-slate-900">8.0</strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Taxa de Aprovação</span>
                <strong className="text-2xl font-black text-emerald-600">75%</strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Total de Provas Lidas</span>
                <strong className="text-2xl font-black text-catolica-primary">40</strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Etapa Atual</span>
                <strong className="text-2xl font-black text-purple-600">N2 em Andamento</strong>
              </div>
            </div>

            {/* TABELA 1: HISTÓRICO EVOLUTIVO POR ALUNO (N1, N2, N3) */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Histórico Contínuo de Notas (N1, N2 e N3)</h3>
                  <p className="text-xs text-slate-500">Acompanhamento longitudinal do desempenho dos estudantes</p>
                </div>
                <button 
                  onClick={exportarCSV}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Exportar Planilha (.CSV)
                </button>
              </div>

              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[680px] w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                      <th className="pb-3">Estudante</th>
                      <th className="pb-3">Matrícula</th>
                      <th className="pb-3 text-center">Nota N1</th>
                      <th className="pb-3 text-center">Nota N2</th>
                      <th className="pb-3 text-center">Nota N3</th>
                      <th className="pb-3 text-center">Média Semestral</th>
                      <th className="pb-3 text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historicoAlunos.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800">{item.nome}</td>
                        <td className="py-3 font-mono text-slate-500">{item.matricula}</td>
                        <td className="py-3 text-center font-bold text-catolica-primary">{item.n1.toFixed(1)}</td>
                        <td className="py-3 text-center font-semibold text-slate-700">{item.n2.toFixed(1)}</td>
                        <td className="py-3 text-center font-semibold text-slate-700">{item.n3.toFixed(1)}</td>
                        <td className="py-3 text-center font-black text-slate-900 text-sm">{item.media.toFixed(1)}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            item.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABELA 2: ESTATÍSTICAS POR QUESTÃO & DIAGNÓSTICO DE DISTRATORES */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">📊 Estatísticas Globais de Erros, Acertos e Distratores</h3>
                <p className="text-xs text-slate-500">Mapeamento pedagógico processado pelo backend por questão avaliada</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {estatisticasQuestoes.map((est) => (
                  <div key={est.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">{est.id}</span>
                      <div className="flex gap-2 text-xs font-bold">
                        <span className="text-emerald-600">✓ {est.taxaAcerto}% Acertos</span>
                        <span className="text-red-500">✗ {est.taxaErro}% Erros</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{est.enunciado}</p>
                    <div className="text-[11px] bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <p className="text-slate-700">Distrator mais marcado: <strong className="text-catolica-primary">{est.distratorMaisMarcado}</strong></p>
                      <p className="text-slate-500 italic">"{est.diagnostico}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}