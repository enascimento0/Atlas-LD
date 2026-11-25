import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Ph from '@phosphor-icons/react'
import { MagnifyingGlass, Shapes, ArrowElbowDownLeft, type Icon } from '@phosphor-icons/react'
import { NAV, DS_ABAS } from '../../lib/navegacao'
import { paginasParaBusca } from '../../lib/api'
import { areaPorId } from '../../lib/areas'
import { useUsuario } from '../../lib/auth'
import { eAdmin } from '../../lib/permissoes'
import { textoPlano } from '../../lib/html'
import { textoDoComparativo } from '../conteudo/Comparativo'
import { COMPONENTES_APOL } from '../../pages/design-system/apol/catalogo'
import { APOL_MANTIDOS, EXTRAS, SUBSTITUIDOS } from '../../pages/design-system/componentes/extras'
import biblioteca from '../../data/biblioteca.json'
import categorias from '../../data/phosphor-categorias.json'

interface Resultado { grupo: string; titulo: string; sub?: string; rota: string; icone: Icon; termos: string }

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const ICONES = Object.values(categorias as Record<string, string[]>).flat()
const IconesPh = Ph as unknown as Record<string, Icon>

const PT_LIB: Record<string, string> = {
  'Button': 'botão botoes', 'Icon Button': 'botão ícone', 'Nav Button': 'botão navegação', 'Video Button': 'botão vídeo play', 'Toggle Button': 'alternar botão',
  'Chips': 'filtro etiqueta tag', 'Checkbox': 'caixa de seleção marcar', 'Radio Button': 'opção única', 'Switch': 'interruptor liga desliga', 'Input Text': 'campo texto entrada formulário',
  'Number': 'número quantidade', 'Alert': 'alerta aviso mensagem', 'Toast': 'notificação aviso', 'Tooltip': 'dica', 'Avatar': 'foto perfil iniciais', 'Badges': 'selo etiqueta',
  'Tabs': 'abas', 'Pagination': 'paginação', 'Dropdown': 'lista suspensa select', 'Modal': 'janela', 'Dialog': 'diálogo confirmação', 'Slider': 'controle deslizante faixa',
  'Progress Bar': 'progresso barra', 'Spinner Circular': 'carregando loading', 'Dividers': 'divisória linha', 'Accordion': 'acordeão sanfona', 'Date picker': 'calendário data período',
  'Menu Lateral': 'sidebar navegação', 'Header': 'cabeçalho topbar', 'List': 'lista', 'Ranking': 'estrelas avaliação', 'Progress Stepper': 'etapas passos', 'Wizard': 'assistente etapas',
  'Breadcrumb': 'trilha navegação', 'Counter': 'contador quantidade', 'Carousel': 'carrossel', 'Scrollbar': 'rolagem', 'Modal Size': 'tamanho modal',
}

const INDICE: Resultado[] = [
  ...NAV.filter(n => !n.somenteAdmin).map(n => ({ grupo: 'Páginas', titulo: n.rotulo, sub: n.descricao, rota: n.rota, icone: n.icone, termos: `${n.rotulo} ${n.descricao}` })),
  ...DS_ABAS.slice(1).map(a => ({ grupo: 'Design System', titulo: a.rotulo, sub: a.descricao, rota: a.rota, icone: a.icone, termos: `${a.rotulo} ${a.descricao}` })),
  ...COMPONENTES_APOL.filter(c => APOL_MANTIDOS.includes(c.id)).map(c => ({ grupo: 'Componentes', titulo: c.nome, sub: `${c.categoria} · ${c.propriedades.length} propriedades`, rota: `/design-system/componentes?c=${c.id}`, icone: Shapes, termos: `${c.nome} ${c.descricao} ${c.categoria} codigo` })),
  ...EXTRAS.map(c => ({ grupo: 'Componentes', titulo: c.nome, sub: `${c.categoria} · ${c.propriedades.length} propriedades`, rota: `/design-system/componentes?c=${c.chave}`, icone: Shapes, termos: `${c.nome} ${c.descricao} ${c.categoria} codigo` })),
  ...biblioteca.componentes.filter(c => !SUBSTITUIDOS.includes(c.nome)).map(c => ({ grupo: 'Componentes', titulo: c.nome, sub: `${c.variantes} variantes · ${c.categoria}`, rota: `/design-system/componentes?c=${encodeURIComponent(c.nome)}`, icone: Shapes, termos: `${c.nome} ${PT_LIB[c.nome] ?? ''} ${c.descricao} ${c.categoria}` })),
]

