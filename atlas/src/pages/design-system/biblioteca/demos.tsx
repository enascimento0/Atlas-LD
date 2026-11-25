/* Prévias ao vivo da Biblioteca de componentes.
   Cada demo recebe `p` (valores escolhidos das propriedades do Figma) e só reage às props listadas em `controla`. */
import { useState, type ReactNode } from 'react'
import { SeletorDePeriodo, type Periodo } from '../../../components/ui/SeletorDePeriodo'
import { SeletorDeData } from '../../../components/ui/SeletorDeData'
import * as Ph from '@phosphor-icons/react'

type P = Record<string, string>
export interface Demo { controla?: string[]; padrao?: P; mini: () => ReactNode; vivo: (p: P) => ReactNode }

const low = (s?: string) => (s ?? '').toLowerCase().replace(/\s+/g, '')
const estado = (s?: string) => low(s) === 'hover' ? 'f-hover' : low(s) === 'active' ? 'f-active' : low(s) === 'disabled' ? 'f-disabled' : ''

function Botao({ p, rotulo = 'Button', icone = false }: { p: P; rotulo?: string; icone?: boolean }) {
  const [carregando, setCarregando] = useState(false)
  const st = low(p.State)
  const loading = st === 'loading' || carregando
  const cls = `lb t-${low(p.Type || 'Secondary')} st-${low(p.Style || 'Filled')} s-${low(p.Size || 'Medium')} ${estado(p.State)} ${icone ? 'icone' : ''}`
  const tam = low(p.Size) === 'small' ? 16 : low(p.Size) === 'large' ? 24 : 20
  return (
    <button className={cls} disabled={st === 'disabled'} onClick={() => { if (!loading) { setCarregando(true); setTimeout(() => setCarregando(false), 1200) } }}>
      {loading ? <span className="spin"><Ph.CircleNotch size={tam} weight="bold" /></span> : icone ? <Ph.Heart size={tam} weight="fill" /> : <>
        {p['Icon Left'] === 'True' && <Ph.Heart size={tam} weight="fill" />}{rotulo}{p['Icon Right'] === 'True' && <Ph.ArrowRight size={tam} weight="bold" />}
      </>}
    </button>
  )
}

function Chip({ p }: { p: P }) {
  const [on, setOn] = useState(low(p.State) === 'active')
  const [vis, setVis] = useState(true)
  if (!vis) return <button className="lb st-text t-secondary s-small" onClick={() => setVis(true)}>Restaurar chip</button>
  const dis = low(p.State).includes('disabled')
  return (
    <button className={`lchip ${low(p.Type) === 'primary' ? 'prim' : ''} ${on || low(p.State) === 'selecteddisabled' ? 'on' : ''}`} disabled={dis} onClick={() => setOn(o => !o)}>
      {p.Style === 'Input' && <span className="av">BS</span>}
      {p.Icon === 'True' && <Ph.Heart size={16} weight="fill" />}Chip
      {p.onDelete === 'True' && <span className="rm" onClick={e => { e.stopPropagation(); setVis(false) }}><Ph.XCircle size={16} weight="fill" /></span>}
    </button>
  )
}

function Check({ p, radio = false }: { p: P; radio?: boolean }) {
  const st = low(p.State)
  const [on, setOn] = useState(st.startsWith('active') || p.Mode === 'Radio On' || st === 'disabledactive')
  const dis = st.includes('disabled')
  return (
    <label className={`lcheck ${radio ? 'lradio' : ''} ${low(p.Type) === 'primary' ? 'prim' : 'sec'} ${dis ? 'dis' : ''} ${low(p.Size) === 'medium' ? 'med' : ''}`} onClick={e => { e.preventDefault(); if (!dis) setOn(o => !o) }}>
      <span className={`box ${on ? 'on' : ''}`}>{on && !radio && <Ph.Check size={low(p.Size) === 'medium' ? 11 : 14} weight="bold" />}</span>{radio ? 'Opção' : 'Aceito os termos'}
    </label>
  )
}

