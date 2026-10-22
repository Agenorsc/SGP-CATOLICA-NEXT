'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Menu } from 'lucide-react';

// Camadas de Domínio (Models)
import { AlunoModel, TurmaModel } from '@/models';
import { UsuarioModel } from '@/models/UsuarioModel';

// Camadas de Serviços e Repositórios
import { 
  AlunoService, 
  TurmaService, 
  QuestionService, 
  OmrService, 
  ExportService,
  ProfessorService
} from '@/services';
import { 
  AlunoRepository, 
  TurmaRepository, 
  QuestionRepository, 
  OmrRepository,
  UsuarioRepository
} from '@/repositories';

// Camada de Tipos
import { 
  Question, 
  AlternativaCadastro, 
  LeituraOMRRegistro,
  AvaliacaoCiclo,
  UserSession
} from '@/types';

// Camada de Componentes de Apresentação
import { Header } from '@/components/layout/Header';
import { Sidebar, TabType } from '@/components/layout/Sidebar';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { CadastrosTab } from '@/components/cadastros/CadastrosTab';
import { ProfessoresTab } from '@/components/professores/ProfessoresTab';
import { ModalProfessor } from '@/components/professores/ModalProfessor';
import { ModalAluno, FormAlunoState } from '@/components/cadastros/ModalAluno';
import { ModalTurma, FormTurmaState } from '@/components/cadastros/ModalTurma';
import { MontadorTab } from '@/components/montador/MontadorTab';
import { ModalQuestao } from '@/components/montador/ModalQuestao';
import { ImpressaoTab } from '@/components/impressao/ImpressaoTab';
import { LeituraTab } from '@/components/leitura/LeituraTab';
import { RelatoriosTab } from '@/components/relatorios/RelatoriosTab';

