import { useMemo } from 'react'
import dados from '../../../data/biblioteca.json'
import { corDe } from '../biblioteca/paleta'
import { CODIGOS } from '../codigos'
import { Codigo, Secao, Sumario, type ItemToc } from '../../../components/ui/Doc'
import { lerToken, useCopiar, usePreferencias } from '../../../lib/preferencias'
import { Mini, Swatches, useAncora } from './pecas'

export const TEMAS_TAB: [string, string[], string, string[]][] = [
  ['Padrão', ['#0059AD', '#004A8F', '#003E7E'], '#001A33', ['#3B8AE0', '#5A9DE6', '#2F74C0']],
  ['Violeta', ['#7C3AED', '#6D28D9', '#5B21B6'], '#241B3D', ['#8B5CF6', '#A78BFA', '#7C3AED']],
  ['Âmbar', ['#D97706', '#B45309', '#92400E'], '#3A2607', ['#D97706', '#F59E0B', '#B45309']],
  ['Teal', ['#0D9488', '#0B7A6F', '#134E4A'], '#062A28', ['#0E9F94', '#14B8A6', '#0D8A80']],
  ['Rosa', ['#DB2777', '#BE185D', '#831843'], '#3D1225', ['#EC4899', '#F472B6', '#DB2777']],
  ['Cinza', ['#475569', '#334155', '#1E293B'], '#1E293B', ['#7C8BA1', '#94A3B8', '#64748B']],
  ['Marinho', ['#001A33', '#001428', '#000D1A'], '#000D1A', ['#4F7FB0', '#6A95C2', '#3F6A96']],
]
export const STATUS: [string, string][] = [['Sucesso', 'success'], ['Perigo', 'danger'], ['Alerta', 'warning'], ['Informação', 'info'], ['IA', 'ai']]
const contraste = (hex: string) => { const n = parseInt(hex.slice(1), 16); const l = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)); return l > 160 ? '#000014' : '#fff' }

const SECOES: ItemToc[] = [
  { id: 'regra', titulo: '1. Regra de ouro', termos: 'token literal hex' },
  { id: 'marca', titulo: '2. Marca e destaque', termos: 'support brand sidebar' },
  { id: 'temas', titulo: '3. Temas de destaque', termos: 'violeta ambar teal rosa cinza marinho' },
  { id: 'superficies', titulo: '4. Superfícies, texto e borda', termos: 'bg surface neutral border' },
  { id: 'status', titulo: '5. Status', termos: 'sucesso perigo alerta info ia lembrete' },
  { id: 'campos', titulo: '6. Estados de campo', termos: 'erro desabilitado' },
  { id: 'escuro', titulo: '7. Modo escuro e tema em código', termos: 'dark mode hook useAppTheme' },
  { id: 'rampas', titulo: '8. Rampas de cor', termos: 'brand primary secondary gray highlight' },
  { id: 'tokens', titulo: '9. Tokens exportáveis (JSON)', termos: 'style dictionary export' },
]