const ALERTA = { info: [Ph.Info, 'Informação'], danger: [Ph.WarningCircle, 'Erro'], sucess: [Ph.CheckCircle, 'Sucesso'], success: [Ph.CheckCircle, 'Sucesso'], warning: [Ph.Warning, 'Atenção'], neutral: [Ph.Bell, 'Aviso'] } as const
const corVar = (v: string) => (v === 'sucess' ? 'success' : v)
const TAG = { info: 'var(--in-500)', danger: 'var(--da-600)', success: 'var(--ok-600)', warning: 'var(--wa-500)', neutral: 'var(--g-400)' } as Record<string, string>

function Alerta({ p }: { p: P }) {
  const [vis, setVis] = useState(true)
  const v = low(p.Variant || 'Info') as keyof typeof ALERTA
  const [I, tit] = ALERTA[v] ?? ALERTA.info
  const tipo = low(p.Type)
  const temTit = tipo.includes('title') || tipo.includes('compound')
  const temDesc = tipo.includes('description') || tipo.includes('compound')
  if (!vis) return <button className="lb st-text t-secondary s-small" onClick={() => setVis(true)}>Mostrar alerta</button>
  return (
    <div className={`lalert ${corVar(v)}`}>
      <I size={20} weight="fill" />
      <div>{temTit && <b>{tit}</b>}{temDesc && <span>Seu pedido foi registrado e será analisado em até 2 dias úteis.</span>}{!temTit && !temDesc && <span>Mensagem do alerta.</span>}</div>
      {tipo.includes('close') && <button className="x" onClick={() => setVis(false)} aria-label="Fechar"><Ph.X size={16} /></button>}
    </div>
  )
}

function ToastLib({ p }: { p: P }) {
  const v = corVar(low(p.Variant || 'Sucess'))
  const [I, tit] = ALERTA[v as keyof typeof ALERTA] ?? ALERTA.info
  const tipo = low(p.Type || 'Compound')
  return (
    <div className="ltoast">
      <div className="tag" style={{ background: TAG[v] }} />
      <div className="corpo"><I size={16} weight="fill" color={TAG[v]} />
        <div>{(tipo === 'title' || tipo === 'compound') && <b>{tit}</b>}{(tipo === 'description' || tipo === 'compound') && <span style={{ color: 'var(--g-700)' }}>Alterações salvas no seu perfil.</span>}</div>
        <button className="x" aria-label="Fechar"><Ph.X size={16} /></button>
      </div>
    </div>
  )
}

function Avatar({ p }: { p: P }) {
  const tam = { xlarge: 64, large: 40, medium: 32, small: 24, xsmall: 20 }[low(p.Size || 'Large')] ?? 40
  const raio = low(p.Variant) === 'square' ? 4 : 999
  const img = low(p.Type) === 'imagem'
  return <span className={`lav ${low(p.Color) === 'primary' ? 'prim' : ''}`} style={{ width: tam, height: tam, borderRadius: raio, fontSize: tam * .4 }}>{img ? <Ph.User size={tam * .6} weight="fill" /> : 'BS'}</span>
}

function Slider() {
  const [v, setV] = useState(65)
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}><input className="lslider" type="range" value={v} onChange={e => setV(+e.target.value)} /><span style={{ font: '700 13px Nunito', color: 'var(--s-500)' }}>{v}%</span></div>
}

function Spinner({ p }: { p: P }) {
  const t = { xxl: 64, xl: 48, l: 32, m: 24, s: 16 }[low(p.Size || 'L')] ?? 32
  const c = { primary: 'var(--p-500)', secundary: 'var(--s-500)', black: 'var(--bk)', gray: 'var(--g-500)', danger: 'var(--da-600)', success: 'var(--ok-600)', white: '#fff', feb: '#0088AE' }[low(p.Style || 'Secundary')] ?? 'var(--s-500)'
  return <div style={{ padding: 8, borderRadius: 8, background: low(p.Style) === 'white' ? 'var(--s-500)' : 'transparent' }}><div className="lspin" style={{ width: t, height: t, borderTopColor: c, borderWidth: Math.max(2, t / 10) }} /></div>
}

