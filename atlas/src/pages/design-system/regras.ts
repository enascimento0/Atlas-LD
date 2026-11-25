/* Regras, armadilhas e setup do Design System. Fonte única: usada pela página Visão geral
   e pelo arquivo .MD da aba Downloads. Ao mudar aqui, os dois acompanham. */

export const REGRAS: [string, string][] = [
  ['Nunca invente classe CSS', 'Procure a existente antes. Se criar, use o prefixo do contexto e registre no CSS global.'],
  ['Sem CSS Modules nem styled-components', 'Um CSS global.'],
  ['Espaçamento de tabela em múltiplos de 8', '8px 16px; denso 8px; nunca 6, 7, 10 ou 12. Os botões seguem os tamanhos small, medium e large.'],
  ['Cabeçalho de tabela herdado', '--c-table-head + --c-table-head-txt; não redeclare.'],
  ['Cor sempre por token', 'Nunca azul literal (quebra os temas); fundo, texto e borda nunca literais (quebram o escuro). Exceções: #fff sobre cor cheia e HTML de impressão/PDF.'],
  ['Ícone só Phosphor', 'size={14} é o padrão.'],
  ['Escala tipográfica fechada', '12.5 / 12 / 13 / 11.5 / 11 / 10.5 e os títulos 20 / 16 / 14.'],
  ['Toda tabela nova exige seu modificador', 'min-width: 0; width: 100%.'],
  ['window.confirm() é proibido', 'Use o ConfirmModal.'],
  ['Toda tela com filtro', 'Leva filtros salvos (VisoesDoFiltro) e a orientação inicial “Comece…” sem botões.'],
  ['Números exibidos', 'Sempre via formatarNumero (pt-BR).'],
  ['Interativos relevantes', 'Levam data-tour-id="<modulo>.<tela>.<elemento>" (consumido pelo tour guiado).'],
]

export const ARMADILHAS: [string, string][] = [
  ['Funnel não é o ícone de filtro', 'O filtro é um card colapsável com CaretDown/CaretUp.'],
  ['.mp-table nasce com min-width: 1300px', 'Sempre aplique o modificador da tela.'],
  ['thead th com nowrap herdado', 'Gerava barra horizontal fantasma. A regra base já tem white-space: normal; não redeclare.'],
  ['<select> em .field-row não estica', 'Precisa de style={{ flex: 1 }}.'],
  ['Autocomplete', 'Use onMouseDown (não onClick), onBlur com setTimeout de 150ms e intercepte o Enter.'],
  ['Popover dentro de card com overflow', 'Renderize em portal.'],
  ['Modal por cima de drawer', 'Passe zIndex (drawer é 8001/9001; o ConfirmModal já é 10000).'],
  ['Drawer fechado mantém box-shadow inline', '.drw:not(.is-aberto) { box-shadow: none }.'],
  ['100vh vs 100dvh', 'Sempre as duas linhas, com vh como fallback.'],
  ['O que não existe', 'DataTable, sticky de cabeçalho de tabela, ordenação por clique no th e skeleton em listagem. O padrão é overlay.'],
]

export const PREFIXOS: [string, string][] = [
  ['mp-', 'Listagem: header, toolbar, tabela, paginação, estado vazio'],
  ['mf-', 'Filtros e formulário em linha (mf-card, mf-row, mf-footer…)'],
  ['pdd- · fd- · det-', 'Drawer de detalhe (cabeçalho, seções, mini-tabela)'],
  ['pdc-', 'Drawer de configuração (painel de controle)'],
  ['pac-', 'Menu de ações (dropdown)'],
  ['fg', 'Campo de formulário vertical (rótulo em cima)'],
  ['toast-notif-', 'Notificação em toast'],
  ['sb- · sidebar-', 'Menu lateral'],
]

export const DECISOES: [string, string][] = [
  ['Estilo', 'Um único arquivo global (index.css). Classes com prefixo por contexto. Sem CSS Modules nem styled-components.'],
  ['Tailwind', "v4 (@import 'tailwindcss'), usado só em componentes compartilhados. O resto é CSS próprio e style={{}} inline, que é aceito."],
  ['Cor', 'Sempre por token var(--c-*). O destaque (--c-support) é trocado pelos 7 temas de usuário.'],
  ['Modo escuro', 'Paleta real (html.dark-mode), não filtro. Superfície, texto e borda são redefinidos.'],
  ['Ícones', 'Só Phosphor, import direto do barrel (@phosphor-icons/react). Não existe wrapper de ícone.'],
  ['Tabela', 'Não existe DataTable: a <table> é escrita à mão com classes.'],
  ['Stack', 'React 19 · TypeScript · Vite 6 · Inter'],
]

export const SETUP_CSS = `/* index.css — topo do arquivo */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import 'tailwindcss';

* { box-sizing: border-box; }
body { margin: 0; font-family: 'Inter', sans-serif; font-size: 13px;      /* o tamanho-base do app é 13px, não 16px */
       background: var(--c-bg); height: 100vh; height: 100dvh; overflow: hidden; }   /* quem rola é o <main>, nunca o body */
#root { height: 100vh; height: 100dvh; width: 100%; display: flex; }

/* Scrollbar fina global */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: var(--c-text-muted); }

/* vite.config.ts — alias usado nos imports ('@/components/...')
   resolve: { alias: { '@': path.resolve(__dirname, './src') } } */`
