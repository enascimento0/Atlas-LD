import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CaretRight, Copy, Check } from '@phosphor-icons/react'
import { useCopiar } from '../../lib/preferencias'

export function Cabecalho({ trilha, titulo, acoes, voltar }: { trilha: { rotulo: string; rota?: string }[]; titulo: string; acoes?: ReactNode; voltar?: { rotulo: string; aoClicar: () => void } }) {
  return (
    <div className="page-hdr">
      <div>
        <div className="crumb">
          {trilha.map((t, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <CaretRight size={10} />}
              {t.rota ? <Link to={t.rota}>{t.rotulo}</Link> : <span>{t.rotulo}</span>}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {voltar && <button type="button" className="icb" onClick={voltar.aoClicar} title={voltar.rotulo} aria-label={voltar.rotulo} style={{ flexShrink: 0 }}><ArrowLeft size={20} /></button>}
          <h1 className="page-title">{titulo}</h1>
        </div>
      </div>
      {acoes}
    </div>
  )
}

export function Secao({ id, num, titulo, lead, children }: { id: string; num?: string; titulo: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section className="sec" id={id}>
      <h2>{num && <span className="num">{num}</span>}{titulo}</h2>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  )
}

export interface ItemToc { id: string; titulo: string; filhos?: ItemToc[]; termos?: string }

/** Sumário lateral com destaque da seção visível (scroll-spy no container .conteudo) */
export function Sumario({ itens }: { itens: ItemToc[] }) {
  const [ativo, setAtivo] = useState(itens[0]?.id)
  useEffect(() => {
    const cont = document.querySelector('.conteudo')
    if (!cont) return
    const ids = itens.flatMap(i => [i.id, ...(i.filhos ?? []).map(f => f.id)])
    const h = () => {
      let atual = ids[0]
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 160) atual = id }
      setAtivo(atual)
    }
    cont.addEventListener('scroll', h, { passive: true }); h()
    return () => cont.removeEventListener('scroll', h)
  }, [itens])
  const ir = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <nav className="toc" aria-label="Nesta página">
      <div className="toc-tit">Nesta página</div>
      {itens.map(i => (
        <div key={i.id}>
          <a className={ativo === i.id ? 'ativo' : ''} onClick={() => ir(i.id)}>{i.titulo}</a>
          {i.filhos?.map(f => <a key={f.id} className={`sub ${ativo === f.id ? 'ativo' : ''}`} onClick={() => ir(f.id)}>{f.titulo}</a>)}
        </div>
      ))}
    </nav>
  )
}

export function BotaoCopiar({ texto, rotulo, children }: { texto: string; rotulo?: string; children?: ReactNode }) {
  const copiar = useCopiar()
  const [ok, setOk] = useState(false)
  return (
    <button className={`copiar ${ok ? 'ok' : ''}`} onClick={e => { e.stopPropagation(); copiar(texto, rotulo); setOk(true); setTimeout(() => setOk(false), 1400) }}>
      {ok ? <Check size={12} weight="bold" /> : <Copy size={12} />}{children ?? 'Copiar'}
    </button>
  )
}

/** Bloco de código copiável. Código longo (> 14 linhas) abre recolhido, com opção de expandir:
 *  o objetivo é copiar e colar, não ler uma barra de código gigante. */
const LINHAS_RECOLHIDO = 14
export function Codigo({ children }: { children: string }) {
  const longo = children.split('\n').length > LINHAS_RECOLHIDO
  const [aberto, setAberto] = useState(false)
  return (
    <div className={`codigo-wrap${longo && !aberto ? ' recolhido' : ''}`}>
      <pre className="codigo"><BotaoCopiar texto={children} rotulo="Código" />{children}</pre>
      {longo && (
        <button type="button" className="codigo-toggle" onClick={() => setAberto(a => !a)}>
          {aberto ? 'Recolher código' : `Expandir código (${children.split('\n').length} linhas)`}
        </button>
      )}
    </div>
  )
}
