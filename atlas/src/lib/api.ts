/*
  API SIMULADA do Atlas — faz o papel do backend enquanto o projeto é só front-end.

  • Os dados ficam no localStorage (e os arquivos no IndexedDB), neste navegador.
  • A sessão é lida AQUI, não pela interface: cada operação descobre quem é o usuário
    e valida a permissão antes de gravar, como um servidor faria. Esconder um botão na tela
    nunca é a única proteção.
  • A interface só conhece as funções exportadas daqui. Para ligar um backend real, troque
    o corpo destas funções por chamadas HTTP, mantendo as assinaturas.
*/
import { useSyncExternalStore } from 'react'
import { areaPorId } from './areas'
import { removerArquivo, salvarArquivo } from './arquivos'
import { slugificar, uid } from './formatar'
import { sanitizar } from './html'
import {
  ErroPermissao, eAdmin, podeCriar, podeEditar, podeExcluir, podeGerenciarUsuarios, podePublicar, podeVer, podeVerHistorico,
} from './permissoes'
import { SEMENTES_EXTRAS, criarDadosIniciais, registrosDaSemente } from './semente'
import type { Area, Bloco, DadosAtlas, Documento, Pagina, Registro, TipoAlteracao, Usuario } from './tipos'

const CHAVE_DADOS = 'atlas.dados.v1'
const CHAVE_SESSAO = 'atlas.sessao.v1'


const agora = () => new Date().toISOString()

/* Dados salvos antes do campo "produto": associa as páginas de exemplo ao APOL+ */
const PRODUTO_DAS_SEMENTES: Record<string, string> = { 'p-apol': 'APOL+', 'p-apol-fluxos': 'APOL+', 'p-rascunho': 'APOL+', 'p-bm-gestao': 'APOL+' }
function migrar(d: DadosAtlas): DadosAtlas {
  /* Área "guias" foi removida: descarta páginas, histórico, contador e permissões antigas */
  const eGuias = (a?: string) => a === 'guias'
  d.paginas = d.paginas.filter(p => !eGuias(p.area))
  d.historico = d.historico.filter(r => !eGuias(r.area))
  d.usuarios = d.usuarios.map(u => ({ ...u, areas: u.areas.filter(a => !eGuias(a)) }))
  delete (d.contadores as Record<string, number>).guias
  d.paginas = d.paginas.map(p => p.produto || !PRODUTO_DAS_SEMENTES[p.id] ? p : { ...p, produto: PRODUTO_DAS_SEMENTES[p.id] })
  /* Páginas de exemplo novas (ex.: benchmarks reais): entram uma única vez, com o próximo código livre da área */
  const feitas = new Set(d.sementes ?? [])
  for (const s of SEMENTES_EXTRAS) {
    if (feitas.has(s.id)) continue
    feitas.add(s.id)
    if (d.paginas.some(p => p.id === s.id)) continue
    const p = s.criar()
    const n = Math.max(d.contadores[p.area] ?? 0, ...d.paginas.filter(x => x.area === p.area).map(x => Number(x.codigo.split('-')[1]) || 0)) + 1
    p.codigo = `${areaPorId(p.area).prefixo}-${String(n).padStart(4, '0')}`
    if (d.paginas.some(x => x.area === p.area && x.slug === p.slug)) p.slug = `${p.slug}-${n}`
    d.contadores = { ...d.contadores, [p.area]: n }
    d.paginas = [...d.paginas, p]
    d.historico = [...registrosDaSemente(p), ...d.historico].sort((a, c) => c.em.localeCompare(a.em))
  }
  d.sementes = [...feitas]
  return d
}

/* ── Armazenamento ── */
function carregar(): DadosAtlas {
  try {
    const bruto = localStorage.getItem(CHAVE_DADOS)
    if (bruto) { const d = JSON.parse(bruto) as DadosAtlas; if (d.versao === 1) return migrar(d) }
  } catch { /* dados corrompidos: recomeça da semente */ }
  const d = criarDadosIniciais()
  try { localStorage.setItem(CHAVE_DADOS, JSON.stringify(d)) } catch { /* sem armazenamento */ }
  return d
}

let db: DadosAtlas = carregar()
let versao = 0
const ouvintes = new Set<() => void>()
const notificar = () => { versao++; ouvintes.forEach(f => f()) }

