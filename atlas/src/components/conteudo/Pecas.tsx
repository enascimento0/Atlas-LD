import {
  File as ArquivoIc, FileDoc, FileImage, FilePdf, FilePpt, FileText, FileXls, FileZip,
} from '@phosphor-icons/react'
import { iniciais } from '../../lib/formatar'
import type { Status } from '../../lib/tipos'

export function BadgeStatus({ status }: { status: Status }) {
  return status === 'publicado'
    ? <span className="badge" style={{ background: 'var(--c-success-bg)', color: 'var(--c-success-txt)' }}>PUBLICADO</span>
    : <span className="badge" style={{ background: 'var(--c-warning-bg)', color: 'var(--c-warning-txt)' }}>RASCUNHO</span>
}

export function Avatar({ nome, tam = 22 }: { nome: string; tam?: number }) {
  return <span className="av-mini" style={{ width: tam, height: tam, fontSize: Math.round(tam * 0.42) }} aria-hidden>{iniciais(nome)}</span>
}

export function iconeDeArquivo(nome: string, tipo = '') {
  const ext = nome.split('.').pop()?.toLowerCase() ?? ''
  if (tipo.startsWith('image/')) return FileImage
  if (ext === 'pdf') return FilePdf
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) return FileDoc
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return FileXls
  if (['ppt', 'pptx', 'key'].includes(ext)) return FilePpt
  if (['zip', 'rar', '7z'].includes(ext)) return FileZip
  if (['txt', 'md'].includes(ext)) return FileText
  return ArquivoIc
}
