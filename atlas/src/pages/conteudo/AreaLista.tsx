import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  MagnifyingGlass, PencilSimpleLine, Plus, UploadSimple, X, Lock, Rows, SquaresFour,
  ClockCounterClockwise,
} from '@phosphor-icons/react'
import { Avatar, BadgeStatus } from '../../components/conteudo/Pecas'
import { Cabecalho } from '../../components/ui/Doc'
import { listarPaginas, useDadosAtlas } from '../../lib/api'
import { areaPorId, PRODUTOS } from '../../lib/areas'
import { useUsuario } from '../../lib/auth'
import { dataHora, eRecente, relativo } from '../../lib/formatar'
import { normalizarSemAcento } from '../../lib/busca'
import { podeCriar } from '../../lib/permissoes'
import type { Area } from '../../lib/tipos'

type FiltroStatus = 'todos' | 'publicado' | 'rascunho'
type Modo = 'lista' | 'grade'
const CHAVE_MODO = 'atlas.modo-lista'
const modoSalvo = (): Modo => { try { return localStorage.getItem(CHAVE_MODO) === 'grade' ? 'grade' : 'lista' } catch { return 'lista' } }

export default function AreaLista({ area }: { area: Area }) {
  const info = areaPorId(area)
  const u = useUsuario()
  useDadosAtlas()
  const todas = listarPaginas(area)
  const pode = podeCriar(u, area)

  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  /* Produto escolhido fica na URL (?produto=…): o Voltar do artigo e o do navegador retornam a esta lista */
  const [params, setParams] = useSearchParams()
  const produto = params.get('produto') ?? ''
  const setProduto = (x: string) => setParams(x ? { produto: x } : {})
  const [modo, setModoEstado] = useState<Modo>(modoSalvo)
  const setModo = (m: Modo) => { setModoEstado(m); try { localStorage.setItem(CHAVE_MODO, m) } catch { /* sem armazenamento */ } }
  const porProduto = info.filtro === 'produto'
  const [status, setStatus] = useState<FiltroStatus>('todos')
  const [ordem, setOrdem] = useState<'recentes' | 'titulo'>('recentes')
  const nav = useNavigate()

  const categorias = useMemo(() => {
    const c = new Map<string, number>()
    todas.filter(p => p.produto === produto).forEach(p => { if (p.categoria) c.set(p.categoria, (c.get(p.categoria) ?? 0) + 1) })
    return [...c.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [todas, produto])
  const produtos = useMemo(() => {
    const c = new Map<string, number>(PRODUTOS.map(x => [x, 0]))
    todas.forEach(p => { if (p.produto) c.set(p.produto, (c.get(p.produto) ?? 0) + 1) })
    return [...c.entries()]
  }, [todas])
  /* última alteração de cada produto (data/hora e pessoa) */
  const ultima = useMemo(() => {
    const m = new Map<string, { em: string; por: string }>()
    todas.forEach(p => { if (p.produto && (!m.has(p.produto) || p.atualizadoEm > m.get(p.produto)!.em)) m.set(p.produto, { em: p.atualizadoEm, por: p.atualizadoPorNome }) })
    return m
  }, [todas])
  const escolherProduto = (x: string) => { setProduto(produto === x ? '' : x); setCat('') }
  /* categorias só existem dentro de um produto, e só em Produtos */
  const comCategorias = porProduto && !!produto && categorias.length > 0
  /* em Produtos, a tela inicial mostra só os produtos; os artigos aparecem ao escolher um (ou ao buscar) */
  const mostrarProdutos = porProduto && !produto

  const contagem = { todos: todas.length, publicado: todas.filter(p => p.status === 'publicado').length, rascunho: todas.filter(p => p.status === 'rascunho').length }
  const lista = todas
    .filter(p => (status === 'todos' || p.status === status) && (!produto || p.produto === produto) && (!cat || p.categoria === cat)
      && (!q.trim() || normalizarSemAcento(`${p.titulo} ${p.descricao} ${p.categoria} ${p.codigo} ${p.autorNome}`).includes(normalizarSemAcento(q.trim()))))
    .sort((a, b) => ordem === 'titulo' ? a.titulo.localeCompare(b.titulo) : b.atualizadoEm.localeCompare(a.atualizadoEm))
  const filtrando = !!(q || cat || produto || status !== 'todos')
  const limpar = () => { setQ(''); setCat(''); setProduto(''); setStatus('todos') }

  return (
    <div className="pagina">
      <Cabecalho
        trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: info.rotulo }, ...(porProduto && produto ? [{ rotulo: produto }] : [])]}
        titulo={porProduto && produto ? produto : info.rotulo}
        voltar={porProduto && produto ? { rotulo: `Voltar para ${info.rotulo}`, aoClicar: () => { setProduto(''); setCat('') } } : undefined}
        acoes={pode && (
          <button className="btn btn-primary" onClick={() => nav(`${info.rota}/novo`, { state: produto ? { produto } : undefined })}><Plus size={16} weight="bold" />Novo conteúdo</button>
        )}
      />
      <p className="note" style={{ margin: '-6px 0 16px', fontSize: 13 }}>{info.descricao}.</p>

      {todas.length === 0 ? (
        <div className="vazio-rico">
          <div className="circ"><info.icone size={20} /></div>
          <b style={{ fontSize: 15 }}>{pode ? `Nenhum ${info.singular} cadastrado ainda` : `Ainda não há conteúdo em ${info.rotulo}`}</b>
          <p>{pode ? info.vazio : 'O time de Produtos está preparando este conteúdo. Volte em breve.'}</p>
          {pode && (
            <ul className="plano">
              <li><PencilSimpleLine size={14} />Use <b>Novo conteúdo</b> para escrever uma página com blocos</li>
              <li><UploadSimple size={14} />Dentro do editor você também pode anexar documentos à página</li>
              <li><Lock size={14} />Tudo começa como rascunho; só aparece para os leitores depois de publicado</li>
            </ul>
          )}
        </div>
      ) : (<>
        {!mostrarProdutos && (<>
        <div className="abas" role="tablist" style={{ marginBottom: 12 }}>
          {pode ? (['todos', 'publicado', 'rascunho'] as const).map(s => (
            <button key={s} role="tab" aria-selected={status === s} className={`aba ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
              {s === 'todos' ? 'Todos' : s === 'publicado' ? 'Publicados' : 'Rascunhos'}<span className="cont">{contagem[s]}</span>
            </button>
          )) : <span className="aba active" style={{ cursor: 'default' }}>Publicados<span className="cont">{contagem.publicado}</span></span>}
        </div>

        <div className="toolbar" style={{ marginBottom: 16, flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
          {comCategorias && (
            <div className="cat-filtros sub" style={{ margin: 0, flex: '1 1 360px' }} role="group" aria-label={`Categorias de ${produto}`}>
              <button className={`chip compacto ${!cat ? 'on' : ''}`} onClick={() => setCat('')}>Tudo de {produto}</button>
              {categorias.map(([c, n]) => <button key={c} className={`chip compacto ${cat === c ? 'on' : ''}`} onClick={() => setCat(cat === c ? '' : c)}>{c}<span style={{ opacity: .7 }}>{n}</span></button>)}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginLeft: 'auto' }}>
            <label className="ordenar"><span>Ordenar por</span>
              <select className="campo" value={ordem} onChange={e => setOrdem(e.target.value as 'recentes' | 'titulo')}>
                <option value="recentes">Mais recentes</option><option value="titulo">Título (A–Z)</option>
              </select>
            </label>
            <div className="seg" role="group" aria-label="Modo de visualização">
              <button type="button" className={modo === 'lista' ? 'on' : ''} onClick={() => setModo('lista')} aria-pressed={modo === 'lista'} title="Lista"><Rows size={14} />Lista</button>
              <button type="button" className={modo === 'grade' ? 'on' : ''} onClick={() => setModo('grade')} aria-pressed={modo === 'grade'} title="Cartões"><SquaresFour size={14} />Cartões</button>
            </div>
          </div>
        </div>
        </>)}

        {mostrarProdutos ? (
          <div className="produtos-grade" role="list" aria-label={info.rotulo}>
            {produtos.map(([x, n]) => (
              <button key={x} type="button" className="card-produto" role="listitem" onClick={() => escolherProduto(x)}>
                <div className="topo">
                  <span className="ic"><info.icone size={22} weight="fill" /></span>
                  <span className="qtd"><b>{n}</b> {n === 1 ? 'publicação' : 'publicações'}</span>
                </div>
                <b className="nome">{x}</b>
                <div className="rodape">
                  {ultima.has(x)
                    ? <><Avatar nome={ultima.get(x)!.por} tam={28} /><span className="quem"><b>{ultima.get(x)!.por}</b><small>Atualizado em {dataHora(ultima.get(x)!.em)}</small></span></>
                    : <span className="sem"><ClockCounterClockwise size={14} />Sem alterações ainda</span>}
                </div>
              </button>
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="vazio-rico">
            <div className="circ"><MagnifyingGlass size={20} /></div>
            <b style={{ fontSize: 15 }}>Nada encontrado</b>
            <p>Nenhuma página corresponde aos filtros{q ? <> para “{q}”</> : ''}. Tente outros termos ou limpe os filtros.</p>
            {filtrando && <button className="btn btn-outline btn-sm" onClick={limpar}><X size={14} />Limpar filtros</button>}
          </div>
        ) : (
          <div className={`pg-lista ${modo}`} role="list">
            {lista.map(p => (
              <Link key={p.id} to={`${info.rota}/${p.slug}`} className="pg-linha" role="listitem">
                <span className="ic"><info.icone size={18} /></span>
                <div className="tx">
                  <div className="tit"><b>{p.titulo}</b>
                    {p.status === 'rascunho' && <BadgeStatus status="rascunho" />}
                    {p.status === 'publicado' && eRecente(p.atualizadoEm) && <span className="badge" style={{ background: 'var(--c-info-bg)', color: 'var(--c-info-txt)' }}>ATUALIZADO</span>}
                  </div>
                  {p.descricao && <span className="desc">{p.descricao}</span>}
                </div>
                <div className="tags">{p.produto && <span className="pill ac">{p.produto}</span>}{p.categoria && <span className="pill">{p.categoria}</span>}</div>
                <div className="aut"><Avatar nome={p.autorNome} /><div><span>{p.autorNome}</span><small>{relativo(p.atualizadoEm)}</small></div></div>
              </Link>
            ))}
          </div>
        )}
      </>)}

    </div>
  )
}
