/* Catálogo dos componentes do APOL+ Marcas: alimenta a biblioteca (cards + detalhe com propriedades e código).
   `id` é o mesmo de ApolComponentes (prop `so`), que renderiza a prévia ao vivo. As classes vêm de apol.css. */

export interface PropApol { nome: string; valores: string[]; nota?: string }
export interface CompApol {
  id: string
  nome: string
  categoria: 'Estrutura' | 'Ações' | 'Formulários' | 'Dados' | 'Feedback' | 'Navegação'
  descricao: string
  propriedades: PropApol[]
  /** HTML pronto para reuso, com as classes do APOL+ (ícones: Phosphor) */
  codigo: string
}

export const CATEGORIAS_APOL = ['Todos', 'Estrutura', 'Ações', 'Formulários', 'Dados', 'Feedback', 'Navegação'] as const

export const COMPONENTES_APOL: CompApol[] = [
  {
    id: 'c-casca', nome: 'Casca da aplicação', categoria: 'Estrutura',
    descricao: 'Sidebar, barra superior e área de conteúdo. A sidebar pode ficar recolhida.',
    propriedades: [{ nome: 'Sidebar', valores: ['expandida', 'recolhida'] }, { nome: 'Tema', valores: ['7 temas', 'claro', 'escuro'], nota: 'Muda --c-support e --c-sidebar-bg' }],
    codigo: `<div class="dm-shell">
  <aside class="dm-sb">
    <button type="button" class="dm-toggle" aria-label="Recolher menu"><i class="ph-bold ph-caret-left"></i></button>
    <div class="dm-logo"><span class="dm-logo-mark"><i class="ph-fill ph-tag"></i></span><span class="dm-logo-txt">Apol<small>LDSOFT · Marcas</small></span></div>
    <nav class="dm-nav">
      <div class="dm-grupo">Geral</div><div class="dm-grupo-sep"></div>
      <div class="dm-item on"><i class="ph-fill ph-house"></i><span>Início</span></div>
      <div class="dm-item"><i class="ph ph-tag"></i><span>Marcas</span></div>
    </nav>
  </aside>
  <div class="dm-main">
    <header class="dm-tb"><button class="btn btn-sm btn-outline">Ação</button></header>
    <div class="dm-cont">
      <div class="crumb">APOL+ › Marcas</div>
      <h1 class="page-title">Título</h1>
    </div>
  </div>
</div>`,
  },
  {
    id: 'c-botoes', nome: 'Botões', categoria: 'Ações',
    descricao: 'Ações da tela. Padrão de 40px; compacto de 32px. Cor sempre por token.',
    propriedades: [
      { nome: 'Variante', valores: ['btn-primary', 'btn-outline', 'btn-success', 'btn-danger', 'btn-text-danger', 'btn-brand'] },
      { nome: 'Tamanho', valores: ['padrão (40px)', 'btn-sm (32px)'] },
      { nome: 'Estado', valores: ['padrão', 'hover', 'disabled', 'loading'] },
    ],
    codigo: `<button class="btn btn-primary">Pesquisar</button>
<button class="btn btn-outline">Limpar</button>
<button class="btn btn-success">Concluído</button>
<button class="btn btn-danger">Excluir</button>
<button class="btn btn-sm btn-primary">Salvar</button>

<!-- desabilitado e carregando -->
<button class="btn btn-primary" disabled>Desabilitado</button>
<button class="btn btn-primary loading" aria-label="Carregando"><span class="spin"></span></button>`,
  },
  {
    id: 'c-campos', nome: 'Campos de formulário', categoria: 'Formulários',
    descricao: 'Input, select e checkbox em 32px, com rótulo, foco e mensagem de erro.',
    propriedades: [
      { nome: 'Estado', valores: ['padrão', 'foco (.foco)', 'erro', 'disabled'] },
      { nome: 'Rótulo', valores: ['campo-lbl'] },
    ],
    codigo: `<label class="campo-wrap">
  <span class="campo-lbl">Número do processo</span>
  <input class="campo" placeholder="Ex.: 912345678" />
</label>

<!-- com erro -->
<label class="campo-wrap">
  <span class="campo-lbl">Número do processo</span>
  <input class="campo erro" value="12345" />
  <span class="campo-erro-msg">Informe 9 dígitos.</span>
</label>`,
  },
  {
    id: 'c-chips', nome: 'Chips e badges', categoria: 'Dados',
    descricao: 'Chip para filtros (liga/desliga), badge para situação e sigla para o tipo de marca.',
    propriedades: [
      { nome: 'Chip', valores: ['chip', 'chip on', 'chip off', 'chip compacto'] },
      { nome: 'Badge', valores: ['CONCEDIDA', 'PEDIDO', 'ARQUIVADO', 'EXIGÊNCIA'], nota: 'Cores por token de status (success, info, danger, warning)' },
      { nome: 'Sigla', valores: ['N Nominativa', 'M Mista', 'F Figurativa'] },
    ],
    codigo: `<button class="chip on">Mista</button>
<button class="chip">Nominativa</button>

<span class="badge" style="background:var(--c-success-bg);color:var(--c-success-txt)">CONCEDIDA</span>
<span class="badge" style="background:var(--c-warning-bg);color:var(--c-warning-txt)">EXIGÊNCIA</span>

<span class="sigla" title="Nominativa">N</span>`,
  },
  {
    id: 'c-abas', nome: 'Abas', categoria: 'Navegação',
    descricao: 'Troca entre visões da mesma tela, com contador opcional.',
    propriedades: [{ nome: 'Estado', valores: ['aba', 'aba active'] }, { nome: 'Contador', valores: ['sem', 'span.cont'] }],
    codigo: `<div class="abas" role="tablist">
  <button role="tab" aria-selected="true" class="aba active">Dashboard</button>
  <button role="tab" aria-selected="false" class="aba">Processos<span class="cont">24</span></button>
</div>`,
  },
  {
    id: 'c-filtros', nome: 'Card de filtros', categoria: 'Formulários',
    descricao: 'Card de pesquisa em duas colunas, recolhível. Pesquisar fecha o card.',
    propriedades: [{ nome: 'Estado', valores: ['aberto', 'recolhido'] }, { nome: 'Colunas', valores: ['mf-two-col'] }],
    codigo: `<div class="mf-card">
  <div class="mf-card-hdr">Filtros</div>
  <div class="mf-two-col">
    <div class="mf-col">
      <div class="mf-row"><span class="mf-row-lbl">Processo</span><div class="mf-row-val"><input class="campo" /></div></div>
    </div>
    <div class="mf-col">
      <div class="mf-row"><span class="mf-row-lbl">Titular</span><div class="mf-row-val"><input class="campo" /></div></div>
    </div>
  </div>
  <div class="mf-footer">
    <button class="btn btn-outline">Limpar</button>
    <button class="btn btn-primary">Pesquisar</button>
  </div>
</div>`,
  },
  {
    id: 'c-toolbar', nome: 'Barra de ações', categoria: 'Dados',
    descricao: 'Contagem de resultados, ordenação e menu de ações em lote. Só aparece depois da primeira pesquisa.',
    propriedades: [{ nome: 'Menu de ações', valores: ['fechado', 'aberto'] }, { nome: 'Item', valores: ['pac-item', 'pac-item perigo'] }],
    codigo: `<div class="toolbar">
  <span class="count"><strong>128</strong> processos</span>
  <label class="ordenar"><span>Ordenar por</span><select class="campo"></select></label>
  <div class="pac">
    <button class="btn btn-sm btn-pac">Ações (3)</button>
    <div class="pac-menu">
      <div class="pac-item">Exportar</div>
      <div class="pac-sep"></div>
      <div class="pac-item perigo">Excluir</div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'c-tabela', nome: 'Tabela e paginação', categoria: 'Dados',
    descricao: 'Tabela de resultados com seleção de linhas e paginação de 20, 50 ou 100 itens.',
    propriedades: [{ nome: 'Linha', valores: ['normal', 'hover', 'selecionada'] }, { nome: 'Por página', valores: ['20', '50', '100'] }],
    codigo: `<div class="tw">
  <table class="tbl">
    <thead><tr><th class="c-acoes"><input type="checkbox" class="chk" /></th><th>Processo</th><th>Marca</th></tr></thead>
    <tbody>
      <tr><td class="c-acoes"><input type="checkbox" class="chk" /></td><td class="c-proc">912345678</td><td class="c-marca">APOL MARCAS</td></tr>
    </tbody>
  </table>
</div>
<div class="pag">
  <div class="pag-ctrls"><select class="campo pag-size"></select></div>
  <div class="pag-btns"><button class="pag-btn">1</button></div>
</div>`,
  },
  {
    id: 'c-drawer', nome: 'Drawer', categoria: 'Feedback',
    descricao: 'Painel lateral de detalhe, com cabeçalho, seções e rodapé de ações.',
    propriedades: [{ nome: 'Estado', valores: ['aberto', 'fechado (.fechado)'] }, { nome: 'Seções', valores: ['pdd-section', 'pdd-grid'] }],
    codigo: `<aside class="drawer">
  <div class="pdd-hdr">
    <div class="pdd-hdr-title">Processo 912345678</div>
    <button class="pdd-close" aria-label="Fechar">×</button>
  </div>
  <div class="pdd-body">
    <div class="pdd-section">
      <div class="pdd-sec-title">Dados gerais</div>
      <div class="pdd-grid"><span class="pdd-flabel">Titular</span><span class="pdd-fval">LD Soft Ltda.</span></div>
    </div>
  </div>
  <div class="pdd-footer"><button class="btn btn-primary">Salvar</button></div>
</aside>`,
  },
  {
    id: 'c-modal', nome: 'Modal', categoria: 'Feedback',
    descricao: 'Diálogo de formulário ou de confirmação, com ações alinhadas à direita.',
    propriedades: [{ nome: 'Tipo', valores: ['formulário', 'confirmação de exclusão'] }, { nome: 'Largura', valores: ['até 448px'] }],
    codigo: `<div class="modal" style="max-width:448px">
  <h4>Novo contato</h4>
  <label class="campo-wrap"><span class="campo-lbl">Nome</span><input class="campo" /></label>
  <div class="modal-acoes">
    <button class="btn btn-outline">Cancelar</button>
    <button class="btn btn-primary">Salvar</button>
  </div>
</div>`,
  },
  {
    id: 'c-toast', nome: 'Toast', categoria: 'Feedback',
    descricao: 'Notificação temporária no canto da tela, com ação opcional (ex.: Desfazer).',
    propriedades: [{ nome: 'Tipo', valores: ['success', 'danger', 'info', 'warning'] }, { nome: 'Duração', valores: ['4 s', '8 s (com ação)'] }],
    codigo: `<div class="toast success" role="status">
  <span>Lead criado com sucesso.</span>
  <button class="fechar" aria-label="Fechar">×</button>
</div>

<div class="toast info" role="status">
  <span>Cartão movido para Ganho.</span>
  <button class="acao">Desfazer</button>
</div>`,
  },
  {
    id: 'c-kpi', nome: 'Cards de painel', categoria: 'Dados',
    descricao: 'Indicadores (KPI) de topo de dashboard: título, valor e rótulo.',
    propriedades: [{ nome: 'Colunas', valores: ['5 por linha', '3 + 2 abaixo de 1100px'] }],
    codigo: `<div class="grid g4">
  <div class="kpi">
    <div class="t">Processos ativos</div>
    <div class="v">1.248</div>
    <div class="l">+12 este mês</div>
  </div>
</div>`,
  },
  {
    id: 'c-estados', nome: 'Estados de página', categoria: 'Feedback',
    descricao: 'Vazio, erro e carregando. Listagem carregando usa overlay com spinner; skeleton só em cards.',
    propriedades: [{ nome: 'Estado', valores: ['vazio', 'erro', 'vazio rico', 'carregando'] }],
    codigo: `<div class="vazio">
  <span>Nenhum registro encontrado.</span>
  <button class="btn btn-outline">Limpar filtros</button>
</div>

<div class="carregando">
  <div class="ov"><span>Carregando...</span><span class="spin"></span></div>
</div>`,
  },
]
