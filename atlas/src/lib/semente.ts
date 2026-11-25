/* Dados iniciais da simulação: usuários fictícios e algumas páginas de exemplo. */
import type { Avaliacao, Bloco, DadosAtlas, Pagina, Registro, TipoBloco, Usuario } from './tipos'

let n = 0
const id = () => `s${Date.now().toString(36)}${(n++).toString(36)}`
const dias = (d: number) => new Date(Date.now() - d * 86400_000).toISOString()

const b = (tipo: TipoBloco, extra: Partial<Bloco> = {}): Bloco => ({ id: id(), tipo, ...extra })
const p = (html: string) => b('paragrafo', { html })
const h = (nivel: 1 | 2 | 3, html: string) => b(`h${nivel}` as TipoBloco, { html })

export const USUARIOS_DEMO: Usuario[] = [
  { id: 'u-produtos', nome: 'Time de Produtos', login: 'produtos01', email: 'produtos@ldsoft.com.br', senha: 'Atlas@2026', perfil: 'admin', areas: ['produtos', 'benchmarks'], podePublicar: true, ativo: true },
  { id: 'u-colab', nome: 'Camila Rocha', login: 'colab01', email: 'camila.rocha@ldsoft.com.br', senha: 'Atlas@2026', perfil: 'colaborador', areas: ['produtos', 'benchmarks'], podePublicar: false, ativo: true },
  { id: 'u-colab2', nome: 'Rafael Mendes', login: 'colab02', email: 'rafael.mendes@ldsoft.com.br', senha: 'Atlas@2026', perfil: 'colaborador', areas: ['benchmarks'], podePublicar: true, ativo: true },
  { id: 'u-leitor', nome: 'Marina Souza', login: 'leitor01', email: 'marina.souza@ldsoft.com.br', senha: 'Atlas@2026', perfil: 'leitor', areas: [], podePublicar: false, ativo: true },
]

export function criarDadosIniciais(): DadosAtlas {
  const adm = USUARIOS_DEMO[0]!, camila = USUARIOS_DEMO[1]!

  const base = (x: Pick<Pagina, 'id' | 'codigo' | 'slug' | 'area' | 'titulo' | 'descricao' | 'categoria' | 'blocos'> & Partial<Pagina>): Pagina => ({
    autorId: adm.id, autorNome: adm.nome, criadoEm: dias(6), atualizadoEm: dias(2), atualizadoPorNome: adm.nome, publicadoEm: dias(2),
    status: 'publicado', documentos: [], relacionadas: [], ...x,
  })

  const paginas: Pagina[] = [
    base({
      id: 'p-apol', codigo: 'PRD-0001', slug: 'apol-marcas', area: 'produtos', titulo: 'APOL+ Marcas', categoria: 'Briefing', produto: 'APOL+',
      descricao: 'Plataforma de gestão de propriedade intelectual: processos, relatórios e acompanhamento de marcas.',
      criadoEm: dias(9), atualizadoEm: dias(1), relacionadas: ['p-apol-fluxos', 'p-bm-gestao'],
      blocos: [
        h(2, 'Visão geral'),
        p('O <b>APOL+ Marcas</b> centraliza o acompanhamento de processos de marcas, com relatórios, filtros avançados e exportação.'),
        h(3, 'Público-alvo'),
        b('lista', { itens: ['Escritórios de propriedade intelectual', 'Departamentos jurídicos', 'Times de proteção de marca'] }),
        h(2, 'Responsáveis'),
        b('tabela', { cabecalho: true, linhas: [['Papel', 'Pessoa', 'Contato'], ['Produto', 'Time de Produtos', 'produtos@ldsoft.com.br'], ['Design', 'Time de Produtos', 'produtos@ldsoft.com.br']] }),
        b('separador'),
        p('O Design System do produto está documentado em <a href="#/design-system/apol">Design System › APOL+</a>.'),
      ],
    }),
    base({
      id: 'p-apol-fluxos', codigo: 'PRD-0002', slug: 'apol-marcas-fluxos-principais', area: 'produtos', titulo: 'APOL+ Marcas: fluxos principais', categoria: 'Fluxos', produto: 'APOL+',
      descricao: 'Mapa dos fluxos de consulta, filtro e exportação de processos.',
      criadoEm: dias(5), atualizadoEm: dias(4), relacionadas: ['p-apol'],
      blocos: [
        h(2, 'Consulta de processos'),
        b('numerada', { itens: ['Abrir <b>Relatório de Processos</b>', 'Aplicar os filtros desejados', 'Selecionar as linhas e usar a barra de ações'] }),
        b('citacao', { html: 'Toda listagem segue o mesmo padrão: filtro, tabela de resultados e barra de ações.' }),
      ],
    }),
    base({
      id: 'p-rascunho', codigo: 'PRD-0003', slug: 'novo-modulo-de-prazos', area: 'produtos', titulo: 'Novo módulo de prazos', categoria: 'Documentação', produto: 'APOL+',
      descricao: 'Rascunho de documentação do módulo de controle de prazos.',
      status: 'rascunho', publicadoEm: undefined, autorId: camila.id, autorNome: camila.nome, atualizadoPorNome: camila.nome, criadoEm: dias(1), atualizadoEm: dias(0.1),
      blocos: [h(2, 'Objetivo'), p('Descrever o comportamento esperado do módulo de prazos. <i>Em elaboração.</i>')],
    }),
    base({
      id: 'p-bm-gestao', codigo: 'BMK-0001', slug: 'plataformas-de-gestao-de-pi', area: 'benchmarks', titulo: 'Plataformas de gestão de PI', categoria: 'Concorrentes', produto: 'APOL+',
      descricao: 'Comparativo de plataformas concorrentes: navegação, relatórios e experiência de busca.',
      autorId: camila.id, autorNome: camila.nome, criadoEm: dias(4), atualizadoEm: dias(0.4), atualizadoPorNome: camila.nome, relacionadas: ['p-apol'],
      blocos: [
        h(2, 'Contexto'), p('Levantamento feito para orientar a evolução dos relatórios do APOL+.'),
        h(2, 'Achados'),
        b('lista', { itens: ['Busca global com atalho de teclado é padrão entre os concorrentes', 'Exportação em lote aparece em todos os produtos analisados'] }),
        h(2, 'Recomendação'), p('Priorizar a busca global e manter a exportação sempre visível na barra de ações.'),
      ],
    }),
    ...SEMENTES_EXTRAS.map(s => s.criar()),
  ]

  const historico: Registro[] = paginas.flatMap(registrosDaSemente).sort((a, c) => c.em.localeCompare(a.em))

  return { versao: 1, usuarios: USUARIOS_DEMO, paginas, historico, contadores: { produtos: 3, benchmarks: 2 }, sementes: SEMENTES_EXTRAS.map(s => s.id) }
}

