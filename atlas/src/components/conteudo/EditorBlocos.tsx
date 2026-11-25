/*
  Editor de páginas por blocos (inspirado no Notion).
  • Digite "/" em um bloco vazio para escolher o tipo; use o "+" para inserir e o ⋮⋮ para mover, duplicar, transformar ou excluir.
  • Selecione um trecho de texto para formatar (negrito, itálico, sublinhado, código, link).
  • Arraste pelo ⋮⋮ para reorganizar.
*/
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as KE, type ReactNode } from 'react'
import {
  ArrowDown, ArrowUp, ChartBar, Code, Copy, DotsSixVertical, Image as ImagemIc, LinkSimple, ListBullets, ListNumbers, Minus, Paperclip, Plus,
  Quotes, Table, TextAa, TextB, TextHOne, TextHThree, TextHTwo, TextItalic, TextUnderline, Trash, UploadSimple, LinkBreak, type Icon,
} from '@phosphor-icons/react'
import { guardarArquivoDeBloco } from '../../lib/api'
import { otimizarImagem } from '../../lib/arquivos'
import { uid } from '../../lib/formatar'
import { escapar, normalizarUrl, textoPlano } from '../../lib/html'
import type { Bloco, TipoBloco } from '../../lib/tipos'
import { AnexoDeBloco, ImagemDeBloco } from './LeitorBlocos'
import { EditorComparativo, comparativoVazio } from './Comparativo'

/* ── Tipos de bloco ── */
interface Opcao { tipo: TipoBloco; rotulo: string; dica: string; icone: Icon; termos: string }
const OPCOES: Opcao[] = [
  { tipo: 'paragrafo', rotulo: 'Texto', dica: 'Parágrafo simples', icone: TextAa, termos: 'texto paragrafo' },
  { tipo: 'h1', rotulo: 'Título 1', dica: 'Cabeçalho grande', icone: TextHOne, termos: 'titulo cabecalho h1' },
  { tipo: 'h2', rotulo: 'Título 2', dica: 'Subtítulo de seção', icone: TextHTwo, termos: 'titulo subtitulo h2' },
  { tipo: 'h3', rotulo: 'Título 3', dica: 'Subtítulo menor', icone: TextHThree, termos: 'titulo subtitulo h3' },
  { tipo: 'lista', rotulo: 'Lista', dica: 'Lista com marcadores', icone: ListBullets, termos: 'lista marcadores bullet' },
  { tipo: 'numerada', rotulo: 'Lista numerada', dica: 'Lista ordenada', icone: ListNumbers, termos: 'lista numerada ordenada' },
  { tipo: 'citacao', rotulo: 'Citação', dica: 'Destaque de uma frase', icone: Quotes, termos: 'citacao destaque quote' },
  { tipo: 'imagem', rotulo: 'Imagem', dica: 'Enviar ou usar um link', icone: ImagemIc, termos: 'imagem foto print' },
  { tipo: 'tabela', rotulo: 'Tabela', dica: 'Linhas e colunas', icone: Table, termos: 'tabela grade' },
  { tipo: 'comparativo', rotulo: 'Tabela comparativa', dica: 'Benchmark: produtos × funcionalidades', icone: ChartBar, termos: 'tabela comparativa benchmark concorrentes comparativo pontuacao' },
  { tipo: 'link', rotulo: 'Link', dica: 'Cartão com endereço', icone: LinkSimple, termos: 'link url endereco' },
  { tipo: 'arquivo', rotulo: 'Arquivo', dica: 'Anexar um arquivo', icone: Paperclip, termos: 'arquivo anexo documento' },
  { tipo: 'separador', rotulo: 'Separador', dica: 'Linha divisória', icone: Minus, termos: 'separador divisor linha' },
]
const TEXTOS: TipoBloco[] = ['paragrafo', 'h1', 'h2', 'h3', 'citacao']
const eTexto = (t: TipoBloco) => TEXTOS.includes(t)
const eLista = (t: TipoBloco) => t === 'lista' || t === 'numerada'
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function novoBloco(tipo: TipoBloco): Bloco {
  const b: Bloco = { id: uid(), tipo }
  if (eTexto(tipo)) b.html = ''
  if (eLista(tipo)) b.itens = ['']
  if (tipo === 'tabela') { b.cabecalho = true; b.linhas = [['', '', ''], ['', '', ''], ['', '', '']] }
  if (tipo === 'comparativo') { b.comparativo = comparativoVazio(); b.legenda = '' }
  return b
}