function Progresso({ p }: { p: P }) {
  const [v, setV] = useState(p.Progress === '100%' ? 100 : 50)
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
    <div className={`lprog ${low(p.Size) === 'medium' ? 'med' : ''} ${low(p.Style) === 'primary' ? 'prim' : ''}`}><div style={{ width: `${v}%`, background: low(p.Style) === 'tripadvisor' ? '#00B087' : undefined }} /></div>
    <div style={{ display: 'flex', gap: 6 }}>{[0, 25, 50, 75, 100].map(n => <button key={n} className={`lchip ${v === n ? 'on' : ''}`} style={{ height: 26, fontSize: 12 }} onClick={() => setV(n)}>{n}%</button>)}</div>
  </div>
}

function Tooltip({ p }: { p: P }) {
  return <div style={{ paddingTop: 48 }}><span className="ltip-alvo"><button className="lb st-outline t-secondary s-small">Passe o mouse</button><span className={`ltip sempre ${low(p.Style) === 'medium' ? 'medium' : low(p.Style) === 'light' ? 'light' : ''}`}>{low(p.Type) === 'detailed' ? 'Título · descrição curta' : 'Tooltip'}</span></span></div>
}

function Abas() {
  const [a, setA] = useState(0)
  return <div style={{ width: '100%', maxWidth: 480 }}><div className="ltabs">{['Visão geral', 'Detalhes', 'Histórico'].map((t, i) => <button key={t} className={`ltab ${a === i ? 'on' : ''}`} onClick={() => setA(i)}>{t}</button>)}</div><div style={{ padding: 12, font: '400 13px Nunito', color: 'var(--g-700)' }}>Conteúdo da aba “{['Visão geral', 'Detalhes', 'Histórico'][a]}”.</div></div>
}

function Paginacao({ p }: { p: P }) {
  const [n, setN] = useState(1)
  return <div className="lpag">
    <button className="lpag-btn" disabled={n === 1} onClick={() => setN(n - 1)} aria-label="Anterior"><Ph.CaretLeft size={14} weight="bold" /></button>
    <div className="lpag-num">{[1, 2, 3, 4, 5].map(i => <button key={i} className={n === i ? 'on' : ''} onClick={() => setN(i)} style={low(p.Variant) === 'neutral' && n === i ? { background: 'var(--g-800)' } : undefined}>{i}</button>)}</div>
    <button className="lpag-btn" disabled={n === 5} onClick={() => setN(n + 1)} aria-label="Próxima"><Ph.CaretRight size={14} weight="bold" /></button>
    {p.Abstract !== 'Off' && <span>{n} de 5 páginas</span>}
  </div>
}

function Stepper() {
  const [a, setA] = useState(1)
  const passos = ['Dados', 'Endereço', 'Pagamento', 'Revisão']
  return <div className="lstep">{passos.map((s, i) => <div key={s} className={`lstep-i ${i < a ? 'feito' : i === a ? 'atual' : ''}`} onClick={() => setA(i)}><span className="bola">{i < a ? <Ph.Check size={14} weight="bold" /> : i + 1}</span>{s}</div>)}</div>
}

function Acordeao() {
  const [a, setA] = useState<number | null>(0)
  return <div className="lacc">{['Como funciona o prazo?', 'Posso cancelar depois?', 'Quem pode ver meus dados?'].map((t, i) => (
    <div key={t} className="lacc-i"><button className={`lacc-h ${a === i ? 'open' : ''}`} onClick={() => setA(a === i ? null : i)}>{t}<Ph.CaretDown size={18} weight="bold" /></button>{a === i && <div className="lacc-c">Leverage agile frameworks to provide a robust synopsis for high level overviews.</div>}</div>
  ))}</div>
}

function Estrelas({ p }: { p: P }) {
  const [n, setN] = useState(p['Property 2'] ? +p['Property 2'] : 4)
  return <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="lstars">{[1, 2, 3, 4, 5].map(i => <span key={i} onClick={() => setN(i)}><Ph.Star size={22} weight={i <= n ? 'fill' : 'regular'} /></span>)}</div><b style={{ font: '700 16px Nunito' }}>{n},0</b></div>
}

