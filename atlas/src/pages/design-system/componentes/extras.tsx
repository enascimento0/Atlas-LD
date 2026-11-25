/* Componentes do Design System que não existem na biblioteca de variantes: padrões e blocos do produto.
   Cada um tem prévia ao vivo (estilos `dsp-*` escopados ao Atlas) e código em ../codigos/*.txt. */
import { useState } from 'react'
import * as Ph from '@phosphor-icons/react'

export interface PropExtra { nome: string; valores: string[]; nota?: string }
export interface Extra {
  chave: string
  nome: string
  categoria: 'Estrutura' | 'Ações' | 'Formulários' | 'Navegação' | 'Feedback' | 'Exibição de dados'
  descricao: string
  icone: Ph.Icon
  propriedades: PropExtra[]
  previa: () => React.ReactNode
}

function Autocomplete() {
  const [t, setT] = useState('AP'); const [aberto, setAberto] = useState(true)
  const itens = ['APOL Marcas', 'Apolo Industrial', 'Aporte Capital'].filter(i => i.toLowerCase().includes(t.toLowerCase()))
  return (
    <div style={{ position: 'relative', width: 280 }}>
      <input className="campo" value={t} onChange={e => { setT(e.target.value); setAberto(true) }} onBlur={() => setTimeout(() => setAberto(false), 150)} onFocus={() => setAberto(true)} />
      {aberto && <div className="dsp-lista">{itens.map(i => <div key={i} className="dsp-item" onMouseDown={() => { setT(i); setAberto(false) }}>{i}</div>)}{itens.length === 0 && <div className="dsp-item" style={{ color: 'var(--c-text-muted)' }}>Nenhum resultado</div>}</div>}
    </div>
  )
}

function MultiSelect() {
  const ops = ['Grupo A', 'Grupo B', 'Grupo C']
  const [sel, setSel] = useState<string[]>(['Grupo A']); const [aberto, setAberto] = useState(true)
  const todos = sel.length === ops.length
  return (
    <div style={{ width: 260 }}>
      <button type="button" className="dsp-ms-btn" onClick={() => setAberto(v => !v)}><span>{sel.length === 0 ? 'Selecione' : `${sel.length} ${sel.length === 1 ? 'grupo' : 'grupos'}`}</span><Ph.CaretDown size={12} weight="bold" /></button>
      {aberto && (
        <div className="dsp-painel">
          <label className="dsp-item" style={{ fontWeight: 700, borderBottom: '1px solid var(--c-border)' }}><input type="checkbox" checked={todos} onChange={() => setSel(todos ? [] : ops)} /> Todos</label>
          {ops.map(o => <label key={o} className="dsp-item"><input type="checkbox" checked={sel.includes(o)} onChange={() => setSel(s => s.includes(o) ? s.filter(x => x !== o) : [...s, o])} /> {o}</label>)}
        </div>
      )}
    </div>
  )
}

function Dropzone() {
  const [sobre, setSobre] = useState(false); const [nome, setNome] = useState('')
  return (
    <div className={`dsp-dz ${sobre ? 'sobre' : ''}`} style={{ width: 380 }}
      onDragOver={e => { e.preventDefault(); setSobre(true) }} onDragLeave={() => setSobre(false)}
      onDrop={e => { e.preventDefault(); setSobre(false); setNome(e.dataTransfer.files?.[0]?.name ?? '') }}>
      <Ph.UploadSimple size={22} /><span style={{ color: 'var(--c-text)', fontWeight: nome ? 600 : 400 }}>{nome || 'Arraste o arquivo aqui ou clique para selecionar'}</span>
    </div>
  )
}