interface Foco { id: string; item?: number; fim?: boolean }

/* ── Texto editável (contentEditable controlado "por fora") ── */
function dividirNoCursor(el: HTMLElement) {
  const sel = getSelection()
  if (!sel?.rangeCount) return { antes: el.innerHTML, depois: '' }
  const r = sel.getRangeAt(0)
  const resto = document.createRange()
  resto.selectNodeContents(el); resto.setStart(r.endContainer, r.endOffset)
  const caixa = document.createElement('div'); caixa.appendChild(resto.extractContents())
  return { antes: el.innerHTML, depois: caixa.innerHTML }
}
const vazio = (h: string) => !textoPlano(h).trim()

function Editavel({ html, onChange, placeholder, className = '', focar, onSplit, onApagarVazio, onTecla }: {
  html: string; onChange: (h: string) => void; placeholder?: string; className?: string; focar?: Foco | null
  onSplit?: (antes: string, depois: string) => void; onApagarVazio?: () => void; onTecla?: (e: KE) => boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => { const el = ref.current!; if (el.innerHTML !== html) el.innerHTML = html }, [html])
  useEffect(() => {
    if (!focar) return
    const el = ref.current!; el.focus()
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(!focar.fim)
    const s = getSelection(); s?.removeAllRanges(); s?.addRange(r)
  }, [focar])

  return (
    <div
      ref={ref} className={`bl-edit ${className}`} contentEditable suppressContentEditableWarning spellCheck data-ph={placeholder} role="textbox" aria-multiline="true" aria-label={placeholder}
      onInput={e => {
        const el = e.currentTarget
        if (!el.textContent && !el.querySelector('img')) el.innerHTML = ''
        onChange(el.innerHTML)
      }}
      onPaste={e => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')) }}
      onKeyDown={e => {
        if (e.nativeEvent.isComposing) return
        if (onTecla?.(e)) return
        if (e.key === 'Enter' && !e.shiftKey && onSplit) { e.preventDefault(); const { antes, depois } = dividirNoCursor(e.currentTarget); onSplit(antes, depois) }
        else if (e.key === 'Backspace' && onApagarVazio && !e.currentTarget.textContent) { e.preventDefault(); onApagarVazio() }
      }}
    />
  )
}

/* ── Barra de formatação flutuante ── */
function Btn({ i: I, t, f }: { i: Icon; t: string; f: () => void }) {
  return <button type="button" title={t} aria-label={t} onMouseDown={e => e.preventDefault()} onClick={f}><I size={15} weight="bold" /></button>
}

function BarraFormatacao() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [modoLink, setModoLink] = useState(false)
  const [url, setUrl] = useState('')
  const guardada = useRef<Range | null>(null)

  useEffect(() => {
    const h = () => {
      if (modoLink) return
      const s = getSelection()
      if (!s || s.isCollapsed || !s.rangeCount) { setPos(null); return }
      const r = s.getRangeAt(0)
      const no = r.commonAncestorContainer
      const el = (no.nodeType === 1 ? no : no.parentElement) as HTMLElement | null
      if (!el?.closest('.bl-edit')) { setPos(null); return }
      const rc = r.getBoundingClientRect()
      setPos({ x: rc.left + rc.width / 2, y: rc.top })
    }
    document.addEventListener('selectionchange', h); document.addEventListener('scroll', h, true)
    return () => { document.removeEventListener('selectionchange', h); document.removeEventListener('scroll', h, true) }
  }, [modoLink])

  if (!pos) return null
  const cmd = (c: string) => document.execCommand(c)
  const codigo = () => { const t = getSelection()?.toString(); if (t) document.execCommand('insertHTML', false, `<code>${escapar(t)}</code>`) }
  const abrirLink = () => { const s = getSelection(); if (s?.rangeCount) { guardada.current = s.getRangeAt(0).cloneRange(); setUrl(''); setModoLink(true) } }
  const aplicarLink = () => {
    const r = guardada.current
    if (r && url.trim()) {
      const no = r.commonAncestorContainer
      ;((no.nodeType === 1 ? no : no.parentElement) as HTMLElement | null)?.closest<HTMLElement>('.bl-edit')?.focus()
      const s = getSelection(); s?.removeAllRanges(); s?.addRange(r)
      document.execCommand('createLink', false, normalizarUrl(url))
    }
    setModoLink(false); setPos(null)
  }
  return (
    <div className="bl-barra" style={{ left: pos.x, top: pos.y }} onMouseDown={e => { if (!(e.target as HTMLElement).closest('input')) e.preventDefault() }}>
      {modoLink ? (
        <form onSubmit={e => { e.preventDefault(); aplicarLink() }}>
          <input autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="Cole ou digite o link" onKeyDown={e => { if (e.key === 'Escape') setModoLink(false) }} />
          <button type="submit" className="ok">Aplicar</button>
        </form>
      ) : (<>
        <Btn i={TextB} t="Negrito (Ctrl+B)" f={() => cmd('bold')} />
        <Btn i={TextItalic} t="Itálico (Ctrl+I)" f={() => cmd('italic')} />
        <Btn i={TextUnderline} t="Sublinhado (Ctrl+U)" f={() => cmd('underline')} />
        <Btn i={Code} t="Código" f={codigo} />
        <span className="sep" />
        <Btn i={LinkSimple} t="Inserir link" f={abrirLink} />
        <Btn i={LinkBreak} t="Remover link" f={() => cmd('unlink')} />
      </>)}
    </div>
  )
}