export default function Home() {
  // Instâncias dos Serviços da Arquitetura em Camadas
  const alunoRepo = useMemo(() => new AlunoRepository(), []);
  const turmaRepo = useMemo(() => new TurmaRepository(), []);
  const questionRepo = useMemo(() => new QuestionRepository(), []);
  const omrRepo = useMemo(() => new OmrRepository(), []);
  const usuarioRepo = useMemo(() => new UsuarioRepository(), []);

  const alunoService = useMemo(() => new AlunoService(alunoRepo), [alunoRepo]);
  const turmaService = useMemo(() => new TurmaService(turmaRepo), [turmaRepo]);
  const questionService = useMemo(() => new QuestionService(questionRepo), [questionRepo]);
  const omrService = useMemo(() => new OmrService(omrRepo), [omrRepo]);
  const professorService = useMemo(() => new ProfessorService(usuarioRepo), [usuarioRepo]);

  // Autenticação Real e Navegação
  const [session, setSession] = useState<UserSession | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('cadastros');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedSession = window.localStorage.getItem('sgp-user-session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch {
        window.localStorage.removeItem('sgp-user-session');
      }
    }
    setSessionLoaded(true);
  }, []);

  const handleLogin = (userSession: UserSession) => {
    window.localStorage.setItem('sgp-user-session', JSON.stringify(userSession));
    setSession(userSession);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('sgp-user-session');
    setSession(null);
  };

  // Estados de Dados
  const [turmas, setTurmas] = useState<TurmaModel[]>([]);
  const [alunos, setAlunos] = useState<AlunoModel[]>([]);
  const [professores, setProfessores] = useState<UsuarioModel[]>([]);
  const [bancoQuestoes, setBancoQuestoes] = useState<Question[]>([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string>('t1');

  useEffect(() => {
    turmaService.listarTurmas().then(setTurmas);
    alunoService.listarAlunos().then(setAlunos);
    questionService.listarQuestoes().then(setBancoQuestoes);
    professorService.listarProfessores().then(setProfessores);
  }, [turmaService, alunoService, questionService, professorService]);

  // ISOLAMENTO DE DADOS POR PROFESSOR ("onde ambos vai ter seus próprios alunos")
  const turmasVisiveis = useMemo(() => {
    if (!session) return turmas;
    if (session.role === 'ADMIN') return turmas;
    // O professor vê apenas as suas disciplinas/turmas
    return turmas.filter(t => t.professorId === session.id || !t.professorId);
  }, [session, turmas]);

  const alunosVisiveis = useMemo(() => {
    if (!session) return alunos;
    if (session.role === 'ADMIN') return alunos;
    // O professor vê apenas os alunos matriculados nas suas turmas
    const turmasIds = new Set(turmasVisiveis.map(t => t.id));
    return alunos.filter(a => turmasIds.has(a.turmaId));
  }, [session, alunos, turmasVisiveis]);

  // Ajusta a turma selecionada para uma turma válida do usuário logado
  useEffect(() => {
    if (turmasVisiveis.length > 0) {
      const existe = turmasVisiveis.some(t => t.id === turmaSelecionadaId);
      if (!existe) {
        setTurmaSelecionadaId(turmasVisiveis[0].id);
      }
    }
  }, [turmasVisiveis, turmaSelecionadaId]);

  // Leitura OMR & Histórico
  const [leiturasOMR, setLeiturasOMR] = useState<LeituraOMRRegistro[]>([]);
  const [buscaRelatorio, setBuscaRelatorio] = useState('');

  // Montador de Provas
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<Question[]>([]);
  const [tituloProva, setTituloProva] = useState('Avaliação Escrita N2 - Engenharia de Software');
  const [buscaQuestao, setBuscaQuestao] = useState('');

  // Inicializa questões selecionadas quando o banco for carregado
  useEffect(() => {
    if (bancoQuestoes.length > 0 && questoesSelecionadas.length === 0) {
      setQuestoesSelecionadas([bancoQuestoes[0], bancoQuestoes[1], bancoQuestoes[2], bancoQuestoes[3]].filter(Boolean));
    }
  }, [bancoQuestoes, questoesSelecionadas.length]);

  // Regras de Embaralhamento e Identificação
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleAlt, setShuffleAlt] = useState(true);
  const [withId, setWithId] = useState(true);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);

  // Estados de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [questaoEmEdicaoId, setQuestaoEmEdicaoId] = useState<string | null>(null);
  const [novoEnunciado, setNovoEnunciado] = useState('');
  const [novoTipo, setNovoTipo] = useState<'objetiva' | 'discursiva'>('objetiva');
  const [novaPontuacao, setNovaPontuacao] = useState(2.5);
  const [novasTags, setNovasTags] = useState('N2, PostgreSQL, Arquitetura');
  const [cicloSelecionado, setCicloSelecionado] = useState<AvaliacaoCiclo | 'TODAS'>('TODAS');
  const [filtroApenasTurma, setFiltroApenasTurma] = useState<boolean>(true);
  const [novaTurmaId, setNovaTurmaId] = useState<string>('');
  const [novaAvaliacao, setNovaAvaliacao] = useState<AvaliacaoCiclo>('N2');
  const [alternativasCadastro, setAlternativasCadastro] = useState<AlternativaCadastro[]>([
    { letra: 'A', texto: '', correta: true },
    { letra: 'B', texto: '', correta: false },
    { letra: 'C', texto: '', correta: false },
    { letra: 'D', texto: '', correta: false },
    { letra: 'E', texto: '', correta: false }
  ]);

  const [modalAlunoAberto, setModalAlunoAberto] = useState(false);
  const [alunoEmEdicaoId, setAlunoEmEdicaoId] = useState<string | null>(null);
  const [formAluno, setFormAluno] = useState<FormAlunoState>({
    nome: '',
    ra: '',
    curso: 'ENGENHARIA DE SOFTWARE',
    turno: 'Noturno',
    turmaId: 't1',
    dataNascimento: '',
    naturalidade: 'Jaraguá do Sul',
    estadoNatal: 'SC',
    mae: '',
    pai: '',
    celular: '',
    cep: '89251500',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: 'Jaraguá do Sul',
    estado: 'SC'
  });

  const [modalTurmaAberto, setModalTurmaAberto] = useState(false);
  const [turmaEmEdicaoId, setTurmaEmEdicaoId] = useState<string | null>(null);
  const [formTurma, setFormTurma] = useState<FormTurmaState>({
    nome: '',
    curso: 'Engenharia de Software',
    semestre: '2026/2',
    professorId: undefined
  });

  // Modal de Professor (Exclusivo Admin)
  const [modalProfessorAberto, setModalProfessorAberto] = useState(false);
  const [professorEmEdicao, setProfessorEmEdicao] = useState<UsuarioModel | null>(null);

  // Memos e Cálculos Derivados
  const alunosDaTurmaSelecionada = useMemo(() => {
    return alunosVisiveis.filter(a => a.turmaId === turmaSelecionadaId);
  }, [alunosVisiveis, turmaSelecionadaId]);

  const alunoAtual = alunosDaTurmaSelecionada[selectedVersionIdx] || alunosDaTurmaSelecionada[0] || alunosVisiveis[0];

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

  const pontuacaoTotal = useMemo(() => {
    return questionService.calcularPontuacaoTotal(questoesSelecionadas);
  }, [questionService, questoesSelecionadas]);

  const contagemCiclos = useMemo(() => {
    return questionService.contarQuestoesPorCiclo(bancoQuestoes, turmaSelecionadaId, filtroApenasTurma);
  }, [questionService, bancoQuestoes, turmaSelecionadaId, filtroApenasTurma]);

  const questoesFiltradas = useMemo(() => {
    return questionService.filtrarQuestoesAvancado(bancoQuestoes, {
      termoBusca: buscaQuestao,
      turmaId: turmaSelecionadaId,
      apenasTurma: filtroApenasTurma,
      ciclo: cicloSelecionado
    });
  }, [questionService, bancoQuestoes, buscaQuestao, turmaSelecionadaId, filtroApenasTurma, cicloSelecionado]);

  const alunosFiltradosRelatorio = useMemo(() => {
    return alunoService.filtrarAlunos(alunosVisiveis, buscaRelatorio);
  }, [alunoService, alunosVisiveis, buscaRelatorio]);

  // Exportação CSV via ExportService
  const exportarCSV = () => {
    ExportService.gerarCsvNotas(alunosVisiveis, turmasVisiveis, tituloProva);
  };

  // Handlers do Montador
  const adicionarNaProva = (q: Question) => {
    if (questoesSelecionadas.some(item => item.id === q.id)) return;
    if (!questionService.validarLimite(questoesSelecionadas)) {
      alert('Limite máximo de 20 questões atingido!');
      return;
    }
    setQuestoesSelecionadas([...questoesSelecionadas, q]);
  };

  const removerDaProva = (id: string) => {
    setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== id));
  };

  // Handlers de Questões
  const abrirModalNovaQuestao = () => {
    setQuestaoEmEdicaoId(null);
    setNovoEnunciado('');
    setNovoTipo('objetiva');
    setNovaPontuacao(2.5);
    setNovasTags('N2, PostgreSQL, Arquitetura');
    setNovaTurmaId(turmaSelecionadaId || '');
    setNovaAvaliacao(cicloSelecionado !== 'TODAS' ? cicloSelecionado : 'N2');
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
    setNovaTurmaId(q.turmaId || '');
    setNovaAvaliacao(q.avaliacao || 'N2');
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

  const excluirQuestao = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta questão do banco?')) {
      await questionService.excluirQuestao(id);
      setBancoQuestoes(bancoQuestoes.filter(q => q.id !== id));
      setQuestoesSelecionadas(questoesSelecionadas.filter(q => q.id !== id));
    }
  };

  const handleSaveQuestaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoEnunciado.trim()) return;

    const questaoFormatada: Question = {
      id: questaoEmEdicaoId || `q_${Date.now()}`,
      tipo: novoTipo,
      enunciado: novoEnunciado,
      pontuacao: Number(novaPontuacao),
      tags: novasTags.split(',').map(t => t.trim()).filter(Boolean),
      turmaId: novaTurmaId || undefined,
      avaliacao: novaAvaliacao,
      alternativas: novoTipo === 'objetiva' ? alternativasCadastro.map((alt, idx) => ({
        id: `alt_${Date.now()}_${idx}`,
        letraOriginal: alt.letra,
        texto: alt.texto,
        correta: alt.correta
      })) : undefined
    };

    const saved = await questionService.salvarQuestao(questaoFormatada);

    if (questaoEmEdicaoId) {
      setBancoQuestoes(bancoQuestoes.map(q => q.id === questaoEmEdicaoId ? saved : q));
      setQuestoesSelecionadas(questoesSelecionadas.map(q => q.id === questaoEmEdicaoId ? saved : q));
    } else {
      setBancoQuestoes([saved, ...bancoQuestoes]);
    }

    setModalAberto(false);
  };

  // Handlers de Alunos
  const abrirModalNovoAluno = () => {
    setAlunoEmEdicaoId(null);
    setFormAluno({
      nome: '',
      ra: '',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: turmasVisiveis[0]?.id || 't1',
      dataNascimento: '',
      naturalidade: 'Jaraguá do Sul',
      estadoNatal: 'SC',
      mae: '',
      pai: '',
      celular: '',
      cep: '89251500',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: 'Jaraguá do Sul',
      estado: 'SC'
    });
    setModalAlunoAberto(true);
  };

  const abrirModalEditarAluno = (aluno: AlunoModel) => {
    setAlunoEmEdicaoId(aluno.id);
    setFormAluno({
      nome: aluno.nome,
      ra: aluno.ra,
      curso: aluno.curso,
      turno: aluno.turno,
      turmaId: aluno.turmaId,
      dataNascimento: aluno.dataNascimento ? new Date(aluno.dataNascimento).toISOString().split('T')[0] : '',
      naturalidade: aluno.naturalidade || '',
      estadoNatal: aluno.estadoNatal || '',
      mae: aluno.filiacao?.mae || '',
      pai: aluno.filiacao?.pai || '',
      celular: aluno.contato?.celular || '',
      cep: aluno.endereco?.cep || '',
      logradouro: aluno.endereco?.logradouro || '',
      numero: aluno.endereco?.numero || '',
      bairro: aluno.endereco?.bairro || '',
      cidade: aluno.endereco?.cidade || '',
      estado: aluno.endereco?.estado || ''
    });
    setModalAlunoAberto(true);
  };

  const excluirAluno = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      await alunoService.excluirAluno(id);
      setAlunos(alunos.filter(a => a.id !== id));
    }
  };

  const handleSaveAlunoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAluno.nome || !formAluno.ra) return;

    const alunoFormatado = new AlunoModel({
      id: alunoEmEdicaoId || `alu-${Date.now()}`,
      nome: formAluno.nome,
      ra: formAluno.ra,
      curso: formAluno.curso,
      turno: formAluno.turno,
      turmaId: formAluno.turmaId,
      dataNascimento: formAluno.dataNascimento || '',
      naturalidade: formAluno.naturalidade,
      estadoNatal: formAluno.estadoNatal,
      filiacao: {
        mae: formAluno.mae,
        pai: formAluno.pai
      },
      contato: {
        celular: formAluno.celular
      },
      endereco: {
        cep: formAluno.cep,
        logradouro: formAluno.logradouro,
        numero: formAluno.numero,
        bairro: formAluno.bairro,
        cidade: formAluno.cidade,
        estado: formAluno.estado
      }
    });

    const saved = await alunoService.salvarAluno(alunoFormatado);

    if (alunoEmEdicaoId) {
      setAlunos(alunos.map(a => a.id === alunoEmEdicaoId ? saved : a));
    } else {
      setAlunos([...alunos, saved]);
    }
    setModalAlunoAberto(false);
  };

  // Handlers de Turmas
  const abrirModalNovaTurma = () => {
    setTurmaEmEdicaoId(null);
    setFormTurma({
      nome: '',
      curso: 'Engenharia de Software',
      semestre: '2026/2',
      professorId: session?.role === 'PROFESSOR' ? session.id : undefined
    });
    setModalTurmaAberto(true);
  };

  const abrirModalEditarTurma = (turma: TurmaModel) => {
    setTurmaEmEdicaoId(turma.id);
    setFormTurma({
      nome: turma.nome,
      curso: turma.curso,
      semestre: turma.semestre,
      professorId: turma.professorId || undefined
    });
    setModalTurmaAberto(true);
  };

  const excluirTurma = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      await turmaService.excluirTurma(id);
      setTurmas(turmas.filter(t => t.id !== id));
      if (turmaSelecionadaId === id && turmasVisiveis.length > 1) {
        setTurmaSelecionadaId(turmasVisiveis.find(t => t.id !== id)?.id || '');
      }
    }
  };

  const handleSaveTurmaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const profAtribuido = formTurma.professorId || (session?.role === 'PROFESSOR' ? session.id : undefined);

    if (turmaEmEdicaoId) {
      const turmaAtualizada = new TurmaModel({
        id: turmaEmEdicaoId,
        nome: formTurma.nome,
        curso: formTurma.curso,
        semestre: formTurma.semestre,
        professorId: profAtribuido
      });
      const saved = await turmaService.salvarTurma(turmaAtualizada);
      setTurmas(turmas.map(t => t.id === turmaEmEdicaoId ? saved : t));
    } else {
      const novaTurma = new TurmaModel({
        nome: formTurma.nome,
        curso: formTurma.curso,
        semestre: formTurma.semestre,
        professorId: profAtribuido
      });
      const saved = await turmaService.salvarTurma(novaTurma);
      setTurmas([...turmas, saved]);
    }
    setModalTurmaAberto(false);
  };

  // Handlers de Professores (Exclusivo Admin)
  const abrirModalNovoProfessor = () => {
    setProfessorEmEdicao(null);
    setModalProfessorAberto(true);
  };

  const abrirModalEditarProfessor = (prof: UsuarioModel) => {
    setProfessorEmEdicao(prof);
    setModalProfessorAberto(true);
  };

  const handleSaveProfessorSubmit = async (dados: { nome: string; email: string; senha?: string; disciplina: string }) => {
    const profFormatado = new UsuarioModel({
      id: professorEmEdicao?.id || `usr_prof_${Date.now()}`,
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha || 'admin',
      role: 'PROFESSOR',
      disciplina: dados.disciplina
    });

    const saved = await professorService.salvarProfessor(profFormatado, session?.role || 'ADMIN');

    if (professorEmEdicao) {
      setProfessores(professores.map(p => p.id === professorEmEdicao.id ? saved : p));
    } else {
      setProfessores([...professores, saved]);
    }
  };

  const excluirProfessor = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
      await professorService.excluirProfessor(id, session?.role || 'ADMIN');
      setProfessores(professores.filter(p => p.id !== id));
    }
  };

  if (!sessionLoaded) return <div className="min-h-screen bg-slate-100" />;

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans text-slate-900 md:block md:h-screen">
      {/* SIDEBAR NAVEGAÇÃO MODULAR */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        session={session}
        onLogout={handleLogout}
      />

      {/* CONTEÚDO PRINCIPAL EM CAMADAS */}
      <main className="w-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 md:ml-64 md:h-screen md:w-auto print:ml-0 print:h-auto">
        <div className="print:hidden">
          <div className="mb-4 flex items-center rounded-xl bg-slate-900 px-4 py-3 text-white shadow-sm md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 transition hover:bg-slate-800"
              aria-label="Abrir menu"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-2 text-sm font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-catolica-primary">C</span>
              SGP Católica
            </div>
          </div>
          <Header currentTab={currentTab} />
        </div>

        {/* 1. ABA CADASTROS (ALUNOS E TURMAS) */}
        {currentTab === 'cadastros' && (
          <CadastrosTab
            alunos={alunosVisiveis}
            turmas={turmasVisiveis}
            onOpenNovoAluno={abrirModalNovoAluno}
            onOpenNovaTurma={abrirModalNovaTurma}
            onEditAluno={abrirModalEditarAluno}
            onDeleteAluno={excluirAluno}
            onEditTurma={abrirModalEditarTurma}
            onDeleteTurma={excluirTurma}
          />
        )}

        {/* 2. ABA GESTÃO DE PROFESSORES (EXCLUSIVO ADMIN) */}
        {currentTab === 'professores' && session.role === 'ADMIN' && (
          <ProfessoresTab
            professores={professores}
            turmas={turmas}
            onOpenNovoProfessor={abrirModalNovoProfessor}
            onEditProfessor={abrirModalEditarProfessor}
            onDeleteProfessor={excluirProfessor}
          />
        )}

        {/* 3. ABA MONTADOR DE PROVAS */}
        {currentTab === 'montador' && (
          <MontadorTab
            bancoQuestoes={bancoQuestoes}
            questoesFiltradas={questoesFiltradas}
            questoesSelecionadas={questoesSelecionadas}
            turmas={turmasVisiveis}
            turmaSelecionadaId={turmaSelecionadaId}
            setTurmaSelecionadaId={setTurmaSelecionadaId}
            tituloProva={tituloProva}
            setTituloProva={setTituloProva}
            buscaQuestao={buscaQuestao}
            setBuscaQuestao={setBuscaQuestao}
            cicloSelecionado={cicloSelecionado}
            setCicloSelecionado={setCicloSelecionado}
            filtroApenasTurma={filtroApenasTurma}
            setFiltroApenasTurma={setFiltroApenasTurma}
            contagemCiclos={contagemCiclos}
            shuffleQ={shuffleQ}
            setShuffleQ={setShuffleQ}
            shuffleAlt={shuffleAlt}
            setShuffleAlt={setShuffleAlt}
            withId={withId}
            setWithId={setWithId}
            pontuacaoTotal={pontuacaoTotal}
            onOpenNovaQuestao={abrirModalNovaQuestao}
            onEditQuestao={abrirModalEditarQuestao}
            onDeleteQuestao={excluirQuestao}
            onAdicionarNaProva={adicionarNaProva}
            onRemoverDaProva={removerDaProva}
            onIrParaImpressao={() => setCurrentTab('impressao')}
          />
        )}

        {/* 4. ABA IMPRESSÃO (CADERNO & GABARITO OMR) */}
        {currentTab === 'impressao' && (
          <ImpressaoTab
            alunosDaTurmaSelecionada={alunosDaTurmaSelecionada}
            selectedVersionIdx={selectedVersionIdx}
            setSelectedVersionIdx={setSelectedVersionIdx}
            alunoAtual={alunoAtual}
            tituloProva={tituloProva}
            turmaSelecionadaId={turmaSelecionadaId}
            withId={withId}
            questoesEmbaralhadas={questoesEmbaralhadas}
          />
        )}

        {/* 5. ABA LEITURA & CORREÇÃO OMR / QR CODE */}
        {currentTab === 'leitura' && (
          <LeituraTab
            alunos={alunosVisiveis}
            turmas={turmasVisiveis}
            turmaSelecionadaId={turmaSelecionadaId}
            questoesSelecionadas={questoesSelecionadas}
            tituloProva={tituloProva}
            shuffleQ={shuffleQ}
            shuffleAlt={shuffleAlt}
            leiturasOMR={leiturasOMR}
            onSalvarLeitura={(registro, alunoAtualizado) => {
              setAlunos(prevAlunos => prevAlunos.map(a => a.id === alunoAtualizado.id ? alunoAtualizado : a));
              setLeiturasOMR(prev => [registro, ...prev]);
              omrService.registrarLeitura(registro);
            }}
          />
        )}

        {/* 6. ABA RELATÓRIOS & HISTÓRICO */}
        {currentTab === 'relatorios' && (
          <RelatoriosTab
            alunos={alunosVisiveis}
            leiturasOMR={leiturasOMR}
            turmas={turmasVisiveis}
            buscaRelatorio={buscaRelatorio}
            setBuscaRelatorio={setBuscaRelatorio}
            alunosFiltradosRelatorio={alunosFiltradosRelatorio}
            onExportarCsv={exportarCSV}
          />
        )}

        {/* MODAL DE PROFESSOR (EXCLUSIVO ADMIN) */}
        {session.role === 'ADMIN' && (
          <ModalProfessor
            isOpen={modalProfessorAberto}
            onClose={() => setModalProfessorAberto(false)}
            professorEmEdicao={professorEmEdicao}
            onSave={handleSaveProfessorSubmit}
          />
        )}

        {/* MODAL DE CADASTRO/EDIÇÃO DE QUESTÃO */}
        <ModalQuestao
          isOpen={modalAberto}
          onClose={() => setModalAberto(false)}
          questaoEmEdicaoId={questaoEmEdicaoId}
          novoEnunciado={novoEnunciado}
          setNovoEnunciado={setNovoEnunciado}
          novoTipo={novoTipo}
          setNovoTipo={setNovoTipo}
          novaPontuacao={novaPontuacao}
          setNovaPontuacao={setNovaPontuacao}
          novasTags={novasTags}
          setNovasTags={setNovasTags}
          novaTurmaId={novaTurmaId}
          setNovaTurmaId={setNovaTurmaId}
          novaAvaliacao={novaAvaliacao}
          setNovaAvaliacao={setNovaAvaliacao}
          turmas={turmasVisiveis}
          alternativasCadastro={alternativasCadastro}
          setAlternativasCadastro={setAlternativasCadastro}
          onSubmit={handleSaveQuestaoSubmit}
        />

        {/* MODAL DE CADASTRO/EDIÇÃO DE ALUNO */}
        <ModalAluno
          isOpen={modalAlunoAberto}
          onClose={() => setModalAlunoAberto(false)}
          isEditing={!!alunoEmEdicaoId}
          formAluno={formAluno}
          setFormAluno={setFormAluno}
          onSubmit={handleSaveAlunoSubmit}
          turmas={turmasVisiveis}
        />

        {/* MODAL DE CADASTRO/EDIÇÃO DE TURMA */}
        <ModalTurma
          isOpen={modalTurmaAberto}
          onClose={() => setModalTurmaAberto(false)}
          isEditing={!!turmaEmEdicaoId}
          formTurma={formTurma}
          setFormTurma={setFormTurma}
          onSubmit={handleSaveTurmaSubmit}
          professores={professores}
          isAdmin={session.role === 'ADMIN'}
        />
      </main>
    </div>
  );
}
