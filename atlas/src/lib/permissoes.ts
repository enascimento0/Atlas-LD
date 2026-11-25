/*
  Regras de acesso do Atlas, em um único lugar.
  A API simulada (api.ts) valida TODAS as ações com estas funções antes de gravar;
  a interface usa as mesmas funções só para decidir o que mostrar.
*/
import type { Area, Pagina, Perfil, Usuario } from './tipos'

type U = Usuario | null | undefined

export const ROTULO_PERFIL: Record<Perfil, string> = {
  admin: 'Administrador',
  colaborador: 'Colaborador',
  leitor: 'Leitor',
}

export const eAdmin = (u: U) => !!u && u.ativo && u.perfil === 'admin'
const eColab = (u: U, area: Area) => !!u && u.ativo && u.perfil === 'colaborador' && u.areas.includes(area)

export const podeCriar = (u: U, area: Area) => eAdmin(u) || eColab(u, area)

/** Publicadas: todos os usuários autenticados. Rascunhos: administradores e o próprio autor. */
export function podeVer(u: U, p: Pagina) {
  if (!u || !u.ativo) return false
  if (p.status === 'publicado') return true
  return eAdmin(u) || (u.perfil === 'colaborador' && p.autorId === u.id)
}

/** Colaborador edita o próprio rascunho; para mexer em conteúdo publicado precisa de autorização de publicar. */
export function podeEditar(u: U, p: Pagina) {
  if (eAdmin(u)) return true
  if (!eColab(u, p.area)) return false
  return p.status === 'rascunho' ? p.autorId === u!.id : u!.podePublicar
}

export const podePublicar = (u: U, p: Pagina) => eAdmin(u) || (eColab(u, p.area) && u!.podePublicar && podeVer(u, p))

export function podeExcluir(u: U, p: Pagina) {
  if (eAdmin(u)) return true
  return eColab(u, p.area) && p.status === 'rascunho' && p.autorId === u!.id
}

export const podeGerenciarUsuarios = (u: U) => eAdmin(u)
export const podeVerHistorico = (u: U) => eAdmin(u)

export class ErroPermissao extends Error {
  constructor(msg = 'Você não tem permissão para esta ação.') { super(msg); this.name = 'ErroPermissao' }
}

/** Autorização de publicar para uma página que ainda não existe (ex.: criação) */
export const podePublicarEm = (u: U, area: Area) => eAdmin(u) || (eColab(u, area) && u!.podePublicar)
