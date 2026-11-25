/**
 * Gera os dados do Design System a partir dos arquivos .fig exportados do Figma.
 *
 * Uso:
 *   npm run dados:figma -- "caminho/DS - Biblioteca de componentes.fig" "caminho/Icons (Phosphor).fig"
 *
 * Saída:
 *   src/data/biblioteca.json            cores, textos, sombras e componentes da biblioteca
 *   src/data/phosphor-categorias.json   ícones Phosphor agrupados por categoria
 *
 * Como funciona: o .fig é um zip com "canvas.fig" (formato binário kiwi do Figma).
 * Lemos o esquema + mensagem, montamos a árvore de nós e extraímos estilos locais e conjuntos de componentes.
 * As descrições em português e as categorias ficam em scripts/descricoes.json — edite lá.
 */
import fs from 'node:fs'
import path from 'node:path'
import { unzipSync, inflateSync } from 'fflate'
import { decompress } from 'fzstd'
import * as kiwi from 'kiwi-schema'

const [libPath, iconesPath] = process.argv.slice(2)
if (!libPath || !iconesPath) { console.error('Uso: npm run dados:figma -- <biblioteca.fig> <icones.fig>'); process.exit(1) }
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const extras = JSON.parse(fs.readFileSync(path.join(RAIZ, 'scripts/descricoes.json'), 'utf8'))

function lerFig(arquivo) {
  const zip = unzipSync(new Uint8Array(fs.readFileSync(arquivo)))
  const buf = zip['canvas.fig']; const dv = new DataView(buf.buffer, buf.byteOffset)
  let off = 12; const partes = []
  while (off < buf.length) { const n = dv.getUint32(off, true); off += 4; partes.push(buf.subarray(off, off + n)); off += n }
  const abrir = c => (c[0] === 0x28 && c[1] === 0xb5 ? decompress(c) : inflateSync(c))
  const esquema = kiwi.compileSchema(kiwi.decodeBinarySchema(abrir(partes[0])))
  const msg = esquema.decodeMessage(abrir(partes[1]))
  const g = x => (x ? `${x.sessionID}:${x.localID}` : null)
  const nos = new Map(), filhos = new Map()
  for (const n of msg.nodeChanges) {
    nos.set(g(n.guid), n); const p = g(n.parentIndex?.guid)
    if (p) { if (!filhos.has(p)) filhos.set(p, []); filhos.get(p).push(n) }
  }
  for (const a of filhos.values()) a.sort((x, y) => (x.parentIndex.position < y.parentIndex.position ? -1 : 1))
  return { msg, nos, filhos, g, kids: n => filhos.get(g(n.guid)) ?? [] }
}
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()

/* ── Biblioteca ── */
const L = lerFig(libPath)
const estilos = L.msg.nodeChanges.filter(n => n.styleType)
const coresBrutas = estilos.filter(n => n.styleType === 'FILL').map(n => ({ nome: n.name, hex: n.fillPaints?.[0]?.color ? hex(n.fillPaints[0].color) : '', opacidade: +(n.fillPaints?.[0]?.opacity ?? 1).toFixed(2) }))
const fim = coresBrutas.findIndex(c => c.nome === 'White/400') // estilos locais vêm antes dos importados
const vistos = new Set(), cores = []
for (const c of coresBrutas.slice(0, fim + 1)) { if (vistos.has(c.nome)) continue; vistos.add(c.nome); cores.push({ ...c, grupo: c.nome.startsWith('Highlight') ? 'Highlight' : c.nome.split('/')[0] }) }
const tvistos = new Set(), textos = []
for (const t of estilos.filter(n => n.styleType === 'TEXT')) {
  if (!t.name.startsWith('Web/') || tvistos.has(t.name) || !['Ubuntu', 'Nunito'].includes(t.fontName?.family)) continue
  tvistos.add(t.name); const [, categoria, rotulo] = t.name.split('/')
  textos.push({ nome: t.name, categoria, rotulo, familia: t.fontName.family, peso: t.fontName.style, tamanho: t.fontSize, alturaLinha: +t.lineHeight.value.toFixed(2) })
}
const ordemCat = ['Headlines', 'Subtitles', 'Paragraph', 'Labels']
textos.sort((a, b) => ordemCat.indexOf(a.categoria) - ordemCat.indexOf(b.categoria) || b.tamanho - a.tamanho || a.peso.localeCompare(b.peso))
const sombras = estilos.filter(n => n.styleType === 'EFFECT' && /^Shadows\/(Light|Dark)\/\d$/.test(n.name))
  .filter((n, i, a) => a.findIndex(x => x.name === n.name) === i)
  .map(n => { const e = n.effects[0]; return { nome: n.name, css: `${e.offset.x}px ${e.offset.y}px ${e.radius}px rgba(0,0,20,${+e.color.a.toFixed(2)})` } })