function Rampas() {
  const copiar = useCopiar()
  const grupos = useMemo(() => {
    const g: Record<string, typeof dados.cores> = {}
    for (const c0 of dados.cores) {
      const c = { ...c0, hex: corDe(c0.nome, c0.hex) }
      const chave = c.grupo === 'Highlight' ? c.nome.split('/').slice(0, 2).join('/') : c.grupo
      ;(g[chave] ||= []).push(c)
    }
    return g
  }, [])
  const ordem = (n: string) => { const m = n.match(/\/(\d+)$/); return m ? +m[1] : 0 }
  return (
    <div className="card">
      {Object.entries(grupos).map(([g, cs]) => (
        <div key={g} className="rampa">
          <div className="nm">{g}</div>
          {[...cs].sort((a, b) => ordem(a.nome) - ordem(b.nome)).map(c => (
            <button key={c.nome} title={c.nome} onClick={() => copiar(c.hex, `${c.nome} (${c.hex})`)}
              style={{ background: c.opacidade < 1 ? `color-mix(in srgb, ${c.hex} ${c.opacidade * 100}%, ${c.hex === '#FFFFFF' ? '#0A1324' : '#fff'})` : c.hex, color: c.opacidade < 1 ? (c.hex === '#FFFFFF' ? '#fff' : '#000014') : contraste(c.hex) }}>
              {c.nome.split('/').pop()}<span>{c.hex}{c.opacidade < 1 ? ` · ${Math.round(c.opacidade * 100)}%` : ''}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function Cores() {
  usePreferencias() // lê tokens ao vivo: re-renderiza na troca de modo/tema
  useAncora()
  const tema = CODIGOS['x-tema'] ?? []
  return (
    <div className="doc-cols">
      <div>
        <Secao id="regra" num="01" titulo="Regra de ouro" lead={<>Toda cor vem de <code>var(--c-*)</code>. Os valores abaixo são lidos ao vivo, então mudam com o <b>modo</b> (claro/escuro) e o <b>tema</b> escolhidos no topo. <b>Clique em uma cor para copiar o token.</b></>}>
          <div className="grid g3">
            <div className="fato"><div className="k">Azul</div><div className="v">Sempre <code>var(--c-support)</code></div><div className="note">Azul literal quebra os 7 temas.</div></div>
            <div className="fato"><div className="k">Fundo, texto e borda</div><div className="v">Nunca literais</div><div className="note">Literais quebram o modo escuro.</div></div>
            <div className="fato"><div className="k">Exceções</div><div className="v"><code>#fff</code> sobre cor cheia</div><div className="note">E HTML de impressão ou PDF.</div></div>
          </div>
          <div className="note">Precisa de uma cor que não existe? Crie o <b>token</b> primeiro (para status, sempre o par <code>--c-&lt;status&gt;-bg</code> + <code>--c-&lt;status&gt;-txt</code>) e só então use no componente.</div>
        </Secao>

        <Secao id="marca" num="02" titulo="Marca e destaque">
          <Swatches itens={[['--c-brand', 'Título de página, marca'], ['--c-brand-hover', 'Hover da marca'], ['--c-sidebar-bg', 'Fundo da sidebar (muda com o tema)'], ['--c-support', 'Destaque: botão, link, foco'], ['--c-support-h', 'Hover do destaque'], ['--c-support-a', 'Pressionado/ativo'], ['--c-secondary', 'Secundária (verde)'], ['--c-secondary-h', 'Hover da secundária']]} />
        </Secao>

        <Secao id="temas" num="03" titulo="Temas de destaque" lead="Cada tema é uma classe theme-* no body e troca só --c-support* e --c-sidebar-bg. No escuro, o destaque clareia para não sumir sobre a superfície escura.">
          <div className="tw-doc"><table className="dt">
            <thead><tr><th>Tema</th><th>Claro · support / -h / -a</th><th>Sidebar</th><th>Escuro · support / -h / -a</th></tr></thead>
            <tbody>{TEMAS_TAB.map(([n, c, s, e]) => <tr key={n}><td><b>{n}</b></td><td><Mini arr={c} /></td><td><Mini arr={[s]} /></td><td><Mini arr={e} /></td></tr>)}</tbody>
          </table></div>
        </Secao>

        <Secao id="superficies" num="04" titulo="Superfícies, texto e borda">
          <Swatches itens={[['--c-bg', 'Fundo da aplicação'], ['--c-surface', 'Card, drawer, modal'], ['--c-surface-2', 'Rodapé, área secundária, hover'], ['--c-text', 'Texto principal'], ['--c-neutral', 'Texto secundário, rótulos'], ['--c-neutral-h', 'Hover de neutro'], ['--c-text-muted', 'Terciário, placeholder, legenda'], ['--c-border', 'Borda padrão'], ['--c-border-soft', 'Divisória interna'], ['--c-table-head', 'Fundo do cabeçalho de tabela'], ['--c-table-head-txt', 'Texto do cabeçalho de tabela'], ['--c-img-bg', 'Fundo atrás de figura de marca']]} />
        </Secao>

        <Secao id="status" num="05" titulo="Status — cheia · fundo · texto" lead="Cada status tem cor cheia, fundo e texto. Success: concluído, ativo. Danger: erro, exclusão, arquivado. Warning: exigência, prazo. Info: em andamento. IA: recursos de IA. Lembrete: sininho.">
          <div className="card">
            {STATUS.map(([rot, k]) => {
              const txt = k === 'ai' ? '--c-ai-hover' : `--c-${k}-txt`
              return (
                <div key={k} className="status-row"><div className="lbl">{rot}</div>
                  <div className="status-cell" style={{ background: `var(--c-${k})`, color: '#fff' }}>--c-{k} · {lerToken(`--c-${k}`)}</div>
                  <div className="status-cell" style={{ background: `var(--c-${k}-bg)`, color: `var(${txt})`, border: '1px solid var(--c-border-soft)' }}>-bg · {lerToken(`--c-${k}-bg`)}</div>
                  <div className="status-cell" style={{ background: 'var(--c-surface)', color: `var(${txt})`, border: '1px solid var(--c-border-soft)', fontWeight: 600 }}>{txt.replace('--c-', '')} · {lerToken(txt)}</div>
                </div>
              )
            })}
          </div>
          <Swatches itens={[['--c-lembrete', 'Sininho de lembrete'], ['--c-lembrete-bg', 'Fundo do lembrete']]} />
        </Secao>

        <Secao id="campos" num="06" titulo="Estados de campo">
          <Swatches itens={[['--c-input-error', 'Borda e mensagem de erro'], ['--c-input-border-disabled', 'Borda desabilitada'], ['--c-input-bg-disabled', 'Fundo desabilitado'], ['--c-input-text-disabled', 'Texto desabilitado']]} />
        </Secao>

        <Secao id="escuro" num="07" titulo="Modo escuro e tema em código" lead="html.dark-mode redefine os tokens de superfície, texto, borda e status (paleta real, não filtro). As cores cheias de status e a sidebar não mudam. Tema = classe no body; modo escuro = classe no html — são independentes e se combinam.">
          {tema.map(a => <div key={a.rotulo} style={{ marginBottom: 16 }}><div className="note mono" style={{ margin: '0 0 6px' }}>{a.rotulo}</div><Codigo>{a.codigo}</Codigo></div>)}
        </Secao>

        <Secao id="rampas" num="08" titulo="Rampas de cor" lead={<>{dados.cores.length} estilos de cor em rampas de 300 a 700 (Gray vai de 50 a 900), usados pelos demais produtos da LDSOFT. Servem de apoio para ilustração e materiais; <b>a interface continua usando os tokens acima</b>. Clique para copiar o hex.</>}>
          <Rampas />
        </Secao>

        <Secao id="tokens" num="09" titulo="Tokens exportáveis (JSON)" lead="Todos os tokens do sistema num formato pronto para importar em Style Dictionary ou em qualquer ferramenta de tokens.">
          <Codigo>{(CODIGOS['x-tokens'] ?? [])[0]?.codigo ?? ''}</Codigo>
        </Secao>
      </div>
      <Sumario itens={SECOES} />
    </div>
  )
}