function gravar() {
  try { localStorage.setItem(CHAVE_DADOS, JSON.stringify(db)) }
  catch { throw new Error('O armazenamento do navegador está cheio. Remova documentos antigos e tente de novo.') }
  notificar()
}

/** Re-renderiza o componente sempre que algo muda (inclusive em outra aba) */
export const useDadosAtlas = () => useSyncExternalStore(f => { ouvintes.add(f); return () => { ouvintes.delete(f) } }, () => versao)

addEventListener('storage', e => {
  if (e.key === CHAVE_DADOS || e.key === CHAVE_SESSAO) { db = carregar(); notificar() }
})

/* ── Sessão e autenticação ── */
export function usuarioAtual(): Usuario | null {
  try {
    const s = JSON.parse(localStorage.getItem(CHAVE_SESSAO) ?? 'null') as { usuarioId: string } | null
    const u = s && db.usuarios.find(x => x.id === s.usuarioId)
    return u && u.ativo ? u : null
  } catch { return null }
}

function exigirUsuario(): Usuario {
  const u = usuarioAtual()
  if (!u) throw new ErroPermissao('Sua sessão expirou. Entre novamente.')
  return u
}

export function entrar(login: string, senha: string): Usuario {
  const u = db.usuarios.find(x => x.login.toLowerCase() === login.trim().toLowerCase())
  if (!u || u.senha !== senha) throw new Error('Usuário ou senha incorretos.')
  if (!u.ativo) throw new Error('Este acesso está desativado. Fale com o time de Produtos.')
  try { localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ usuarioId: u.id, desde: agora() })) } catch { /* */ }
  notificar()
  return u
}

export function sair() {
  try { localStorage.removeItem(CHAVE_SESSAO) } catch { /* */ }
  notificar()
}

/** Restaura a base de demonstração (só administrador) */
export function restaurarDemonstracao() {
  const u = exigirUsuario()
  if (!eAdmin(u)) throw new ErroPermissao()
  db = criarDadosIniciais()
  gravar()
}

/* ── Histórico ── */
function registrar(u: Usuario, tipo: TipoAlteracao, extra: Partial<Registro> = {}) {
  db.historico = [{ id: uid(), em: agora(), usuarioId: u.id, usuarioNome: u.nome, tipo, ...extra }, ...db.historico].slice(0, 1000)
}

export function listarHistorico(paginaId?: string): Registro[] {
  if (!podeVerHistorico(exigirUsuario())) throw new ErroPermissao('Somente administradores veem o histórico de alterações.')
  return paginaId ? db.historico.filter(r => r.paginaId === paginaId) : db.historico
}

/* ── Páginas ── */
export function listarPaginas(area?: Area): Pagina[] {
  const u = usuarioAtual()
  return db.paginas.filter(p => (!area || p.area === area) && podeVer(u, p)).sort((a, c) => c.atualizadoEm.localeCompare(a.atualizadoEm))
}

export function obterPagina(area: Area, slug: string): Pagina | undefined {
  return listarPaginas(area).find(p => p.slug === slug)
}

export function obterPaginaPorId(id: string): Pagina | undefined {
  const u = usuarioAtual()
  return db.paginas.find(p => p.id === id && podeVer(u, p))
}

/** Categorias já usadas na área + as sugeridas */
export function categoriasDaArea(area: Area): string[] {
  const usadas = db.paginas.filter(p => p.area === area).map(p => p.categoria).filter(Boolean)
  return [...new Set([...areaPorId(area).categorias, ...usadas])]
}

function slugUnico(area: Area, titulo: string, ignorar?: string) {
  const base = slugificar(titulo)
  let slug = base, i = 2
  while (db.paginas.some(p => p.area === area && p.slug === slug && p.id !== ignorar)) slug = `${base}-${i++}`
  return slug
}

const exigirPagina = (id: string): Pagina => {
  const p = db.paginas.find(x => x.id === id)
  if (!p || !podeVer(usuarioAtual(), p)) throw new Error('Página não encontrada.')
  return p
}

function limparBlocos(blocos: Bloco[]): Bloco[] {
  return blocos.map(b => ({
    ...b,
    html: b.html === undefined ? undefined : sanitizar(b.html),
    itens: b.itens?.map(sanitizar),
    legenda: b.legenda === undefined ? undefined : sanitizar(b.legenda),
  }))
}

