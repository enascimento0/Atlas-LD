import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarBlank, CaretLeft, CaretRight, Check, X } from '@phosphor-icons/react'

// Período De → Até: os dois campos de data de sempre (aceitam digitação), mas o clique abre um
// calendário de dois meses em que o primeiro clique marca o início e o segundo o fim — o intervalo
// fica destacado e, ao escolher o fim, a dica mostra quantos dias o período tem. "Confirmar"
// aplica; Esc, Cancelar ou clique fora descartam. Datas em ISO (AAAA-MM-DD); "" = vazio.

export interface Periodo { de: string; ate: string }

export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
// Largura do painel (2 meses de 7 × 36px + vão + padding) — para não sair da tela à direita.
const LARGURA_DOIS_MESES = 2 * 7 * 36 + 32 + 40
export const LARGURA_UM_MES = 7 * 36 + 40

export function iso(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}
export function hojeIso(): string {
  const d = new Date()
  return iso(d.getFullYear(), d.getMonth(), d.getDate())
}
export function formatar(valor: string): string {
  const [a, m, d] = valor.split('-')
  return `${d}/${m}/${a}`
}
function diasEntre(de: string, ate: string): number {
  const [a1, m1, d1] = de.split('-').map(Number)
  const [a2, m2, d2] = ate.split('-').map(Number)
  return Math.round((new Date(a2, m2 - 1, d2).getTime() - new Date(a1, m1 - 1, d1).getTime()) / 86_400_000) + 1
}
function plural(n: number): string {
  return `${n} ${n === 1 ? 'dia' : 'dias'}`
}

export type MesVisivel = { ano: number; mes: number }

export function somarMeses({ ano, mes }: MesVisivel, n: number): MesVisivel {
  const d = new Date(ano, mes + n, 1)
  return { ano: d.getFullYear(), mes: d.getMonth() }
}

/** Mês inicial da esquerda: o mês anterior ao do "Até" (o "Até" fica à direita), ou o do "De". */
function mesInicial(p: Periodo, meses: number): MesVisivel {
  const base = p.ate || p.de || hojeIso()
  const [a, m] = base.split('-').map(Number)
  return somarMeses({ ano: a, mes: m - 1 }, meses === 2 && p.ate ? -1 : 0)
}

