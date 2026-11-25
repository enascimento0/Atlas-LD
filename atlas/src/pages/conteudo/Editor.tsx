import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarBlank, CheckCircle, ClockCounterClockwise, Eye, FloppyDisk, LockKey, Package, Paperclip, PencilSimpleLine, RocketLaunch, Tag, Trash, UploadSimple } from '@phosphor-icons/react'
import { CampoCategoria } from '../../components/conteudo/CampoCategoria'
import { EditorBlocos } from '../../components/conteudo/EditorBlocos'
import { ArquivosDoCorpo, LeitorBlocos } from '../../components/conteudo/LeitorBlocos'
import { Avatar, BadgeStatus, iconeDeArquivo } from '../../components/conteudo/Pecas'
import { enviarDocumentos, PainelDocumentos } from '../../components/conteudo/PainelDocumentos'
import { Confirmar } from '../../components/ui/Dialogos'
import { Cabecalho } from '../../components/ui/Doc'
import { criarPagina, listarPaginas, obterPagina, obterPaginaPorId, publicar, salvarPagina, useDadosAtlas } from '../../lib/api'
import { areaPorId, PRODUTOS } from '../../lib/areas'
import { useUsuario } from '../../lib/auth'
import { dataCurta, dataHora, tamanhoLegivel, uid } from '../../lib/formatar'
import { podeCriar, podeEditar, podePublicar, podePublicarEm } from '../../lib/permissoes'
import { usePreferencias } from '../../lib/preferencias'
import type { Area, Bloco, Pagina } from '../../lib/tipos'

const paragrafoVazio = (): Bloco => ({ id: uid(), tipo: 'paragrafo', html: '' })

function SemAcesso({ area, texto }: { area: Area; texto: string }) {
  const info = areaPorId(area)
  return (
    <div className="pagina">
      <Cabecalho trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: info.rotulo, rota: info.rota }, { rotulo: 'Editor' }]} titulo="Acesso restrito" />
      <div className="vazio-rico">
        <div className="circ"><LockKey size={20} /></div>
        <b style={{ fontSize: 15 }}>{texto}</b>
        <p>Peça ao time de Produtos para liberar a sua permissão nesta área.</p>
        <Link to={info.rota} className="btn btn-primary" style={{ marginTop: 8 }}><ArrowRight size={16} />Voltar para {info.rotulo}</Link>
      </div>
    </div>
  )
}

export default function Editor({ area }: { area: Area }) {
  const { slug } = useParams()
  const u = useUsuario()
  useDadosAtlas()
  const existente = slug ? obterPagina(area, slug) : undefined

  if (slug && !existente) return <SemAcesso area={area} texto="Página não encontrada ou sem acesso" />
  if (existente ? !podeEditar(u, existente) : !podeCriar(u, area)) return <SemAcesso area={area} texto="Você não tem permissão para editar este conteúdo" />
  return <EditorForm key={existente?.id ?? 'novo'} area={area} existente={existente} />
}