function atualizar(p: Pagina, patch: Partial<Pagina>, u: Usuario) {
  db.paginas = db.paginas.map(x => x.id === p.id ? { ...p, ...patch, atualizadoEm: agora(), atualizadoPorNome: u.nome } : x)
}

export interface DadosPagina { titulo: string; descricao: string; categoria: string; produto?: string; blocos?: Bloco[]; relacionadas?: string[] }

export function criarPagina(area: Area, dados: DadosPagina): Pagina {
  const u = exigirUsuario()
  if (!podeCriar(u, area)) throw new ErroPermissao('Você não tem permissão para criar conteúdo nesta área.')
  const titulo = dados.titulo.trim()
  if (!titulo) throw new Error('Dê um título à página.')
  const n = db.contadores[area] + 1
  const t = agora()
  const pagina: Pagina = {
    id: uid(), codigo: `${areaPorId(area).prefixo}-${String(n).padStart(4, '0')}`, slug: slugUnico(area, titulo), area, titulo,
    descricao: dados.descricao.trim(), categoria: dados.categoria.trim(), produto: dados.produto || undefined, autorId: u.id, autorNome: u.nome, criadoEm: t, atualizadoEm: t,
    atualizadoPorNome: u.nome, status: 'rascunho', blocos: limparBlocos(dados.blocos ?? []), documentos: [], relacionadas: dados.relacionadas ?? [],
  }
  db = { ...db, contadores: { ...db.contadores, [area]: n }, paginas: [pagina, ...db.paginas] }
  registrar(u, 'criou', { paginaId: pagina.id, paginaTitulo: titulo, area })
  gravar()
  return pagina
}

export function salvarPagina(id: string, dados: DadosPagina): Pagina {
  const u = exigirUsuario(), p = exigirPagina(id)
  if (!podeEditar(u, p)) throw new ErroPermissao('Você não tem permissão para editar esta página.')
  const titulo = dados.titulo.trim()
  if (!titulo) throw new Error('Dê um título à página.')
  atualizar(p, {
    titulo, descricao: dados.descricao.trim(), categoria: dados.categoria.trim(), produto: dados.produto || undefined, blocos: limparBlocos(dados.blocos ?? p.blocos),
    relacionadas: dados.relacionadas ?? p.relacionadas, slug: titulo === p.titulo ? p.slug : slugUnico(p.area, titulo, p.id),
  }, u)
  registrar(u, 'editou', { paginaId: p.id, paginaTitulo: titulo, area: p.area })
  gravar()
  return db.paginas.find(x => x.id === id)!
}

export function publicar(id: string) {
  const u = exigirUsuario(), p = exigirPagina(id)
  if (!podePublicar(u, p)) throw new ErroPermissao('Você não tem autorização para publicar. Peça ao time de Produtos.')
  atualizar(p, { status: 'publicado', publicadoEm: p.publicadoEm ?? agora() }, u)
  registrar(u, 'publicou', { paginaId: p.id, paginaTitulo: p.titulo, area: p.area })
  gravar()
}

export function despublicar(id: string) {
  const u = exigirUsuario(), p = exigirPagina(id)
  if (!podePublicar(u, p)) throw new ErroPermissao('Você não tem autorização para despublicar esta página.')
  atualizar(p, { status: 'rascunho' }, u)
  registrar(u, 'despublicou', { paginaId: p.id, paginaTitulo: p.titulo, area: p.area })
  gravar()
}

export function excluir(id: string) {
  const u = exigirUsuario(), p = exigirPagina(id)
  if (!podeExcluir(u, p)) throw new ErroPermissao('Você não tem permissão para excluir esta página.')
  p.documentos.forEach(d => void removerArquivo(d.id))
  p.blocos.forEach(b => { if (b.arquivoId) void removerArquivo(b.arquivoId) })
  db = { ...db, paginas: db.paginas.filter(x => x.id !== id).map(x => ({ ...x, relacionadas: x.relacionadas.filter(r => r !== id) })) }
  registrar(u, 'excluiu', { paginaId: p.id, paginaTitulo: p.titulo, area: p.area })
  gravar()
}

