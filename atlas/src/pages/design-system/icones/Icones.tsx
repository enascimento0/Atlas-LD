import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as Ph from '@phosphor-icons/react'
import type { IconWeight, Icon } from '@phosphor-icons/react'
import categorias from '../../../data/phosphor-categorias.json'
import { Codigo, BotaoCopiar } from '../../../components/ui/Doc'
import { useCopiar } from '../../../lib/preferencias'

const CATS = categorias as Record<string, string[]>
const TODOS = Object.entries(CATS).flatMap(([c, ns]) => ns.map(n => ({ nome: n, cat: c }))).sort((a, b) => a.nome.localeCompare(b.nome))
const I = Ph as unknown as Record<string, Icon>
const PESOS: { id: IconWeight; rotulo: string; uso: string }[] = [
  { id: 'thin', rotulo: 'Thin', uso: 'Ilustrações grandes e decorativas' },
  { id: 'light', rotulo: 'Light', uso: 'Interfaces leves, telas de marketing' },
  { id: 'regular', rotulo: 'Regular', uso: 'Padrão em todos os produtos' },
  { id: 'bold', rotulo: 'Bold', uso: 'Ações pequenas (fechar, +) e ênfase' },
  { id: 'fill', rotulo: 'Fill', uso: 'Estado ativo (aba, menu) e status' },
  { id: 'duotone', rotulo: 'Duotone', uso: 'Destaques e estados vazios' },
]
const CAT_PT: Record<string, string> = {
  'Arrows': 'Setas', 'Brands': 'Marcas', 'Commerce': 'Comércio', 'Communication': 'Comunicação', 'Design': 'Design', 'Development': 'Desenvolvimento', 'Education': 'Educação', 'Games': 'Jogos', 'Health & Wellness': 'Saúde', 'Maps & Travel': 'Mapas e viagem', 'Math & Finance': 'Matemática e finanças', 'Media': 'Mídia', 'Office & Editing': 'Escritório e edição', 'People': 'Pessoas', 'Security & Warnings': 'Segurança e avisos', 'System & Devices': 'Sistema e dispositivos', 'Time': 'Tempo', 'Weather & Nature': 'Clima e natureza',
}
/* Busca em português: termo PT → trecho do nome em inglês */
const PT: Record<string, string[]> = {
  seta: ['arrow', 'caret'], lixo: ['trash'], lixeira: ['trash'], excluir: ['trash', 'x'], usuario: ['user'], pessoa: ['user', 'person'], casa: ['house'], inicio: ['house'],
  busca: ['magnifying'], buscar: ['magnifying'], pesquisa: ['magnifying'], lupa: ['magnifying'], calendario: ['calendar'], data: ['calendar'], configuracao: ['gear', 'sliders'], ajuste: ['gear', 'sliders'],
  email: ['envelope', 'at'], 'e-mail': ['envelope'], sino: ['bell'], notificacao: ['bell'], olho: ['eye'], ver: ['eye'], cadeado: ['lock'], senha: ['lock', 'password', 'key'], chave: ['key'],
  estrela: ['star'], favorito: ['star', 'heart', 'bookmark'], coracao: ['heart'], arquivo: ['file'], documento: ['file'], pasta: ['folder'], editar: ['pencil'], lapis: ['pencil'], fechar: ['x'],
  adicionar: ['plus'], mais: ['plus'], menos: ['minus'], dinheiro: ['money', 'currency', 'coin'], moeda: ['currency', 'coin'], grafico: ['chart'], telefone: ['phone'], mapa: ['map'], local: ['map-pin', 'pin'],
  relogio: ['clock'], hora: ['clock'], nuvem: ['cloud'], baixar: ['download'], enviar: ['upload', 'paper-plane'], compartilhar: ['share'], copiar: ['copy'], imprimir: ['printer'], aviso: ['warning'],
  alerta: ['warning'], erro: ['warning', 'x-circle'], sucesso: ['check'], info: ['info'], ajuda: ['question'], filtro: ['funnel'], ordenar: ['sort'], lista: ['list'], tabela: ['table'], grade: ['grid'],
  menu: ['list', 'dots'], carrinho: ['shopping'], loja: ['storefront'], etiqueta: ['tag'], marca: ['tag', 'trademark'], camera: ['camera'], foto: ['image', 'camera'], imagem: ['image'], video: ['video', 'film'],
  musica: ['music'], som: ['speaker'], microfone: ['microphone'], chat: ['chat'], mensagem: ['chat'], link: ['link'], sair: ['sign-out'], entrar: ['sign-in'], atualizar: ['arrow-clockwise', 'arrows-clockwise'],
  carregando: ['spinner', 'circle-notch', 'arrow-clockwise'], sol: ['sun'], lua: ['moon'], escudo: ['shield'], predio: ['building'], empresa: ['building'], maleta: ['briefcase'], trabalho: ['briefcase'],
  livro: ['book'], globo: ['globe'], ia: ['sparkle', 'robot', 'brain'], robo: ['robot'], codigo: ['code'], banco: ['bank'], cartao: ['credit-card'], kanban: ['kanban'], painel: ['gauge', 'chart'],
}
const kebab = (n: string) => n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const CORES = [
  { id: 'currentColor', rotulo: 'Texto', css: 'var(--c-text)' },
  { id: 'support', rotulo: 'Destaque', css: 'var(--c-support)' },
  { id: 'neutral', rotulo: 'Neutro', css: 'var(--c-neutral)' },
  { id: 'danger', rotulo: 'Perigo', css: 'var(--c-danger)' },
  { id: 'lib', rotulo: 'Biblioteca', css: '#0D2137' },
]

