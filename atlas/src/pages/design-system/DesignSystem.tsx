import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import * as Ph from '@phosphor-icons/react'
import { Cabecalho, Codigo, Secao, Sumario, type ItemToc } from '../../components/ui/Doc'
import { DS_ABAS } from '../../lib/navegacao'
import biblioteca from '../../data/biblioteca.json'
import { CODIGOS } from './codigos'
import { ARMADILHAS, REGRAS, SETUP_CSS } from './regras'
import { EXTRAS } from './componentes/extras'
import { Tabela, useAncora } from './fundamentos/pecas'

export function DesignSystemLayout() {
  const { pathname } = useLocation()
  const atual = DS_ABAS.find(a => a.rota === pathname) ?? DS_ABAS[0]
  const visao = DS_ABAS[0]
  const biblioteca = DS_ABAS.slice(1)               // tudo do Design System vive dentro da Biblioteca
  const naDownloads = pathname === '/design-system/downloads'
  const naBiblioteca = !naDownloads && atual.rota !== visao.rota
  return (
    <div className="pagina">
      <Cabecalho trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: 'Design System', rota: '/design-system' }, ...(naBiblioteca ? [{ rotulo: 'Biblioteca', rota: biblioteca[0].rota }, { rotulo: atual.rotulo }] : naDownloads ? [{ rotulo: 'Downloads' }] : [])]} titulo="Design System" />
      <nav className="abas" aria-label="Design System">
        <NavLink to={visao.rota} end className="aba">
          {({ isActive }) => <><visao.icone size={14} weight={isActive ? 'fill' : 'regular'} />{visao.rotulo}</>}
        </NavLink>
        <NavLink to={biblioteca[0].rota} className={`aba${naBiblioteca ? ' active' : ''}`}>
          <Ph.Books size={14} weight={naBiblioteca ? 'fill' : 'regular'} />Biblioteca
        </NavLink>
        <NavLink to="/design-system/downloads" className="aba">
          {({ isActive }) => <><Ph.DownloadSimple size={14} weight={isActive ? 'fill' : 'regular'} />Downloads</>}
        </NavLink>
      </nav>
      {naBiblioteca && (
        <nav className="chips-sub" aria-label="Biblioteca">
          {biblioteca.map(a => (
            <NavLink key={a.rota} to={a.rota} end className={({ isActive }) => `chip compacto${isActive ? ' on' : ''}`}>
              <a.icone size={14} weight={a.rota === pathname ? 'fill' : 'regular'} />{a.rotulo}
            </NavLink>
          ))}
        </nav>
      )}
      <Outlet />
    </div>
  )
}

const SECOES: ItemToc[] = [
  { id: 'mapa', titulo: '1. Mapa do sistema', termos: 'seções componentes cores' },
  { id: 'construcao', titulo: '2. Como é construído', termos: 'css prefixo tailwind setup vite' },
  { id: 'regras', titulo: '3. Regras', termos: 'padrão token ícone tabela confirm' },
  { id: 'armadilhas', titulo: '4. Armadilhas conhecidas', termos: 'select autocomplete portal z-index' },
  { id: 'utilitarios', titulo: '5. Utilitários', termos: 'formatarNumero data hook' },
]

