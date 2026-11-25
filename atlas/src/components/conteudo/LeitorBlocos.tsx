import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowSquareOut, ArrowsOut, DownloadSimple, Eye, ImageBroken, X } from '@phosphor-icons/react'
import { abrirArquivo, useArquivoUrl } from '../../lib/arquivos'
import { tamanhoLegivel } from '../../lib/formatar'
import { normalizarUrl, sanitizar, textoPlano, urlSegura } from '../../lib/html'
import type { Bloco } from '../../lib/tipos'
import type { ItemToc } from '../ui/Doc'
import { iconeDeArquivo } from './Pecas'
import { TabelaComparativa } from './Comparativo'

export const idDoTitulo = (b: Bloco) => `h-${b.id}`

/** Sumário a partir dos títulos da página */
export function sumarioDe(blocos: Bloco[]): ItemToc[] {
  const itens: ItemToc[] = []
  for (const b of blocos) {
    const t = textoPlano(b.html).trim()
    if (!t) continue
    if (b.tipo === 'h1' || b.tipo === 'h2') itens.push({ id: idDoTitulo(b), titulo: t, filhos: [] })
    else if (b.tipo === 'h3') {
      const f = { id: idDoTitulo(b), titulo: t }
      if (itens.length) itens[itens.length - 1]!.filhos!.push(f); else itens.push({ id: f.id, titulo: f.titulo, filhos: [] })
    }
  }
  return itens
}

export function Rico({ html, tag: T = 'div', className }: { html?: string; tag?: 'div' | 'li' | 'figcaption' | 'blockquote' | 'td' | 'th'; className?: string }) {
  return <T className={className} dangerouslySetInnerHTML={{ __html: sanitizar(html) }} />
}

export function ImagemDeBloco({ b }: { b: Bloco }) {
  const guardada = useArquivoUrl(b.arquivoId)
  const src = b.arquivoId ? guardada : b.url && urlSegura(b.url) ? b.url : undefined
  if (!src) return <div className="bl-img-vazia"><ImageBroken size={20} />Imagem indisponível</div>
  return <img src={src} alt={textoPlano(b.legenda) || b.nome || ''} loading="lazy" />
}

/** Tipos que o navegador consegue mostrar: imagem e PDF. O resto (Word, PowerPoint, planilhas…) só baixa. */
export function tipoVisualizavel(nome = ''): 'imagem' | 'pdf' | null {
  const ext = nome.split('.').pop()?.toLowerCase() ?? ''
  if (/^(png|jpe?g|gif|webp|svg|bmp|avif)$/.test(ext)) return 'imagem'
  if (ext === 'pdf') return 'pdf'
  return null
}

