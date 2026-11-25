/*
  Tabela comparativa de benchmark: produtos nas colunas, funcionalidades nas linhas.
  Cada célula é Tem / Parcial / Não tem / N/A; a pontuação (Tem = 1 · Parcial = 0,5) é calculada.
  A coluna de referência (normalmente o nosso produto) fica destacada.
*/
import { Minus, Plus, X } from '@phosphor-icons/react'
import type { Avaliacao, Comparativo } from '../../lib/tipos'

export const AVALIACOES: { id: Avaliacao; rotulo: string; legenda: string; pontos: number }[] = [
  { id: 'tem', rotulo: 'Tem', legenda: 'Tem', pontos: 1 },
  { id: 'parcial', rotulo: 'Parcial', legenda: 'Parcial', pontos: 0.5 },
  { id: 'nao', rotulo: 'Não tem', legenda: 'Não tem', pontos: 0 },
  { id: 'na', rotulo: '—', legenda: 'N/A — não avaliado', pontos: 0 },
]
const avaliacao = (a: Avaliacao) => AVALIACOES.find(x => x.id === a) ?? AVALIACOES[3]!
const proxima = (a: Avaliacao): Avaliacao => AVALIACOES[(AVALIACOES.findIndex(x => x.id === a) + 1) % AVALIACOES.length]!.id

export function comparativoVazio(): Comparativo {
  return {
    colunas: [{ nome: 'Nosso produto' }, { nome: 'Concorrente 1' }, { nome: 'Concorrente 2' }],
    destaque: 0,
    linhas: [{ funcionalidade: '', valores: ['na', 'na', 'na'] }],
  }
}

export const pontuacao = (c: Comparativo, col: number) => c.linhas.reduce((s, l) => s + avaliacao(l.valores[col] ?? 'na').pontos, 0)
const numero = (n: number) => String(n).replace('.', ',')

/** Texto plano do comparativo (para a busca) */
export const textoDoComparativo = (c?: Comparativo) =>
  c ? [...c.colunas.map(x => `${x.nome} ${x.sub ?? ''}`), ...c.linhas.map(l => l.funcionalidade)].join(' ') : ''

export function Selo({ a }: { a: Avaliacao }) {
  const v = avaliacao(a)
  return <span className={`cmp-selo ${v.id}`} title={v.legenda}>{v.rotulo}</span>
}

export function LegendaComparativo() {
  return (
    <div className="cmp-legenda">
      {AVALIACOES.map(a => <span key={a.id} className={`cmp-selo ${a.id}`}>{a.legenda}</span>)}
    </div>
  )
}

function Pontos({ c, col }: { c: Comparativo; col: number }) {
  const pts = pontuacao(c, col)
  const max = c.linhas.length || 1
  return (
    <div className="cmp-pontos">
      <b>{numero(pts)}</b>
      <span className="cmp-barra" aria-hidden="true"><i style={{ width: `${(pts / max) * 100}%` }} /></span>
    </div>
  )
}

const ROTULO_PONTOS = <>Pontuação <small>(Tem = 1 · Parcial = 0,5)</small></>