/** Registros de "criou" e "publicou" de uma página de exemplo */
export function registrosDaSemente(pg: Pagina): Registro[] {
  const adm = USUARIOS_DEMO[0]!
  const r: Registro[] = [{ id: id(), em: pg.criadoEm, usuarioId: pg.autorId, usuarioNome: pg.autorNome, tipo: 'criou', paginaId: pg.id, paginaTitulo: pg.titulo, area: pg.area }]
  if (pg.status === 'publicado') r.push({ id: id(), em: pg.publicadoEm ?? pg.atualizadoEm, usuarioId: adm.id, usuarioNome: adm.nome, tipo: 'publicou', paginaId: pg.id, paginaTitulo: pg.titulo, area: pg.area })
  return r
}

/* ── Benchmarks reais ── */

/** APOL × 8 concorrentes (Figma "Benchmarks Compilados", versão resumida). Tem = T, Parcial = P, Não tem = N, não avaliado = - */
function benchmarkApolCompilado(): Pagina {
  const adm = USUARIOS_DEMO[0]!
  const em = '2026-07-15T12:00:00.000Z'
  const mapa: Record<string, Avaliacao> = { T: 'tem', P: 'parcial', N: 'nao', '-': 'na' }
  const linhas: [string, string][] = [
    ['Busca de anterioridade (consulta)', 'TPTPNTTTT'],
    ['Cadastrar o processo (automático)', 'TNNNN-P-N'],
    ['Conferir o cadastro / exportar relatórios', 'TPPNN-T-T'],
    ['Cadastro de envolvidos', 'TTTNT-T-T'],
    ['Emitir relatório de prorrogação', 'TTNNN-N-N'],
    ['Emitir comunicado para clientes', 'TTNPT-P-P'],
    ['Relatório de despacho (lote, citação RPI)', 'TTTNT-P-P'],
    ['Relatório de petições', 'TTPNN-N-N'],
    ['Colidência (parâmetros, relatório, marcas)', 'TTTNT-T-P'],
    ['Consulta RPI (prospecção de clientes)', 'TTTT--N-P'],
    ['Agenda (prazos, sync Gmail/Outlook, API)', 'TTTP--N-T'],
    ['Configurações (e-mail, automação)', 'TTNP--P-P'],
    ['Lançamentos financeiros', 'TTNP--N-N'],
    ['Avisos e alertas (notificações)', 'T-----T-T'],
  ]
  return {
    id: 'p-bm-apol-compilado', codigo: 'BMK-0002', slug: 'apol-benchmarks-compilados', area: 'benchmarks',
    titulo: 'APOL - Benchmarks Compilados', categoria: 'Gestão de marcas e PI', produto: 'APOL+',
    descricao: 'Apol × 8 concorrentes · 14 funcionalidades · atualizado em 15/07/2026',
    autorId: adm.id, autorNome: adm.nome, criadoEm: em, atualizadoEm: em, atualizadoPorNome: adm.nome, publicadoEm: em,
    status: 'publicado', documentos: [], relacionadas: ['p-apol', 'p-bm-gestao'],
    blocos: [
      b('comparativo', {
        comparativo: {
          colunas: [
            { nome: 'Apol', sub: 'LDSOFT' }, { nome: 'Softica', sub: 'Não é SaaS' }, { nome: 'Sixsoft', sub: 'SaaS' }, { nome: 'Ilupi (PRIS)', sub: 'SaaS' },
            { nome: 'Reggente' }, { nome: 'Marca Acomp.', sub: 'Monitoram.' }, { nome: 'Brandious' }, { nome: 'Siga sua Marca', sub: 'Monitoram.' }, { nome: 'Takip', sub: 'SaaS' },
          ],
          destaque: 0,
          linhas: linhas.map(([funcionalidade, v]) => ({ funcionalidade, valores: [...v].map(c => mapa[c]!) })),
        },
        legenda: 'Fontes: quadro original "Benchmarks Compilados" · análise Takip 15/07/2026 (site, telas do produto e teste de anterioridade). Coluna Apol destacada como referência. Células "—" = não avaliado no estudo original.',
      }),
    ],
  }
}

/** Páginas de exemplo acrescentadas depois da primeira versão: a migração as inclui uma única vez em dados já salvos */
export const SEMENTES_EXTRAS: { id: string; criar: () => Pagina }[] = [
  { id: 'p-bm-apol-compilado', criar: benchmarkApolCompilado },
]
