/* Texto com formatação básica: só estas tags sobrevivem; o resto vira texto puro. */
const PERMITIDAS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'CODE', 'A', 'BR'])
const DESCARTAR = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE'])

export const urlSegura = (u: string) => /^(https?:|mailto:|\/|#)/i.test(u.trim())
/** Garante protocolo em links digitados sem http(s) */
export const normalizarUrl = (u: string) => { const t = u.trim(); return !t || urlSegura(t) ? t : `https://${t}` }

function limpar(no: Node) {
  for (const f of [...no.childNodes]) {
    if (f.nodeType === 3) continue
    if (f.nodeType !== 1) { f.remove(); continue }
    const el = f as HTMLElement
    if (DESCARTAR.has(el.tagName)) { el.remove(); continue }
    limpar(el)
    if (!PERMITIDAS.has(el.tagName)) { el.replaceWith(...el.childNodes); continue }
    const href = el.tagName === 'A' ? el.getAttribute('href') ?? '' : ''
    for (const a of [...el.attributes]) el.removeAttribute(a.name)
    if (el.tagName === 'A') {
      if (urlSegura(href)) { el.setAttribute('href', href); el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer') }
      else el.replaceWith(...el.childNodes)
    }
  }
}

export function sanitizar(html: string | undefined): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  limpar(doc.body)
  return doc.body.innerHTML
}

export function textoPlano(html: string | undefined): string {
  if (!html) return ''
  return new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html').body.textContent ?? ''
}

export const escapar = (t: string) => t.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)
