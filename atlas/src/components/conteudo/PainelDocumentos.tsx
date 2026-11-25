import { useRef, useState } from 'react'
import { DownloadSimple, Eye, FilePlus, Trash, UploadSimple } from '@phosphor-icons/react'
import { adicionarDocumento, removerDocumento } from '../../lib/api'
import { abrirArquivo } from '../../lib/arquivos'
import { dataCurta, tamanhoLegivel } from '../../lib/formatar'
import { usePreferencias } from '../../lib/preferencias'
import type { Pagina } from '../../lib/tipos'
import { Confirmar } from '../ui/Dialogos'
import { iconeDeArquivo } from './Pecas'

/** Envia vários arquivos para uma página; devolve a lista de falhas (texto pronto para exibir) */
export async function enviarDocumentos(paginaId: string, arquivos: File[]) {
  const falhas: string[] = []
  let ok = 0
  for (const a of arquivos) {
    try { await adicionarDocumento(paginaId, a); ok++ } catch (e) { falhas.push((e as Error).message) }
  }
  return { ok, falhas }
}

export function PainelDocumentos({ pagina, editavel, aoAlterar }: { pagina: Pagina; editavel: boolean; aoAlterar?: () => void }) {
  const { avisar } = usePreferencias()
  const entrada = useRef<HTMLInputElement>(null)
  const [arrastando, setArrastando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [remover, setRemover] = useState<string | null>(null)

  const enviar = async (lista: FileList | File[] | null) => {
    const arquivos = lista ? [...lista] : []
    if (!arquivos.length) return
    setEnviando(true); setErro('')
    const r = await enviarDocumentos(pagina.id, arquivos)
    setEnviando(false)
    if (r.ok) aoAlterar?.()
    if (r.ok) avisar(r.ok === 1 ? 'Documento adicionado.' : `${r.ok} documentos adicionados.`)
    if (r.falhas.length) setErro(r.falhas.join(' '))
  }

  const alvo = pagina.documentos.find(d => d.id === remover)
  return (
    <div className="docs">
      {pagina.documentos.length === 0 ? (
        !editavel && <p className="note" style={{ margin: 0 }}>Nenhum documento anexado a esta página.</p>
      ) : (
        <ul className="docs-lista">
          {pagina.documentos.map(d => {
            const I = iconeDeArquivo(d.nome, d.tipo)
            return (
              <li key={d.id}>
                <span className="ic"><I size={20} /></span>
                <div className="info"><b title={d.nome}>{d.nome}</b><small>{tamanhoLegivel(d.tamanho)} · {d.enviadoPorNome} · {dataCurta(d.enviadoEm)}</small></div>
                <div className="acoes">
                  <button className="icb" title="Abrir" aria-label={`Abrir ${d.nome}`} onClick={() => void abrirArquivo(d.id)}><Eye size={16} /></button>
                  <button className="icb" title="Baixar" aria-label={`Baixar ${d.nome}`} onClick={() => void abrirArquivo(d.id, d.nome)}><DownloadSimple size={16} /></button>
                  {editavel && <button className="icb perigo" title="Remover" aria-label={`Remover ${d.nome}`} onClick={() => setRemover(d.id)}><Trash size={16} /></button>}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editavel && (
        <div
          className={`dropzone ${arrastando ? 'sobre' : ''}`}
          onDragOver={e => { e.preventDefault(); setArrastando(true) }}
          onDragLeave={() => setArrastando(false)}
          onDrop={e => { e.preventDefault(); setArrastando(false); void enviar(e.dataTransfer.files) }}
        >
          <UploadSimple size={20} />
          <span>{enviando ? 'Enviando…' : 'Arraste documentos aqui ou'}</span>
          <button className="btn btn-outline btn-sm" disabled={enviando} onClick={() => entrada.current?.click()}><FilePlus size={14} />Selecionar arquivos</button>
          <input ref={entrada} type="file" multiple hidden onChange={e => { void enviar(e.target.files); e.target.value = '' }} />
        </div>
      )}
      {erro && <div className="aviso" style={{ marginTop: 8 }} role="alert">{erro}</div>}

      {alvo && <Confirmar titulo="Remover documento" texto={<>O arquivo <b>{alvo.nome}</b> será removido desta página.</>} rotuloConfirmar="Remover"
        aoConfirmar={() => { try { removerDocumento(pagina.id, alvo.id); aoAlterar?.(); avisar('Documento removido.') } catch (e) { setErro((e as Error).message) } }} fechar={() => setRemover(null)} />}
    </div>
  )
}
