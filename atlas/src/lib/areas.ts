import { Package, ChartLineUp, type Icon } from '@phosphor-icons/react'
import type { Area } from './tipos'

export interface InfoArea {
  id: Area
  rotulo: string
  /** nome no singular, para botões e mensagens */
  singular: string
  rota: string
  prefixo: string
  icone: Icon
  descricao: string
  categorias: string[]
  /** como o conteúdo é filtrado na listagem */
  filtro: 'produto' | 'nenhum'
  vazio: string
}

/** Produtos da LDSOFT: usados como filtro em Produtos e Benchmarks */
export const PRODUTOS = ['APOL+', 'Authora', 'Aquiles', 'Busca Nacional', 'Cashfy', 'Webseek Radar', 'Webseek Empresas', 'Webseek Figurativo'] as const

export const AREAS: InfoArea[] = [
  {
    id: 'produtos', rotulo: 'Produtos', singular: 'produto', rota: '/produtos', prefixo: 'PRD', icone: Package,
    descricao: 'Hub de cada produto da LDSOFT',
    categorias: ['Briefing', 'Fluxos', 'Telas', 'Arquitetura da informação', 'Documentação', 'Pesquisa'], filtro: 'produto',
    vazio: 'Cada produto ganha uma página com visão geral, documentação, fluxos e materiais.',
  },
  {
    id: 'benchmarks', rotulo: 'Benchmarks', singular: 'benchmark', rota: '/benchmarks', prefixo: 'BMK', icone: ChartLineUp,
    descricao: 'Análises de concorrentes e referências',
    categorias: ['Concorrentes', 'Referências', 'Tendências', 'Experiência de uso'], filtro: 'produto',
    vazio: 'Registre contexto, prints, achados e recomendações de cada análise.',
  },
]

export const areaPorId = (id: Area) => AREAS.find(a => a.id === id)!
export const areaPorRota = (seg: string) => AREAS.find(a => a.rota === `/${seg}`)
