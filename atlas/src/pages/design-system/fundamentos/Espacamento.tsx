import { useState } from 'react'
import { Codigo, Secao, Sumario, type ItemToc } from '../../../components/ui/Doc'
import { Tabela, useAncora } from './pecas'

export const ESPACOS: [string, number, string][] = [
  ['space-1', 4, 'Ícone + texto mínimo, gap de botões de paginação'], ['space-2', 8, 'O mais usado — gap padrão, padding vertical de célula'],
  ['space-3', 12, 'Gap de toolbar, padding de KPI, margem inferior da toolbar'], ['space-4', 16, 'Padding horizontal de célula, botão, campo, modal e seção'],
  ['space-5', 20, 'Área de conteúdo (main)'], ['space-6', 24, 'Padding lateral do cabeçalho de card de filtros e do rodapé'], ['space-8', 32, 'Gap entre colunas de filtro (.mf-two-col)'],
]

const SECOES: ItemToc[] = [
  { id: 'grade', titulo: '1. Grade e escala', termos: 'space 8 múltiplos gap padding' },
  { id: 'medidas', titulo: '2. Medidas de referência', termos: 'card drawer modal formulário' },
  { id: 'controles', titulo: '3. Tamanhos de controles', termos: 'botão small medium large campo altura' },
  { id: 'tabela', titulo: '4. Tabela', termos: 'célula padding 8 16 densa' },
  { id: 'responsivo', titulo: '5. Responsividade', termos: 'breakpoint mobile container query media' },
  { id: 'casca', titulo: '6. Casca da aplicação', termos: 'sidebar topbar main layout' },
]

export const CSS_RESP = `/* Não há escala nomeada de breakpoints: o CSS usa max-width direto, nestes valores. */
@media (max-width: 1100px) { .kpi-grade { grid-template-columns: repeat(3, 1fr); } }      /* dashboard: 5 → 3 + 2 por linha */
@media (max-width:  900px) { .mf-two-col { grid-template-columns: 1fr; } }                /* filtros em 1 coluna */
@media (max-width:  768px) { .sb { position: fixed; transform: translateX(-100%); }        /* sidebar vira overlay */
                             .drw, .dw { width: 100%; min-width: 0; } }                    /* drawers em tela cheia */
@media (max-width:  640px) { .toolbar, .pag { flex-direction: column; align-items: stretch; } }  /* barra de ações e paginação empilham */
@media (max-width:  479px) { /* ajustes de login */ }

/* Componentes NOVOS usam container queries: a largura útil muda com a sidebar aberta/recolhida,
   então a janela não diz quanto espaço o componente realmente tem. */
.cartao-lista { container-type: inline-size; }
@container (max-width: 560px) { .cartao-lista .linha { grid-template-columns: 1fr; } }

/* Altura de tela: sempre as duas linhas, vh como fallback do dvh (barra do Safari iOS). */
.shell { height: 100vh; height: 100dvh; }`

