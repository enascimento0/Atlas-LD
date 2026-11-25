import dados from '../../../data/biblioteca.json'
import { Secao, Sumario, type ItemToc } from '../../../components/ui/Doc'
import { Tabela, useAncora } from './pecas'

const SECOES: ItemToc[] = [
  { id: 'raio', titulo: '1. Raio', termos: 'radius arredondado' },
  { id: 'borda', titulo: '2. Borda', termos: 'espessura 1.5px' },
  { id: 'sombra', titulo: '3. Sombras', termos: 'shadow elevação light dark blur foco' },
  { id: 'camadas', titulo: '4. Camadas (z-index)', termos: 'z-index modal drawer toast' },
  { id: 'movimento', titulo: '5. Movimento', termos: 'transição animação skeleton spinner' },
]

export default function Efeitos() {
  useAncora()
  return (
    <div className="doc-cols">
      <div>
        <Secao id="raio" num="01" titulo="Raio">
          <div className="grid g6">
            {[[4, 'xs', 'chip "E", fechar toast'], [6, 'sm', 'campo de filtro, paginação, sigla'], [8, 'md', 'todos os botões, aviso, select'], [10, 'lg', 'card, tabela, popover, toast simples'], [12, 'xl', 'modal, menu de ações, drawer, notificação'], [999, 'pill', 'badge de status, chip']].map(([r, n, u]) => (
              <div key={n}><div className="raio-box" style={{ borderRadius: r as number, justifyContent: r === 999 ? 'center' : undefined, alignItems: r === 999 ? 'center' : undefined }}>{r === 999 ? 'pill' : `${r}px`}</div><div className="note"><b>{n}</b> · {u}</div></div>
            ))}
          </div>
          <div className="note">Também: 7px no campo de formulário (.fg) e no botão de fechar do drawer; 50% em ícones circulares de modal e estado vazio.</div>
        </Secao>

        <Secao id="borda" num="02" titulo="Borda">
          <Tabela cab={['Uso', 'Espessura', 'Cor']} linhas={[
            ['Campo, chip, paginação', '1.5px', <code>--c-border</code>],
            ['Botões, card, tabela, modal', '1px', <code>--c-border</code>],
            ['Divisória interna, linha de tabela', '1px', <code>--c-border-soft</code>],
            ['Cabeçalho de tabela (inferior)', '1.5px', <code>--c-border-soft</code>],
            ['Aba ativa (inferior)', '2px', <code>--c-support</code>],
            ['Dropzone e estado vazio rico', '1.5px tracejada', <code>--c-border</code>],
          ]} />
        </Secao>

        <Secao id="sombra" num="03" titulo="Sombras" lead={<>Três níveis para a interface (<code>--shadow-sm/md/lg</code>). No escuro a opacidade sobe. O drawer de detalhe usa uma própria: <code>-8px 0 40px rgba(0,0,0,.2)</code>.</>}>
          <div className="grid g3">
            {[['--shadow-sm', 'Card, tabela, card de filtros'], ['--shadow-md', 'Toast simples, autocomplete'], ['--shadow-lg', 'Modal, menu, drawer, popover']].map(([s, u]) => (
              <div key={s}><div className="sombra-box" style={{ boxShadow: `var(${s})` }}>{s}</div><div className="note">{u}</div></div>
            ))}
          </div>
          <h3 className="h3">Níveis de elevação da biblioteca</h3>
          <p className="lead" style={{ color: 'var(--c-neutral)', maxWidth: 760, marginTop: 0 }}>Duas famílias com os mesmos 4 níveis: <b>Light</b> (12% de opacidade) para fundos claros e <b>Dark</b> (32%) para fundos escuros. Cor base <code>#000014</code>.</p>
          {['Light', 'Dark'].map(m => (
            <div key={m} className="card" style={{ background: m === 'Light' ? '#F6F6FF' : '#3A3A48' }}>
              <div className="grid g4">
                {dados.sombras.filter(s => s.nome.includes(m)).map(s => (
                  <div key={s.nome}>
                    <div style={{ height: 96, borderRadius: 8, background: m === 'Light' ? '#fff' : '#4D4D5E', boxShadow: s.css, display: 'grid', placeItems: 'center', font: '600 12px var(--font-mono)', color: m === 'Light' ? '#000014' : '#fff' }}>{s.nome.replace('Shadows/', '')}</div>
                    <div className="note mono" style={{ color: m === 'Light' ? '#626275' : '#BDBDD0' }}>{s.css}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="note">Também fazem parte dos efeitos: <code>Blur/100–400</code> (desfoque de fundo de 4 a 24px), <code>Focus/Light</code> e <code>Focus/Dark</code> (anel de foco de 4px). No produto, o foco de campo é a borda na cor de destaque, sem halo (<code>border-color: var(--c-support)</code>).</div>
        </Secao>

        <Secao id="camadas" num="04" titulo="Camadas (z-index)" lead="Modal sobre drawer: passe zIndex ao Modal. O modal de confirmação já é 10000, acima de qualquer coisa.">
          <div className="card"><div className="z-stack">
            {[['Coluna de ações fixa da tabela', '2'], ['Card de filtros (sticky)', '10'], ['Autocomplete', '20'], ['Menu de ações, popover', '40'], ['Modal genérico, dropdown da topbar', '50'], ['Botão de ajuda / painel de ajuda', '800 / 850'], ['Overlay / drawer de configuração', '8000 / 8001'], ['Drawer de detalhe e painel de componente', '9001'], ['Toast', '9500'], ['Overlay / tela cheia da ajuda', '9600 / 9610'], ['Modal de confirmação', '10000']].map(([a, b]) => <div key={a} className="z-item">{a} <b>{b}</b></div>)}
          </div></div>
        </Secao>

        <Secao id="movimento" num="05" titulo="Movimento">
          <Tabela cab={['Animação', 'Valor']} linhas={[
            ['Hover de botão, borda e fundo', <code>.15s</code>],
            ['Abrir drawer', <code>right .3s cubic-bezier(.4, 0, .2, 1)</code>],
            ['Recolher sidebar', <code>width .28s cubic-bezier(.4, 0, .2, 1)</code>],
            ['"Mais filtros" (accordion)', <code>max-height .4s ease</code>],
            ['Entrada de toast e painel', <code>.2s–.22s ease-out · translateY(8px) → 0</code>],
            ['Skeleton (só em cards/tiles)', <code>1.6s linear infinite</code>],
            ['Spinner', <code>.7s linear infinite</code>],
          ]} />
          <div className="note">Respeite <code>prefers-reduced-motion: reduce</code>: toasts e notificações desligam a animação de entrada.</div>
        </Secao>
      </div>
      <Sumario itens={SECOES} />
    </div>
  )
}
