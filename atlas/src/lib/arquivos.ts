/*
  Arquivos (imagens, anexos e documentos) guardados no IndexedDB do navegador.
  SIMULAÇÃO: em produção isso viria de um armazenamento no servidor.
*/
import { useEffect, useState } from 'react'

const BANCO = 'atlas-arquivos'
const LOJA = 'blobs'

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    const r = indexedDB.open(BANCO, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(LOJA)
    r.onsuccess = () => ok(r.result)
    r.onerror = () => erro(r.error)
  })
}

async function tx<T>(modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await abrir()
  return new Promise((ok, erro) => {
    const req = fn(db.transaction(LOJA, modo).objectStore(LOJA))
    req.onsuccess = () => ok(req.result)
    req.onerror = () => erro(req.error)
  })
}

export const salvarArquivo = (id: string, blob: Blob) => tx('readwrite', s => s.put(blob, id))
export const lerArquivo = (id: string) => tx<Blob | undefined>('readonly', s => s.get(id))
export const removerArquivo = (id: string) => tx('readwrite', s => s.delete(id)).catch(() => undefined)

/** URL temporária para exibir/baixar um arquivo guardado */
export function useArquivoUrl(id?: string) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!id) { setUrl(undefined); return }
    let obj: string | undefined
    let vivo = true
    lerArquivo(id).then(b => { if (vivo && b) { obj = URL.createObjectURL(b); setUrl(obj) } }).catch(() => undefined)
    return () => { vivo = false; if (obj) URL.revokeObjectURL(obj) }
  }, [id])
  return url
}

export async function abrirArquivo(id: string, baixarComo?: string) {
  const b = await lerArquivo(id)
  if (!b) return false
  const u = URL.createObjectURL(b)
  if (baixarComo) { const a = document.createElement('a'); a.href = u; a.download = baixarComo; a.click() }
  else window.open(u, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(u), 60_000)
  return true
}

/** Reduz imagens grandes antes de guardar (máx. 1600px) */
export async function otimizarImagem(arq: File): Promise<Blob> {
  if (!/^image\/(png|jpe?g|webp)$/.test(arq.type) || arq.size < 400_000) return arq
  try {
    const bmp = await createImageBitmap(arq)
    const f = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * f); c.height = Math.round(bmp.height * f)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    const out = await new Promise<Blob | null>(r => c.toBlob(r, 'image/webp', 0.85))
    return out && out.size < arq.size ? out : arq
  } catch { return arq }
}
