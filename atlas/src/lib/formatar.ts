const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const dois = (n: number) => String(n).padStart(2, '0')

export function dataCurta(iso: string) {
  const d = new Date(iso)
  return `${dois(d.getDate())} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export function dataHora(iso: string) {
  const d = new Date(iso)
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} às ${dois(d.getHours())}:${dois(d.getMinutes())}`
}

export function relativo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'agora há pouco'
  if (s < 3600) return `há ${Math.floor(s / 60)} min`
  if (s < 86400) return `há ${Math.floor(s / 3600)} h`
  if (s < 86400 * 7) { const d = Math.floor(s / 86400); return `há ${d} ${d === 1 ? 'dia' : 'dias'}` }
  return dataCurta(iso)
}

/** Atualizada nos últimos 7 dias */
export const eRecente = (iso: string) => Date.now() - new Date(iso).getTime() < 86400_000 * 7

export function tamanhoLegivel(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 ** 2).toFixed(1).replace('.', ',')} MB`
}

export const iniciais = (nome: string) => nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]!.toUpperCase()).join('')

export function slugificar(t: string) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'pagina'
}

export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`

export const ROTULO_ACAO: Record<import('./tipos').TipoAlteracao, string> = {
  criou: 'Criou a página', editou: 'Editou o conteúdo', publicou: 'Publicou', despublicou: 'Despublicou', excluiu: 'Excluiu',
  anexou: 'Anexou documento', 'removeu-documento': 'Removeu documento', usuario: 'Cadastrou usuário', permissoes: 'Alterou permissões',
}