function EditorForm({ area, existente }: { area: Area; existente?: Pagina }) {
  const info = areaPorId(area)
  const u = useUsuario()!
  const nav = useNavigate()
  const { avisar } = usePreferencias()

  const [titulo, setTitulo] = useState(existente?.titulo ?? '')
  const [descricao, setDescricao] = useState(existente?.descricao ?? '')
  const [categoria, setCategoria] = useState(existente?.categoria ?? '')
  const [produto, setProduto] = useState(existente?.produto ?? (useLocation().state as { produto?: string } | null)?.produto ?? '')
  const [anexos, setAnexos] = useState<File[]>([])
  const entradaAnexo = useRef<HTMLInputElement>(null)
  const adicionarAnexos = (l: FileList | null) => { if (l) { setAnexos(a => [...a, ...[...l].filter(n => !a.some(x => x.name === n.name && x.size === n.size))]); setSujo(true); setSalvo(false) } }
  const [blocos, setBlocos] = useState<Bloco[]>(existente?.blocos.length ? existente.blocos : [paragrafoVazio()])
  const [relacionadas, setRelacionadas] = useState<string[]>(existente?.relacionadas ?? [])
  const [previa, setPrevia] = useState(false)
  const [sujo, setSujo] = useState(false)
  const loc = useLocation()
  const [salvo, setSalvo] = useState(() => (loc.state as { salvo?: boolean } | null)?.salvo === true)
  const [erro, setErro] = useState('')
  const [saindo, setSaindo] = useState(false)

  const marcar = <T,>(set: (v: T) => void) => (v: T) => { set(v); setSujo(true); setSalvo(false); setErro('') }
  const publicada = existente?.status === 'publicado'
  const jaSalvo = !sujo && (!!existente || salvo)
  const publica = existente ? podePublicar(u, existente) : podePublicarEm(u, area)
  const outras = listarPaginas(area).filter(p => p.id !== existente?.id)

  useEffect(() => {
    if (!sujo) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    addEventListener('beforeunload', h); return () => removeEventListener('beforeunload', h)
  }, [sujo])

  const salvar = async (e: { publicarDepois?: boolean }) => {
    try {
      const dados = { titulo, descricao, categoria, produto, blocos, relacionadas }
      const p = existente ? salvarPagina(existente.id, dados) : criarPagina(area, dados)
      if (!existente && anexos.length) {
        const r = await enviarDocumentos(p.id, anexos)
        if (r.falhas.length) avisar(r.falhas.join(' '))
      }
      if (e.publicarDepois) publicar(p.id)
      setSujo(false)
      setSalvo(true)
      avisar(e.publicarDepois ? 'Página publicada.' : publicada ? 'Alterações salvas.' : 'Rascunho salvo.')
      if (e.publicarDepois) nav(`${info.rota}/${p.slug}`)
      else nav(`${info.rota}/${p.slug}/editar`, { replace: true, state: { salvo: true } })
    } catch (x) { setErro((x as Error).message) }
  }
  const cancelar = () => nav(existente ? `${info.rota}/${existente.slug}` : info.rota)

  return (
    <div className="pagina">
      <Cabecalho
        trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: info.rotulo, rota: info.rota }, ...(existente ? [{ rotulo: existente.titulo, rota: `${info.rota}/${existente.slug}` }] : []), { rotulo: existente ? 'Editar' : 'Novo conteúdo' }]}
        titulo={existente ? 'Editar página' : `Novo ${info.singular}`}
        acoes={
          <div className="pg-acoes">
            {sujo && <span className="note" style={{ margin: 0 }}>Alterações não salvas</span>}
            <button className={`btn btn-outline ${previa ? 'ativo' : ''}`} onClick={() => setPrevia(p => !p)} aria-pressed={previa}>{previa ? <PencilSimpleLine size={16} /> : <Eye size={16} />}{previa ? 'Voltar a editar' : 'Pré-visualizar'}</button>
            <button className="btn btn-outline" onClick={() => sujo ? setSaindo(true) : cancelar()}>{jaSalvo ? <><ArrowLeft size={16} />Voltar</> : 'Cancelar'}</button>
            {publicada
              ? <button className="btn btn-primary" disabled={jaSalvo} onClick={() => salvar({})}>{jaSalvo ? <><CheckCircle size={16} weight="fill" />Salvo</> : <><FloppyDisk size={16} />Salvar alterações</>}</button>
              : (<>
                <button className="btn btn-outline" disabled={jaSalvo} onClick={() => salvar({})}>{jaSalvo ? <><CheckCircle size={16} weight="fill" />Rascunho salvo</> : <><FloppyDisk size={16} />Salvar rascunho</>}</button>
                {publica && <button className="btn btn-primary" onClick={() => salvar({ publicarDepois: true })}><RocketLaunch size={16} />Publicar</button>}
              </>)}
          </div>
        }
      />
      {erro && <div className="aviso" role="alert" style={{ marginBottom: 12 }}>{erro}</div>}
      {!publica && !publicada && <div className="aviso" style={{ marginBottom: 12 }}><LockKey size={16} weight="fill" /><span>Você pode criar e salvar rascunhos. Para publicar, peça autorização ao time de Produtos.</span></div>}

      <div className="ed-cols">
        <div className="ed-principal">
          {previa ? (
            <div className="ed-previa">
              <div className="aviso" style={{ marginBottom: 16 }}><Eye size={16} />Pré-visualização: é assim que os leitores verão a página.</div>
              <div className="pg-centro">
                <article className="pg-artigo">
                  <h2 className="pg-titulo">{titulo || 'Sem título'}</h2>
                  <div className="pg-meta">
                    <div className="pg-meta-l1">
                      <span className="pg-meta-i autor"><Avatar nome={existente?.autorNome ?? u.nome} tam={26} /><b>{existente?.autorNome ?? u.nome}</b></span>
                      <span className="pg-meta-i"><CalendarBlank size={14} />Criada em {existente ? dataCurta(existente.criadoEm) : 'Ao salvar'}</span>
                      <span className="pg-meta-fim">
                        <BadgeStatus status={existente?.status ?? 'rascunho'} />
                        {produto && <span className="pill ac"><Package size={11} />{produto}</span>}
                        {categoria && <span className="pill ac"><Tag size={11} />{categoria}</span>}
                        {existente && <span className="pg-meta-i mono">{existente.codigo}</span>}
                      </span>
                    </div>
                    {existente && <div className="pg-meta-l2"><ClockCounterClockwise size={14} />Atualizada em {dataHora(existente.atualizadoEm)} por <Avatar nome={existente.atualizadoPorNome} tam={18} /><b>{existente.atualizadoPorNome}</b></div>}
                  </div>
                  {descricao && <p className="pg-desc">{descricao}</p>}
                  {blocos.some(b => b.tipo !== 'paragrafo' || b.html) ? <LeitorBlocos blocos={blocos} /> : (
                    <div className="vazio-rico" style={{ marginTop: 16 }}>
                      <div className="circ"><PencilSimpleLine size={20} /></div>
                      <b style={{ fontSize: 15 }}>Esta página ainda não tem conteúdo</b>
                    </div>
                  )}
                  <section className="pg-secao">
                    <h3 className="h3"><Paperclip size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Documentos e materiais{(existente ? existente.documentos.length : anexos.length) > 0 && <span className="pill" style={{ marginLeft: 8 }}>{existente ? existente.documentos.length : anexos.length}</span>}</h3>
                    {existente ? <PainelDocumentos pagina={existente} editavel={false} /> : (
                      anexos.length === 0 ? null : <ul className="docs-lista">{anexos.map((a, i) => { const I = iconeDeArquivo(a.name, a.type); return (
                        <li key={a.name + i}><span className="ic"><I size={20} /></span><div className="info"><b>{a.name}</b><small>{tamanhoLegivel(a.size)}</small></div></li>
                      ) })}</ul>
                    )}
                  </section>
                  {(() => {
                    const rels = [
                      ...relacionadas.map(obterPaginaPorId).filter((x): x is Pagina => !!x),
                    ]
                    const sug = outras.filter(x => x.status === 'publicado' && x.categoria === categoria && !rels.some(r => r.id === x.id))
                    const todas = [...rels, ...sug].slice(0, 4)
                    return todas.length > 0 && (
                      <section className="pg-secao">
                        <h3 className="h3">Páginas relacionadas</h3>
                        <div className="atalhos">
                          {todas.map(r => { const ar = areaPorId(r.area); return (
                            <span key={r.id} className="atalho"><span className="ic"><ar.icone size={18} /></span><div><b>{r.titulo}</b><span>{ar.rotulo}{r.categoria ? ` · ${r.categoria}` : ''}</span></div><ArrowRight size={15} className="seta" /></span>
                          ) })}
                        </div>
                      </section>
                    )
                  })()}
                </article>
              </div>
            </div>
          ) : (<>
            <input className="ed-titulo" value={titulo} onChange={e => marcar(setTitulo)(e.target.value)} placeholder="Título da página" aria-label="Título" maxLength={120} autoFocus={!existente} />
            <input className="ed-desc" value={descricao} onChange={e => marcar(setDescricao)(e.target.value)} placeholder="Adicione uma descrição curta" aria-label="Descrição" maxLength={240} />
            <EditorBlocos blocos={blocos} onChange={marcar(setBlocos)} />
          </>)}
        </div>

        <aside className="ed-lado">
          <div className="card">
            <h3 className="h3" style={{ marginTop: 0 }}>Propriedades</h3>
            {info.filtro === 'produto' && (
              <label className="campo-wrap" style={{ minWidth: 0 }}><span className="campo-lbl">Produto</span>
                <select className="campo" value={produto} onChange={e => marcar(setProduto)(e.target.value)}>
                  <option value="">Sem produto específico</option>
                  {PRODUTOS.map(x => <option key={x} value={x}>{x}</option>)}
                </select></label>
            )}
            <label className="campo-wrap" style={{ minWidth: 0 }}><span className="campo-lbl">Categoria</span>
              <CampoCategoria area={area} valor={categoria} onChange={marcar(setCategoria)} /></label>
            <dl className="props">
              <dt>Status</dt><dd><BadgeStatus status={existente?.status ?? 'rascunho'} /></dd>
              <dt>Responsável</dt><dd><Avatar nome={existente?.autorNome ?? u.nome} />{existente?.autorNome ?? u.nome}</dd>
              <dt>Criada em</dt><dd>{existente ? dataCurta(existente.criadoEm) : 'Ao salvar'}</dd>
              {existente && <><dt>Atualizada</dt><dd>{dataHora(existente.atualizadoEm)}</dd><dt>Código</dt><dd className="mono">{existente.codigo}</dd></>}
            </dl>
          </div>

          {blocos.some(b => b.tipo === 'arquivo' && b.arquivoId) && (
            <div className="card">
              <h3 className="h3" style={{ marginTop: 0 }}>Arquivos no corpo do artigo</h3>
              <ArquivosDoCorpo blocos={blocos} />
              <p className="note" style={{ marginBottom: 0 }}>Aparecem dentro do texto, com prévia. Para remover, apague o bloco no artigo.</p>
            </div>
          )}

          <div className="card">
            <h3 className="h3" style={{ marginTop: 0 }}>Documentos e materiais</h3>
            <p className="note" style={{ marginTop: 0 }}>Ficam no final da página, para download.</p>
            {existente
              ? <PainelDocumentos pagina={existente} editavel aoAlterar={() => { setSujo(true); setSalvo(false) }} />
              : (<>
                <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); adicionarAnexos(e.dataTransfer.files) }}>
                  <UploadSimple size={20} /><span>Arraste documentos aqui ou</span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => entradaAnexo.current?.click()}>Selecionar arquivos</button>
                  <input ref={entradaAnexo} type="file" multiple hidden onChange={e => { adicionarAnexos(e.target.files); e.target.value = '' }} />
                </div>
                {anexos.length > 0 && (
                  <ul className="docs-lista" style={{ marginTop: 12 }}>
                    {anexos.map((a, i) => { const I = iconeDeArquivo(a.name, a.type); return (
                      <li key={a.name + i}><span className="ic"><I size={18} /></span><div className="info"><b title={a.name}>{a.name}</b><small>{tamanhoLegivel(a.size)}</small></div>
                        <div className="acoes"><button type="button" className="icb perigo" aria-label={`Remover ${a.name}`} onClick={() => setAnexos(l => l.filter((_, k) => k !== i))}><Trash size={15} /></button></div></li>
                    ) })}
                  </ul>
                )}
                <p className="note" style={{ marginBottom: 0 }}>Os documentos são enviados ao salvar.</p>
              </>)}
          </div>

          {outras.length > 0 && (
            <div className="card">
              <h3 className="h3" style={{ marginTop: 0 }}>Páginas relacionadas</h3>
              <div className="rel-lista">
                {outras.map(p => (
                  <label key={p.id} className="chk"><input type="checkbox" checked={relacionadas.includes(p.id)} onChange={e => marcar(setRelacionadas)(e.target.checked ? [...relacionadas, p.id] : relacionadas.filter(x => x !== p.id))} /><span>{p.titulo}</span></label>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {saindo && <Confirmar titulo="Descartar alterações?" texto="Há alterações que ainda não foram salvas. Se sair agora, elas serão perdidas." rotuloConfirmar="Descartar e sair" aoConfirmar={() => { setSujo(false); cancelar() }} fechar={() => setSaindo(false)} />}
    </div>
  )
}
