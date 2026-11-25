import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CaretLeft, CaretRight, List, MagnifyingGlass, Moon, SignOut, Sun } from '@phosphor-icons/react'
import { NAV } from '../../lib/navegacao'
import { usePreferencias } from '../../lib/preferencias'
import { sair, useUsuario } from '../../lib/auth'
import { eAdmin, ROTULO_PERFIL } from '../../lib/permissoes'
import { iniciais } from '../../lib/formatar'
import { MenuSuspenso } from '../ui/Dialogos'
const BuscaGlobal = lazy(() => import('./BuscaGlobal').then(m => ({ default: m.BuscaGlobal })))

const GRUPO_ADMIN = 'Administração'

function LogoAtlas({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17M12 3.5c3 2.6 3 14.4 0 17M12 3.5c-3 2.6-3 14.4 0 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const { modo, setModo } = usePreferencias()
  const usuario = useUsuario()
  const [recolhida, setRecolhida] = useState(() => { try { return localStorage.getItem('atlas.sb') === '1' } catch { return false } })
  const [mobile, setMobile] = useState(false)
  const [busca, setBusca] = useState(false)
  const [tip, setTip] = useState<{ x: number; y: number; t: string } | null>(null)
  const loc = useLocation()

  useEffect(() => { setMobile(false); document.querySelector('.conteudo')?.scrollTo({ top: 0 }) }, [loc.pathname])
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setBusca(b => !b) }    }
    addEventListener('keydown', h); return () => removeEventListener('keydown', h)
  }, [])
  const alternar = () => { setRecolhida(r => { try { localStorage.setItem('atlas.sb', r ? '0' : '1') } catch { /* */ } return !r }) }

  const itens = NAV.filter(n => !n.somenteAdmin || eAdmin(usuario))
  const grupos = [...new Set(itens.map(n => n.grupo))].filter(g => g !== GRUPO_ADMIN)
  const itensAdmin = itens.filter(n => n.grupo === GRUPO_ADMIN)
  const renderItem = (n: typeof itens[number]) => (
    <NavLink key={n.rota} to={n.rota} end={n.rota === '/'} className="sb-item"
      onMouseEnter={e => { if (recolhida) { const r = e.currentTarget.getBoundingClientRect(); setTip({ x: r.right + 10, y: r.top + r.height / 2 - 13, t: n.rotulo }) } }}
      onMouseLeave={() => setTip(null)}>
      {({ isActive }) => (<><n.icone size={16} weight={isActive ? 'fill' : 'regular'} /><span>{n.rotulo}</span>{n.tag && <em className="tag">{n.tag}</em>}</>)}
    </NavLink>
  )
  return (
    <div className="app">
      {mobile && <div className="sb-ov" onClick={() => setMobile(false)} />}
      <aside className={`sb ${recolhida ? 'recolhida' : ''} ${mobile ? 'aberta-mobile' : ''}`} aria-label="Navegação principal">
        <NavLink to="/" className="sb-logo">
          <span className="sb-logo-mark"><LogoAtlas /></span>
          <span className="sb-logo-txt">Atlas<small>LDSOFT · Produtos</small></span>
        </NavLink>
        <button className="sb-toggle" onClick={alternar} aria-label={recolhida ? 'Expandir menu' : 'Recolher menu'}>
          {recolhida ? <CaretRight size={12} weight="bold" /> : <CaretLeft size={12} weight="bold" />}
        </button>
        <nav className="sb-nav">
          {grupos.map(g => (
            <div key={g}>
              <div className="sb-grupo">{g}</div><div className="sb-grupo-sep" />
              {itens.filter(n => n.grupo === g).map(renderItem)}
            </div>
          ))}
        </nav>
        {itensAdmin.length > 0 && (
          <div className="sb-admin">
            <div className="sb-grupo">{GRUPO_ADMIN}</div><div className="sb-grupo-sep" />
            {itensAdmin.map(renderItem)}
          </div>
        )}
        <div className="sb-rodape">ATLAS · LDSOFT © 2026</div>
      </aside>
      {tip && <div className="sb-tip" style={{ left: tip.x, top: tip.y }}>{tip.t}</div>}

      <div className="main">
        <header className="tb">
          <button className="tb-menu" onClick={() => setMobile(true)} aria-label="Abrir menu"><List size={18} /></button>
          <button className="tb-busca" onClick={() => setBusca(true)}>
            <MagnifyingGlass size={14} /><span className="txt">Buscar no Atlas: componentes, cores, ícones…</span><kbd>Ctrl K</kbd>
          </button>
          <div className="tb-dir">
            <div className="seg" role="group" aria-label="Modo">
              <button className={modo === 'claro' ? 'on' : ''} onClick={() => setModo('claro')} aria-label="Modo claro"><Sun size={14} /></button>
              <button className={modo === 'escuro' ? 'on' : ''} onClick={() => setModo('escuro')} aria-label="Modo escuro"><Moon size={14} /></button>
            </div>
            <MenuSuspenso gatilho={abrir => (
              <button className="tb-av" onClick={abrir} aria-label="Menu do usuário" aria-haspopup="menu" title={usuario?.nome}>{iniciais(usuario?.nome ?? 'LD')}</button>
            )}>
              {fechar => (<>
                <div className="pac-quem"><b>{usuario?.nome}</b><span>{usuario?.email}</span><em>{usuario ? ROTULO_PERFIL[usuario.perfil] : ''}</em></div>
                <div className="pac-sep" />
                <div className="pac-item perigo" role="menuitem" tabIndex={0} onClick={() => { fechar(); sair() }} onKeyDown={e => { if (e.key === 'Enter') { fechar(); sair() } }}><SignOut size={16} />Sair</div>
              </>)}
            </MenuSuspenso>
          </div>
        </header>
        <main className="conteudo">{children}</main>
      </div>
      {busca && <Suspense fallback={<div className="cmd-ov" />}><BuscaGlobal fechar={() => setBusca(false)} /></Suspense>}
    </div>
  )
}