/* ── Documentos ── */
export const LIMITE_ARQUIVO = 25 * 1024 * 1024

export async function adicionarDocumento(paginaId: string, arquivo: File): Promise<Documento> {
  const u = exigirUsuario(), p = exigirPagina(paginaId)
  if (!podeEditar(u, p)) throw new ErroPermissao('Você não tem permissão para inserir documentos nesta página.')
  if (arquivo.size > LIMITE_ARQUIVO) throw new Error(`"${arquivo.name}" passa de 25 MB.`)
  const doc: Documento = { id: uid(), nome: arquivo.name, tamanho: arquivo.size, tipo: arquivo.type, enviadoPor: u.id, enviadoPorNome: u.nome, enviadoEm: agora() }
  await salvarArquivo(doc.id, arquivo)
  // relê a página: outro upload pode ter terminado enquanto este gravava
  const atual = exigirPagina(paginaId)
  atualizar(atual, { documentos: [...atual.documentos, doc] }, u)
  registrar(u, 'anexou', { paginaId, paginaTitulo: p.titulo, area: p.area, detalhe: arquivo.name })
  gravar()
  return doc
}

export function removerDocumento(paginaId: string, docId: string) {
  const u = exigirUsuario(), p = exigirPagina(paginaId)
  if (!podeEditar(u, p)) throw new ErroPermissao('Você não tem permissão para remover documentos desta página.')
  const doc = p.documentos.find(d => d.id === docId)
  if (!doc) return
  void removerArquivo(docId)
  atualizar(p, { documentos: p.documentos.filter(d => d.id !== docId) }, u)
  registrar(u, 'removeu-documento', { paginaId, paginaTitulo: p.titulo, area: p.area, detalhe: doc.nome })
  gravar()
}

/** Salva um arquivo solto (imagem ou anexo de bloco) */
export async function guardarArquivoDeBloco(arquivo: Blob): Promise<string> {
  const u = exigirUsuario()
  if (!(u.perfil === 'admin' || u.perfil === 'colaborador')) throw new ErroPermissao()
  const id = uid()
  await salvarArquivo(id, arquivo)
  return id
}

/* ── Usuários (administração) ── */
export function listarUsuarios(): Usuario[] {
  if (!podeGerenciarUsuarios(exigirUsuario())) throw new ErroPermissao('Somente o time de Produtos gerencia colaboradores.')
  return db.usuarios
}

export function salvarUsuario(dados: Omit<Usuario, 'id'> & { id?: string }): Usuario {
  const adm = exigirUsuario()
  if (!podeGerenciarUsuarios(adm)) throw new ErroPermissao('Somente o time de Produtos gerencia colaboradores.')
  const nome = dados.nome.trim(), login = dados.login.trim()
  if (!nome || !login) throw new Error('Informe nome e usuário.')
  if (!dados.senha) throw new Error('Informe uma senha.')
  if (db.usuarios.some(x => x.login.toLowerCase() === login.toLowerCase() && x.id !== dados.id)) throw new Error('Já existe um usuário com este login.')
  const anterior = dados.id ? db.usuarios.find(x => x.id === dados.id) : undefined
  const novo: Usuario = {
    ...dados, id: dados.id ?? uid(), nome, login, email: dados.email.trim(),
    areas: dados.perfil === 'admin' ? ['produtos', 'benchmarks'] : dados.perfil === 'leitor' ? [] : dados.areas,
    podePublicar: dados.perfil === 'admin' ? true : dados.perfil === 'leitor' ? false : dados.podePublicar,
  }
  const admins = db.usuarios.filter(x => x.perfil === 'admin' && x.ativo && x.id !== novo.id).length
  if (!(novo.perfil === 'admin' && novo.ativo) && admins === 0) throw new Error('É preciso manter ao menos um administrador ativo.')
  db = { ...db, usuarios: anterior ? db.usuarios.map(x => x.id === novo.id ? novo : x) : [...db.usuarios, novo] }
  registrar(adm, anterior ? 'permissoes' : 'usuario', { detalhe: `${anterior ? 'Atualizou' : 'Cadastrou'} ${nome} (${novo.perfil})` })
  gravar()
  return novo
}

/* ── Busca (conteúdo que o usuário pode ver) ── */
export const paginasParaBusca = () => listarPaginas()
