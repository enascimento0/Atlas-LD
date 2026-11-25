import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Warning, X } from '@phosphor-icons/react'

/** Modal padrão (usa a classe .modal do APOL+). Fecha com Esc e clique fora. */
export function Modal({ titulo, fechar, children, acoes, largura = 480 }: { titulo: string; fechar: () => void; children: ReactNode; acoes?: ReactNode; largura?: number }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar() }
    addEventListener('keydown', h); return () => removeEventListener('keydown', h)
  }, [fechar])
  return (
    <div className="mdl-ov" onMouseDown={e => { if (e.target === e.currentTarget) fechar() }}>
      <div className="modal mdl" role="dialog" aria-modal="true" aria-label={titulo} style={{ maxWidth: largura }}>
        <div className="mdl-hdr"><h4>{titulo}</h4><button className="mdl-x" onClick={fechar} aria-label="Fechar"><X size={16} /></button></div>
        <div className="mdl-corpo">{children}</div>
        {acoes && <div className="modal-acoes">{acoes}</div>}
      </div>
    </div>
  )
}

/** Confirmação de ação destrutiva */
export function Confirmar({ titulo, texto, rotuloConfirmar, perigo = true, aoConfirmar, fechar }: {
  titulo: string; texto: ReactNode; rotuloConfirmar: string; perigo?: boolean; aoConfirmar: () => void; fechar: () => void
}) {
  return (
    <Modal titulo={titulo} fechar={fechar} largura={440} acoes={<>
      <button className="btn btn-outline" onClick={fechar}>Cancelar</button>
      <button className={`btn ${perigo ? 'btn-danger' : 'btn-primary'}`} onClick={() => { aoConfirmar(); fechar() }}>{rotuloConfirmar}</button>
    </>}>
      <div className="mdl-aviso">{perigo && <Warning size={20} weight="fill" />}<p>{texto}</p></div>
    </Modal>
  )
}

/** Menu suspenso simples (padrão .pac do APOL+) */
export function MenuSuspenso({ gatilho, children, alinhar = 'right' }: { gatilho: (abrir: () => void, aberto: boolean) => ReactNode; children: (fechar: () => void) => ReactNode; alinhar?: 'left' | 'right' }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const fora = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setAberto(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAberto(false) }
    addEventListener('mousedown', fora); addEventListener('keydown', esc)
    return () => { removeEventListener('mousedown', fora); removeEventListener('keydown', esc) }
  }, [aberto])
  return (
    <div className="pac" ref={ref}>
      {gatilho(() => setAberto(a => !a), aberto)}
      {aberto && <div className="pac-menu" style={alinhar === 'left' ? { left: 0, right: 'auto' } : undefined} role="menu">{children(() => setAberto(false))}</div>}
    </div>
  )
}