function Contador({ p }: { p: P }) {
  const [n, setN] = useState(2)
  const dis = low(p.Status) === 'disabled'
  return <div className="lcounter"><button disabled={dis || n === 0} onClick={() => setN(n - 1)} aria-label="Subtrair"><Ph.Minus size={14} weight="bold" /></button>{n}<button disabled={dis} onClick={() => setN(n + 1)} aria-label="Somar"><Ph.Plus size={14} weight="bold" /></button></div>
}

function Toggle() {
  const [a, setA] = useState(0)
  return <div className="ltoggle">{['Lista', 'Mapa'].map((t, i) => <button key={t} className={a === i ? 'on' : ''} onClick={() => setA(i)}>{t}</button>)}</div>
}

function Switch({ p }: { p: P }) {
  const [on, setOn] = useState(p.Mode !== 'Switch Off')
  return <label style={{ display: 'flex', alignItems: 'center', gap: 10, font: '400 14px Nunito', cursor: 'pointer' }}><button className={`lswitch ${on ? 'on' : ''} ${low(p.Type) === 'primary' ? 'prim' : ''}`} disabled={low(p.State) === 'disabled'} onClick={() => setOn(o => !o)} aria-pressed={on} />{on ? 'Ligado' : 'Desligado'}</label>
}

function Carrossel() {
  const [a, setA] = useState(0)
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}><div style={{ width: 240, height: 90, borderRadius: 8, background: ['#CCE0F5', '#B8C7D9', '#D2E6FF', '#A0C8FF'][a], display: 'grid', placeItems: 'center', font: '700 20px Ubuntu', transition: 'background .3s' }}>Slide {a + 1}</div><div className="ldots">{[0, 1, 2, 3].map(i => <button key={i} className={a === i ? 'on' : ''} onClick={() => setA(i)} aria-label={`Slide ${i + 1}`} />)}</div></div>
}

function InputLib({ p }: { p: P }) {
  const [v, setV] = useState('')
  const erro = v.length > 0 && !v.includes('@')
  return <div className="linput-w">
    <span className="linput-lbl">E-mail</span>
    <div className={`linput ${erro ? 'erro' : v ? 'ok' : ''}`}><Ph.EnvelopeSimple size={20} /><input value={v} onChange={e => setV(e.target.value)} placeholder="nome@empresa.com.br" />{v && <Ph.X size={18} style={{ cursor: 'pointer' }} onClick={() => setV('')} />}</div>
    {erro ? <span className="linput-msg" style={{ color: 'var(--da-600)' }}><Ph.WarningCircle size={14} weight="fill" />Digite um e-mail válido.</span> : <span className="linput-help">{p.x ?? 'This is the description area'}</span>}
  </div>
}

/* Date picker: os componentes reais do sistema (SeletorDePeriodo e SeletorDeData). Clique no campo para abrir o calendário. */
function DatePicker({ tipo }: { tipo?: string }) {
  const [periodo, setPeriodo] = useState<Periodo>({ de: '2026-11-10', ate: '2026-11-18' })
  const [data, setData] = useState('2026-11-17')
  return tipo === 'Single basic'
    ? <div style={{ width: 240 }}><SeletorDeData valor={data} onChange={setData} ariaLabel="Data" /></div>
    : <SeletorDePeriodo valor={periodo} onChange={setPeriodo} ariaLabel="Período" />
}

function Dropdown() {
  const [q, setQ] = useState(''); const [sel, setSel] = useState('São Paulo')
  const op = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Recife'].filter(o => o.toLowerCase().includes(q.toLowerCase()))
  return <div className="ldrop"><div className="busca"><Ph.MagnifyingGlass size={16} /><input placeholder="Continue digitando..." value={q} onChange={e => setQ(e.target.value)} /></div><div className="sub">Cidades</div>{op.map(o => <div key={o} className={`it ${sel === o ? 'on' : ''}`} onClick={() => setSel(o)}>{o}{sel === o && <Ph.Check size={16} weight="bold" />}</div>)}</div>
}