function Detalhe({ nome, peso, tam, cor, fechar }: { nome: string; peso: IconWeight; tam: number; cor: string; fechar: () => void }) {
  const Ic = I[nome + 'Icon']
  const svgRef = useRef<HTMLDivElement>(null)
  const copiar = useCopiar()
  const [pesoLocal, setPesoLocal] = useState<IconWeight>(peso)
  useEffect(() => setPesoLocal(peso), [peso, nome])
  if (!Ic) return null
  const cat = TODOS.find(t => t.nome === nome)?.cat ?? ''
  const pesoProp = pesoLocal === 'regular' ? '' : ` weight="${pesoLocal}"`
  const webCls = pesoLocal === 'regular' ? 'ph' : `ph-${pesoLocal}`
  const copiarSvg = () => { const s = svgRef.current?.querySelector('svg'); if (s) copiar(s.outerHTML.replace(/var\([^)]+\)/g, 'currentColor'), `SVG de ${nome}`) }
  return (
    <aside className="card ic-det" aria-label={`Ícone ${nome}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div><div className="pdd-flabel">{CAT_PT[cat] ?? cat}</div><div style={{ fontSize: 16, fontWeight: 800, wordBreak: 'break-word' }}>{nome}</div></div>
        <button className="pdd-close" onClick={fechar} aria-label="Fechar detalhe"><Ph.X size={16} weight="bold" /></button>
      </div>
      <div className="ic-grande" ref={svgRef}><Ic size={96} weight={pesoLocal} color={cor} /></div>
      <div className="ic-pesos">
        {PESOS.map(p => <button key={p.id} className={pesoLocal === p.id ? 'on' : ''} onClick={() => setPesoLocal(p.id)} title={p.rotulo}><Ic size={22} weight={p.id} /><span>{p.rotulo}</span></button>)}
      </div>
      <div className="pdd-flabel" style={{ margin: '14px 0 6px' }}>React (todos os produtos)</div>
      <Codigo>{`import { ${nome}Icon } from '@phosphor-icons/react'\n\n<${nome}Icon size={${tam}}${pesoProp} />`}</Codigo>
      <div className="pdd-flabel" style={{ margin: '14px 0 6px' }}>Web / HTML</div>
      <Codigo>{`<i class="${webCls} ph-${kebab(nome)}"></i>`}</Codigo>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-sm btn-outline" onClick={copiarSvg}><Ph.FileSvg size={14} />Copiar SVG</button>
        <BotaoCopiar texto={nome} rotulo={`Nome ${nome}`}>Copiar nome</BotaoCopiar>
      </div>
    </aside>
  )
}

export default function Icones() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [peso, setPeso] = useState<IconWeight>('regular')
  const [tam, setTam] = useState(24)
  const [cor, setCor] = useState('currentColor')
  const [cat, setCat] = useState('Todas')
  const [sel, setSel] = useState<string | null>(params.get('q') && TODOS.some(t => t.nome === params.get('q')) ? params.get('q') : null)
  const dq = useDeferredValue(q)
  const corCss = CORES.find(c => c.id === cor)?.css ?? 'currentColor'

  useEffect(() => { const v = params.get('q'); if (v != null) { setQ(v); if (TODOS.some(t => t.nome === v)) setSel(v) } }, [params])

  const lista = useMemo(() => {
    const t = norm(dq)
    const termos = t ? [t.replace(/\s+/g, '-'), ...(PT[t] ?? [])] : []
    return TODOS.filter(i => (cat === 'Todas' || i.cat === cat) && (!t || termos.some(x => kebab(i.nome).includes(x) || i.nome.toLowerCase().includes(x.replace(/-/g, '')))))
  }, [dq, cat])

  return (
    <>
      <div className="hero" style={{ marginBottom: 20 }}>
        <div className="hero-art" style={{ right: 24, top: 24, opacity: .14, display: 'grid', gridTemplateColumns: 'repeat(4, 48px)', gap: 16 }}>
          {['House', 'Bell', 'Gear', 'Heart', 'Star', 'Tag', 'User', 'Globe', 'Kanban', 'Chat', 'Folder', 'Lock'].map(n => { const C = I[n + 'Icon']; return <C key={n} size={48} weight="duotone" color="#fff" /> })}
        </div>
        <div className="eyebrow">Usado por todos os produtos, incluindo o APOL+</div>
        <h2>Ícones Phosphor</h2>
        <p><b>1.512 ícones</b> em <b>6 pesos</b> (9.072 no total), versão 2.1. Em código: <code>@phosphor-icons/react</code>. Busque em português ou inglês, clique para ver o código.</p>
      </div>

      <div className="card ic-ctrl">
        <div className="campo-ic" style={{ flex: '1 1 260px', minWidth: 220 }}>
          <input className="campo" autoFocus placeholder="Buscar: seta, lixo, usuário, calendar…" value={q} onChange={e => { setQ(e.target.value); if (params.get('q')) setParams({}, { replace: true }) }} style={{ height: 36 }} />
          {q ? <Ph.X size={14} style={{ pointerEvents: 'auto', cursor: 'pointer' }} onClick={() => setQ('')} /> : <Ph.MagnifyingGlass size={14} />}
        </div>
        <div><div className="pdd-flabel">Peso</div><div className="seg">{PESOS.map(p => <button key={p.id} className={peso === p.id ? 'on' : ''} onClick={() => setPeso(p.id)}>{p.rotulo}</button>)}</div></div>
        <div><div className="pdd-flabel">Tamanho · {tam}px</div><input type="range" min={12} max={48} step={1} value={tam} onChange={e => setTam(+e.target.value)} style={{ accentColor: 'var(--c-support)', width: 120 }} /></div>
        <div><div className="pdd-flabel">Cor</div><div className="temas">{CORES.map(c => <button key={c.id} title={c.rotulo} className={cor === c.id ? 'on' : ''} style={{ background: c.css }} onClick={() => setCor(c.id)} />)}</div></div>
      </div>

      <div className="cat-filtros" style={{ marginTop: 12 }}>
        <button className={`chip compacto ${cat === 'Todas' ? 'on' : ''}`} onClick={() => setCat('Todas')}>Todas</button>
        {Object.keys(CATS).sort((a, b) => (CAT_PT[a] ?? a).localeCompare(CAT_PT[b] ?? b)).map(c => <button key={c} className={`chip compacto ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{CAT_PT[c] ?? c}<span style={{ opacity: .65 }}>{CATS[c].length}</span></button>)}
      </div>

      <div className="toolbar" style={{ margin: '4px 0 12px' }}><span className="count"><strong>{lista.length.toLocaleString('pt-BR')}</strong> ícones{dq && <> para “{dq}”</>}{PT[norm(dq)] && <span className="note" style={{ margin: '0 0 0 8px' }}>(também buscando: {PT[norm(dq)].join(', ')})</span>}</span></div>

      <div className={`ic-layout ${sel ? 'com-det' : ''}`}>
        {lista.length === 0 ? (
          <div className="vazio"><Ph.MagnifyingGlass size={32} color="var(--c-text-muted)" /><span>Nenhum ícone para “{q}”. Tente em inglês.</span><button className="btn btn-outline" onClick={() => { setQ(''); setCat('Todas') }}>Limpar filtros</button></div>
        ) : (
          <div className="ic-grid" style={{ ['--ic' as string]: `${Math.max(tam + 56, 96)}px` }}>
            {lista.map(({ nome }) => {
              const C = I[nome + 'Icon']
              return (
                <button key={nome} className={`ic-cel ${sel === nome ? 'on' : ''}`} onClick={() => setSel(nome)} title={nome}>
                  <C size={tam} weight={peso} color={corCss} />
                  <span>{nome}</span>
                </button>
              )
            })}
          </div>
        )}
        {sel && <Detalhe nome={sel} peso={peso} tam={tam} cor={corCss} fechar={() => setSel(null)} />}
      </div>

      <h3 className="h3" style={{ marginTop: 40 }}>Como usar nos produtos</h3>
      <div className="grid g3">
        {PESOS.map(p => { const C = I['PaperPlaneTiltIcon']; return <div key={p.id} className="fato" style={{ display: 'flex', gap: 14, alignItems: 'center' }}><C size={32} weight={p.id} color="var(--c-support)" /><div><div className="v" style={{ marginTop: 0 }}>{p.rotulo}</div><div className="note" style={{ marginTop: 2 }}>{p.uso}</div></div></div> })}
      </div>
      <div className="tw-doc" style={{ marginTop: 16 }}><table className="dt">
        <thead><tr><th>Tamanho</th><th>Uso</th></tr></thead>
        <tbody>
          <tr><td>10px</td><td>Seta de breadcrumb</td></tr>
          <tr><td>12–13px</td><td>Chip, caret de paginação, ícone de erro</td></tr>
          <tr><td><b>14px</b></td><td><b>Padrão</b>: botão small, campo, item de menu, aba</td></tr>
          <tr><td>15–16px</td><td>Ação principal, ícone de cabeçalho de drawer, botão medium</td></tr>
          <tr><td>18px</td><td>Ação de linha, spinner de carregamento</td></tr>
          <tr><td>20px</td><td>Botão large</td></tr>
          <tr><td>22px</td><td>Ícone de modal de confirmação</td></tr>
          <tr><td>32px</td><td>Estado vazio, em <code>--c-text-muted</code></td></tr>
          <tr><td>Peso</td><td><code>regular</code> por padrão; <code>fill</code> no estado ativo e em status; <code>bold</code> em ações pequenas</td></tr>
          <tr><td>Cor</td><td>Sempre <code>currentColor</code> ou token <code>var(--c-*)</code></td></tr>
          <tr><td>Filtro</td><td>Não use <code>Funnel</code>: o filtro é um card colapsável com <code>CaretDown</code>/<code>CaretUp</code></td></tr>
        </tbody>
      </table></div>
    </>
  )
}