/* ── Menu de tipos (slash e "+") ── */
function MenuTipos({ opcoes, sel, aoEscolher, fechar, titulo }: { opcoes: Opcao[]; sel?: number; aoEscolher: (t: TipoBloco) => void; fechar: () => void; titulo?: string }) {
  return (<>
    <div className="bl-menu-fundo" onMouseDown={fechar} />
    <div className="bl-menu" role="listbox" onMouseDown={e => e.preventDefault()}>
      <div className="bl-menu-tit">{titulo ?? 'Blocos'}</div>
      {opcoes.length === 0 && <div className="bl-menu-vazio">Nenhum bloco encontrado.</div>}
      {opcoes.map((o, i) => (
        <button type="button" key={o.tipo} role="option" aria-selected={i === sel} className={i === sel ? 'sel' : ''} onClick={() => aoEscolher(o.tipo)}>
          <span className="ic"><o.icone size={18} /></span><span><b>{o.rotulo}</b><small>{o.dica}</small></span>
        </button>
      ))}
    </div>
  </>)
}

/* ── Blocos com interface própria ── */
function BlocoTabela({ b, aoMudar }: { b: Bloco; aoMudar: (p: Partial<Bloco>) => void }) {
  const linhas = b.linhas ?? [['']]
  const cols = linhas[0]?.length ?? 1
  const set = (i: number, j: number, v: string) => aoMudar({ linhas: linhas.map((l, a) => a === i ? l.map((c, k) => k === j ? v : c) : l) })
  return (
    <div className="bl-tabela">
      <div className="a-tabela"><table><tbody>
        {linhas.map((l, i) => (
          <tr key={i}>{l.map((c, j) => (
            <td key={j} className={b.cabecalho && i === 0 ? 'cab' : ''}>
              <input value={c} onChange={e => set(i, j, e.target.value)} aria-label={`Linha ${i + 1}, coluna ${j + 1}`} placeholder={b.cabecalho && i === 0 ? 'Cabeçalho' : ''} />
            </td>
          ))}</tr>
        ))}
      </tbody></table></div>
      <div className="bl-tabela-acoes">
        <button type="button" onClick={() => aoMudar({ linhas: [...linhas, Array(cols).fill('')] })}><Plus size={12} />Linha</button>
        <button type="button" onClick={() => aoMudar({ linhas: linhas.map(l => [...l, '']) })}><Plus size={12} />Coluna</button>
        <button type="button" disabled={linhas.length <= 1} onClick={() => aoMudar({ linhas: linhas.slice(0, -1) })}><Minus size={12} />Linha</button>
        <button type="button" disabled={cols <= 1} onClick={() => aoMudar({ linhas: linhas.map(l => l.slice(0, -1)) })}><Minus size={12} />Coluna</button>
        <label className="chk" style={{ marginLeft: 'auto' }}><input type="checkbox" checked={!!b.cabecalho} onChange={e => aoMudar({ cabecalho: e.target.checked })} />Primeira linha como cabeçalho</label>
      </div>
    </div>
  )
}