const doc = L.msg.nodeChanges.find(n => n.type === 'DOCUMENT')
/* Componentes do Figma que não fazem parte do sistema: ficam de fora do catálogo. */
const FORA_DO_SISTEMA = ['Post-it', 'Browser bar', 'Map']
const paginas = L.kids(doc).filter(c => c.name.includes('✅') && !FORA_DO_SISTEMA.some(n => c.name.includes(n)))
const componentes = paginas.map(p => {
  const conj = []
  const coletar = n => { if ((n.type === 'FRAME' && n.isStateGroup) || n.type === 'SYMBOL') { conj.push(n); return } L.kids(n).forEach(coletar) }
  L.kids(p).forEach(coletar)
  const info = conj.map(s => {
    const vs = s.type === 'FRAME' ? L.kids(s).filter(c => c.type === 'SYMBOL') : [s]
    const props = {}
    for (const v of vs) for (const parte of v.name.split(',')) { const [k, val] = parte.split('=').map(x => x?.trim()); if (val !== undefined) (props[k] ||= new Set()).add(val) }
    return { nome: s.name.trim(), variantes: vs.length, props }
  })
  const principal = info.filter(x => !x.nome.startsWith('_')).sort((a, b) => b.variantes - a.variantes)[0] ?? info.sort((a, b) => b.variantes - a.variantes)[0]
  const propriedades = {}
  for (const st of info) if (!st.nome.startsWith('_') || st === principal) for (const [k, v] of Object.entries(st.props)) propriedades[k] = [...new Set([...(propriedades[k] ?? []), ...v])]
  const nome = p.name.replace('✅', '').trim()
  return { nome, figmaId: L.g(p.guid), categoria: extras.categorias[nome] ?? 'Outros', descricao: extras.descricoes[nome] ?? '', conjuntos: info.length, variantes: info.reduce((a, x) => a + x.variantes, 0), principal: principal?.nome ?? null, propriedades }
})
const meta = JSON.parse(new TextDecoder().decode(unzipSync(new Uint8Array(fs.readFileSync(libPath)))['meta.json']))
fs.writeFileSync(path.join(RAIZ, 'src/data/biblioteca.json'), JSON.stringify({ arquivo: meta.file_name, exportado: meta.exported_at?.slice(0, 10), cores, textos, sombras, componentes }, null, 1))
console.log(`biblioteca: ${cores.length} cores, ${textos.length} textos, ${sombras.length} sombras, ${componentes.length} componentes`)

/* ── Ícones ── */
const I = lerFig(iconesPath)
const pag = I.msg.nodeChanges.find(n => n.type === 'CANVAS' && n.name === 'Components')
const cats = {}
for (const cat of I.kids(pag)) cats[cat.name] = I.kids(cat).filter(i => i.type === 'FRAME' && i.isStateGroup).map(i => i.name)
fs.writeFileSync(path.join(RAIZ, 'src/data/phosphor-categorias.json'), JSON.stringify(cats))
console.log(`ícones: ${Object.values(cats).flat().length} em ${Object.keys(cats).length} categorias`)