export function DesignSystemVisao() {
  useAncora()
  const aba = (r: string) => DS_ABAS.find(a => a.rota === r)!
  const totalComp = biblioteca.componentes.length + 7 + EXTRAS.length
  const cartoes = [
    { ...aba('/design-system/componentes'), cor: '#1F4E79', numeros: [[String(totalComp), 'componentes'], [String(Object.keys(CODIGOS).length), 'com código'], ['Ao vivo', 'prévia']], texto: 'Botões, campos, tabelas, modais, drawers e padrões de tela. Cada componente abre num painel maximizável com prévia, propriedades e o código React + CSS para reproduzir do zero.' },
    { ...aba('/design-system/cores'), cor: 'var(--c-sidebar-bg)', numeros: [['7', 'temas'], ['2', 'modos'], ['100%', 'por token']], texto: 'Tokens de marca, superfície, texto, status e estados de campo. Temas de destaque, modo escuro em código e tokens exportáveis em JSON.' },
    { ...aba('/design-system/tipografia'), cor: '#003E7E', numeros: [['Inter', 'fonte'], ['13px', 'base'], ['16', 'estilos']], texto: 'A escala fechada de estilos de texto, com teste ao vivo, mais os estilos Ubuntu e Nunito da biblioteca.' },
    { ...aba('/design-system/espacamento'), cor: '#2B4C7E', numeros: [['8px', 'grade'], ['32/44/56', 'botões'], ['5', 'breakpoints']], texto: 'Grade de espaçamento, medidas e tamanhos de controles (botões small, medium e large) e tudo sobre responsividade num lugar só.' },
    { ...aba('/design-system/efeitos'), cor: '#3A3A48', numeros: [['6', 'raios'], ['3', 'sombras'], ['11', 'camadas']], texto: 'Raio, borda, sombras, camadas de z-index e movimento.' },
    { ...aba('/design-system/icones'), cor: '#2B2B36', numeros: [['1.512', 'ícones'], ['6', 'pesos'], ['14px', 'padrão']], texto: 'A biblioteca de ícones única da LDSOFT: Phosphor. Galeria com busca em português, código React e HTML pronto para copiar.' },
  ]
  const utilitarios = CODIGOS['x-utilitarios'] ?? []

  return (
    <div className="doc-cols">
      <div>
        <div className="hero" style={{ marginBottom: 32 }}>
          <svg className="hero-art" width="280" height="280" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth=".6" /><rect x="13" y="3" width="8" height="8" rx="4" stroke="#fff" strokeWidth=".5" /><rect x="3" y="13" width="8" height="8" rx="4" stroke="#fff" strokeWidth=".5" /><rect x="13" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth=".6" /></svg>
          <div className="eyebrow">Base de design e de código · LDSOFT</div>
          <h2>Design System</h2>
          <p>Um só sistema para o time de desenvolvimento e para o time de UX. Cada componente traz prévia, propriedades e código para ser reproduzido do zero em qualquer projeto. Toda cor vem de token, a grade é de 8 e os ícones são Phosphor. O próprio Atlas é construído com estes tokens: troque o <b>modo</b> claro/escuro no topo e veja o portal inteiro mudar junto.</p>
        </div>

        <Secao id="mapa" num="01" titulo="Mapa do sistema">
          <div className="grid g2" style={{ marginBottom: 24 }}>
            {cartoes.map(c => (
              <Link key={c.rota} to={c.rota} className="ds-cartao">
                <div className="topo" style={{ background: c.cor }}>
                  <c.icone size={40} weight="duotone" color="#fff" />
                  <div className="nums">{c.numeros.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div>
                </div>
                <div className="corpo">
                  <div className="t">{c.rotulo}<Ph.ArrowRight size={16} weight="bold" /></div>
                  <p>{c.texto}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="card" style={{ margin: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
              {([
                [Ph.MagnifyingGlass, <>Aperte <span className="kbd">Ctrl K</span> em qualquer tela para buscar um componente, cor ou ícone.</>],
                [Ph.Palette, <>Troque o <b>modo</b> claro/escuro no topo: a documentação e o próprio Atlas mudam juntos.</>],
                [Ph.CursorClick, <>Todo componente é clicável. No painel, use <b>Maximizar</b> para ver o código em tela cheia.</>],
                [Ph.Copy, <>Clique em cores, ícones e blocos de código para copiar.</>],
              ] as const).map(([I, t], i) => <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><I size={16} color="var(--c-support)" style={{ flexShrink: 0, marginTop: 2 }} /><span>{t}</span></div>)}
            </div>
          </div>
        </Secao>

        <Secao id="construcao" num="02" titulo="Como o sistema é construído" lead="Poucos componentes React pequenos; a maior parte do sistema é classe CSS + padrão de marcação.">
          <Tabela cab={['Decisão', 'Como é no projeto']} linhas={[
            ['Estilo', <>Um único arquivo global (<code>index.css</code>). Classes com prefixo por contexto. Sem CSS Modules nem styled-components.</>],
            ['Tailwind', <>v4 (<code>@import 'tailwindcss'</code>), usado só em componentes compartilhados. O resto é CSS próprio e <code>style={'{{}}'}</code> inline, que é aceito.</>],
            ['Cor', <>Sempre por token <code>var(--c-*)</code>. O destaque (<code>--c-support</code>) é trocado pelos 7 temas de usuário.</>],
            ['Modo escuro', <>Paleta real (<code>html.dark-mode</code>), não filtro. Superfície, texto e borda são redefinidos.</>],
            ['Ícones', <>Só Phosphor, import direto do barrel (<code>@phosphor-icons/react</code>). Não existe wrapper de ícone.</>],
            ['Tabela', <>Não existe <code>DataTable</code>: a <code>&lt;table&gt;</code> é escrita à mão com classes.</>],
            ['Stack', 'React 19 · TypeScript · Vite 6 · Inter'],
          ]} />
          <h3 className="h3">Prefixos de classe</h3>
          <Tabela cab={['Prefixo', 'Contexto']} linhas={[
            [<code>mp-</code>, 'Listagem: header, toolbar, tabela, paginação, estado vazio'],
            [<code>mf-</code>, 'Filtros e formulário em linha (mf-card, mf-row, mf-footer…)'],
            [<><code>pdd-</code> · <code>fd-</code> · <code>det-</code></>, 'Drawer de detalhe (cabeçalho, seções, mini-tabela)'],
            [<code>pdc-</code>, 'Drawer de configuração (painel de controle)'],
            [<code>pac-</code>, 'Menu de ações (dropdown)'],
            [<code>fg</code>, 'Campo de formulário vertical (rótulo em cima)'],
            [<code>toast-notif-</code>, 'Notificação em toast'],
            [<><code>sb-</code> · <code>sidebar-</code></>, 'Menu lateral'],
          ]} />
          <h3 className="h3">Setup mínimo para reproduzir</h3>
          <Codigo>{SETUP_CSS}</Codigo>
        </Secao>

        <Secao id="regras" num="03" titulo="Regras">
          <div className="card">
            {REGRAS.map(([t, d], i) => <div key={i} className="ponto"><div className="n">{i + 1}</div><div><b>{t}</b><span>{d}</span></div></div>)}
          </div>
        </Secao>

        <Secao id="armadilhas" num="04" titulo="Armadilhas conhecidas" lead="Erros que já custaram retrabalho.">
          <div className="card">
            {ARMADILHAS.map(([t, d], i) => <div key={i} className="ponto"><div className="n">{i + 1}</div><div><b>{t}</b><span>{d}</span></div></div>)}
          </div>
        </Secao>

        <Secao id="utilitarios" num="05" titulo="Utilitários" lead="Formatação e datas. Para o hook de tema e modo escuro, veja a aba Cores.">
          {utilitarios.map(a => <div key={a.rotulo} style={{ marginBottom: 16 }}><div className="note mono" style={{ margin: '0 0 6px' }}>{a.rotulo}</div><Codigo>{a.codigo}</Codigo></div>)}
        </Secao>
      </div>
      <Sumario itens={SECOES} />
    </div>
  )
}