function MenuAcoes() {
  const [aberto, setAberto] = useState(true)
  return (
    <div style={{ position: 'relative', minHeight: 190, width: 240, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
      <div style={{ position: 'relative' }}>
        <button type="button" className="dsp-pac-btn" onClick={() => setAberto(v => !v)}>Ações (3)<Ph.CaretDown size={12} style={{ transform: aberto ? 'rotate(180deg)' : undefined }} /></button>
        {aberto && (
          <div className="dsp-pac-menu">
            <div className="dsp-pac-item"><Ph.DownloadSimple size={15} />Exportar XLS</div>
            <div style={{ height: 1, margin: '8px 0', background: 'var(--c-border-soft)' }} />
            <div className="dsp-pac-item">Mais opções <Ph.CaretRight size={12} style={{ marginLeft: 'auto' }} /></div>
            <div style={{ height: 1, margin: '8px 0', background: 'var(--c-border-soft)' }} />
            <div className="dsp-pac-item" style={{ color: 'var(--c-danger)' }}><Ph.Trash size={15} />Excluir</div>
          </div>
        )}
      </div>
    </div>
  )
}

const Cabecalho = () => (
  <div style={{ width: 420 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-neutral)', marginBottom: 2 }}>Marcas<Ph.CaretDown size={10} style={{ transform: 'rotate(-90deg)' }} />Manutenção</div>
    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-brand)' }}>Relatório de Processos</div>
  </div>
)

const MiniTabela = () => (
  <table className="dsp-mini" style={{ width: 380 }}>
    <thead><tr><th>Código</th><th>Descrição</th></tr></thead>
    <tbody><tr><td style={{ fontWeight: 700, color: 'var(--c-support)', whiteSpace: 'nowrap' }}>IPAS-100</td><td>Publicação do pedido</td></tr><tr><td style={{ fontWeight: 700, color: 'var(--c-support)' }}>IPAS-029</td><td>Exigência de mérito</td></tr></tbody>
  </table>
)

const Overlay = () => (
  <div style={{ position: 'relative', width: 380, height: 120, border: '1px solid var(--c-border)', borderRadius: 10, background: 'var(--c-surface)', overflow: 'hidden' }}>
    <div style={{ padding: 16, color: 'var(--c-neutral)', fontSize: 12.5 }}>Resultados da pesquisa…</div>
    <div style={{ position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--c-surface) 75%, transparent)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 36, gap: 8, color: 'var(--c-support)', fontSize: 12, fontWeight: 600 }}>
      <Ph.ArrowClockwise size={18} className="dsp-spin" />Carregando...
    </div>
  </div>
)

const Ajuda = () => (
  <div style={{ position: 'relative', width: 380, height: 150, border: '1px dashed var(--c-border)', borderRadius: 10 }}>
    <button type="button" aria-label="Ajuda" style={{ position: 'absolute', right: 16, bottom: 16, width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'var(--c-support)', color: '#fff', boxShadow: 'var(--shadow-lg)', display: 'grid', placeItems: 'center' }}><Ph.Question size={22} weight="bold" /></button>
  </div>
)

const PaginaListagem = () => (
  <div style={{ width: 460, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, color: 'var(--c-neutral)' }}>
    {[['1 · Cabeçalho', 'breadcrumb + título + ação'], ['2 · Card de filtros', 'sticky, recolhível; Pesquisar fecha o card'], ['3 · Estado inicial', '"Comece pesquisando", sem botões'], ['4 · Barra de resultados', 'contagem · ordenar · ações'], ['5 · Tabela', 'mp-table + modificador da tela'], ['6 · Paginação', '20 / 50 / 100 por página']].map(([a, b]) => (
      <div key={a} style={{ display: 'flex', gap: 10, padding: '8px 12px', background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 8 }}><b style={{ color: 'var(--c-text)', minWidth: 140 }}>{a}</b>{b}</div>
    ))}
  </div>
)

