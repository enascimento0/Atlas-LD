import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarBlank, CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import {
  LARGURA_UM_MES, MESES, MesDoCalendario, hojeIso, somarMeses, type MesVisivel,
} from './SeletorDePeriodo'

// Data única no mesmo visual do SeletorDePeriodo: o campo de data de sempre (aceita digitação), mas
// o clique abre um calendário de um mês. Um clique no dia grava e fecha; o rodapé mostra a data por
// extenso e as opções Limpar e Hoje (as mesmas do calendário nativo). Esc ou clique fora fecham sem
// alterar. Data em ISO (AAAA-MM-DD); "" = vazio.

const DIAS_DA_SEMANA_POR_EXTENSO = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

function porExtenso(valor: string): string {
  const [a, m, d] = valor.split('-').map(Number)
  return `${DIAS_DA_SEMANA_POR_EXTENSO[new Date(a, m - 1, d).getDay()]}, ${d} de ${MESES[m - 1].toLowerCase()} de ${a}`
}

function mesDe(valor: string): MesVisivel {
  const [a, m] = (valor || hojeIso()).split('-').map(Number)
  return { ano: a, mes: m - 1 }
}

export function SeletorDeData({
  valor, onChange, className, ariaLabel, id, disabled, readOnly, min, max, inputClassName, compacto, title, onBlur, onEscolher,
}: {
  valor: string
  onChange: (valor: string) => void
  className?: string
  ariaLabel?: string
  id?: string
  disabled?: boolean
  readOnly?: boolean
  /** Limites (ISO): os dias fora deles ficam desabilitados no calendário. */
  min?: string
  max?: string
  /** Classe extra no <input> (ex.: mf-input-error). */
  inputClassName?: string
  /** 28px de altura — campo dentro de linha de tabela. */
  compacto?: boolean
  title?: string
  onBlur?: () => void
  /** Escolha feita no calendário (dia, Limpar ou Hoje) — não dispara enquanto se digita. */
  onEscolher?: (valor: string) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [visivel, setVisivel] = useState<MesVisivel>(() => mesDe(valor))
  const [posicao, setPosicao] = useState<{ top: number; left: number } | null>(null)
  const raizRef = useRef<HTMLDivElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)

  function abrir() {
    if (disabled || readOnly) return
    if (!aberto) setVisivel(mesDe(valor))
    setAberto(true)
  }
  function escolher(dia: string) {
    onChange(dia)
    onEscolher?.(dia)
    setAberto(false)
  }

  // Posição fixa abaixo do campo, sem passar da borda direita da janela.
  useEffect(() => {
    if (!aberto) return
    function atualizar() {
      const r = raizRef.current?.getBoundingClientRect()
      if (!r) return
      setPosicao({ top: r.bottom + 6, left: Math.max(12, Math.min(r.left, window.innerWidth - LARGURA_UM_MES - 12)) })
    }
    atualizar()
    window.addEventListener('scroll', atualizar, true)
    window.addEventListener('resize', atualizar)
    return () => {
      window.removeEventListener('scroll', atualizar, true)
      window.removeEventListener('resize', atualizar)
    }
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      const alvo = e.target as Node
      if (raizRef.current?.contains(alvo) || painelRef.current?.contains(alvo)) return
      setAberto(false)
    }
    // Esc fecha só o calendário, não o drawer em volta.
    function aoTeclar(e: KeyboardEvent) { if (e.key === 'Escape') { e.stopPropagation(); setAberto(false) } }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar, true)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar, true)
    }
  }, [aberto])

  return (
    <div ref={raizRef} className={`mf-periodo mf-data${compacto ? ' mf-data--compacta' : ''}${className ? ` ${className}` : ''}`}>
      <span className={`mf-periodo-campo${aberto ? ' ativo' : ''}`}>
        <input
          type="date" id={id} aria-label={ariaLabel} title={title} value={valor} className={inputClassName}
          disabled={disabled} readOnly={readOnly} min={min} max={max}
          onClick={abrir} onFocus={abrir} onBlur={onBlur}
          onChange={e => onChange(e.target.value)}
        />
        <CalendarBlank size={14} />
      </span>

      {aberto && posicao && createPortal(
        <div ref={painelRef} className="mf-periodo-pop" role="dialog" aria-label="Escolher data" style={{ top: posicao.top, left: posicao.left }}>
          <div className="mf-periodo-meses">
            <button type="button" className="mf-periodo-nav mf-periodo-nav--ant" onClick={() => setVisivel(v => somarMeses(v, -1))} aria-label="Mês anterior">
              <CaretLeft size={14} weight="bold" />
            </button>
            {/* Início e fim iguais: o dia escolhido aparece destacado, sem faixa de intervalo. */}
            <MesDoCalendario
              visivel={visivel} rascunho={{ de: valor, ate: valor }} previa={null}
              onEscolher={escolher} onPassar={() => {}} min={min} max={max}
            />
            <button type="button" className="mf-periodo-nav mf-periodo-nav--prox" onClick={() => setVisivel(v => somarMeses(v, 1))} aria-label="Próximo mês">
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
          <div className="mf-periodo-rodape mf-data-rodape">
            <span className="mf-periodo-resumo">{valor ? porExtenso(valor) : 'Nenhuma data escolhida'}</span>
            <div className="mf-data-botoes">
              <button type="button" className="mf-btn-clear" onClick={() => escolher('')}><X size={14} /> Limpar</button>
              <button type="button" className="mf-btn-search" onClick={() => escolher(hojeIso())}
                disabled={(!!min && hojeIso() < min) || (!!max && hojeIso() > max)}>Hoje</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
