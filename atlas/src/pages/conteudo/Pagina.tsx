import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowRight, CalendarBlank, EyeSlash, FileX, Info, PencilSimpleLine, RocketLaunch, Tag, Trash, User, ClockCounterClockwise, Paperclip, Package,
} from '@phosphor-icons/react'
import { LeitorBlocos } from '../../components/conteudo/LeitorBlocos'
import { Avatar, BadgeStatus } from '../../components/conteudo/Pecas'
import { PainelDocumentos } from '../../components/conteudo/PainelDocumentos'
import { Confirmar } from '../../components/ui/Dialogos'
import { Cabecalho } from '../../components/ui/Doc'
import { despublicar, excluir, listarHistorico, listarPaginas, obterPagina, obterPaginaPorId, publicar, useDadosAtlas } from '../../lib/api'
import { areaPorId } from '../../lib/areas'
import { useUsuario } from '../../lib/auth'
import { dataCurta, dataHora, ROTULO_ACAO } from '../../lib/formatar'
import { podeEditar, podeExcluir, podePublicar, podeVerHistorico } from '../../lib/permissoes'
import { usePreferencias } from '../../lib/preferencias'
import type { Area, Pagina as PaginaT } from '../../lib/tipos'

export default function Pagina({ area }: { area: Area }) {
  const { slug = '' } = useParams()
  const info = areaPorId(area)
  const u = useUsuario()
  useDadosAtlas()
  const nav = useNavigate()
  const { avisar } = usePreferencias()
  const [excluindo, setExcluindo] = useState(false)
  const [erro, setErro] = useState('')

  const p = obterPagina(area, slug)
  if (!p) return (
    <div className="pagina">
      <Cabecalho trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: info.rotulo, rota: info.rota }, { rotulo: 'Página' }]} titulo="Página não encontrada" />
      <div className="vazio-rico">
        <div className="circ"><FileX size={20} /></div>
        <b style={{ fontSize: 15 }}>Não encontramos esta página</b>
        <p>Ela pode ter sido removida, despublicada ou o endereço pode estar incorreto.</p>
        <Link to={info.rota} className="btn btn-primary" style={{ marginTop: 8 }}><ArrowRight size={16} />Ir para {info.rotulo}</Link>
      </div>
    </div>
  )

  const editar = podeEditar(u, p), publica = podePublicar(u, p), exclui = podeExcluir(u, p)
  const acao = (fn: () => void, ok: string) => { try { fn(); setErro(''); avisar(ok) } catch (e) { setErro((e as Error).message) } }
  /* Volta para a seção de onde o artigo veio (ex.: a lista do produto), não para o início da área */
  const voltarPara = info.filtro === 'produto' && p.produto
    ? { rotulo: p.produto, rota: `${info.rota}?produto=${encodeURIComponent(p.produto)}` }
    : { rotulo: info.rotulo, rota: info.rota }

  const relacionadas = (() => {
    const explicitas = p.relacionadas.map(obterPaginaPorId).filter((x): x is PaginaT => !!x)
    const sugeridas = listarPaginas(area).filter(x => x.id !== p.id && x.status === 'publicado' && x.categoria === p.categoria && !explicitas.some(e => e.id === x.id))
    return [...explicitas, ...sugeridas].slice(0, 4)
  })()

  return (
    <div className="pagina">
      <Cabecalho
        trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: info.rotulo, rota: info.rota }, ...(voltarPara.rota !== info.rota ? [voltarPara] : []), { rotulo: p.titulo }]}
        titulo={p.titulo}
        voltar={{ rotulo: `Voltar para ${voltarPara.rotulo}`, aoClicar: () => nav(voltarPara.rota) }}
        acoes={(
          <div className="pg-acoes">
            {exclui && <button className="btn btn-text-danger" onClick={() => setExcluindo(true)}><Trash size={16} />Excluir</button>}
            {publica && p.status === 'publicado' && <button className="btn btn-outline" onClick={() => acao(() => despublicar(p.id), 'Página despublicada.')}><EyeSlash size={16} />Despublicar</button>}
            {editar && <Link to={`${info.rota}/${p.slug}/editar`} className="btn btn-outline"><PencilSimpleLine size={16} />Editar</Link>}
            {publica && p.status === 'rascunho' && <button className="btn btn-primary" onClick={() => acao(() => publicar(p.id), 'Página publicada.')}><RocketLaunch size={16} />Publicar</button>}
          </div>
        )}
      />

      {erro && <div className="aviso" role="alert" style={{ marginBottom: 12 }}>{erro}</div>}
      {p.status === 'rascunho' && (
        <div className="aviso" style={{ marginBottom: 12 }}><Info size={16} weight="fill" />
          <span>Esta página é um <b>rascunho</b> e só aparece para você e para os administradores.{!publica && ' Para publicar, peça autorização ao time de Produtos.'}</span>
        </div>
      )}

      <div className="pg-centro">
        <article className={`pg-artigo ${p.blocos.some(b => b.tipo === 'comparativo') ? 'largo' : ''}`}>
          <h2 className="pg-titulo">{p.titulo}</h2>
          <div className="pg-meta">
            <div className="pg-meta-l1">
              <span className="pg-meta-i autor"><Avatar nome={p.autorNome} tam={26} /><b>{p.autorNome}</b></span>
              <span className="pg-meta-i" title={dataHora(p.criadoEm)}><CalendarBlank size={14} />Criada em {dataCurta(p.criadoEm)}</span>
              <span className="pg-meta-fim">
                <BadgeStatus status={p.status} />
                {p.produto && <span className="pill ac"><Package size={11} />{p.produto}</span>}
                {p.categoria && <span className="pill ac"><Tag size={11} />{p.categoria}</span>}
                <span className="pg-meta-i mono">{p.codigo}</span>
              </span>
            </div>
            <div className="pg-meta-l2" title={dataHora(p.atualizadoEm)}><ClockCounterClockwise size={14} />Atualizada em {dataHora(p.atualizadoEm)} por <Avatar nome={p.atualizadoPorNome} tam={18} /><b>{p.atualizadoPorNome}</b></div>
          </div>
          {p.descricao && <p className="pg-desc">{p.descricao}</p>}

          {p.blocos.some(b => b.tipo !== 'paragrafo' || b.html) ? <LeitorBlocos blocos={p.blocos} /> : (
            <div className="vazio-rico" style={{ marginTop: 16 }}>
              <div className="circ"><PencilSimpleLine size={20} /></div>
              <b style={{ fontSize: 15 }}>Esta página ainda não tem conteúdo</b>
              <p>{editar ? 'Use o botão Editar para escrever o conteúdo.' : p.documentos.length ? 'Consulte os documentos abaixo.' : 'O conteúdo será adicionado em breve.'}</p>
            </div>
          )}

          <section className="pg-secao" id="documentos">
            <h3 className="h3"><Paperclip size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Documentos e materiais{p.documentos.length > 0 && <span className="pill" style={{ marginLeft: 8 }}>{p.documentos.length}</span>}</h3>
            <PainelDocumentos pagina={p} editavel={editar} />
          </section>

          {relacionadas.length > 0 && (
            <section className="pg-secao">
              <h3 className="h3">Páginas relacionadas</h3>
              <div className="atalhos">
                {relacionadas.map(r => {
                  const ar = areaPorId(r.area)
                  return (
                    <Link key={r.id} to={`${ar.rota}/${r.slug}`} className="atalho">
                      <span className="ic"><ar.icone size={18} /></span>
                      <div><b>{r.titulo}</b><span>{ar.rotulo}{r.categoria ? ` · ${r.categoria}` : ''}</span></div>
                      <ArrowRight size={15} className="seta" />
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {podeVerHistorico(u) && <Historico pagina={p} />}
        </article>

      </div>

      {excluindo && <Confirmar titulo="Excluir página" rotuloConfirmar="Excluir página" fechar={() => setExcluindo(false)}
        texto={<>Você está prestes a excluir <b>{p.titulo}</b> e todos os documentos anexados. Esta ação não pode ser desfeita.</>}
        aoConfirmar={() => { try { excluir(p.id); avisar('Página excluída.'); nav(info.rota, { replace: true }) } catch (e) { setErro((e as Error).message) } }} />}
    </div>
  )
}

function Historico({ pagina }: { pagina: PaginaT }) {
  const [aberto, setAberto] = useState(false)
  const registros = listarHistorico(pagina.id)
  return (
    <section className="pg-secao">
      <h3 className="h3"><User size={14} style={{ verticalAlign: -2, marginRight: 6 }} />Histórico de alterações<span className="pill" style={{ marginLeft: 8 }}>{registros.length}</span>
        <button className="copiar" style={{ marginLeft: 12, textTransform: 'none', letterSpacing: 0 }} onClick={() => setAberto(a => !a)}>{aberto ? 'Ocultar' : 'Mostrar'}</button></h3>
      {aberto && (registros.length === 0 ? <p className="note">Nenhum registro.</p> : (
        <ul className="hist">
          {registros.map(r => (
            <li key={r.id}><Avatar nome={r.usuarioNome} /><div><b>{r.usuarioNome}</b> {ROTULO_ACAO[r.tipo].toLowerCase()}{r.detalhe ? <>: <span className="mono">{r.detalhe}</span></> : ''}<small>{dataHora(r.em)}</small></div></li>
          ))}
        </ul>
      ))}
    </section>
  )
}
