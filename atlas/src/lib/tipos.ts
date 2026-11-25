/* Modelo de dados do Atlas (conteúdo dinâmico, usuários e histórico). */

export type Area = 'produtos' | 'benchmarks'
export type Perfil = 'admin' | 'colaborador' | 'leitor'
export type Status = 'rascunho' | 'publicado'

export interface Usuario {
  id: string
  nome: string
  login: string
  email: string
  /** SIMULAÇÃO: senha em texto puro só existe porque não há backend. Nunca fazer isso em produção. */
  senha: string
  perfil: Perfil
  /** Áreas em que o colaborador pode criar/editar (admin tem todas) */
  areas: Area[]
  /** Colaborador só publica quando autorizado */
  podePublicar: boolean
  ativo: boolean
}

export type TipoBloco =
  | 'paragrafo' | 'h1' | 'h2' | 'h3' | 'lista' | 'numerada' | 'citacao'
  | 'imagem' | 'tabela' | 'comparativo' | 'link' | 'arquivo' | 'separador'

/** Avaliação de uma funcionalidade num produto (tabela comparativa de benchmark) */
export type Avaliacao = 'tem' | 'parcial' | 'nao' | 'na'

/** Tabela comparativa de benchmark: produtos nas colunas, funcionalidades nas linhas */
export interface Comparativo {
  /** produtos comparados; `sub` é a linha pequena abaixo do nome (ex.: SAAS) */
  colunas: { nome: string; sub?: string }[]
  /** índice da coluna de referência, destacada (normalmente o nosso produto) */
  destaque?: number
  linhas: { funcionalidade: string; valores: Avaliacao[] }[]
}

export interface Bloco {
  id: string
  tipo: TipoBloco
  /** texto com formatação básica (negrito, itálico, sublinhado, código, link) */
  html?: string
  /** itens de lista (cada um com formatação básica) */
  itens?: string[]
  url?: string
  nome?: string
  tamanho?: number
  /** arquivo guardado no navegador (imagem ou anexo) */
  arquivoId?: string
  legenda?: string
  linhas?: string[][]
  cabecalho?: boolean
  comparativo?: Comparativo
}

export interface Documento {
  id: string
  nome: string
  tamanho: number
  tipo: string
  enviadoPor: string
  enviadoPorNome: string
  enviadoEm: string
}

export interface Pagina {
  id: string
  /** identificação legível, ex.: PRD-0003 */
  codigo: string
  /** endereço próprio da página dentro da área */
  slug: string
  area: Area
  titulo: string
  descricao: string
  categoria: string
  /** produto da LDSOFT a que o conteúdo se refere (Produtos e Benchmarks) */
  produto?: string
  autorId: string
  autorNome: string
  criadoEm: string
  atualizadoEm: string
  atualizadoPorNome: string
  publicadoEm?: string
  status: Status
  blocos: Bloco[]
  documentos: Documento[]
  relacionadas: string[]
}

export type TipoAlteracao =
  | 'criou' | 'editou' | 'publicou' | 'despublicou' | 'excluiu'
  | 'anexou' | 'removeu-documento' | 'usuario' | 'permissoes'

export interface Registro {
  id: string
  em: string
  usuarioId: string
  usuarioNome: string
  tipo: TipoAlteracao
  paginaId?: string
  paginaTitulo?: string
  area?: Area
  detalhe?: string
}

export interface DadosAtlas {
  versao: number
  usuarios: Usuario[]
  paginas: Pagina[]
  historico: Registro[]
  contadores: Record<Area, number>
  /** páginas de exemplo extras já incluídas (para não recriá-las depois de excluídas) */
  sementes?: string[]
}
