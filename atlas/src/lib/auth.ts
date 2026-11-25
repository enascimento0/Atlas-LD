import { entrar, sair, useDadosAtlas, usuarioAtual } from './api'
import type { Usuario } from './tipos'

/** Usuário logado (ou null). Atualiza a tela quando a sessão ou as permissões mudam. */
export function useUsuario(): Usuario | null {
  useDadosAtlas()
  return usuarioAtual()
}

export { entrar, sair }
