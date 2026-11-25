import { Link } from 'react-router-dom'
import * as Ph from '@phosphor-icons/react'
import { NAV } from '../lib/navegacao'
import { useDadosAtlas } from '../lib/api'
import { relativo } from '../lib/formatar'
import { listarNovidades } from '../lib/novidades'

export function Inicio({ abrirBusca }: { abrirBusca?: () => void }) {
  useDadosAtlas()
  const todasNovidades = listarNovidades()
  const recentes = todasNovidades.slice(0, 5)
  // o que já foi liberado vem primeiro
  const secoes = NAV.filter(n => n.grupo === 'Conteúdo').sort((a, b) => Number(!!a.tag) - Number(!!b.tag))
  return (
    <div className="pagina">
      <div className="hero inicio-hero">
        <svg className="hero-art" width="420" height="420" viewBox="0 0 24 24" fill="none" style={{ opacity: .1, right: -60, top: -80 }}><circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth=".35" /><path d="M3 12h18M12 3c3.2 2.7 3.2 15.3 0 18M12 3c-3.2 2.7-3.2 15.3 0 18M4.5 7.5h15M4.5 16.5h15" stroke="#fff" strokeWidth=".3" /></svg>
        <div className="eyebrow">LDSOFT · Time de Produtos</div>
        <h2 style={{ fontSize: 34 }}>Bem-vindo ao Atlas</h2>
        <p>O lugar único para documentação, design system e benchmarks de todos os produtos da LDSOFT.<br />Comece pela busca ou escolha uma seção.</p>
        <button className="inicio-busca" onClick={abrirBusca ?? (() => dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true })))}>
          <Ph.MagnifyingGlass size={18} /><span>O que você procura? Ex.: botão, cor de sucesso, ícone de lixeira…</span><kbd className="kbd">Ctrl K</kbd>
        </button>
      </div>

      <div className="inicio-cols">
      <div>
      <h3 className="h3">Seções</h3>
      <div className="atalhos grandes">
        {secoes.map(s => s.tag ? (
          <div key={s.rota} className="atalho off" aria-disabled="true">
            <span className="ic"><s.icone size={22} /></span>
            <div><b>{s.rotulo}</b><span>{s.descricao}</span></div>
            <small>Em breve</small>
          </div>
        ) : (
          <Link key={s.rota} to={s.rota} className="atalho">
            <span className="ic"><s.icone size={22} /></span>
            <div><b>{s.rotulo}</b><span>{s.descricao}</span></div>
            <Ph.ArrowRight size={15} className="seta" />
          </Link>
        ))}
      </div>


      </div>

      <aside>
      <h3 className="h3">Últimas atualizações</h3>
      <div className="card" style={{ margin: 0 }}>
          {recentes.map(n => (
            <Link key={n.id} to={n.rota} className="novidade novidade-link">
              <span className="ic"><n.icone size={16} /></span>
              <div><b>{n.titulo}</b><span>{n.detalhe}</span></div>
              <small>{relativo(n.em)}</small>
            </Link>
          ))}
          {todasNovidades.length > 0 && <div className="inicio-ver-mais"><Link to="/novidades" className="inicio-ver-mais-link">Ver mais<Ph.ArrowRight size={14} /></Link></div>}
      </div>
      </aside>
      </div>
    </div>
  )
}