/** Visualizador em tela grande (imagem ou PDF), com baixar e fechar. Fecha com Esc e clique fora. */
export function Visualizador({ id, nome, fechar }: { id: string; nome: string; fechar: () => void }) {
  const url = useArquivoUrl(id)
  const tipo = tipoVisualizavel(nome)
  const I = iconeDeArquivo(nome)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    addEventListener('keydown', h); return () => removeEventListener('keydown', h)
  }, [fechar])
  return createPortal(
    <div className="vis-ov" onMouseDown={e => { if (e.target === e.currentTarget) fechar() }}>
      <div className="vis" role="dialog" aria-modal="true" aria-label={nome}>
        <div className="vis-hdr">
          <I size={18} /><b title={nome}>{nome}</b>
          <button type="button" className="icb" title="Baixar" aria-label={`Baixar ${nome}`} onClick={() => void abrirArquivo(id, nome)}><DownloadSimple size={16} /></button>
          <button type="button" className="icb" title="Fechar" aria-label="Fechar" onClick={fechar}><X size={16} /></button>
        </div>
        <div className={`vis-corpo ${tipo ?? ''}`}>
          {!url ? <span className="note">Carregando…</span> : tipo === 'imagem' ? <img src={url} alt={nome} /> : <iframe src={url} title={nome} />}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Arquivo anexado no corpo do artigo: imagem e PDF aparecem em prévia (clique amplia);
    abaixo, ícone + nome como link + baixar. Os demais tipos são só o link, que baixa o arquivo. */
export function AnexoDeBloco({ b, acao }: { b: Bloco; acao?: React.ReactNode }) {
  const [aberto, setAberto] = useState(false)
  const nome = b.nome ?? 'arquivo'
  const tipo = tipoVisualizavel(nome)
  const url = useArquivoUrl(tipo ? b.arquivoId : undefined)
  const I = iconeDeArquivo(nome)
  if (!b.arquivoId) return null
  const abrir = () => tipo ? setAberto(true) : void abrirArquivo(b.arquivoId!, nome)
  return (
    <div className="bl-anexo">
      {tipo && url && (
        <button type="button" className={`bl-anexo-prev ${tipo}`} onClick={() => setAberto(true)} aria-label={`Ampliar ${nome}`}>
          {tipo === 'imagem' ? <img src={url} alt={nome} /> : <iframe src={`${url}#toolbar=0&navpanes=0&view=FitH`} title={nome} tabIndex={-1} />}
          <span className="amp"><ArrowsOut size={14} />Ampliar</span>
        </button>
      )}
      <div className="bl-anexo-linha">
        <I size={18} className="ic" />
        <button type="button" className="lnk" onClick={abrir} title={tipo ? 'Visualizar' : 'Baixar'}>{nome}</button>
        {b.tamanho != null && <small>{tamanhoLegivel(b.tamanho)}</small>}
        <button type="button" className="icb" title="Baixar" aria-label={`Baixar ${nome}`} onClick={() => void abrirArquivo(b.arquivoId!, nome)}><DownloadSimple size={16} /></button>
        {acao}
      </div>
      {aberto && <Visualizador id={b.arquivoId} nome={nome} fechar={() => setAberto(false)} />}
    </div>
  )
}

/** Lista compacta dos arquivos anexados no corpo do artigo (para a lateral do editor e a seção de documentos). */
export function ArquivosDoCorpo({ blocos }: { blocos: Bloco[] }) {
  const [ver, setVer] = useState<Bloco | null>(null)
  const arqs = blocos.filter(b => b.tipo === 'arquivo' && b.arquivoId)
  if (!arqs.length) return null
  return (
    <>
      <ul className="docs-lista">
        {arqs.map(b => {
          const nome = b.nome ?? 'arquivo'
          const I = iconeDeArquivo(nome)
          return (
            <li key={b.id}>
              <span className="ic"><I size={18} /></span>
              <div className="info"><b title={nome}>{nome}</b><small>{b.tamanho != null ? tamanhoLegivel(b.tamanho) : ''}</small></div>
              <div className="acoes">
                {tipoVisualizavel(nome) && <button type="button" className="icb" title="Visualizar" aria-label={`Visualizar ${nome}`} onClick={() => setVer(b)}><Eye size={16} /></button>}
                <button type="button" className="icb" title="Baixar" aria-label={`Baixar ${nome}`} onClick={() => void abrirArquivo(b.arquivoId!, nome)}><DownloadSimple size={16} /></button>
              </div>
            </li>
          )
        })}
      </ul>
      {ver && <Visualizador id={ver.arquivoId!} nome={ver.nome ?? 'arquivo'} fechar={() => setVer(null)} />}
    </>
  )
}

/** Renderização de leitura dos blocos de uma página */
export function LeitorBlocos({ blocos }: { blocos: Bloco[] }) {
  return <div className="artigo">{blocos.map(b => <Bloco1 key={b.id} b={b} />)}</div>
}

function Bloco1({ b }: { b: Bloco }) {
  switch (b.tipo) {
    case 'h1': return <h2 id={idDoTitulo(b)} className="a-h1" dangerouslySetInnerHTML={{ __html: sanitizar(b.html) }} />

    case 'h2': return <h2 id={idDoTitulo(b)} dangerouslySetInnerHTML={{ __html: sanitizar(b.html) }} />
    case 'h3': return <h3 id={idDoTitulo(b)} dangerouslySetInnerHTML={{ __html: sanitizar(b.html) }} />
    case 'paragrafo': return b.html ? <Rico html={b.html} className="a-p" /> : <div className="a-p vazio-p" />
    case 'citacao': return <Rico tag="blockquote" html={b.html} />
    case 'lista': return <ul>{b.itens?.map((i, k) => <Rico key={k} tag="li" html={i} />)}</ul>
    case 'numerada': return <ol>{b.itens?.map((i, k) => <Rico key={k} tag="li" html={i} />)}</ol>
    case 'separador': return <hr />
    case 'imagem': return <figure><ImagemDeBloco b={b} />{textoPlano(b.legenda) && <Rico tag="figcaption" html={b.legenda} />}</figure>
    case 'arquivo': return <AnexoDeBloco b={b} />
    case 'link': return b.url && urlSegura(b.url)
      ? <a className="bl-link" href={normalizarUrl(b.url)} target="_blank" rel="noopener noreferrer"><ArrowSquareOut size={18} /><div><b>{b.nome || b.url}</b><small>{b.url}</small></div></a>
      : null
    case 'tabela': return (
      <div className="a-tabela"><table>
        <tbody>{b.linhas?.map((l, i) => <tr key={i}>{l.map((c, j) => b.cabecalho && i === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table></div>
    )
    case 'comparativo': return b.comparativo ? (
      <div className="bl-cmp">
        <TabelaComparativa c={b.comparativo} />
        {textoPlano(b.legenda) && <Rico html={b.legenda} className="cmp-fonte" />}
      </div>
    ) : null
    default: return null
  }
}