export function MesDoCalendario({ visivel, rascunho, previa, onEscolher, onPassar, min, max }: {
  visivel: MesVisivel
  rascunho: Periodo
  /** Fim provisório enquanto o mouse passa (escolhendo o fim). */
  previa: string | null
  onEscolher: (dia: string) => void
  onPassar: (dia: string | null) => void
  /** Limites (ISO): os dias fora deles ficam desabilitados. */
  min?: string
  max?: string
}) {
  const { ano, mes } = visivel
  const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay()
  const totalDeDias = new Date(ano, mes + 1, 0).getDate()
  const hoje = hojeIso()
  // Escolhendo o fim, o dia sob o mouse vale como fim provisório (mostra a faixa e a dica).
  const fim = (previa && previa >= rascunho.de ? previa : '') || rascunho.ate
  const inicio = rascunho.de

  return (
    <div>
      <div className="mf-periodo-mes-tit">{MESES[mes]} de {ano}</div>
      <div className="mf-periodo-grade" onMouseLeave={() => onPassar(null)}>
        {DIAS_DA_SEMANA.map(d => <span key={d} className="mf-periodo-sem">{d}</span>)}
        {Array.from({ length: primeiroDiaDaSemana }, (_, i) => <span key={`v${i}`} />)}
        {Array.from({ length: totalDeDias }, (_, i) => {
          const dia = iso(ano, mes, i + 1)
          const coluna = (primeiroDiaDaSemana + i) % 7
          const ehInicio = dia === inicio
          const ehFim = !!fim && dia === fim && fim >= inicio
          const noIntervalo = !!inicio && !!fim && dia > inicio && dia < fim
          const classes = ['mf-periodo-dia']
          if (ehInicio || ehFim) classes.push('ponta')
          if (noIntervalo) classes.push('no-intervalo')
          // Faixa do intervalo arredondada no começo e no fim de cada semana.
          if (noIntervalo && (coluna === 0 || i === 0)) classes.push('borda-esq')
          if (noIntervalo && (coluna === 6 || i === totalDeDias - 1)) classes.push('borda-dir')
          if (dia === hoje) classes.push('hoje')
          const mostrarDica = !!inicio && previa === dia && dia >= inicio
          const foraDoLimite = (!!min && dia < min) || (!!max && dia > max)
          return (
            <button
              key={dia} type="button" className={classes.join(' ')} disabled={foraDoLimite}
              onClick={() => onEscolher(dia)}
              onMouseEnter={() => onPassar(dia)}
              aria-label={formatar(dia)} aria-pressed={ehInicio || ehFim}
            >
              {i + 1}
              {mostrarDica && <span className="mf-periodo-dica">{plural(diasEntre(inicio, dia))}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function SeletorDePeriodo({ valor, onChange, className, disabled, min, max, ariaLabel, inputClassName }: {
  valor: Periodo
  onChange: (p: Periodo) => void
  className?: string
  disabled?: boolean
  /** Limites (ISO) do período inteiro. */
  min?: string
  max?: string
  /** Prefixo dos rótulos acessíveis: "Data de Registro de" / "… até". */
  ariaLabel?: string
  /** Classe extra nos dois <input> (ex.: mf-input-error). */
  inputClassName?: string
}) {
  const [aberto, setAberto] = useState(false)
  // Qual ponta o próximo clique no calendário define.
  const [proximo, setProximo] = useState<'de' | 'ate'>('de')
  const [rascunho, setRascunho] = useState<Periodo>(valor)
  const [previa, setPrevia] = useState<string | null>(null)
  const [esquerda, setEsquerda] = useState<MesVisivel>(() => mesInicial(valor, 2))
  const [posicao, setPosicao] = useState<{ top: number; left: number } | null>(null)
  const [meses, setMeses] = useState(2)
  const raizRef = useRef<HTMLDivElement>(null)
  const painelRef = useRef<HTMLDivElement>(null)

  function abrir(ponta: 'de' | 'ate') {
    if (disabled) return
    const qtd = window.innerWidth < 720 ? 1 : 2
    setMeses(qtd)
    if (!aberto) {
      setRascunho(valor)
      setEsquerda(mesInicial(valor, qtd))
    }
    setProximo(ponta)
    setPrevia(null)
    setAberto(true)
  }
  function fechar() {
    setAberto(false)
    setPrevia(null)
  }

  // Posição fixa abaixo dos campos, sem passar da borda direita da janela.
  useEffect(() => {
    if (!aberto) return
    function atualizar() {
      const r = raizRef.current?.getBoundingClientRect()
      if (!r) return
      const largura = meses === 2 ? LARGURA_DOIS_MESES : LARGURA_UM_MES
      setPosicao({ top: r.bottom + 6, left: Math.max(12, Math.min(r.left, window.innerWidth - largura - 12)) })
    }
    atualizar()
    window.addEventListener('scroll', atualizar, true)
    window.addEventListener('resize', atualizar)
    return () => {
      window.removeEventListener('scroll', atualizar, true)
      window.removeEventListener('resize', atualizar)
    }
  }, [aberto, meses])

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(e: MouseEvent) {
      const alvo = e.target as Node
      if (raizRef.current?.contains(alvo) || painelRef.current?.contains(alvo)) return
      fechar()
    }
    function aoTeclar(e: KeyboardEvent) { if (e.key === 'Escape') fechar() }
    document.addEventListener('mousedown', aoClicarFora)
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('mousedown', aoClicarFora)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  function escolher(dia: string) {
    if (proximo === 'de' || !rascunho.de || dia < rascunho.de) {
      // Novo início: o fim é escolhido de novo no próximo clique.
      setRascunho({ de: dia, ate: '' })
      setProximo('ate')
    } else {
      setRascunho(r => ({ ...r, ate: dia }))
      setProximo('de')
    }
    setPrevia(null)
  }

  function confirmar() {
    if (!rascunho.de || !rascunho.ate) return
    onChange(rascunho)
    fechar()
  }

  const ativo = aberto ? proximo : null
  const resumo = rascunho.de && rascunho.ate
    ? `${formatar(rascunho.de)} → ${formatar(rascunho.ate)} · ${plural(diasEntre(rascunho.de, rascunho.ate))}`
    : rascunho.de ? `${formatar(rascunho.de)} → escolha a data final` : 'Escolha a data inicial'

  return (
    <div ref={raizRef} className={`mf-periodo${className ? ` ${className}` : ''}`}>
      <span className={`mf-periodo-campo${ativo === 'de' ? ' ativo' : ''}`}>
        <input
          type="date" aria-label={`${ariaLabel ?? 'Período'} de`} value={valor.de} disabled={disabled} className={inputClassName}
          min={min} max={valor.ate || max}
          onClick={() => abrir('de')} onFocus={() => abrir('de')}
          onChange={e => onChange({ ...valor, de: e.target.value })}
        />
        <CalendarBlank size={14} />
      </span>
      <span style={{ color: 'var(--c-neutral)', fontSize: 11 }}>→</span>
      <span className={`mf-periodo-campo${ativo === 'ate' ? ' ativo' : ''}`}>
        <input
          type="date" aria-label={`${ariaLabel ?? 'Período'} até`} value={valor.ate} disabled={disabled} className={inputClassName}
          min={valor.de || min} max={max}
          onClick={() => abrir('ate')} onFocus={() => abrir('ate')}
          onChange={e => onChange({ ...valor, ate: e.target.value })}
        />
        <CalendarBlank size={14} />
      </span>

      {aberto && posicao && createPortal(
        <div ref={painelRef} className="mf-periodo-pop" role="dialog" aria-label="Escolher período" style={{ top: posicao.top, left: posicao.left }}>
          <div className="mf-periodo-meses">
            <button type="button" className="mf-periodo-nav mf-periodo-nav--ant" onClick={() => setEsquerda(e => somarMeses(e, -1))} aria-label="Mês anterior">
              <CaretLeft size={14} weight="bold" />
            </button>
            {Array.from({ length: meses }, (_, i) => (
              <MesDoCalendario
                key={i} visivel={somarMeses(esquerda, i)} rascunho={rascunho}
                previa={proximo === 'ate' ? previa : null}
                onEscolher={escolher} onPassar={setPrevia} min={min} max={max}
              />
            ))}
            <button type="button" className="mf-periodo-nav mf-periodo-nav--prox" onClick={() => setEsquerda(e => somarMeses(e, 1))} aria-label="Próximo mês">
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
          <div className="mf-periodo-rodape">
            <span className="mf-periodo-resumo">{resumo}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="mf-btn-clear" onClick={fechar}><X size={14} /> Cancelar</button>
              <button type="button" className="mf-btn-search" onClick={confirmar} disabled={!rascunho.de || !rascunho.ate}>
                <Check size={14} /> Confirmar
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