function MenuLateral({ p }: { p: P }) {
  const [aberto, setAberto] = useState(!(p['Property 1'] ?? '').includes('fechado'))
  const [a, setA] = useState('Início')
  return <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}><div className={`lmenu ${aberto ? '' : 'fechado'}`}>{([['Início', Ph.House], ['Busca', Ph.MagnifyingGlass], ['Favoritos', Ph.Heart], ['Perfil', Ph.User]] as const).map(([n, I]) => <div key={n} className={`it ${a === n ? 'on' : ''}`} onClick={() => setA(n)}><I size={18} weight={a === n ? 'fill' : 'regular'} />{aberto && n}</div>)}</div><button className="lnav" onClick={() => setAberto(x => !x)} aria-label="Alternar menu">{aberto ? <Ph.CaretLeft size={16} weight="bold" /> : <Ph.CaretRight size={16} weight="bold" />}</button></div>
}

function Wizard() {
  const [a, setA] = useState(1)
  const it = [['Cadastro da empresa', 'done', '✓'], ['Documentos', 'def', '2'], ['Pagamento', 'alert', '!'], ['Confirmação', 'wait', '4']] as const
  return <div className="lwiz">{it.map(([t, s, n], i) => <div key={t}><div className="lwiz-i" onClick={() => setA(i)}><span className={`st ${s}`}>{n}</span>{t}<Ph.CaretDown size={16} style={{ marginLeft: 'auto', transform: a === i ? 'rotate(180deg)' : undefined, transition: 'transform .2s' }} /></div>{a === i && <div className="lwiz-c">Conteúdo da etapa “{t}”.</div>}</div>)}</div>
}

function NumberIn() {
  const [n, setN] = useState(1)
  return <div className="lnumber"><button onClick={() => setN(Math.max(0, n - 1))} aria-label="Menos"><Ph.Minus size={14} weight="bold" /></button><input value={n} onChange={e => setN(+e.target.value.replace(/\D/g, '') || 0)} /><button onClick={() => setN(n + 1)} aria-label="Mais"><Ph.Plus size={14} weight="bold" /></button></div>
}

const ICONBTN = (p: P) => <Botao p={p} icone />