function Carregador({ rotulo, aceita, icone: I, aoEscolher, extra }: { rotulo: string; aceita?: string; icone: Icon; aoEscolher: (f: File) => Promise<void>; extra?: ReactNode }) {
  const entrada = useRef<HTMLInputElement>(null)
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const [sobre, setSobre] = useState(false)
  const enviar = async (f?: File) => {
    if (!f) return
    setOcupado(true); setErro('')
    try { await aoEscolher(f) } catch (e) { setErro((e as Error).message) } finally { setOcupado(false) }
  }
  return (
    <div className={`dropzone ${sobre ? 'sobre' : ''}`} onDragOver={e => { e.preventDefault(); setSobre(true) }} onDragLeave={() => setSobre(false)} onDrop={e => { e.preventDefault(); setSobre(false); void enviar(e.dataTransfer.files[0]) }}>
      <I size={20} />
      <button type="button" className="btn btn-outline btn-sm" disabled={ocupado} onClick={() => entrada.current?.click()}><UploadSimple size={14} />{ocupado ? 'Enviando…' : rotulo}</button>
      <input ref={entrada} type="file" accept={aceita} hidden onChange={e => { void enviar(e.target.files?.[0]); e.target.value = '' }} />
      {extra}
      {erro && <span className="campo-erro-msg" role="alert" style={{ margin: 0 }}>{erro}</span>}
    </div>
  )
}

