import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as Ph from '@phosphor-icons/react'
import dados from '../../../data/biblioteca.json'
import { DEMOS } from '../biblioteca/demos'
import { ApolComponentes } from '../apol/ApolComponentes'
import { COMPONENTES_APOL, type CompApol } from '../apol/catalogo'
import { CODIGOS, type Arquivo } from '../codigos'
import { APOL_MANTIDOS, EXTRAS, SUBSTITUIDOS, type Extra } from './extras'
import { Codigo } from '../../../components/ui/Doc'

type LibComp = (typeof dados.componentes)[number]
const fmt = (n: number) => n.toLocaleString('pt-BR')

/* Categorias únicas do Design System (a biblioteca de variantes e os padrões do produto numa lista só) */
const CATEGORIAS = ['Todos', 'Estrutura', 'Ações', 'Formulários', 'Navegação', 'Feedback', 'Exibição de dados']
const ICONE_CAT: Record<string, Ph.Icon> = { Estrutura: Ph.Layout, 'Ações': Ph.CursorClick, 'Formulários': Ph.Textbox, 'Navegação': Ph.Compass, Feedback: Ph.ChatCircleDots, 'Exibição de dados': Ph.Table }

/* Os componentes do APOL+ que a biblioteca já cobre (Botões, Campos, Período, Chips, Abas, Modal, Toast)
   foram unificados: aparecem uma vez só, com o código real anexado ao componente da biblioteca. */
const CATEGORIA_APOL: Record<string, string> = { Dados: 'Exibição de dados' }

export interface Item { chave: string; nome: string; categoria: string; descricao: string; nProps: number; variantes?: number; lib?: LibComp; apol?: CompApol; extra?: Extra }

function montarItens(): Item[] {
  const lib: Item[] = dados.componentes.filter(c => !SUBSTITUIDOS.includes(c.nome)).map(c => ({ chave: c.nome, nome: c.nome, categoria: c.categoria, descricao: c.descricao, nProps: Object.keys(c.propriedades).length, variantes: c.variantes, lib: c }))
  const apol: Item[] = COMPONENTES_APOL.filter(c => APOL_MANTIDOS.includes(c.id)).map(c => ({ chave: c.id, nome: c.nome, categoria: CATEGORIA_APOL[c.categoria] ?? c.categoria, descricao: c.descricao, nProps: c.propriedades.length, apol: c }))
  const extra: Item[] = EXTRAS.map(e => ({ chave: e.chave, nome: e.nome, categoria: e.categoria, descricao: e.descricao, nProps: e.propriedades.length, extra: e }))
  return [...lib, ...apol, ...extra]
}
export const ITENS = montarItens()

/* Snippet JSX a partir das propriedades (fallback quando o componente ainda não tem código real documentado).
   No Button, Type/Style viram tone/variant, como no componente real. */
const camel = (t: string) => t.replace(/\s+(.)/g, (_, c: string) => c.toUpperCase()).replace(/^./, c => c.toLowerCase())
const pascal = (t: string) => t.replace(/(^|\s+)(.)/g, (_, __, c: string) => c.toUpperCase())
function gerarCodigo(nome: string, sel: Record<string, string>, props: Record<string, string[]>) {
  const botao = nome === 'Button'
  const atributos = Object.keys(props).filter(k => sel[k] != null).map(k => {
    const v = sel[k]!
    const nomeProp = botao ? ({ Type: 'tone', Style: 'variant' } as Record<string, string>)[k] ?? camel(k) : camel(k)
    const valor = botao && ['Type', 'Style', 'Size'].includes(k) ? v.toLowerCase() : v
    return v === 'True' ? `  ${nomeProp}` : v === 'False' ? `  ${nomeProp}={false}` : `  ${nomeProp}="${valor}"`
  })
  const tag = pascal(nome)
  return atributos.length ? `<${tag}\n${atributos.join('\n')}\n/>` : `<${tag} />`
}

/* Prévia real do componente em miniatura (metade do tamanho, sem interação) para o card do catálogo */
function Miniatura({ children }: { children: React.ReactNode }) {
  return <div className="mini-esc" aria-hidden="true" inert><div className="mini-esc-in">{children}</div></div>
}

