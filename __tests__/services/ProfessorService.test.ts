import { ProfessorService } from '../../src/services/ProfessorService';
import { UsuarioRepository } from '../../src/repositories/UsuarioRepository';
import { UsuarioModel } from '../../src/models/UsuarioModel';

describe('ProfessorService - Gestão Exclusiva de Professores pelo Admin', () => {
  let service: ProfessorService;
  let mockRepo: UsuarioRepository;

  const mockUsuarios: UsuarioModel[] = [
    new UsuarioModel({
      id: 'usr-admin-01',
      nome: 'Administrador SGP',
      email: 'admin@admin.com',
      senha: 'admin',
      role: 'ADMIN'
    }),
    new UsuarioModel({
      id: 'usr-prof-01',
      nome: 'Prof. Agenor Alvise',
      email: 'prof.agenor@catolica.edu.br',
      senha: 'admin',
      role: 'PROFESSOR',
      disciplina: 'Engenharia de Software IV'
    }),
    new UsuarioModel({
      id: 'usr-prof-02',
      nome: 'Prof. Marcos Silva',
      email: 'prof.marcos@catolica.edu.br',
      senha: 'admin',
      role: 'PROFESSOR',
      disciplina: 'Arquitetura de Software'
    })
  ];

  beforeEach(() => {
    mockRepo = new UsuarioRepository();
    jest.spyOn(mockRepo, 'findAll').mockResolvedValue(mockUsuarios);
    jest.spyOn(mockRepo, 'save').mockImplementation(async (u) => u);
    jest.spyOn(mockRepo, 'delete').mockResolvedValue(true);
    service = new ProfessorService(mockRepo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deve listar apenas usuários com papel de PROFESSOR', async () => {
    const profs = await service.listarProfessores();

    expect(profs).toHaveLength(2);
    expect(profs.every(p => p.role === 'PROFESSOR')).toBe(true);
    expect(profs.some(p => p.email === 'admin@admin.com')).toBe(false);
  });

  it('deve permitir que o ADMINISTRADOR cadastre um novo professor', async () => {
    const novoProf = new UsuarioModel({
      nome: 'Prof. Carlos Santos',
      email: 'prof.carlos@catolica.edu.br',
      disciplina: 'Banco de Dados'
    });

    const salvo = await service.salvarProfessor(novoProf, 'ADMIN');

    expect(salvo).toBeDefined();
    expect(salvo.nome).toBe('Prof. Carlos Santos');
    expect(salvo.role).toBe('PROFESSOR');
  });

  it('deve BLOQUEAR o cadastro de professor se o usuário não for ADMIN', async () => {
    const novoProf = new UsuarioModel({
      nome: 'Prof. Hacker',
      email: 'hacker@catolica.edu.br',
      disciplina: 'Segurança'
    });

    await expect(service.salvarProfessor(novoProf, 'PROFESSOR'))
      .rejects
      .toThrow('Acesso negado: Apenas administradores podem cadastrar ou editar professores.');
  });

  it('deve BLOQUEAR a exclusão de professor se o usuário não for ADMIN', async () => {
    await expect(service.excluirProfessor('usr-prof-01', 'PROFESSOR'))
      .rejects
      .toThrow('Acesso negado: Apenas administradores podem excluir professores.');
  });

  it('deve permitir a exclusão de professor pelo ADMIN', async () => {
    const deleted = await service.excluirProfessor('usr-prof-01', 'ADMIN');
    expect(deleted).toBe(true);
  });
});