function BlocoImagem({ b, aoMudar, aoTexto, focar }: { b: Bloco; aoMudar: (p: Partial<Bloco>) => void; aoTexto: (h: string) => void; focar?: Foco | null }) {
  const [link, setLink] = useState('')
  const tem = !!(b.arquivoId || b.url)
  if (!tem) return (
    <Carregador rotulo="Enviar imagem" aceita="image/*" icone={ImagemIc}
      aoEscolher={async f => {
        if (!f.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem.')
        aoMudar({ arquivoId: await guardarArquivoDeBloco(await otimizarImagem(f)), nome: f.name })
      }}
      extra={<form className="bl-img-link" onSubmit={e => { e.preventDefault(); if (link.trim()) aoMudar({ url: normalizarUrl(link) }) }}>
        <span>ou</span><input className="campo" value={link} onChange={e => setLink(e.target.value)} placeholder="Cole o link de uma imagem" /><button className="btn btn-outline btn-sm" type="submit">Inserir</button>
      </form>} />
  )
  return (
    <figure className="bl-figura">
      <ImagemDeBloco b={b} />
      <Editavel html={b.legenda ?? ''} onChange={aoTexto} placeholder="Adicionar legenda" className="bl-legenda" focar={focar} />
    </figure>
  )
}

/* ═══ Editor ═══ */
export function EditorBlocos({ blocos, onChange }: { blocos: Bloco[]; onChange: (b: Bloco[]) => void }) {
  const [foco, setFoco] = useState<Foco | null>(null)
  const [slash, setSlash] = useState<{ id: string; filtro: string; sel: number } | null>(null)
  const [mais, setMais] = useState<string | null>(null)       // menu "+" aberto
  const [acoes, setAcoes] = useState<string | null>(null)     // menu ⋮⋮ aberto
  const [arrasto, setArrasto] = useState<string | null>(null)
  const [sobre, setSobre] = useState<string | null>(null)

  const opcoesSlash = slash ? OPCOES.filter(o => norm(`${o.rotulo} ${o.termos}`).includes(norm(slash.filtro))) : []

  const mudar = (id: string, p: Partial<Bloco>) => onChange(blocos.map(b => b.id === id ? { ...b, ...p } : b))
  const indice = (id: string) => blocos.findIndex(b => b.id === id)
  const inserir = (pos: number, novo: Bloco, f?: Foco | null) => { const c = [...blocos]; c.splice(pos, 0, novo); onChange(c); if (f !== null) setFoco(f ?? { id: novo.id }) }
  const remover = (id: string) => { const c = blocos.filter(b => b.id !== id); onChange(c.length ? c : [novoBloco('paragrafo')]) }

  /** Converte o bloco; `manter` preserva o texto (transformação) ou limpa o "/comando" (slash) */
  const converter = (id: string, tipo: TipoBloco, manter: boolean) => {
    const i = indice(id), atual = blocos[i]!
    const texto = manter ? atual.html ?? (atual.itens ?? []).join(' ') : ''
    const novo = { ...novoBloco(tipo), id }
    if (eTexto(tipo)) novo.html = texto
    if (eLista(tipo)) novo.itens = manter ? (atual.itens ?? [atual.html ?? '']) : ['']
    const c = [...blocos]; c[i] = novo
    if (tipo === 'separador') { const p = novoBloco('paragrafo'); c.splice(i + 1, 0, p); onChange(c); setFoco({ id: p.id }) }
    else { onChange(c); if (eTexto(tipo) || eLista(tipo)) setFoco({ id, item: eLista(tipo) ? 0 : undefined, fim: true }) }
  }

  const inserirApos = (id: string, tipo: TipoBloco) => {
    const i = indice(id), atual = blocos[i]!
    if (atual.tipo === 'paragrafo' && vazio(atual.html ?? '')) { converter(id, tipo, false); return }
    const novo = novoBloco(tipo)
    const c = [...blocos]; c.splice(i + 1, 0, novo)
    if (tipo === 'separador') { const p = novoBloco('paragrafo'); c.splice(i + 2, 0, p); onChange(c); setFoco({ id: p.id }) }
    else { onChange(c); if (eTexto(tipo) || eLista(tipo)) setFoco({ id: novo.id, item: eLista(tipo) ? 0 : undefined }) }
  }

  const mover = (id: string, d: -1 | 1) => {
    const i = indice(id), j = i + d
    if (j < 0 || j >= blocos.length) return
    const c = [...blocos];[c[i], c[j]] = [c[j]!, c[i]!]; onChange(c)
  }
  const duplicar = (id: string) => {
    const i = indice(id), copia: Bloco = { ...structuredClone(blocos[i]!), id: uid() }
    inserir(i + 1, copia, null)
  }
  const soltar = (alvo: string) => {
    if (!arrasto || arrasto === alvo) return
    const de = indice(arrasto), para = indice(alvo)
    const c = [...blocos]; const [x] = c.splice(de, 1); c.splice(para, 0, x!); onChange(c)
  }

  const apagarVazioTexto = (b: Bloco) => {
    if (b.tipo !== 'paragrafo') { converter(b.id, 'paragrafo', true); return }
    const i = indice(b.id)
    if (blocos.length === 1 || i === 0) return
    const ant = blocos[i - 1]!
    remover(b.id)
    if (eTexto(ant.tipo)) setFoco({ id: ant.id, fim: true })
    else if (eLista(ant.tipo)) setFoco({ id: ant.id, item: ant.itens!.length - 1, fim: true })
  }

  const aoDigitar = (b: Bloco, html: string) => {
    mudar(b.id, { html })
    const t = textoPlano(html)
    if (b.tipo === 'paragrafo' && t.startsWith('/') && !/\s/.test(t)) setSlash(s => ({ id: b.id, filtro: t.slice(1), sel: s?.id === b.id ? s.sel : 0 }))
    else setSlash(s => s?.id === b.id ? null : s)
  }

  const teclaSlash = (b: Bloco) => (e: KE) => {
    if (slash?.id !== b.id || !opcoesSlash.length) return false
    const n = opcoesSlash.length
    if (e.key === 'ArrowDown') { e.preventDefault(); setSlash({ ...slash, sel: (slash.sel + 1) % n }); return true }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSlash({ ...slash, sel: (slash.sel - 1 + n) % n }); return true }
    if (e.key === 'Enter') { e.preventDefault(); converter(b.id, opcoesSlash[Math.min(slash.sel, n - 1)]!.tipo, false); setSlash(null); return true }
    if (e.key === 'Escape') { e.preventDefault(); setSlash(null); return true }
    return false
  }

  /* itens de lista */
  const itensDe = (b: Bloco) => b.itens ?? ['']
  const aoDividirItem = (b: Bloco, i: number, antes: string, depois: string) => {
    const itens = itensDe(b)
    if (vazio(antes) && vazio(depois)) {
      // Enter em item vazio: sai da lista
      const resto = itens.filter((_, k) => k !== i)
      const p = novoBloco('paragrafo')
      const idx = indice(b.id), c = [...blocos]
      if (resto.length) { c[idx] = { ...b, itens: resto }; c.splice(idx + 1, 0, p) } else c.splice(idx, 1, p)
      onChange(c); setFoco({ id: p.id }); return
    }
    const novos = [...itens]; novos.splice(i, 1, antes, depois)
    mudar(b.id, { itens: novos }); setFoco({ id: b.id, item: i + 1 })
  }
  const aoApagarItem = (b: Bloco, i: number) => {
    const itens = itensDe(b)
    if (itens.length === 1) { converter(b.id, 'paragrafo', false); return }
    mudar(b.id, { itens: itens.filter((_, k) => k !== i) }); setFoco({ id: b.id, item: Math.max(0, i - 1), fim: true })
  }

  const ultimo = blocos[blocos.length - 1]
  const clicarFim = () => {
    if (ultimo && ultimo.tipo === 'paragrafo' && vazio(ultimo.html ?? '')) setFoco({ id: ultimo.id })
    else { const p = novoBloco('paragrafo'); onChange([...blocos, p]); setFoco({ id: p.id }) }
  }

  const corpo = (b: Bloco): ReactNode => {
    const f = foco?.id === b.id ? foco : null
    switch (b.tipo) {
      case 'paragrafo':
        return <Editavel html={b.html ?? ''} onChange={h => aoDigitar(b, h)} placeholder="Digite “/” para ver os blocos" className="bl-p" focar={f}
          onSplit={(a, d) => { mudar(b.id, { html: a }); const n = novoBloco('paragrafo'); n.html = d; inserir(indice(b.id) + 1, n) }} onApagarVazio={() => apagarVazioTexto(b)} onTecla={teclaSlash(b)} />
      case 'h1': case 'h2': case 'h3':
        return <Editavel html={b.html ?? ''} onChange={h => mudar(b.id, { html: h })} placeholder={`Título ${b.tipo[1]}`} className={`bl-${b.tipo}`} focar={f}
          onSplit={(a, d) => { mudar(b.id, { html: a }); const n = novoBloco('paragrafo'); n.html = d; inserir(indice(b.id) + 1, n) }} onApagarVazio={() => apagarVazioTexto(b)} />
      case 'citacao':
        return <Editavel html={b.html ?? ''} onChange={h => mudar(b.id, { html: h })} placeholder="Citação" className="bl-citacao" focar={f}
          onSplit={(a, d) => { mudar(b.id, { html: a }); const n = novoBloco('paragrafo'); n.html = d; inserir(indice(b.id) + 1, n) }} onApagarVazio={() => apagarVazioTexto(b)} />
      case 'lista': case 'numerada': {
        const L = b.tipo === 'lista' ? 'ul' : 'ol'
        return (
          <L className="bl-lista">
            {itensDe(b).map((it, i) => (
              <li key={i}>
                <Editavel html={it} onChange={h => mudar(b.id, { itens: itensDe(b).map((x, k) => k === i ? h : x) })} placeholder="Item da lista" focar={f && f.item === i ? f : null}
                  onSplit={(a, d) => aoDividirItem(b, i, a, d)} onApagarVazio={() => aoApagarItem(b, i)} />
              </li>
            ))}
          </L>
        )
      }
      case 'separador': return <hr className="bl-hr" />
      case 'imagem': return <BlocoImagem b={b} aoMudar={p => mudar(b.id, p)} aoTexto={h => mudar(b.id, { legenda: h })} focar={f} />
      case 'tabela': return <BlocoTabela b={b} aoMudar={p => mudar(b.id, p)} />
      case 'comparativo': return (
        <div className="bl-cmp">
          <EditorComparativo c={b.comparativo ?? comparativoVazio()} aoMudar={c => mudar(b.id, { comparativo: c })} />
          <Editavel html={b.legenda ?? ''} onChange={h => mudar(b.id, { legenda: h })} placeholder="Fontes e observações (opcional)" className="cmp-fonte" focar={f} />
        </div>
      )
      case 'link': return (
        <div className="bl-link-ed">
          <LinkSimple size={18} />
          <input className="campo" value={b.nome ?? ''} onChange={e => mudar(b.id, { nome: e.target.value })} placeholder="Título do link" aria-label="Título do link" />
          <input className="campo" value={b.url ?? ''} onChange={e => mudar(b.id, { url: e.target.value })} onBlur={e => { if (e.target.value) mudar(b.id, { url: normalizarUrl(e.target.value) }) }} placeholder="https://…" aria-label="Endereço do link" />
        </div>
      )
      case 'arquivo': return b.arquivoId
        ? <AnexoDeBloco b={b} />
        : <Carregador rotulo="Anexar arquivo" icone={Paperclip} aoEscolher={async f => {
          if (f.size > 25 * 1024 * 1024) throw new Error('O arquivo passa de 25 MB.')
          mudar(b.id, { arquivoId: await guardarArquivoDeBloco(f), nome: f.name, tamanho: f.size })
        }} />
    }
  }

  return (
    <div className="bl-editor">
      <BarraFormatacao />
      {blocos.map((b, i) => (
        <div key={b.id} className={`bl ${arrasto === b.id ? 'arrastando' : ''} ${sobre === b.id && arrasto !== b.id ? 'alvo' : ''}`}
          onDragOver={e => { if (arrasto) { e.preventDefault(); setSobre(b.id) } }} onDrop={e => { e.preventDefault(); soltar(b.id); setArrasto(null); setSobre(null) }}>
          <div className="bl-ctl">
            <button type="button" className="bl-ic" title="Inserir bloco abaixo" aria-label="Inserir bloco abaixo" onClick={() => { setMais(m => m === b.id ? null : b.id); setAcoes(null) }}><Plus size={14} weight="bold" /></button>
            <button type="button" className="bl-ic" title="Arraste para mover · clique para opções" aria-label="Opções do bloco" draggable
              onDragStart={e => { setArrasto(b.id); e.dataTransfer.effectAllowed = 'move'; const row = e.currentTarget.closest('.bl'); if (row) e.dataTransfer.setDragImage(row, 0, 0) }}
              onDragEnd={() => { setArrasto(null); setSobre(null) }}
              onClick={() => { setAcoes(a => a === b.id ? null : b.id); setMais(null) }}><DotsSixVertical size={14} weight="bold" /></button>
          </div>
          <div className="bl-corpo">{corpo(b)}</div>

          {slash?.id === b.id && <MenuTipos opcoes={opcoesSlash} sel={Math.min(slash.sel, Math.max(0, opcoesSlash.length - 1))} aoEscolher={t => { converter(b.id, t, false); setSlash(null) }} fechar={() => setSlash(null)} />}
          {mais === b.id && <MenuTipos opcoes={OPCOES} titulo="Inserir bloco" aoEscolher={t => { inserirApos(b.id, t); setMais(null) }} fechar={() => setMais(null)} />}
          {acoes === b.id && (<>
            <div className="bl-menu-fundo" onMouseDown={() => setAcoes(null)} />
            <div className="bl-menu estreito" role="menu">
              {(eTexto(b.tipo) || eLista(b.tipo)) && (<>
                <div className="bl-menu-tit">Transformar em</div>
                {OPCOES.filter(o => (eTexto(o.tipo) || eLista(o.tipo)) && o.tipo !== b.tipo).map(o => (
                  <button type="button" key={o.tipo} onClick={() => { converter(b.id, o.tipo, true); setAcoes(null) }}><span className="ic"><o.icone size={16} /></span><span><b>{o.rotulo}</b></span></button>
                ))}
                <div className="bl-menu-sep" />
              </>)}
              <button type="button" disabled={i === 0} onClick={() => { mover(b.id, -1); setAcoes(null) }}><span className="ic"><ArrowUp size={16} /></span><span><b>Mover para cima</b></span></button>
              <button type="button" disabled={i === blocos.length - 1} onClick={() => { mover(b.id, 1); setAcoes(null) }}><span className="ic"><ArrowDown size={16} /></span><span><b>Mover para baixo</b></span></button>
              <button type="button" onClick={() => { duplicar(b.id); setAcoes(null) }}><span className="ic"><Copy size={16} /></span><span><b>Duplicar</b></span></button>
              <div className="bl-menu-sep" />
              <button type="button" className="perigo" onClick={() => { remover(b.id); setAcoes(null) }}><span className="ic"><Trash size={16} /></span><span><b>Excluir bloco</b></span></button>
            </div>
          </>)}
        </div>
      ))}
      <div className="bl-fim" onClick={clicarFim} aria-hidden />
    </div>
  )
}
