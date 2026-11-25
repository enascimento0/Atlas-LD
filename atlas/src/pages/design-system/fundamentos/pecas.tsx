import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { lerToken, useCopiar, usePreferencias } from '../../../lib/preferencias'

/** Rola até a âncora (#id) da URL quando a página abre. */
export function useAncora() {
  const { hash } = useLocation()
  useEffect(() => { if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80) }, [hash])
}

/** Grade de cores por token, lidas ao vivo (mudam com modo e tema). Clique copia `var(--token)`. */
export function Swatches({ itens }: { itens: [string, string][] }) {
  usePreferencias() // re-renderiza quando o modo/tema muda
  const copiar = useCopiar()
  return (
    <div className="grid g4">
      {itens.map(([nome, uso]) => (
        <button key={nome} className="sw" onClick={() => copiar(`var(${nome})`, nome)} title="Clique para copiar o token">
          <span className="sw-cor" style={{ background: `var(${nome})` }}><span className="copy-hint">copiar</span></span>
          <div className="meta"><div className="nome">{nome}</div><div className="hex">{lerToken(nome)}</div><div className="uso">{uso}</div></div>
        </button>
      ))}
    </div>
  )
}

export const Mini = ({ arr }: { arr: string[] }) => <>{arr.map(h => <span key={h} className="mini-sw" style={{ background: h }} title={h} />)}<span className="mono" style={{ color: 'var(--c-neutral)' }}>{arr.join(' · ')}</span></>

/** Tabela simples de documentação (2 ou 3 colunas). */
export function Tabela({ cab, linhas }: { cab: string[]; linhas: (string | React.ReactNode)[][] }) {
  return (
    <div className="tw-doc"><table className="dt">
      <thead><tr>{cab.map(c => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>{linhas.map((l, i) => <tr key={i}>{l.map((c, k) => <td key={k}>{typeof c === 'string' && k === 0 ? <b>{c}</b> : c}</td>)}</tr>)}</tbody>
    </table></div>
  )
}
