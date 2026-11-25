import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from '@phosphor-icons/react'
import { Cabecalho } from '../components/ui/Doc'
import { useDadosAtlas } from '../lib/api'
import { PRODUTOS } from '../lib/areas'
import { dataCurta, relativo } from '../lib/formatar'
import { listarNovidades } from '../lib/novidades'

const ROTULO_TIPO = { produto: 'Novo produto', conteudo: 'Conteúdo', 'design-system': 'Design System' } as const

export default function Novidades() {
  useDadosAtlas()
  const [produto, setProduto] = useState('')
  const todas = listarNovidades()
  const contagem = useMemo(() => {
    const c = new Map<string, number>(PRODUTOS.map(x => [x, 0]))
    todas.forEach(n => { if (n.produto) c.set(n.produto, (c.get(n.produto) ?? 0) + 1) })
    return [...c.entries()]
  }, [todas])
  const lista = todas.filter(n => !produto || n.produto === produto)

  return (
    <div className="pagina">
      <Cabecalho trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: 'Novidades' }]} titulo="Novidades" />
      <p className="note" style={{ margin: '-6px 0 16px', fontSize: 13 }}>Produtos incluídos, conteúdos publicados e atualizações do Atlas.</p>

      <div className="cat-filtros" style={{ marginBottom: 16 }} role="group" aria-label="Filtrar por produto">
        <button className={`chip compacto ${!produto ? 'on' : ''}`} onClick={() => setProduto('')}>Tudo<span style={{ opacity: .7 }}>{todas.length}</span></button>
        {contagem.filter(([, n]) => n > 0).map(([x, n]) => (
          <button key={x} className={`chip compacto ${produto === x ? 'on' : ''}`} onClick={() => setProduto(produto === x ? '' : x)}>{x}<span style={{ opacity: .7 }}>{n}</span></button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="vazio-rico"><b style={{ fontSize: 15 }}>Nada por aqui ainda</b><p>Nenhuma novidade para este produto.</p></div>
      ) : (
        <div className="nov-lista" role="list">
          {lista.map(n => (
            <Link key={n.id} to={n.rota} className="nov-item" role="listitem">
              <span className="ic"><n.icone size={20} /></span>
              <div className="tx">
                <div className="tit"><b>{n.titulo}</b><span className="pill">{ROTULO_TIPO[n.tipo]}</span>{n.produto && n.tipo !== 'produto' && <span className="pill ac">{n.produto}</span>}</div>
                <span className="desc">{n.detalhe}</span>
              </div>
              <small title={dataCurta(n.em)}>{relativo(n.em)}</small>
              <ArrowRight size={15} className="seta" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
