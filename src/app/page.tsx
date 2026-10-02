'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { LoginScreen, UserRole } from '@/components/auth/LoginScreen';
import { Question } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  BookOpen, 
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
  Pencil,
  UserPlus,
  FolderPlus,
  GraduationCap,
  Users,
  Camera,
  Scan,
  CheckCircle2,
  RefreshCw,
  VideoOff,
  ClipboardList,
  Award,
  CalendarDays
} from 'lucide-react';

// ============================================================================
// COMPONENTE DE QR CODE COM RENDERING NO CLIENTE (SSR SAFE)
// ============================================================================
function QRCodeWrapper({ value, size = 110 }: { value: string; size?: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-mono border"
      >
        Gerando...
      </div>
    );
  }

  return (
    <QRCodeSVG 
      value={value} 
      size={size} 
      level="M" 
      includeMargin={false} 
    />
  );
}

// ============================================================================
// MODELOS ORIENTADOS A OBJETOS (OO)
// ============================================================================

interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface Contato {
  email: string;
  celular: string;
  residencial?: string;
}

interface Filiacao {
  mae: string;
  pai: string;
}

class PessoaModel {
  nome: string;
  dataNascimento: string;
  naturalidade: string;
  estadoNatal: string;
  filiacao: Filiacao;
  contato: Contato;
  endereco: Endereco;

  constructor(data: Partial<PessoaModel>) {
    this.nome = data.nome || '';
    this.dataNascimento = data.dataNascimento || '';
    this.naturalidade = data.naturalidade || '';
    this.estadoNatal = data.estadoNatal || '';
    this.filiacao = data.filiacao || { mae: '', pai: '' };
    this.contato = data.contato || { email: '', celular: '' };
    this.endereco = data.endereco || { cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '' };
  }
}

class AlunoModel extends PessoaModel {
  id: string;
  ra: string;
  curso: string;
  turno: string;
  turmaId: string;
  n1: number;
  n2: number;
  n3: number;

  constructor(data: Partial<AlunoModel>) {
    super(data);
    this.id = data.id || `alu_${Date.now()}`;
    this.ra = data.ra || '';
    this.curso = data.curso || 'Engenharia de Software';
    this.turno = data.turno || 'Noturno';
    this.turmaId = data.turmaId || '';
    this.n1 = data.n1 ?? 0;
    this.n2 = data.n2 ?? 0;
    this.n3 = data.n3 ?? 0;
  }

  get media(): number {
    return Number(((this.n1 + this.n2 + this.n3) / 3).toFixed(1));
  }

  get status(): 'Aprovado' | 'Exame' | 'Reprovado' {
    if (this.media >= 7.0) return 'Aprovado';
    if (this.media >= 4.0) return 'Exame';
    return 'Reprovado';
  }
}

class TurmaModel {
  id: string;
  nome: string;
  curso: string;
  semestre: string;
  codigoConvite: string;

  constructor(data: Partial<TurmaModel>) {
    this.id = data.id || `turma_${Date.now()}`;
    this.nome = data.nome || '';
    this.curso = data.curso || 'Engenharia de Software';
    this.semestre = data.semestre || '2026/2';
    this.codigoConvite = data.codigoConvite || `CAT-${Math.floor(1000 + Math.random() * 9000)}`;
  }
}

interface AlternativaCadastro {
  letra: string;
  texto: string;
  correta: boolean;
}

interface LeituraOMRRegistro {
  id: string;
  alunoId: string;
  alunoNome: string;
  ra: string;
  turmaNome: string;
  materia: string;
  versao: string;
  acertos: number;
  totalQuestoes: number;
  notaCalculada: number;
  dataLeitura: string;
  respostasDetectadas: Record<number, string>;
}

function PortalAluno({ aluno, nomeSessao, provas, onLogout }: {
  aluno?: AlunoModel;
  nomeSessao: string;
  provas: LeituraOMRRegistro[];
  onLogout: () => void;
}) {
  const media = provas.length ? provas.reduce((total, prova) => total + prova.notaCalculada, 0) / provas.length : null;
  return (
    <main className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-catolica-primary text-xl font-black text-white">C</div><div><p className="font-bold">SGP Católica</p><p className="text-xs text-slate-500">Portal do aluno</p></div></div>
        <button onClick={onLogout} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:text-catolica-primary"><LogOut className="mr-2 inline h-4 w-4" />Sair</button>
      </div></header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">Área acadêmica</p><h1 className="mt-3 text-2xl font-black sm:text-3xl">Olá, {aluno?.nome || nomeSessao}!</h1><p className="mt-2 text-sm text-slate-300">Consulte as notas e respostas das avaliações corrigidas.</p>{aluno && <p className="mt-4 text-xs font-semibold text-slate-400">{aluno.curso} • RA {aluno.ra}</p>}</section>
        {!aluno ? <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><p className="font-bold">Cadastro não localizado</p><p className="mt-1">Este e-mail não está vinculado a um cadastro de aluno. Confira seu e-mail institucional.</p></section> : <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500">Provas corrigidas<ClipboardList className="h-5 w-5 text-catolica-primary" /></div><p className="mt-3 text-3xl font-black">{provas.length}</p><p className="mt-1 text-xs text-slate-500">Avaliações disponíveis</p></article><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex justify-between text-xs font-bold uppercase tracking-wide text-slate-500">Média das provas<Award className="h-5 w-5 text-catolica-primary" /></div><p className="mt-3 text-3xl font-black">{media === null ? '—' : media.toFixed(1)}</p><p className="mt-1 text-xs text-slate-500">Escala de 0 a 10</p></article></div>
          <section className="mt-8"><div className="mb-4"><h2 className="text-lg font-black">Minhas avaliações</h2><p className="mt-1 text-sm text-slate-500">Notas e respostas registradas nas provas que você realizou.</p></div>
            {provas.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-catolica-light text-catolica-primary"><FileText className="h-6 w-6" /></div><p className="mt-4 font-bold text-slate-700">Nenhuma avaliação corrigida ainda</p><p className="mt-1 text-sm text-slate-500">Quando uma prova sua for corrigida, ela aparecerá aqui.</p></div> : <div className="space-y-4">{provas.map(prova => <article key={prova.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-bold">{prova.materia}</h3><p className="mt-1 text-xs text-slate-500">{prova.turmaNome} • {prova.versao}</p></div><div className="flex items-center gap-4"><span className="flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays className="h-4 w-4" />{prova.dataLeitura}</span><span className="rounded-xl bg-emerald-50 px-4 py-2 text-lg font-black text-emerald-700">{prova.notaCalculada.toFixed(1)}<span className="ml-1 text-xs font-semibold">/ 10</span></span></div></div><div className="p-5"><p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Suas respostas <span className="font-medium normal-case">({prova.acertos} de {prova.totalQuestoes} acertos)</span></p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(prova.respostasDetectadas).map(([questao, resposta]) => <div key={questao} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm"><span className="text-slate-500">Questão {questao}</span><span className="font-black">{resposta}</span></div>)}</div></div></article>)}</div>}
          </section>
        </>}
      </div>
    </main>
  );
}