export const DEMOS: Record<string, Demo> = {
  'Button': {
    controla: ['Type', 'Style', 'Size', 'State', 'Icon Left', 'Icon Right'],
    padrao: { Type: 'Secondary', Style: 'Filled', Size: 'Medium', State: 'Default', 'Icon Left': 'False', 'Icon Right': 'True' },
    mini: () => <><Botao p={{ Type: 'Primary', Style: 'Filled', Size: 'Small' }} /><Botao p={{ Type: 'Secondary', Style: 'Filled', Size: 'Small' }} /><Botao p={{ Type: 'Secondary', Style: 'Outline', Size: 'Small' }} /></>,
    vivo: p => <Botao p={p} />,
  },
  'Icon Button': {
    controla: ['Type', 'Style', 'Size', 'State'], padrao: { Type: 'Primary', Style: 'Filled', Size: 'Medium', State: 'Default' },
    mini: () => <>{['Primary', 'Secondary', 'Neutral', 'Danger', 'Success'].map(t => <Botao key={t} p={{ Type: t, Style: 'Filled', Size: 'Small' }} icone />)}</>,
    vivo: ICONBTN,
  },
  'Nav Button': {
    controla: ['Color'], padrao: { Color: 'White' },
    mini: () => <><button className="lnav"><Ph.CaretLeft size={16} weight="bold" /></button><button className="lnav sec"><Ph.CaretRight size={16} weight="bold" /></button><button className="lnav prim"><Ph.Heart size={16} weight="fill" /></button></>,
    vivo: p => <>{[Ph.CaretLeft, Ph.CaretRight, Ph.X, Ph.Plus, Ph.Minus, Ph.Heart, Ph.ShareNetwork].map((I, i) => <button key={i} className={`lnav ${low(p.Color) === 'primary' ? 'prim' : low(p.Color) === 'secondary' ? 'sec' : ''}`}><I size={16} weight={i === 5 ? 'fill' : 'bold'} /></button>)}</>,
  },
  'Video Button': { mini: () => <button className="lvideo"><Ph.Play size={24} weight="fill" /></button>, vivo: () => <button className="lvideo"><Ph.Play size={24} weight="fill" /></button> },
  'Toggle Button': { mini: () => <Toggle />, vivo: () => <Toggle /> },
  'Counter': { controla: ['Status'], mini: () => <Contador p={{}} />, vivo: p => <Contador p={p} /> },
  'Chips': {
    controla: ['Type', 'Style', 'Icon', 'onDelete', 'State'], padrao: { Type: 'Secondary', Style: 'Filter or choice', Icon: 'True', onDelete: 'True', State: 'Default' },
    mini: () => <><Chip p={{ Icon: 'True' }} /><Chip p={{ State: 'Active' }} /><Chip p={{ Style: 'Input', onDelete: 'True' }} /></>,
    vivo: p => <Chip key={JSON.stringify(p)} p={p} />,
  },
  'Checkbox': {
    controla: ['Type', 'State', 'Size'], padrao: { Type: 'Secondary', State: 'Active', Size: 'Large' },
    mini: () => <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Check p={{ State: 'Active' }} /><Check p={{ State: 'Default' }} /><Check p={{ State: 'Disabled' }} /></div>,
    vivo: p => <Check key={JSON.stringify(p)} p={p} />,
  },
  'Radio Button': {
    controla: ['Type', 'Mode', 'State', 'Size'], padrao: { Type: 'Secondary', Mode: 'Radio On', State: 'Default', Size: 'Large' },
    mini: () => <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><Check radio p={{ Mode: 'Radio On' }} /><Check radio p={{}} /></div>,
    vivo: p => <Check key={JSON.stringify(p)} radio p={p} />,
  },
  'Switch': { controla: ['Type', 'Mode', 'State'], padrao: { Type: 'Secundary', Mode: 'Switch On', State: 'Enable' }, mini: () => <><Switch p={{}} /><Switch p={{ Mode: 'Switch Off' }} /></>, vivo: p => <Switch key={JSON.stringify(p)} p={p} /> },
  'Input Text': { mini: () => <div className="linput-w" style={{ width: 240 }}><span className="linput-lbl">Label</span><div className="linput"><Ph.MagnifyingGlass size={18} /><input placeholder="Typ|" readOnly /></div></div>, vivo: p => <InputLib p={p} /> },
  'Number': { mini: () => <NumberIn />, vivo: () => <NumberIn /> },
  'Slider': { mini: () => <input className="lslider" type="range" defaultValue={65} style={{ width: 200 }} />, vivo: () => <Slider /> },
  'Date picker': { controla: ['Type'], padrao: { Type: 'Double basic' }, mini: () => <div style={{ pointerEvents: 'none' }}><SeletorDePeriodo valor={{ de: '2026-11-10', ate: '2026-11-18' }} onChange={() => {}} ariaLabel="Período" /></div>, vivo: p => <DatePicker key={p.Type} tipo={p.Type} /> },
  'Dropdown': { mini: () => <div style={{ transform: 'scale(.55)', transformOrigin: 'center' }}><Dropdown /></div>, vivo: () => <Dropdown /> },
  'Alert': {
    controla: ['Variant', 'Type'], padrao: { Variant: 'Info', Type: 'Compound with close' },
    mini: () => <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6, transform: 'scale(.8)' }}><Alerta p={{ Variant: 'Info', Type: 'Title' }} /><Alerta p={{ Variant: 'Danger', Type: 'Title' }} /></div>,
    vivo: p => <Alerta key={JSON.stringify(p)} p={p} />,
  },
  'Toast': { controla: ['Variant', 'Type'], padrao: { Variant: 'Sucess', Type: 'Compound' }, mini: () => <div style={{ transform: 'scale(.75)' }}><ToastLib p={{}} /></div>, vivo: p => <ToastLib p={p} /> },
  'Tooltip': { controla: ['Style', 'Type'], padrao: { Style: 'Dark', Type: 'Simple' }, mini: () => <Tooltip p={{}} />, vivo: p => <Tooltip p={p} /> },
  'Dialog': {
    controla: ['Title', 'Description'], padrao: { Title: 'True', Description: 'True' },
    mini: () => <div style={{ transform: 'scale(.6)' }}><div className="ldialog"><b>Título do diálogo</b>Descrição curta da ação.<div className="acoes"><Botao p={{ Style: 'Text', Size: 'Small' }} rotulo="Cancelar" /><Botao p={{ Size: 'Small' }} rotulo="Confirmar" /></div></div></div>,
    vivo: p => <div className="ldialog">{p.Title !== 'False' && <b>Descartar alterações?</b>}{p.Description !== 'False' && <span>As alterações feitas neste formulário serão perdidas.</span>}<div className="acoes"><Botao p={{ Style: 'Text', Size: 'Small' }} rotulo="Cancelar" /><Botao p={{ Size: 'Small', Type: 'Danger' }} rotulo="Descartar" /></div></div>,
  },
  'Modal': { mini: () => <div style={{ transform: 'scale(.55)' }}><div className="ldialog" style={{ width: 420 }}><b>Header</b><div style={{ height: 40, background: 'var(--g-50)', borderRadius: 6 }} /><div className="acoes"><Botao p={{ Style: 'Outline', Size: 'Small' }} rotulo="Footer" /></div></div></div>, vivo: () => <div className="ldialog" style={{ width: 520 }}><b>Cabeçalho do modal</b><div style={{ height: 120, background: 'var(--g-50)', borderRadius: 6, display: 'grid', placeItems: 'center' }}>Corpo</div><div className="acoes"><Botao p={{ Style: 'Outline', Size: 'Medium' }} rotulo="Cancelar" /><Botao p={{ Size: 'Medium' }} rotulo="Salvar" /></div></div> },
  'Modal Size': { mini: () => <div className="lmodal-sizes">{[[50, 40, 'S'], [80, 60, 'M'], [110, 80, 'L']].map(([w, h, t]) => <div key={t} style={{ width: w, height: h }}>{t}</div>)}</div>, vivo: () => <div className="lmodal-sizes">{[[120, 90, 'Small'], [200, 140, 'Medium'], [300, 200, 'Large']].map(([w, h, t]) => <div key={t} style={{ width: w as number, height: h as number }}>{t}</div>)}</div> },
  'Spinner Circular': { controla: ['Style', 'Size'], padrao: { Style: 'Secundary', Size: 'L' }, mini: () => <>{['S', 'M', 'L', 'XL'].map(s => <Spinner key={s} p={{ Size: s }} />)}</>, vivo: p => <Spinner p={p} /> },
  'Progress Bar': { controla: ['Style', 'Size', 'Progress'], padrao: { Style: 'Secundary', Size: 'Medium', Progress: '50%' }, mini: () => <div className="lprog med" style={{ width: 200 }}><div style={{ width: '60%' }} /></div>, vivo: p => <Progresso key={JSON.stringify(p)} p={p} /> },
  'Menu Lateral': { controla: ['Property 1'], mini: () => <div className="lmenu fechado" style={{ height: 120 }}>{[Ph.House, Ph.MagnifyingGlass, Ph.Heart].map((I, i) => <div key={i} className={`it ${i === 0 ? 'on' : ''}`}><I size={18} /></div>)}</div>, vivo: p => <MenuLateral key={JSON.stringify(p)} p={p} /> },
  'Header': { mini: () => <div className="lheader" style={{ transform: 'scale(.7)', width: 360 }}><span className="logo">Logo</span><span className="r">John<span className="lav" style={{ width: 32, height: 32, borderRadius: 99, fontSize: 12 }}>J</span></span></div>, vivo: () => <div className="lheader"><span className="logo">Logo</span><span style={{ color: 'var(--g-700)' }}>Início</span><span style={{ color: 'var(--g-700)' }}>Produtos</span><span className="r"><Ph.Bell size={20} />John<span className="lav" style={{ width: 32, height: 32, borderRadius: 99, fontSize: 12 }}>J</span></span></div> },
  'Breadcrumb': { mini: () => <div className="lcrumb"><a>Início</a><Ph.CaretRight size={12} /><a>Produtos</a><Ph.CaretRight size={12} /><span className="atual">Detalhe</span></div>, vivo: () => <div className="lcrumb"><a>Início</a><Ph.CaretRight size={12} /><a>Produtos</a><Ph.CaretRight size={12} /><a>Categoria</a><Ph.CaretRight size={12} /><span className="atual">Página atual</span></div> },
  'Tabs': { mini: () => <div style={{ width: 260 }}><Abas /></div>, vivo: () => <Abas /> },
  'Pagination': { controla: ['Variant', 'Abstract'], padrao: { Variant: 'Secondary', Abstract: 'On' }, mini: () => <div style={{ transform: 'scale(.8)' }}><Paginacao p={{}} /></div>, vivo: p => <Paginacao p={p} /> },
  'Progress Stepper': { mini: () => <div style={{ width: 260, transform: 'scale(.9)' }}><Stepper /></div>, vivo: () => <Stepper /> },
  'Wizard': { mini: () => <div style={{ transform: 'scale(.6)', width: 400 }}><Wizard /></div>, vivo: () => <Wizard /> },
  'Carousel': { mini: () => <div className="ldots">{[0, 1, 2, 3].map(i => <button key={i} className={i === 0 ? 'on' : ''} />)}</div>, vivo: () => <Carrossel /> },
  'Scrollbar': { mini: () => <div className="lscroll" style={{ width: 180, height: 90 }}>{'Conteúdo com rolagem. '.repeat(20)}</div>, vivo: () => <div className="lscroll">{'Conteúdo com rolagem vertical e horizontal para ver a barra fina da biblioteca. '.repeat(12)}</div> },
  'Accordion': { mini: () => <div style={{ transform: 'scale(.6)', width: 420 }}><Acordeao /></div>, vivo: () => <Acordeao /> },
  'Avatar': { controla: ['Variant', 'Type', 'Size', 'Color'], padrao: { Variant: 'Circle', Type: 'Text', Size: 'XLarge', Color: 'Secondary' }, mini: () => <>{['XLarge', 'Large', 'Medium', 'Small'].map((s, i) => <Avatar key={s} p={{ Size: s, Variant: i % 2 ? 'Square' : 'Circle', Color: i === 1 ? 'Primary' : 'Secondary' }} />)}</>, vivo: p => <Avatar p={p} /> },
  'Badges': { mini: () => <><span style={{ position: 'relative' }}><Ph.Bell size={26} /><span className="lbadge-n">3</span></span><span className="lbadge-p" style={{ background: 'var(--ok-600)', color: '#fff' }}>8,3</span><span className="lbadge-p" style={{ background: 'var(--s-500)', color: '#fff' }}><Ph.SealCheck size={14} weight="fill" />Verified</span></>, vivo: () => <><span style={{ position: 'relative' }}><Ph.Bell size={28} /><span className="lbadge-n">12</span></span><span className="lbadge-p" style={{ background: 'var(--ok-600)', color: '#fff' }}>8,3 Muito bom</span><span className="lbadge-p" style={{ background: 'var(--s-500)', color: '#fff' }}><Ph.SealCheck size={14} weight="fill" />Verified</span><span className="lbadge-p" style={{ background: 'var(--p-500)' }}>R$ 1.299</span></> },
  'List': { mini: () => <div className="llist" style={{ transform: 'scale(.6)' }}><div className="it"><Ph.File size={20} />Simple list</div><div className="it"><Ph.File size={20} />Simple list</div></div>, vivo: () => <div className="llist">{['Relatório de marcas', 'Contrato assinado', 'Proposta comercial'].map((t, i) => <div key={t} className="it"><Ph.FileText size={22} color="var(--s-500)" /><div>{t}<small>Atualizado há {i + 2} dias</small></div><Ph.DotsThreeVertical size={18} style={{ marginLeft: 'auto' }} /></div>)}</div> },
  'Ranking': { controla: ['Property 2'], mini: () => <Estrelas p={{}} />, vivo: p => <Estrelas key={p['Property 2']} p={p} /> },
  'Dividers': { controla: ['Style'], mini: () => <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: 16 }}><div className="ldiv-h" /><div className="ldiv-h dots" /></div>, vivo: p => <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, font: '400 13px Nunito' }}>Acima<div className={`ldiv-h ${low(p.Style) === 'dots' ? 'dots' : ''}`} />Abaixo</div> },
}
