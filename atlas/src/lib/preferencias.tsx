import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle, X } from '@phosphor-icons/react'

export type Modo = 'claro' | 'escuro'

/* localStorage pode falhar (navegação privada, iframe) — sempre com try/catch */
function ler<T>(chave: string, padrao: T): T {
  try { const v = localStorage.getItem(chave); return v == null ? padrao : (JSON.parse(v) as T) } catch { return padrao }
}
function gravar(chave: string, v: unknown) { try { localStorage.setItem(chave, JSON.stringify(v)) } catch { /* sem armazenamento */ } }

interface Ctx {
  modo: Modo; setModo: (m: Modo) => void
  /** muda a cada troca de modo, para quem lê tokens via getComputedStyle */
  versao: number
  avisar: (msg: string) => void
}
const PrefCtx = createContext<Ctx | null>(null)

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const [modo, setModoS] = useState<Modo>(() => ler('atlas.modo', 'claro'))
  const [versao, setVersao] = useState(0)
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', modo === 'escuro')
    try { localStorage.removeItem('atlas.tema') } catch { /* sem armazenamento */ }
    setVersao(v => v + 1)
  }, [modo])

  const setModo = (m: Modo) => { setModoS(m); gravar('atlas.modo', m) }
  const avisar = useCallback((msg: string) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t.slice(-2), { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600)
  }, [])

  return (
    <PrefCtx.Provider value={{ modo, setModo, versao, avisar }}>
      {children}
      <div className="toast-area" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="toast toast-success toast-in">
            <CheckCircle size={16} weight="fill" />{t.msg}
            <button className="fechar" aria-label="Fechar" onClick={() => setToasts(x => x.filter(y => y.id !== t.id))}><X size={13} weight="bold" /></button>
          </div>
        ))}
      </div>
    </PrefCtx.Provider>
  )
}

export function usePreferencias() {
  const c = useContext(PrefCtx)
  if (!c) throw new Error('usePreferencias fora do provider')
  return c
}

/** Copia texto e mostra o toast padrão do APOL+ */
export function useCopiar() {
  const { avisar } = usePreferencias()
  return useCallback(async (texto: string, rotulo?: string) => {
    try { await navigator.clipboard.writeText(texto) } catch {
      const ta = document.createElement('textarea'); ta.value = texto; document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch { /* nada */ } ta.remove()
    }
    avisar(`${rotulo ?? texto} copiado.`)
  }, [avisar])
}

/** Valor atual de um token CSS (lido do body) */
export function lerToken(nome: string) {
  return getComputedStyle(document.body).getPropertyValue(nome).trim().toUpperCase()
}