export const EXTRAS_BASE: Extra[] = [
  { chave: 'x-cabecalho', nome: 'Cabeçalho de página', categoria: 'Estrutura', icone: Ph.Layout, descricao: 'Breadcrumb de 2 níveis e título 20/800, com a ação principal à direita. Sem subtítulo.', propriedades: [{ nome: 'Ação', valores: ['sem ação', 'botão primário à direita'] }], previa: Cabecalho },
  { chave: 'x-pagina-listagem', nome: 'Página de listagem (receita)', categoria: 'Estrutura', icone: Ph.Rows, descricao: 'Toda listagem segue a mesma ordem vertical. Junta cabeçalho, filtros, estados vazios, barra de resultados, tabela e paginação.', propriedades: [{ nome: 'Estado', valores: ['início', 'carregando', 'sem resultado', 'erro', 'com resultados'] }], previa: PaginaListagem },
  { chave: 'x-menu-acoes', nome: 'Menu de ações', categoria: 'Ações', icone: Ph.DotsThreeCircle, descricao: 'Dropdown próprio, sem biblioteca. Fica sempre visível; a contagem de selecionados vai no rótulo do botão.', propriedades: [{ nome: 'Item', valores: ['padrão', 'perigo', 'desabilitado'] }, { nome: 'Submenu', valores: ['sem', 'abre à esquerda'] }], previa: MenuAcoes },
  { chave: 'x-autocomplete', nome: 'Autocomplete', categoria: 'Formulários', icone: Ph.Textbox, descricao: 'Campo com lista de sugestões feito à mão. Três pegadinhas obrigatórias: onMouseDown, blur com atraso e interceptar Enter.', propriedades: [{ nome: 'Estado', valores: ['fechado', 'com sugestões', 'sem resultado'] }], previa: Autocomplete },
  { chave: 'x-multiselect', nome: 'Multi-select em popover', categoria: 'Formulários', icone: Ph.ListChecks, descricao: 'Botão que abre um painel de checkboxes com "Todos" no topo. O painel vai para portal e abre para cima quando falta espaço.', propriedades: [{ nome: 'Seleção', valores: ['nenhum', 'alguns', 'todos'] }, { nome: 'Direção', valores: ['para baixo', 'para cima'] }], previa: MultiSelect },
  { chave: 'x-dropzone', nome: 'Dropzone de anexo', categoria: 'Formulários', icone: Ph.UploadSimple, descricao: 'Área de arrastar ou clicar para anexar um arquivo. Borda tracejada que muda para a cor de destaque ao arrastar.', propriedades: [{ nome: 'Estado', valores: ['vazio', 'arrastando', 'com arquivo'] }], previa: Dropzone },
  { chave: 'x-minitabela', nome: 'Mini-tabela', categoria: 'Exibição de dados', icone: Ph.Table, descricao: 'Tabela compacta para dentro de drawer ou modal, com cabeçalho de 10px e células de 8px.', propriedades: [{ nome: 'Coluna', valores: ['código (destaque)', 'descrição'] }], previa: MiniTabela },
  { chave: 'x-overlay', nome: 'Overlay de carregamento', categoria: 'Feedback', icone: Ph.CircleNotch, descricao: 'Listagem não usa skeleton: o padrão é um overlay translúcido sobre os resultados, com spinner sticky.', propriedades: [{ nome: 'Uso', valores: ['listagem (overlay)', 'cards/tiles (skeleton)'] }], previa: Overlay },
  { chave: 'x-ajuda', nome: 'Botão de ajuda da tela', categoria: 'Feedback', icone: Ph.Question, descricao: 'FAB circular de 48px no canto inferior direito que abre um painel de tópicos. Os toasts sobem para não cobri-lo.', propriedades: [{ nome: 'Estado', valores: ['fechado', 'painel aberto'] }], previa: Ajuda },
]

/* Componentes do catálogo antigo do APOL+ que continuam como itens próprios; os demais (Botões, Campos, Período,
   Chips, Abas, Modal, Toast) foram unificados com o componente equivalente da biblioteca. */
export const APOL_MANTIDOS = ['c-casca', 'c-filtros', 'c-toolbar', 'c-tabela', 'c-drawer', 'c-kpi', 'c-estados']

/* Componentes da biblioteca antiga (Figma) que foram substituídos por versões novas do Design System. */
export const SUBSTITUIDOS = ['Toast']

import { EXTRAS_2 } from './extras2'
export const EXTRAS: Extra[] = [...EXTRAS_BASE, ...EXTRAS_2]