/* ─────────── Catálogo ─────────── */
function Catalogo({ abrir }: { abrir: (i: Item) => void }) {
  const [cat, setCat] = useState('Todos')
  const [q, setQ] = useState('')
  const [ordem, setOrdem] = useState('categoria')
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    const l = ITENS.filter(c => (cat === 'Todos' || c.categoria === cat) && (!t || `${c.nome} ${c.descricao}`.toLowerCase().includes(t)))
    return [...l].sort((a, b) => ordem === 'nome' ? a.nome.localeCompare(b.nome) : CATEGORIAS.indexOf(a.categoria) - CATEGORIAS.indexOf(b.categoria) || a.nome.localeCompare(b.nome))
  }, [cat, q, ordem])

  return (
    <>
      <div className="cat-filtros">
        <div className="campo-ic" style={{ width: 260 }}><input className="campo" placeholder="Buscar componente…" value={q} onChange={e => setQ(e.target.value)} /><Ph.MagnifyingGlass size={14} /></div>
        {CATEGORIAS.map(c => <button key={c} className={`chip compacto ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}{c !== 'Todos' && <span style={{ opacity: .7 }}>· {ITENS.filter(x => x.categoria === c).length}</span>}</button>)}
        <div className="ordenar" style={{ marginLeft: 'auto' }}><span>Ordenar</span><select className="campo" value={ordem} onChange={e => setOrdem(e.target.value)}><option value="categoria">Categoria</option><option value="nome">Nome</option></select></div>
      </div>
      <div className="toolbar" style={{ marginBottom: 12 }}><span className="count"><strong>{lista.length}</strong> componentes · <strong>{lista.filter(c => CODIGOS[c.chave]).length}</strong> com código para reproduzir</span></div>
      {lista.length === 0 ? (
        <div className="vazio"><Ph.MagnifyingGlass size={32} color="var(--c-text-muted)" /><span>Nenhum componente encontrado.</span><button className="btn btn-outline" onClick={() => { setQ(''); setCat('Todos') }}>Limpar filtros</button></div>
      ) : (
        <div className="cat-grid">
          {lista.map(c => {
            const d = c.lib ? DEMOS[c.nome] : undefined; const I = ICONE_CAT[c.categoria] ?? Ph.Shapes;            return (
              <button key={c.chave} className="cat-card" onClick={() => abrir(c)}>
                <div className={`prev ${c.lib ? 'lib' : 'apol-ic'}`}>{d ? d.mini() : c.apol ? <Miniatura><div className="apol-previa previa-clara"><ApolComponentes so={c.apol.id} /></div></Miniatura> : c.extra ? <Miniatura>{c.extra.previa()}</Miniatura> : <Ph.Shapes size={32} color="#C9CDD3" />}</div>
                <div className="info">
                  <div className="nome">{c.nome}</div>
                  <div className="desc">{c.descricao}</div>
                  <div className="meta">
                    <span className="pill"><I size={11} />{c.categoria}</span>
                    {c.variantes != null && <span className="pill">{fmt(c.variantes)} variantes</span>}
                    {c.nProps > 0 && <span className="pill">{c.nProps} props</span>}
                    {CODIGOS[c.chave] && <span className="pill ac"><Ph.Code size={11} />código</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

/* Código separado por arquivo (TSX, CSS, uso…) */
function CodigoPorArquivo({ arquivos }: { arquivos: Arquivo[] }) {
  const [i, setI] = useState(0)
  const atual = arquivos[Math.min(i, arquivos.length - 1)]
  return (
    <>
      {arquivos.length > 1 && <div className="cat-filtros" style={{ marginBottom: 8 }}>{arquivos.map((a, k) => <button key={a.rotulo} className={`chip compacto ${k === i ? 'on' : ''}`} onClick={() => setI(k)}>{a.rotulo}</button>)}</div>}
      {arquivos.length === 1 && <div className="note mono" style={{ margin: '0 0 6px' }}>{atual.rotulo}</div>}
      <Codigo key={atual.rotulo}>{atual.codigo}</Codigo>
    </>
  )
}

function Detalhe({ item, fechar }: { item: Item; fechar: () => void }) {
  const { lib, apol, extra } = item
  const d = lib ? DEMOS[lib.nome] : undefined
  const props = (lib?.propriedades ?? {}) as Record<string, string[]>
  const inicial = useMemo(() => { const p: Record<string, string> = {}; for (const [k, v] of Object.entries(props)) p[k] = d?.padrao?.[k] ?? v[0]; return p }, [item.chave]) // eslint-disable-line
  const [sel, setSel] = useState<Record<string, string>>(inicial)
  const [fundo, setFundo] = useState<'grade' | 'branco'>('grade')
  const [maximizado, setMaximizado] = useState(false)
  useEffect(() => { setSel(inicial) }, [inicial])
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && fechar(); addEventListener('keydown', h); return () => removeEventListener('keydown', h) }, [fechar])
  const nomeVariante = Object.entries(sel).filter(([k]) => props[k]).map(([k, v]) => `${k}=${v}`).join(', ')
  const arquivos = CODIGOS[item.chave]
  const I = ICONE_CAT[item.categoria] ?? Ph.Shapes

  return (
    <>
      <div className="dw-ov" onClick={fechar} />
      <aside className={`dw${maximizado ? ' dw-max' : ''}`} role="dialog" aria-label={item.nome}>
        <div className="pdd-hdr">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="crumb">Componentes <Ph.CaretRight size={10} /> {item.categoria}</div>
            <div className="pdd-hdr-title" style={{ fontSize: 20 }}>{item.nome}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="pill"><I size={11} />{item.categoria}</span>
              {lib && <span className="pill ac">{fmt(lib.variantes)} variantes</span>}
              {item.nProps > 0 && <span className="pill">{item.nProps} propriedades</span>}
              {arquivos && <span className="pill ac"><Ph.Code size={11} />{arquivos.length} {arquivos.length === 1 ? 'arquivo' : 'arquivos'} de código</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="pdd-close" aria-label={maximizado ? 'Restaurar tamanho' : 'Maximizar'} title={maximizado ? 'Restaurar tamanho' : 'Maximizar'} onClick={() => setMaximizado(m => !m)}>{maximizado ? <Ph.CornersIn size={16} /> : <Ph.CornersOut size={16} />}</button>
            <button className="pdd-close" aria-label="Fechar" onClick={fechar}><Ph.X size={16} weight="bold" /></button>
          </div>
        </div>

        <div className="pdd-body">
          <div className="pdd-section"><p style={{ margin: 0, fontSize: 13.5 }}>{item.descricao}</p></div>

          <div className="pdd-section">
            <div className="pdd-sec-title" style={{ justifyContent: 'space-between' }}><span style={{ display: 'flex', gap: 7, alignItems: 'center' }}><Ph.Play size={13} weight="fill" />Prévia ao vivo</span>
              {lib && <div className="seg"><button className={fundo === 'grade' ? 'on' : ''} onClick={() => setFundo('grade')}>Grade</button><button className={fundo === 'branco' ? 'on' : ''} onClick={() => setFundo('branco')}>Branco</button></div>}
            </div>
            {lib && <div className={`palco lib ${fundo === 'grade' ? 'grade' : ''}`} style={{ minHeight: 200 }}>{d ? d.vivo(sel) : <div className="vazio-rico" style={{ width: '100%', background: 'transparent' }}><div className="circ"><Ph.Shapes size={20} /></div><b>Sem prévia ao vivo</b><p>Este componente ainda não tem réplica em código nesta página.</p></div>}</div>}
            {apol && <div className="apol-previa previa-clara"><ApolComponentes so={apol.id} /></div>}
            {extra && <div className="palco previa-clara" style={{ minHeight: 200 }}>{extra.previa()}</div>}
            {d?.controla && <div className="note"><Ph.HandPointing size={12} /> Clique nos valores da tabela abaixo para trocar a variante. Também dá para interagir com a prévia.</div>}
            {nomeVariante && d?.controla && <div className="note mono" style={{ marginTop: 4 }}>Variante: {nomeVariante}</div>}
          </div>

          <div className="pdd-section">
            <div className="pdd-sec-title"><Ph.SlidersHorizontal size={13} />Propriedades do componente</div>
            {lib ? (Object.keys(props).length === 0 ? <div className="note" style={{ marginTop: 0 }}>Sem propriedades de variante (componente único ou peças internas).</div> : (
              <div className="tw-doc"><table className="dt props-tab">
                <thead><tr><th style={{ width: 150 }}>Propriedade</th><th>Valores</th></tr></thead>
                <tbody>{Object.entries(props).map(([k, vs]) => {
                  const ativa = d?.controla?.includes(k)
                  return <tr key={k}><td><b>{k}</b>{ativa && <div className="note" style={{ margin: 0, fontSize: 11 }}>interativa</div>}</td><td><div className="vals">{vs.map(v => ativa
                    ? <button key={v} className={sel[k] === v ? 'on' : ''} onClick={() => setSel(s => ({ ...s, [k]: v }))}>{v}</button>
                    : <span key={v} className="pill">{v}</span>)}</div></td></tr>
                })}</tbody>
              </table></div>
            )) : (
              <div className="tw-doc"><table className="dt props-tab">
                <thead><tr><th style={{ width: 150 }}>Propriedade</th><th>Valores</th></tr></thead>
                <tbody>{(apol?.propriedades ?? extra?.propriedades ?? []).map(p => (
                  <tr key={p.nome}><td><b>{p.nome}</b></td><td><div className="vals">{p.valores.map(v => <span key={v} className="pill mono">{v}</span>)}</div>{p.nota && <div className="note" style={{ margin: '6px 0 0' }}>{p.nota}</div>}</td></tr>
                ))}</tbody>
              </table></div>
            )}
          </div>

          <div className="pdd-section">
            <div className="pdd-sec-title"><Ph.Code size={13} />Código para reproduzir do zero</div>
            {arquivos ? <CodigoPorArquivo arquivos={arquivos} /> : <Codigo>{lib ? gerarCodigo(lib.nome, sel, props) : apol?.codigo ?? ''}</Codigo>}
            <div className="note"><Ph.Info size={12} /> {arquivos
              ? 'React + CSS prontos para copiar. Toda cor vem de token (var(--c-*)); ícones são do Phosphor.'
              : 'Este componente ainda não tem a implementação documentada. O trecho acima é gerado a partir das propriedades escolhidas.'}</div>
          </div>
          {item.chave === 'Button' && <BotaoMatriz />}
        </div>
        <div className="pdd-footer"><button className="btn btn-outline" onClick={() => setMaximizado(m => !m)}>{maximizado ? 'Restaurar' : 'Maximizar'}</button><button className="btn btn-outline" onClick={fechar}>Fechar</button></div>
      </aside>
    </>
  )
}

/* Matriz Tom × Estilo do Button, com o token de cada tom */
function BotaoMatriz() {
  const tons: [string, string, string, string][] = [['Primary', 'primary', '--c-support', 'hover --c-support-h · ativo --c-support-a'], ['Secondary', 'secondary', '--c-brand', 'hover --c-brand-hover'], ['Neutral', 'neutral', '--c-text', 'hover --c-neutral-h'], ['Danger', 'danger', '--c-danger', 'hover --c-danger-txt'], ['Success', 'success', '--c-success', 'hover --c-success-txt']]
  return (
    <div className="pdd-section">
      <div className="pdd-sec-title"><Ph.GridFour size={13} />Matriz de tons e estilos</div>
      <div className="tw-doc"><table className="dt lib">
        <thead><tr><th>Tom</th><th>Filled</th><th>Outline</th><th>Text</th><th>Token</th></tr></thead>
        <tbody>{tons.map(([t, , tk, h]) => (
          <tr key={t}><td><b>{t}</b></td>
            {['Filled', 'Outline', 'Text'].map(s => <td key={s} style={{ background: '#fff' }}>{DEMOS.Button.vivo({ Type: t, Style: s, Size: 'Small', State: 'Default' })}</td>)}
            <td><span className="mini-sw" style={{ background: `var(${tk})` }} /><code>{tk}</code><div className="note" style={{ margin: '2px 0 0' }}>{h}</div></td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="grid g3" style={{ marginTop: 12 }}>
        {[['Small (padrão)', '32px', '14 / 600 · padding 8×16'], ['Medium', '44px', '16 / 600 · padding 8×16'], ['Large', '56px', '18 / 600 · padding 16×24']].map(([n, h, dsc]) => <div key={n} className="fato"><div className="k">{n}</div><div className="v">{h}</div><div className="note">{dsc} · raio 8 · gap 8</div></div>)}
      </div>
      <div className="note">Desabilitado: fundo <code>--c-input-bg-disabled</code>, texto <code>--c-input-text-disabled</code>; outline com borda <code>--c-input-border-disabled</code>. Hover de Outline e Text: fundo do tom a 12%. Estes três tamanhos são o padrão de todos os botões do produto.</div>
    </div>
  )
}

export default function Componentes() {
  const [params, setParams] = useSearchParams()
  const aberto = params.get('c')
  const item = ITENS.find(c => c.chave === aberto)
  const set = (v: string | null) => setParams(p => { const n = new URLSearchParams(p); if (v == null) n.delete('c'); else n.set('c', v); return n }, { replace: v == null })
  return (
    <>
      <p className="lead" style={{ color: 'var(--c-neutral)', maxWidth: 820, marginTop: 0 }}>Todos os componentes do Atlas e dos produtos da LDSOFT em um só lugar. Clique em um componente para abrir o painel com a prévia ao vivo, as propriedades e o <b>código para reproduzi-lo do zero</b> (React + CSS, separado por arquivo). O painel pode ser maximizado.</p>
      <Catalogo abrir={i => set(i.chave)} />
      {item && <Detalhe key={item.chave} item={item} fechar={() => set(null)} />}
    </>
  )
}