/* ── Leitura ── */
export function TabelaComparativa({ c }: { c: Comparativo }) {
  const ref = (j: number) => (j === c.destaque ? 'ref' : '')
  return (
    <div className="cmp">
      <LegendaComparativo />
      <div className="cmp-rolagem">
        <table className="cmp-tabela">
          <thead>
            <tr>
              <th className="cmp-func" scope="col">Funcionalidade</th>
              {c.colunas.map((col, j) => <th key={j} scope="col" className={ref(j)}><b>{col.nome}</b>{col.sub && <small>{col.sub}</small>}</th>)}
            </tr>
          </thead>
          <tbody>
            {c.linhas.map((l, i) => (
              <tr key={i}>
                <th scope="row" className="cmp-func">{i + 1}.&nbsp; {l.funcionalidade}</th>
                {c.colunas.map((_, j) => <td key={j} className={ref(j)}><Selo a={l.valores[j] ?? 'na'} /></td>)}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="cmp-func">{ROTULO_PONTOS}</th>
              {c.colunas.map((_, j) => <td key={j} className={ref(j)}><Pontos c={c} col={j} /></td>)}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/* ── Edição ── */
export function EditorComparativo({ c, aoMudar }: { c: Comparativo; aoMudar: (c: Comparativo) => void }) {
  const ref = (j: number) => (j === c.destaque ? 'ref' : '')
  const setCol = (j: number, p: Partial<Comparativo['colunas'][number]>) => aoMudar({ ...c, colunas: c.colunas.map((x, k) => k === j ? { ...x, ...p } : x) })
  const setLinha = (i: number, p: Partial<Comparativo['linhas'][number]>) => aoMudar({ ...c, linhas: c.linhas.map((x, k) => k === i ? { ...x, ...p } : x) })
  const ciclar = (i: number, j: number) => setLinha(i, { valores: c.colunas.map((_, k) => k === j ? proxima(c.linhas[i]!.valores[k] ?? 'na') : c.linhas[i]!.valores[k] ?? 'na') })

  const addColuna = () => aoMudar({ ...c, colunas: [...c.colunas, { nome: '' }], linhas: c.linhas.map(l => ({ ...l, valores: [...l.valores, 'na'] })) })
  const remColuna = (j: number) => {
    const d = c.destaque
    aoMudar({
      ...c, colunas: c.colunas.filter((_, k) => k !== j), linhas: c.linhas.map(l => ({ ...l, valores: l.valores.filter((_, k) => k !== j) })),
      destaque: d === undefined || d === j ? undefined : d > j ? d - 1 : d,
    })
  }
  const addLinha = () => aoMudar({ ...c, linhas: [...c.linhas, { funcionalidade: '', valores: c.colunas.map(() => 'na') }] })
  const remLinha = (i: number) => aoMudar({ ...c, linhas: c.linhas.filter((_, k) => k !== i) })

  return (
    <div className="cmp cmp-ed">
      <LegendaComparativo />
      <div className="cmp-rolagem">
        <table className="cmp-tabela">
          <thead>
            <tr>
              <th className="cmp-func" scope="col">Funcionalidade</th>
              {c.colunas.map((col, j) => (
                <th key={j} scope="col" className={ref(j)}>
                  <input value={col.nome} onChange={e => setCol(j, { nome: e.target.value })} placeholder="Produto" aria-label={`Nome da coluna ${j + 1}`} />
                  <input className="sub" value={col.sub ?? ''} onChange={e => setCol(j, { sub: e.target.value || undefined })} placeholder="Detalhe" aria-label={`Detalhe da coluna ${j + 1}`} />
                  <button type="button" className="cmp-rem" disabled={c.colunas.length <= 1} title="Remover coluna" aria-label={`Remover coluna ${col.nome || j + 1}`} onClick={() => remColuna(j)}><X size={11} weight="bold" /></button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.linhas.map((l, i) => (
              <tr key={i}>
                <th scope="row" className="cmp-func">
                  <span className="n">{i + 1}.</span>
                  <input value={l.funcionalidade} onChange={e => setLinha(i, { funcionalidade: e.target.value })} placeholder="Funcionalidade" aria-label={`Funcionalidade ${i + 1}`} />
                  <button type="button" className="cmp-rem" disabled={c.linhas.length <= 1} title="Remover linha" aria-label={`Remover linha ${i + 1}`} onClick={() => remLinha(i)}><X size={11} weight="bold" /></button>
                </th>
                {c.colunas.map((col, j) => {
                  const v = avaliacao(l.valores[j] ?? 'na')
                  return (
                    <td key={j} className={ref(j)}>
                      <button type="button" className="cmp-ciclo" onClick={() => ciclar(i, j)} title="Clique para trocar a avaliação"
                        aria-label={`${l.funcionalidade || `Linha ${i + 1}`} em ${col.nome || `coluna ${j + 1}`}: ${v.legenda}. Clique para trocar.`}>
                        <Selo a={v.id} />
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="cmp-func">{ROTULO_PONTOS}</th>
              {c.colunas.map((_, j) => <td key={j} className={ref(j)}><Pontos c={c} col={j} /></td>)}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="bl-tabela-acoes">
        <button type="button" onClick={addLinha}><Plus size={12} />Funcionalidade</button>
        <button type="button" onClick={addColuna}><Plus size={12} />Produto</button>
        <button type="button" disabled={c.linhas.length <= 1} onClick={() => remLinha(c.linhas.length - 1)}><Minus size={12} />Funcionalidade</button>
        <label className="cmp-ref-campo">Coluna de referência
          <select value={c.destaque ?? ''} onChange={e => aoMudar({ ...c, destaque: e.target.value === '' ? undefined : Number(e.target.value) })}>
            <option value="">Nenhuma</option>
            {c.colunas.map((col, j) => <option key={j} value={j}>{col.nome || `Coluna ${j + 1}`}</option>)}
          </select>
        </label>
      </div>
    </div>
  )
}