export function BuscaGlobal({ fechar }: { fechar: () => void }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const nav = useNavigate()
  const lista = useRef<HTMLDivElement>(null)
  const usuario = useUsuario()

  /* conteúdo dinâmico: só o que o usuário pode ver */
  const conteudo = useMemo<Resultado[]>(() => paginasParaBusca().map(p => {
    const a = areaPorId(p.area)
    const corpo = p.blocos.map(b => textoPlano(b.html) + ' ' + (b.itens ?? []).map(textoPlano).join(' ') + ' ' + (b.nome ?? '') + ' ' + textoDoComparativo(b.comparativo)).join(' ')
    return { grupo: a.rotulo, titulo: p.titulo, sub: p.status === 'rascunho' ? 'Rascunho' : p.categoria || a.singular, rota: `${a.rota}/${p.slug}`, icone: a.icone, termos: `${p.titulo} ${p.descricao} ${p.categoria} ${p.codigo} ${p.autorNome} ${p.documentos.map(d => d.nome).join(' ')} ${corpo}` }
  // o usuário entra como dependência para refazer o índice quando a sessão muda
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [usuario])

  const resultados = useMemo(() => {
    const t = normalizar(q.trim())
    const adm = eAdmin(usuario)
    const indice = [...conteudo, ...INDICE]
    if (!t) return [...INDICE.filter(r => (r.grupo === 'Páginas' || r.grupo === 'Design System') && (adm || r.rota !== '/colaboradores'))]
    const base = indice.filter(r => normalizar(r.termos).includes(t)).slice(0, 24)
    const ic = ICONES.filter(n => normalizar(n).includes(t.replace(/\s/g, ''))).slice(0, 8)
      .map(n => ({ grupo: 'Ícones Phosphor', titulo: n, sub: 'Abrir na galeria', rota: `/design-system/icones?q=${n}`, icone: IconesPh[n + 'Icon'], termos: n }))
    return [...base, ...ic]
  }, [q, conteudo, usuario])

  useEffect(() => setSel(0), [q])
  useEffect(() => { lista.current?.querySelector('.sel')?.scrollIntoView({ block: 'nearest' }) }, [sel])

  const ir = (r: Resultado) => { nav(r.rota); fechar() }
  const tecla = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, resultados.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter' && resultados[sel]) ir(resultados[sel])
    else if (e.key === 'Escape') fechar()
  }

  let ultimo = ''
  return (
    <div className="cmd-ov" onMouseDown={e => { if (e.target === e.currentTarget) fechar() }}>
      <div className="cmd" role="dialog" aria-label="Buscar no Atlas">
        <div className="cmd-in"><MagnifyingGlass size={18} /><input autoFocus value={q} onChange={e => setQ(e.target.value)} onKeyDown={tecla} placeholder="Buscar componentes, cores, seções, ícones…" /><span className="kbd">Esc</span></div>
        <div className="cmd-lista" ref={lista}>
          {resultados.length === 0 && <div className="cmd-vazio">Nada encontrado para “{q}”.</div>}
          {resultados.map((r, i) => {
            const cab = r.grupo !== ultimo ? (ultimo = r.grupo) : null
            const I = r.icone
            return (
              <div key={r.grupo + r.titulo + i}>
                {cab && <div className="cmd-grupo">{cab}</div>}
                <div className={`cmd-item ${i === sel ? 'sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => ir(r)}>
                  <span className="ic">{I && <I size={16} />}</span>{r.titulo}<small>{r.sub}</small>
                </div>
              </div>
            )
          })}
        </div>
        <div className="cmd-pe"><span>↑↓ navegar</span><span><ArrowElbowDownLeft size={11} /> abrir</span><span>Esc fechar</span></div>
      </div>
    </div>
  )
}