export default function Espacamento() {
  useAncora()
  const [escala, setEscala] = useState(1)
  return (
    <div className="doc-cols">
      <div>
        <Secao id="grade" num="01" titulo="Grade e escala" lead="Múltiplos de 8, com 4 como meio-passo. Em tabelas é obrigatório e sem exceção. O padrão é flexível em casos pontuais, desde que dentro da escala.">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span className="campo-lbl" style={{ margin: 0 }}>Zoom da régua</span>
              <input type="range" min={1} max={6} step={1} value={escala} onChange={e => setEscala(+e.target.value)} style={{ accentColor: 'var(--c-support)' }} />
              <span className="mono" style={{ color: 'var(--c-neutral)' }}>{escala}×</span>
            </div>
            {ESPACOS.map(([t, px, uso]) => (
              <div key={t} className="esp-row"><code>{t}</code><b>{px}px</b><div style={{ display: 'flex', gap: 16, alignItems: 'center' }}><div className="esp-bar" style={{ width: px * escala }} /><span style={{ color: 'var(--c-neutral)', fontSize: 12 }}>{uso}</span></div></div>
            ))}
          </div>
          <div className="note">Fora da grade (não use em código novo): 6, 10 e 14px. Use 4, 8, 12 ou 16.</div>
        </Secao>

        <Secao id="medidas" num="02" titulo="Medidas de referência">
          <Tabela cab={['Elemento', 'Medida']} linhas={[
            ['Área de conteúdo (main)', <code>20px</code>],
            ['Célula de tabela', <code>8px 16px · densa 8px 8px</code>],
            ['Card de filtros — cabeçalho / corpo / rodapé', <code>16px 24px · 16px · 16px 24px</code>],
            ['Linha de formulário', <code>gap 8px · altura mín. 32px · rótulo 150px</code>],
            ['Modal', <code>padding 24px</code>],
            ['Drawer — cabeçalho / corpo / rodapé', <code>14px 18px · 18px 20px · 16px 24px</code>],
            ['Drawer de detalhe — cabeçalho', <code>20px 22px 18px</code>],
            ['Card de painel / KPI', <code>12px 16px</code>],
            ['Cartão de seção no drawer', <code>14px 16px · gap 10px</code>],
          ]} />
        </Secao>

        <Secao id="controles" num="03" titulo="Tamanhos de controles" lead="Os botões seguem a estrutura da biblioteca: três tamanhos, mesmo raio e mesmo gap. Small é o padrão do produto.">
          <div className="grid g3">
            {[['Small (padrão)', '32px', '14 / 600 · padding 8×16'], ['Medium', '44px', '16 / 600 · padding 8×16'], ['Large', '56px', '18 / 600 · padding 16×24']].map(([n, h, d]) => <div key={n} className="fato"><div className="k">Botão · {n}</div><div className="v">{h}</div><div className="note">{d} · raio 8 · gap 8 · borda 1px</div></div>)}
          </div>
          <Tabela cab={['Controle', 'Altura', 'Raio', 'Observação']} linhas={[
            ['Campo de filtro (.field-row)', '32px', '6px', 'fonte 12.5px, padding 0 16px, borda 1.5px'],
            ['Campo de formulário (.fg)', '34px', '7px', 'fonte 13px, padding 0 18px'],
            ['Multi-select (botão)', '36px', '8px', 'fonte 13px'],
            ['Botão de menu de ações', '32px', '8px', 'outline na cor de destaque'],
            ['Ordenar / paginação', '28px', '6px', 'botão quadrado de 28px'],
            ['Switch', '19px', '10px', 'largura 34px'],
            ['Botão de ajuda (FAB)', '48px', '50%', 'canto inferior direito, 24px de margem'],
            ['Topbar', '56px', '—', 'fundo surface, sombra 0 1px 4px'],
          ]} />
          <div className="note">Regras de botão: um primário (filled) por área; ações secundárias em outline; ações fracas em text. Use <b>medium</b> em formulários largos e <b>large</b> só em telas de decisão. Cor sempre por token. Veja o componente <b>Button</b> em Componentes.</div>
        </Secao>

        <Secao id="tabela" num="04" titulo="Tabela">
          <Tabela cab={['Regra', 'Valor']} linhas={[
            ['Padding de célula (cabeçalho e corpo)', <code>8px 16px</code>],
            ['Tabela densa — mínimo lateral', <code>8px</code>],
            ['Nunca', <code>6, 7, 10 ou 12px</code>],
            ['Largura de coluna', 'Múltiplo de 8 (rótulo + 32px, arredondado)'],
            ['Tamanho de página', '20 · 50 · 100 (padrão 20)'],
          ]} />
          <div className="note">O modificador por tela (<code>.mp-table--minha-tela {'{ min-width: 0; width: 100% }'}</code>) é obrigatório; sem ele a tabela nasce com <code>min-width: 1300px</code> e rola na horizontal. O código completo está em <b>Componentes › Tabela</b>.</div>
        </Secao>

        <Secao id="responsivo" num="05" titulo="Responsividade" lead="Toda a informação de responsividade está aqui: breakpoints, o que muda em cada um, container queries e as regras de altura.">
          <Tabela cab={['Largura', 'Efeito']} linhas={[
            ['≤ 1100px', 'KPIs do dashboard: 5 → 3 + 2 por linha'],
            ['≤ 900px', 'Formulário de filtros em 1 coluna (.mf-two-col)'],
            ['≤ 768px', 'Sidebar vira overlay; drawers em tela cheia'],
            ['≤ 640px', 'Barra de resultados e paginação empilham em coluna'],
            ['≤ 479px', 'Ajustes de login'],
          ]} />
          <div className="grid g3" style={{ marginTop: 12 }}>
            <div className="fato"><div className="k">Drawer</div><div className="v">65% · mín. 480px</div><div className="note">Tela cheia sob demanda (100%) e no mobile.</div></div>
            <div className="fato"><div className="k">Sidebar</div><div className="v">220px · 200–420</div><div className="note">Arrastável e recolhível; ≤ 768px vira overlay.</div></div>
            <div className="fato"><div className="k">Modal</div><div className="v">448 · 560px</div><div className="note">Largura máxima de 92vw no mobile.</div></div>
          </div>
          <h3 className="h3">CSS de referência</h3>
          <Codigo>{CSS_RESP}</Codigo>
        </Secao>

        <Secao id="casca" num="06" titulo="Casca da aplicação" lead="Sidebar à esquerda, topbar no alto e a área de conteúdo rolável. Quem rola é o main, nunca o body. O código do layout está em Componentes › Casca da aplicação.">
          <Tabela cab={['Peça', 'Especificação']} linhas={[
            ['Sidebar', 'largura 220px (200–420 arrastável), recolhível (só ícones + menu flutuante); fundo --c-sidebar-bg; raio 0 12px 12px 0; sombra 4px 0 20px rgba(0,0,0,.28); transição .28s'],
            ['Item de menu', 'padding 9px 14px, margem 1px 8px; hover rgba(255,255,255,.07); ativo rgba(255,255,255,.10) + inset 3px 0 0 #fff; ícone 18 (20 recolhido), nome 13px'],
            ['Topbar', 'altura 56px, fundo --c-surface, sombra 0 1px 4px rgba(0,0,0,.06)'],
            ['Main', 'flex 1, overflow auto, padding 20px, fundo --c-bg'],
            ['Tela dividida', 'dois lados com divisória arrastável, proporção 30–70% lembrada no localStorage'],
          ]} />
        </Secao>
      </div>
      <Sumario itens={SECOES} />
    </div>
  )
}