export default function Home() {
  const [session, setSession] = useState<{ role: UserRole; name: string; email?: string } | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'cadastros' | 'montador' | 'impressao' | 'leitura' | 'relatorios'>('cadastros');
  const [subTabCadastro, setSubTabCadastro] = useState<'alunos' | 'turmas'>('alunos');
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

  const handleLogin = (role: UserRole, name: string, email: string) => {
    const newSession = { role, name, email };
    window.localStorage.setItem('sgp-mock-session', JSON.stringify(newSession));
    setSession(newSession);
  };

  const handleLogout = () => {
    window.localStorage.removeItem('sgp-mock-session');
    setSession(null);
  };

  // State de Turmas
  const [turmas, setTurmas] = useState<TurmaModel[]>([
    new TurmaModel({ id: 't1', nome: 'Engenharia de Software IV', curso: 'Engenharia de Software', semestre: '2026/2', codigoConvite: 'CAT-8842' }),
    new TurmaModel({ id: 't2', nome: 'Arquitetura de Software', curso: 'Engenharia de Software', semestre: '2026/2', codigoConvite: 'CAT-9910' })
  ]);

  // State de Alunos
  const [alunos, setAlunos] = useState<AlunoModel[]>([
    new AlunoModel({ id: 'alu-01', nome: 'AGENOR ALVISE', ra: '1328834', curso: 'ENGENHARIA DE SOFTWARE', turno: 'Noturno', turmaId: 't1', n1: 9.5, n2: 8.5, n3: 9.0, contato: { email: 'agenor.alvise@catolicasc.edu.br', celular: '(47) 99690-0033' }, endereco: { cep: '89251500', logradouro: 'MARINA FRUTUOSO', numero: '810', bairro: 'CENTRO', cidade: 'Jaraguá do Sul', estado: 'SC' } }),
    new AlunoModel({ id: 'alu-02', nome: 'Beatriz Ramos', ra: '20241002', curso: 'ENGENHARIA DE SOFTWARE', turno: 'Noturno', turmaId: 't1', n1: 7.5, n2: 8.0, n3: 8.5 }),
    new AlunoModel({ id: 'alu-03', nome: 'Lucas Martins', ra: '20241003', curso: 'ENGENHARIA DE SOFTWARE', turno: 'Noturno', turmaId: 't1', n1: 4.5, n2: 5.0, n3: 6.0 }),
    new AlunoModel({ id: 'alu-04', nome: 'Fernanda Lima', ra: '20241004', curso: 'ENGENHARIA DE SOFTWARE', turno: 'Noturno', turmaId: 't1', n1: 10.0, n2: 9.5, n3: 10.0 })
  ]);

  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string>('t1');

  // Leitura OMR & Câmera
  const [leiturasOMR, setLeiturasOMR] = useState<LeituraOMRRegistro[]>([]);
  const [alunoSelecionadoLeitura, setAlunoSelecionadoLeitura] = useState<string>('alu-01');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);
  const [scanSucesso, setScanSucesso] = useState<LeituraOMRRegistro | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [buscaRelatorio, setBuscaRelatorio] = useState('');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Banco de Questões
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

  // Montador
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<Question[]>([bancoQuestoes[0], bancoQuestoes[1], bancoQuestoes[2], bancoQuestoes[3]]);
  const [tituloProva, setTituloProva] = useState('Avaliação Escrita N2 - Arquitetura de Software');
  const [buscaQuestao, setBuscaQuestao] = useState('');
  
  // Regras
  const [shuffleQ, setShuffleQ] = useState(true);
  const [shuffleAlt, setShuffleAlt] = useState(true);
  const [withId, setWithId] = useState(true);

  // Modais
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

  const [modalAlunoAberto, setModalAlunoAberto] = useState(false);
  const [alunoEmEdicaoId, setAlunoEmEdicaoId] = useState<string | null>(null);
  const [formAluno, setFormAluno] = useState({
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
    email: '',
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
  const [formTurma, setFormTurma] = useState({
    nome: '',
    curso: 'Engenharia de Software',
    semestre: '2026/2'
  });

  const [selectedVersionIdx, setSelectedVersionIdx] = useState(0);

  const alunosDaTurmaSelecionada = useMemo(() => {
    return alunos.filter(a => a.turmaId === turmaSelecionadaId);
  }, [alunos, turmaSelecionadaId]);

  const alunoAtual = alunosDaTurmaSelecionada[selectedVersionIdx] || alunosDaTurmaSelecionada[0] || alunos[0];

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

  // ============================================================================
  // LEITURA AUTOMÁTICA VIA CÂMERA & PROCESSAMENTO AUTOMÁTICO
  // ============================================================================
  
  const iniciarCameraLeitura = async () => {
    setCameraErro(null);
    setCameraAtiva(true);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('reader-omr');
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Quando a câmera escaneia, desliga e processa automaticamente
          pararCameraLeitura();
          processarDadoQrCodeLido(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      setCameraErro('Não foi possível acessar a câmera do dispositivo.');
      setCameraAtiva(false);
    }
  };

  const pararCameraLeitura = async () => {
    if (scannerRef.current && cameraAtiva) {
      try {
        await scannerRef.current.stop();
        setCameraAtiva(false);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const processarDadoQrCodeLido = (qrCodeString: string) => {
    try {
      const parsed = JSON.parse(qrCodeString);
      const targetRa = parsed.ra || '1328834';
      const targetAluno = alunos.find(a => a.ra === targetRa) || alunos[0];
      processarLeituraOMR(targetAluno.id);
    } catch {
      const targetAluno = alunos.find(a => a.ra === qrCodeString) || alunos[0];
      processarLeituraOMR(targetAluno.id);
    }
  };

  const processarLeituraOMR = (alunoTargetId: string) => {
    setIsSimulatingScan(true);
    setScanSucesso(null);

    setTimeout(() => {
      const targetAluno = alunos.find(a => a.id === alunoTargetId) || alunos[0];
      const targetTurma = turmas.find(t => t.id === targetAluno.turmaId) || turmas[0];

      const objetivas = questoesSelecionadas.filter(q => q.tipo === 'objetiva');
      let acertos = 0;
      const respostasDetectadas: Record<number, string> = {};

      objetivas.forEach((q, idx) => {
        const letras = ['A', 'B', 'C', 'D', 'E'];
        const letraEscolhida = Math.random() > 0.15 ? 'A' : letras[Math.floor(Math.random() * 5)];
        respostasDetectadas[idx + 1] = letraEscolhida;
        if (letraEscolhida === 'A') {
          acertos += 1;
        }
      });

      const notaFinal = Number(((acertos / (objetivas.length || 1)) * 10).toFixed(1));

      // Atualiza automaticamente no estado do Aluno
      setAlunos(prevAlunos => prevAlunos.map(a => {
        if (a.id === targetAluno.id) {
          return new AlunoModel({ ...a, n2: notaFinal });
        }
        return a;
      }));

      // Cria o registro completo com matéria, turma, RA, nome e nota
      const novoRegistro: LeituraOMRRegistro = {
        id: `scan_${Date.now()}`,
        alunoId: targetAluno.id,
        alunoNome: targetAluno.nome,
        ra: targetAluno.ra,
        turmaNome: targetTurma.nome,
        materia: tituloProva,
        versao: 'Versão A',
        acertos,
        totalQuestoes: objetivas.length,
        notaCalculada: notaFinal,
        dataLeitura: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        respostasDetectadas
      };

      setLeiturasOMR(prev => [novoRegistro, ...prev]);
      setScanSucesso(novoRegistro);
      setIsSimulatingScan(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const exportarCSV = () => {
    let csv = "Aluno;RA;Turma;Materia;N1;N2;N3;Media;Status\n";
    alunos.forEach(r => {
      const turmaObj = turmas.find(t => t.id === r.turmaId);
      csv += `${r.nome};${r.ra};${turmaObj?.nome || '-'};${tituloProva};${r.n1.toFixed(1)};${r.n2.toFixed(1)};${r.n3.toFixed(1)};${r.media.toFixed(1)};${r.status}\n`;
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
      setBancoQuestoes(bancoQuestoes.map(q => q.id === questaoEmEdicaoId ? questaoFormatada : q));
      setQuestoesSelecionadas(questoesSelecionadas.map(q => q.id === questaoEmEdicaoId ? questaoFormatada : q));
    } else {
      setBancoQuestoes([questaoFormatada, ...bancoQuestoes]);
    }

    setModalAberto(false);
  };

  const abrirModalNovoAluno = () => {
    setAlunoEmEdicaoId(null);
    setFormAluno({
      nome: '',
      ra: '',
      curso: 'ENGENHARIA DE SOFTWARE',
      turno: 'Noturno',
      turmaId: turmas[0]?.id || 't1',
      dataNascimento: '',
      naturalidade: 'Jaraguá do Sul',
      estadoNatal: 'SC',
      mae: '',
      pai: '',
      email: '',
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
      dataNascimento: aluno.dataNascimento,
      naturalidade: aluno.naturalidade,
      estadoNatal: aluno.estadoNatal,
      mae: aluno.filiacao.mae,
      pai: aluno.filiacao.pai,
      email: aluno.contato.email,
      celular: aluno.contato.celular,
      cep: aluno.endereco.cep,
      logradouro: aluno.endereco.logradouro,
      numero: aluno.endereco.numero,
      bairro: aluno.endereco.bairro,
      cidade: aluno.endereco.cidade,
      estado: aluno.endereco.estado
    });
    setModalAlunoAberto(true);
  };

  const excluirAluno = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
      setAlunos(alunos.filter(a => a.id !== id));
    }
  };

  const handleSaveAlunoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailAluno = formAluno.email.trim().toLowerCase();
    const emailJaCadastrado = alunos.some(aluno =>
      aluno.id !== alunoEmEdicaoId && aluno.contato.email.trim().toLowerCase() === emailAluno
    );
    if (emailJaCadastrado) {
      alert('Este e-mail já está vinculado a outro aluno.');
      return;
    }
    if (alunoEmEdicaoId) {
      setAlunos(alunos.map(a => {
        if (a.id === alunoEmEdicaoId) {
          return new AlunoModel({
            ...a,
            nome: formAluno.nome,
            ra: formAluno.ra,
            curso: formAluno.curso,
            turno: formAluno.turno,
            turmaId: formAluno.turmaId,
            dataNascimento: formAluno.dataNascimento,
            naturalidade: formAluno.naturalidade,
            estadoNatal: formAluno.estadoNatal,
            filiacao: { mae: formAluno.mae, pai: formAluno.pai },
            contato: { email: emailAluno, celular: formAluno.celular },
            endereco: {
              cep: formAluno.cep,
              logradouro: formAluno.logradouro,
              numero: formAluno.numero,
              bairro: formAluno.bairro,
              cidade: formAluno.cidade,
              estado: formAluno.estado
            }
          });
        }
        return a;
      }));
    } else {
      const novoAluno = new AlunoModel({
        nome: formAluno.nome,
        ra: formAluno.ra || String(Math.floor(1000000 + Math.random() * 9000000)),
        curso: formAluno.curso,
        turno: formAluno.turno,
        turmaId: formAluno.turmaId,
        dataNascimento: formAluno.dataNascimento,
        naturalidade: formAluno.naturalidade,
        estadoNatal: formAluno.estadoNatal,
        filiacao: { mae: formAluno.mae, pai: formAluno.pai },
        contato: { email: emailAluno, celular: formAluno.celular },
        endereco: {
          cep: formAluno.cep,
          logradouro: formAluno.logradouro,
          numero: formAluno.numero,
          bairro: formAluno.bairro,
          cidade: formAluno.cidade,
          estado: formAluno.estado
        }
      });
      setAlunos([...alunos, novoAluno]);
    }

    setModalAlunoAberto(false);
  };

  const abrirModalNovaTurma = () => {
    setTurmaEmEdicaoId(null);
    setFormTurma({
      nome: '',
      curso: 'Engenharia de Software',
      semestre: '2026/2'
    });
    setModalTurmaAberto(true);
  };

  const abrirModalEditarTurma = (turma: TurmaModel) => {
    setTurmaEmEdicaoId(turma.id);
    setFormTurma({
      nome: turma.nome,
      curso: turma.curso,
      semestre: turma.semestre
    });
    setModalTurmaAberto(true);
  };

  const excluirTurma = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      setTurmas(turmas.filter(t => t.id !== id));
    }
  };

  const handleSaveTurmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (turmaEmEdicaoId) {
      setTurmas(turmas.map(t => {
        if (t.id === turmaEmEdicaoId) {
          return new TurmaModel({
            ...t,
            nome: formTurma.nome,
            curso: formTurma.curso,
            semestre: formTurma.semestre
          });
        }
        return t;
      }));
    } else {
      const novaTurma = new TurmaModel({
        nome: formTurma.nome,
        curso: formTurma.curso,
        semestre: formTurma.semestre
      });
      setTurmas([...turmas, novaTurma]);
    }
    setModalTurmaAberto(false);
  };

  const questoesFiltradas = bancoQuestoes.filter(q => 
    q.enunciado.toLowerCase().includes(buscaQuestao.toLowerCase()) ||
    q.tags.some(t => t.toLowerCase().includes(buscaQuestao.toLowerCase()))
  );

  const alunosFiltradosRelatorio = alunos.filter(a => 
    a.nome.toLowerCase().includes(buscaRelatorio.toLowerCase()) ||
    a.ra.toLowerCase().includes(buscaRelatorio.toLowerCase())
  );

  if (!sessionLoaded) return <div className="min-h-screen bg-slate-100" />;

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  if (session.role === 'aluno') {
    const alunoLogado = alunos.find(aluno => aluno.contato.email.toLowerCase() === (session.email || '').toLowerCase());
    const provasDoAluno = alunoLogado ? leiturasOMR.filter(leitura => leitura.alunoId === alunoLogado.id) : [];
    return <PortalAluno aluno={alunoLogado} nomeSessao={session.name} provas={provasDoAluno} onLogout={handleLogout} />;
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
      
      {/* SIDEBAR REORGANIZADA */}
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
              { id: 'cadastros', label: 'Cadastros (Aluno/Turma)', icon: UserPlus },
              { id: 'montador', label: 'Montador de Provas', icon: BookOpen },
              { id: 'impressao', label: 'Caderno & Gabarito OMR', icon: Printer },
              { id: 'leitura', label: 'Leitura & Correção OMR', icon: Scan },
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

        {/* CADASTROS */}
        {currentTab === 'cadastros' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Painel de Cadastros Gerais</h3>
                <p className="text-xs text-slate-500">Gestão e Edição de Alunos e Turmas Acadêmicas</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={abrirModalNovoAluno}
                  className="bg-catolica-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-catolica-dark transition shadow-md"
                >
                  <UserPlus className="w-4 h-4" /> Cadastrar Aluno
                </button>
                <button 
                  onClick={abrirModalNovaTurma}
                  className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-md"
                >
                  <FolderPlus className="w-4 h-4" /> Cadastrar Turma
                </button>
              </div>
            </div>

            <div className="flex gap-3 border-b border-slate-200 pb-2">
              <button
                onClick={() => setSubTabCadastro('alunos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  subTabCadastro === 'alunos' ? 'bg-catolica-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Alunos Cadastrados ({alunos.length})
              </button>
              <button
                onClick={() => setSubTabCadastro('turmas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  subTabCadastro === 'turmas' ? 'bg-catolica-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Users className="w-4 h-4" /> Turmas / Disciplinas ({turmas.length})
              </button>
            </div>

            {subTabCadastro === 'alunos' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Lista de Estudantes Cadastrados</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-slate-400 font-bold uppercase">
                        <th className="pb-3">RA / Registro</th>
                        <th className="pb-3">Nome Completo</th>
                        <th className="pb-3">Curso</th>
                        <th className="pb-3">Turno</th>
                        <th className="pb-3">Contato</th>
                        <th className="pb-3">Disciplina / Turma</th>
                        <th className="pb-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {alunos.map(a => {
                        const turmaObj = turmas.find(t => t.id === a.turmaId);
                        return (
                          <tr key={a.id} className="hover:bg-slate-50">
                            <td className="py-3 font-mono font-bold text-slate-800">{a.ra}</td>
                            <td className="py-3 font-bold text-slate-900">{a.nome}</td>
                            <td className="py-3 text-slate-600">{a.curso}</td>
                            <td className="py-3 text-slate-600">{a.turno}</td>
                            <td className="py-3 text-slate-500">{a.contato?.email || '-'}</td>
                            <td className="py-3">
                              <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                                turmaObj ? 'bg-catolica-light text-catolica-primary' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {turmaObj ? turmaObj.nome : 'Nenhuma Disciplina'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => abrirModalEditarAluno(a)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                                  title="Editar Aluno"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => excluirAluno(a.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Excluir Aluno"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {subTabCadastro === 'turmas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {turmas.map(t => {
                  const alunosDaTurma = alunos.filter(a => a.turmaId === t.id);
                  return (
                    <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold bg-catolica-light text-catolica-primary px-3 py-1 rounded-lg border border-catolica-primary/20">
                          {t.semestre}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg border text-slate-700">
                            Convite: <strong>{t.codigoConvite}</strong>
                          </span>
                          <button
                            onClick={() => abrirModalEditarTurma(t)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Editar Turma"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => excluirTurma(t.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Excluir Turma"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-base text-slate-800">{t.nome}</h4>
                      <p className="text-xs text-slate-500">{t.curso}</p>
                      
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700">
                            Estudantes Matriculados ({alunosDaTurma.length}):
                          </span>
                        </div>

                        <div className="text-xs space-y-1 text-slate-600 max-h-40 overflow-y-auto">
                          {alunosDaTurma.length === 0 ? (
                            <p className="text-slate-400 italic text-[11px] py-2">Nenhum aluno matriculado nesta disciplina.</p>
                          ) : (
                            alunosDaTurma.map(a => (
                              <div key={a.id} className="flex justify-between p-1.5 bg-slate-50 rounded-lg">
                                <span>{a.nome}</span>
                                <span className="font-mono text-slate-500">RA: {a.ra}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MONTADOR DE PROVAS */}
        {currentTab === 'montador' && (
          <div className="space-y-6">
            <header className="flex justify-between items-center print:hidden">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="text-catolica-primary" /> Montador de Avaliações
                </h2>
                <p className="text-xs text-slate-500">Selecione a turma e monte a avaliação com as questões do banco.</p>
              </div>
              <button 
                onClick={abrirModalNovaQuestao}
                className="flex items-center gap-2 bg-catolica-primary hover:bg-catolica-dark text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-catolica-primary/20 transition cursor-pointer"
              >
                <PlusCircle size={16} /> Nova Questão
              </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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

              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="border-b border-slate-100 pb-4 space-y-2">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">Turma Destino da Prova:</label>
                    <select
                      value={turmaSelecionadaId}
                      onChange={(e) => setTurmaSelecionadaId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-catolica-primary outline-none"
                    >
                      {turmas.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nome} — {t.curso} ({t.semestre})
                        </option>
                      ))}
                    </select>
                  </div>

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
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Matéria / Título da Prova:</label>
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
          </div>
        )}

        {/* CADERNO & GABARITO OMR COM GERADOR LOCAL DE QR CODE */}
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
                  {alunosDaTurmaSelecionada.map((aluno, idx) => (
                    <option key={aluno.id} value={idx}>
                      {aluno.nome} — RA: {aluno.ra} (Versão {String.fromCharCode(65 + (idx % 4))})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl bg-catolica-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-catolica-primary/20 transition hover:bg-catolica-dark"
              >
                <Printer className="w-4 h-4" /> Imprimir Prova Completa (Frente/Verso)
              </button>
            </div>

            <div className="space-y-8">
              {/* FOLHA DE RESPOSTA OMR - FRENTE */}
              <div className="rounded-xl border-2 border-slate-300 bg-white p-3 shadow-lg print:border-none print:p-0 print:shadow-none sm:p-8 print:break-after-page">
                <div className="mb-6 flex flex-col gap-1 border-b-2 border-dashed border-slate-400 pb-3 text-xs font-bold uppercase text-slate-500 sm:flex-row sm:items-center sm:justify-between print:hidden">
                  <span>✂️ Destaque aqui — Entregar somente este gabarito ao professor</span>
                  <span>Folha de Respostas OMR (Frente Única)</span>
                </div>

                <div className="relative min-h-[500px] border-4 border-slate-900 p-4 sm:p-6 print:border-4 print:border-black">
                  {/* Marcadores Ópticos de Calibração */}
                  <div className="absolute top-2 left-2 w-4 h-4 bg-black print:bg-black" />
                  <div className="absolute top-2 right-2 w-4 h-4 bg-black print:bg-black" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 bg-black print:bg-black" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 bg-black print:bg-black" />

                  <div className="mb-6 flex items-start justify-between gap-3 border-b-2 border-slate-900 pb-4 print:border-black">
                    <div>
                      <h3 className="text-base font-black uppercase text-slate-900">CATÓLICA SC - CENTRO UNIVERSITÁRIO</h3>
                      <p className="text-xs font-semibold text-slate-700">Folha de Respostas Óptica • Avaliação Individual</p>
                      <p className="text-xs font-bold text-catolica-primary mt-1">Matéria: {tituloProva}</p>
                      
                      {withId ? (
                        <div className="mt-2 text-xs">
                          <p><strong>Estudante:</strong> {alunoAtual?.nome}</p>
                          <p><strong>Registro Acadêmico (RA):</strong> {alunoAtual?.ra}</p>
                        </div>
                      ) : (
                        <div className="mt-2 text-xs">
                          <p><strong>Estudante:</strong> __________________________________________</p>
                          <p><strong>RA:</strong> ____________________</p>
                        </div>
                      )}
                    </div>
                    <div className="border-2 border-slate-900 p-2 text-center text-xs print:border-black">
                      <span className="block font-bold">VERSÃO</span>
                      <strong className="text-2xl font-black">{String.fromCharCode(65 + (selectedVersionIdx % 4))}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    
                    {/* GERADOR DE QR CODE CLIENT-SIDE */}
                    <div className="border-2 border-slate-900 p-3 text-center font-mono text-xs flex flex-col items-center justify-center bg-white rounded-xl print:border-2 print:border-black">
                      <div className="p-2 bg-white rounded border border-slate-200 print:border-none flex justify-center items-center">
                        <QRCodeWrapper 
                          value={JSON.stringify({
                            ra: withId ? (alunoAtual?.ra || '1328834') : 'ANONIMO',
                            aluno: withId ? (alunoAtual?.nome || 'AGENOR ALVISE') : 'ANONIMO',
                            materia: tituloProva,
                            versao: String.fromCharCode(65 + (selectedVersionIdx % 4)),
                            turmaId: turmaSelecionadaId
                          })}
                          size={110}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-900 mt-2 block print:text-black">
                        {withId ? `RA: ${alunoAtual?.ra}` : 'PROVA ANÔNIMA'} • VERSÃO {String.fromCharCode(65 + (selectedVersionIdx % 4))}
                      </span>
                      <span className="text-[9px] text-slate-500 block print:text-black">
                        Identificação Óptica Automática
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase block text-slate-800">Quadro de Respostas (Preencha a caneta):</span>
                      {questoesEmbaralhadas.filter(q => q.tipo === 'objetiva').map((q, idx) => (
                        <div key={q.id || idx} className="flex items-center gap-2 text-xs">
                          <span className="font-bold w-7">Q.{idx + 1}:</span>
                          {['A', 'B', 'C', 'D', 'E'].map(letra => (
                            <div key={letra} className="w-6 h-6 border-2 border-slate-900 rounded-full flex items-center justify-center font-bold text-[11px] print:border-black print:text-black">
                              {letra}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* PÁGINA EM BRANCO INTENCIONAL */}
              <div className="hidden print:block print:break-after-page">
                <div className="h-[285mm] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 text-xs uppercase p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-300 flex items-center justify-center font-bold">✂️</div>
                  <p className="font-bold">PÁGINA EM BRANCO INTENCIONAL (VERSO DO CARTÃO GABARITO)</p>
                </div>
              </div>

              {/* CADERNO DE QUESTÕES */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg print:border-none print:shadow-none print:p-0 sm:p-8 print:break-before-page">
                <div className="mb-6 flex flex-col gap-3 border-b-2 border-slate-900 pb-3 sm:flex-row sm:items-start sm:justify-between print:border-black">
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase">CATÓLICA SC - CADERNO DE QUESTÕES</h3>
                    <p className="text-xs text-slate-600">{tituloProva} • Versão {String.fromCharCode(65 + (selectedVersionIdx % 4))}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {questoesEmbaralhadas.map((q, idx) => (
                    <div key={q.id || idx} className="text-xs space-y-2 border-b border-slate-100 pb-4 print:break-inside-avoid">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LEITURA & CORREÇÃO OMR / QR CODE VIA CÂMERA */}
        {currentTab === 'leitura' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Scan className="text-catolica-primary" /> Módulo Leitor de Cartão OMR & QR Code
              </h2>
              <p className="text-xs text-slate-500">
                Ligue a câmera e aponte para a folha impressa ou faça a simulação de correção.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-2">Digitalizador de Provas (Câmera Ativa)</h3>

                {cameraErro && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                    <AlertCircle size={16} /> {cameraErro}
                  </div>
                )}

                <div className="relative min-h-[280px] bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center text-white border-4 border-slate-800 shadow-inner">
                  <div id="reader-omr" className={`w-full h-full ${cameraAtiva ? 'block' : 'hidden'}`} />

                  {!cameraAtiva && !isSimulatingScan && (
                    <div className="flex flex-col items-center space-y-2 p-6 text-center">
                      <Camera className="w-12 h-12 text-slate-500" />
                      <span className="text-xs font-bold">Câmera Desligada</span>
                      <p className="text-[10px] text-slate-400">Clique no botão abaixo para permitir o uso da câmera</p>
                    </div>
                  )}

                  {isSimulatingScan && (
                    <div className="flex flex-col items-center space-y-3 z-10 bg-slate-900/90 inset-0 absolute items-center justify-center">
                      <RefreshCw className="w-10 h-10 animate-spin text-catolica-primary" />
                      <span className="text-xs font-bold">Lendo QR Code e Analisando Bolhas...</span>
                    </div>
                  )}

                  {cameraAtiva && (
                    <div className="absolute inset-8 border-2 border-dashed border-catolica-primary/60 rounded-xl pointer-events-none" />
                  )}
                </div>

                <div className="flex gap-2">
                  {!cameraAtiva ? (
                    <button
                      onClick={iniciarCameraLeitura}
                      className="flex-1 bg-catolica-primary hover:bg-catolica-dark text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-catolica-primary/30 transition cursor-pointer"
                    >
                      <Camera size={16} /> Ligar Câmera para Leitura Real
                    </button>
                  ) : (
                    <button
                      onClick={pararCameraLeitura}
                      className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <VideoOff size={16} /> Desligar Câmera
                    </button>
                  )}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Simular Leitura Direta sem Câmera:</label>
                  <div className="flex gap-2">
                    <select
                      value={alunoSelecionadoLeitura}
                      onChange={(e) => setAlunoSelecionadoLeitura(e.target.value)}
                      className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-xs font-bold outline-none"
                    >
                      {alunos.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.nome} — RA: {a.ra}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => processarLeituraOMR(alunoSelecionadoLeitura)}
                      disabled={isSimulatingScan}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                    >
                      <Scan size={14} /> Corrigir
                    </button>
                  </div>
                </div>

                {scanSucesso && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 space-y-2 animate-fadeIn">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <CheckCircle2 size={16} /> QR Code Lido e Respostas OMR Processadas!
                    </div>
                    <div className="text-xs space-y-1 pt-1">
                      <p><strong>Estudante:</strong> {scanSucesso.alunoNome} (RA: {scanSucesso.ra})</p>
                      <p><strong>Matéria:</strong> {scanSucesso.materia}</p>
                      <p><strong>Turma:</strong> {scanSucesso.turmaNome}</p>
                      <p><strong>Acertos:</strong> {scanSucesso.acertos} de {scanSucesso.totalQuestoes} questões</p>
                      <p><strong>Nota N2 Calculada:</strong> <span className="text-base font-black text-emerald-700">{scanSucesso.notaCalculada.toFixed(1)}</span></p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-slate-800 text-sm">Provas Processadas ({leiturasOMR.length})</h3>
                  <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-bold">
                    Integração Automática com N2
                  </span>
                </div>

                {leiturasOMR.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                    <Scan className="w-8 h-8 mx-auto opacity-40" />
                    <p>Nenhuma prova digitalizada nesta sessão.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {leiturasOMR.map(l => (
                      <div key={l.id} className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-900 block">{l.alunoNome}</span>
                          <span className="text-[10px] text-slate-600 font-semibold block">{l.materia}</span>
                          <span className="text-[10px] text-slate-500 font-mono">RA: {l.ra} • {l.turmaNome}</span>
                          <span className="text-[10px] text-slate-400 block">Horário: {l.dataLeitura}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 block">NOTA N2</span>
                          <strong className="text-lg font-black text-catolica-primary">{l.notaCalculada.toFixed(1)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RELATÓRIOS E HISTÓRICO COM BUSCA */}
        {currentTab === 'relatorios' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Média Geral da Turma</span>
                <strong className="text-2xl font-black text-slate-900">
                  {(alunos.reduce((acc, a) => acc + a.media, 0) / (alunos.length || 1)).toFixed(1)}
                </strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Taxa de Aprovação</span>
                <strong className="text-2xl font-black text-emerald-600">
                  {Math.round((alunos.filter(a => a.status === 'Aprovado').length / (alunos.length || 1)) * 100)}%
                </strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Total de Provas Lidas</span>
                <strong className="text-2xl font-black text-catolica-primary">{leiturasOMR.length}</strong>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Etapa Atual</span>
                <strong className="text-2xl font-black text-purple-600">N2 em Andamento</strong>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Histórico Contínuo de Notas (N1, N2 e N3)</h3>
                  <p className="text-xs text-slate-500">Acompanhamento longitudinal do desempenho dos estudantes por turma</p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por Aluno ou RA..."
                      value={buscaRelatorio}
                      onChange={(e) => setBuscaRelatorio(e.target.value)}
                      className="bg-transparent text-xs w-full outline-none"
                    />
                  </div>

                  <button 
                    onClick={exportarCSV}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>

              <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table className="min-w-[680px] w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                      <th className="pb-3">Estudante</th>
                      <th className="pb-3">Registro Acadêmico (RA)</th>
                      <th className="pb-3">Disciplina / Turma</th>
                      <th className="pb-3 text-center">Nota N1</th>
                      <th className="pb-3 text-center">Nota N2</th>
                      <th className="pb-3 text-center">Nota N3</th>
                      <th className="pb-3 text-center">Média Semestral</th>
                      <th className="pb-3 text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alunosFiltradosRelatorio.map((item) => {
                      const turmaObj = turmas.find(t => t.id === item.turmaId);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-3 font-bold text-slate-800">{item.nome}</td>
                          <td className="py-3 font-mono text-slate-500">{item.ra}</td>
                          <td className="py-3 text-slate-600 font-semibold">{turmaObj ? turmaObj.nome : 'Engenharia IV'}</td>
                          <td className="py-3 text-center font-bold text-catolica-primary">{item.n1.toFixed(1)}</td>
                          <td className="py-3 text-center font-bold text-emerald-600 bg-emerald-50/50 rounded-lg">{item.n2.toFixed(1)}</td>
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE QUESTÕES */}
        {modalAberto && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {questaoEmEdicaoId ? 'Editar Questão' : 'Nova Questão do Banco'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure o enunciado e as alternativas de resposta</p>
                </div>
                <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestaoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enunciado da Questão:</label>
                  <textarea 
                    required 
                    rows={3}
                    value={novoEnunciado} 
                    onChange={e => setNovoEnunciado(e.target.value)} 
                    placeholder="Digite a pergunta ou caso de teste da questão..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-catolica-primary" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Questão:</label>
                    <select 
                      value={novoTipo} 
                      onChange={e => setNovoTipo(e.target.value as any)} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="objetiva">Objetiva (Múltipla Escolha)</option>
                      <option value="discursiva">Discursiva (Texto Aberto)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pontuação (pts):</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      value={novaPontuacao} 
                      onChange={e => setNovaPontuacao(Number(e.target.value))} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tags (separadas por vírgula):</label>
                    <input 
                      type="text" 
                      value={novasTags} 
                      onChange={e => setNovasTags(e.target.value)} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs" 
                    />
                  </div>
                </div>

                {novoTipo === 'objetiva' && (
                  <div className="space-y-3 border-t pt-4">
                    <span className="text-xs font-bold text-slate-700 uppercase block">Alternativas de Múltipla Escolha:</span>
                    {alternativasCadastro.map((alt, idx) => (
                      <div key={alt.letra} className="flex items-center gap-3">
                        <span className="font-bold text-xs text-slate-700 w-4">{alt.letra})</span>
                        <input 
                          type="text" 
                          required
                          placeholder={`Texto da Alternativa ${alt.letra}`}
                          value={alt.texto}
                          onChange={e => {
                            const clone = [...alternativasCadastro];
                            clone[idx].texto = e.target.value;
                            setAlternativasCadastro(clone);
                          }}
                          className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="alternativaCorretaRadio"
                            checked={alt.correta}
                            onChange={() => {
                              setAlternativasCadastro(alternativasCadastro.map((a, i) => ({
                                ...a,
                                correta: i === idx
                              })));
                            }}
                            className="w-3.5 h-3.5 accent-catolica-primary"
                          />
                          Correta
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">
                    Cancelar
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-catolica-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-catolica-dark transition">
                    {questaoEmEdicaoId ? 'Atualizar Questão' : 'Salvar no Banco'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAIS DE ALUNO E TURMA */}
        {modalAlunoAberto && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {alunoEmEdicaoId ? 'Editar Aluno' : 'Cadastro do Aluno'}
                  </h3>
                  <p className="text-xs text-slate-500">Estrutura baseada no Portal Acadêmico Católica SC</p>
                </div>
                <button onClick={() => setModalAlunoAberto(false)} className="text-slate-400 hover:text-slate-600 transition">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveAlunoSubmit} className="space-y-4">
                <div className="border-b pb-3">
                  <span className="text-xs font-bold text-catolica-primary uppercase block mb-2">Dados Acadêmicos & Identificação</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Nome Completo</label>
                      <input required type="text" value={formAluno.nome} onChange={e => setFormAluno({ ...formAluno, nome: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Registro Acadêmico (RA)</label>
                      <input type="text" placeholder="Ex: 1328834" value={formAluno.ra} onChange={e => setFormAluno({ ...formAluno, ra: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">E-mail de acesso</label>
                      <input required type="email" autoComplete="email" placeholder="aluno@catolicasc.edu.br" value={formAluno.email} onChange={e => setFormAluno({ ...formAluno, email: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg text-xs" />
                      <p className="mt-1 text-[10px] text-slate-500">O aluno usará este e-mail para entrar na área dele.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">Disciplina / Turma</label>
                      <select value={formAluno.turmaId} onChange={e => setFormAluno({ ...formAluno, turmaId: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold">
                        <option value="">Nenhuma Disciplina</option>
                        {turmas.map(t => (
                          <option key={t.id} value={t.id}>{t.nome}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setModalAlunoAberto(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-catolica-primary text-white rounded-xl text-xs font-bold shadow-md">
                    {alunoEmEdicaoId ? 'Atualizar Aluno' : 'Salvar Aluno'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {modalTurmaAberto && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 border border-slate-200">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {turmaEmEdicaoId ? 'Editar Turma' : 'Nova Turma Acadêmica'}
                </h3>
                <button onClick={() => setModalTurmaAberto(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveTurmaSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Disciplina / Turma</label>
                  <input required type="text" placeholder="Ex: Engenharia de Software IV" value={formTurma.nome} onChange={e => setFormTurma({ ...formTurma, nome: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Curso</label>
                  <input type="text" value={formTurma.curso} onChange={e => setFormTurma({ ...formTurma, curso: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Semestre Letivo</label>
                  <input type="text" value={formTurma.semestre} onChange={e => setFormTurma({ ...formTurma, semestre: e.target.value })} className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs" />
                </div>

                <div className="flex justify-end gap-3 border-t pt-4">
                  <button type="button" onClick={() => setModalTurmaAberto(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md">
                    {turmaEmEdicaoId ? 'Atualizar Turma' : 'Criar Turma'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
