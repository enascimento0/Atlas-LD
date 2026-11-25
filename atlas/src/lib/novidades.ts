/* Feed de novidades do Atlas: alimenta "Últimas atualizações" (Início) e a tela Novidades. */
import { Package, Palette, type Icon } from '@phosphor-icons/react'
import { listarPaginas } from './api'
import { areaPorId, PRODUTOS } from './areas'

export interface Novidade {
  id: string
  tipo: 'produto' | 'conteudo' | 'design-system'
  titulo: string
  detalhe: string
  em: string
  rota: string
  icone: Icon
  /** produto a que a novidade se refere (para filtrar) */
  produto?: string
}

/** Marco fixo: o Design System foi publicado antes de existir conteúdo dinâmico */
const DESIGN_SYSTEM: Novidade = {
  id: 'ds', tipo: 'design-system', titulo: 'Design System publicado',
  detalhe: 'APOL+, Biblioteca de componentes e Ícones Phosphor documentados.', em: '2026-11-16T12:00:00', rota: '/design-system', icone: Palette,
}

export function listarNovidades(): Novidade[] {
  const paginas = listarPaginas().filter(p => p.status === 'publicado')

  const conteudo: Novidade[] = paginas.map(p => {
    const a = areaPorId(p.area)
    return {
      id: p.id, tipo: 'conteudo', titulo: p.titulo,
      detalhe: `${a.rotulo}${p.categoria ? ` · ${p.categoria}` : ''} · ${p.atualizadoPorNome}`,
      em: p.atualizadoEm, rota: `${a.rota}/${p.slug}`, icone: a.icone, produto: p.produto,
    }
  })

  /* Um produto "entra" no Atlas quando recebe o primeiro conteúdo publicado */
  const produtos: Novidade[] = PRODUTOS.flatMap(nome => {
    const doProduto = paginas.filter(p => p.produto === nome).sort((a, b) => (a.publicadoEm ?? a.criadoEm).localeCompare(b.publicadoEm ?? b.criadoEm))
    const primeira = doProduto[0]
    if (!primeira) return []
    return [{
      id: `produto-${nome}`, tipo: 'produto' as const, titulo: `${nome} incluído no Atlas`,
      detalhe: `${doProduto.length} ${doProduto.length === 1 ? 'conteúdo publicado' : 'conteúdos publicados'}`,
      em: primeira.publicadoEm ?? primeira.criadoEm, rota: `/produtos`, icone: Package, produto: nome,
    }]
  })

  return [...conteudo, ...produtos, DESIGN_SYSTEM].sort((a, b) => b.em.localeCompare(a.em))
}
