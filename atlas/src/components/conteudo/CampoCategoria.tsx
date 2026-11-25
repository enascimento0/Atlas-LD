/* Campo de categoria no padrão Autocomplete do Design System: sugere enquanto digita e, com o campo vazio,
   já mostra as 3 categorias usadas mais recentemente na área. Aceita uma categoria nova (opção "Criar").
   Pegadinhas do padrão: escolher com onMouseDown, onBlur com atraso e Enter interceptado. */
import { useMemo, useState } from 'react'
import { ClockCounterClockwise, Plus, Tag } from '@phosphor-icons/react'
import { categoriasDaArea, listarPaginas } from '../../lib/api'
import type { Area } from '../../lib/tipos'

const RECENTES = 3

export function CampoCategoria({ area, valor, onChange }: { area: Area; valor: string; onChange: (v: string) => void }) {
  const [aberto, setAberto] = useState(false)
  const [sel, setSel] = useState(0)

  const todas = categoriasDaArea(area)
  const recentes = useMemo(() => {
    const ordem = [...listarPaginas(area)].sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
    return [...new Set(ordem.map(p => p.categoria).filter(Boolean))].slice(0, RECENTES)
  }, [area])

  const t = valor.trim().toLowerCase()
  const filtradas = t ? todas.filter(c => c.toLowerCase().includes(t)) : []
  const existe = todas.some(c => c.toLowerCase() === t)
  // Opções na ordem em que aparecem (para navegar com as setas)
  const opcoes: { rotulo: string; novo?: boolean; recente?: boolean }[] = t
    ? [...filtradas.map(c => ({ rotulo: c })), ...(!existe ? [{ rotulo: valor.trim(), novo: true }] : [])]
    : recentes.map(c => ({ rotulo: c, recente: true }))

  const escolher = (v: string) => { onChange(v); setAberto(false) }

  return (
    <div className="ac" style={{ position: 'relative' }}>
      <input
        className="campo" value={valor} placeholder="Escolha ou digite uma nova" maxLength={60} aria-label="Categoria"
        role="combobox" aria-expanded={aberto} aria-autocomplete="list"
        onChange={e => { onChange(e.target.value); setAberto(true); setSel(0) }}
        onFocus={() => { setAberto(true); setSel(0) }}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        onKeyDown={e => {
          if (!aberto || !opcoes.length) return
          if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => (s + 1) % opcoes.length) }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => (s - 1 + opcoes.length) % opcoes.length) }
          else if (e.key === 'Enter') { e.preventDefault(); escolher(opcoes[sel]!.rotulo) }
          else if (e.key === 'Escape') setAberto(false)
        }}
      />
      {aberto && (opcoes.length > 0 || !t) && (
        <div className="ac-lista" role="listbox">
          {!t && <div className="ac-grupo">{recentes.length ? 'Usadas recentemente' : 'Nenhuma categoria usada ainda'}</div>}
          {opcoes.map((o, i) => (
            <div key={o.rotulo + (o.novo ? '+' : '')} role="option" aria-selected={i === sel} className={`ac-item ${i === sel ? 'on' : ''}`}
              onMouseEnter={() => setSel(i)} onMouseDown={() => escolher(o.rotulo)}>
              {o.novo ? <Plus size={14} /> : o.recente ? <ClockCounterClockwise size={14} /> : <Tag size={14} />}
              {o.novo ? <span>Criar “<b>{o.rotulo}</b>”</span> : <span>{o.rotulo}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
