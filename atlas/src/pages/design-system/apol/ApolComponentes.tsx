import { useEffect, useRef, useState } from 'react'
import * as Ph from '@phosphor-icons/react'
import { Secao } from '../../../components/ui/Doc'

const Lbl = ({ children }: { children: React.ReactNode }) => <div className="demo-lbl">{children}</div>
const Nota = ({ children }: { children: React.ReactNode }) => <div className="note">{children}</div>
const H3 = ({ id, children }: { id: string; children: React.ReactNode }) => <h3 className="h3" id={id}>{children}</h3>

const BADGE = {
  CONCEDIDA: ['--c-success-bg', '--c-success-txt'], PEDIDO: ['--c-info-bg', '--c-info-txt'],
  ARQUIVADO: ['--c-danger-bg', '--c-danger-txt'], 'EXIGÊNCIA': ['--c-warning-bg', '--c-warning-txt'],
} as const
type Situacao = keyof typeof BADGE
const Badge = ({ s }: { s: Situacao }) => <span className="badge" style={{ background: `var(${BADGE[s][0]})`, color: `var(${BADGE[s][1]})` }}>{s}</span>
const SIGLA = { N: ['#E8F0FB', '#3B82F6', 'Nominativa'], M: ['#FEF3E2', '#C05621', 'Mista'], F: ['#E6FFFA', '#276749', 'Figurativa'] } as const
const Sigla = ({ s }: { s: keyof typeof SIGLA }) => <span className="sigla" style={{ background: SIGLA[s][0], color: SIGLA[s][1] }} title={SIGLA[s][2]}>{s}</span>

const PROCESSOS: { proc: string; marca: string; ap: keyof typeof SIGLA; titular: string; pasta: string; dep: string; sit: Situacao; classe: string }[] = [
  { proc: '912345678', marca: 'APOL MARCAS', ap: 'N', titular: 'LD Soft Ltda.', pasta: '2026/0142', dep: '12/03/2026', sit: 'CONCEDIDA', classe: '35' },
  { proc: '923456789', marca: 'VERDE VIVO', ap: 'M', titular: 'Empresa Exemplo S.A.', pasta: '2026/0098', dep: '03/07/2026', sit: 'PEDIDO', classe: '31' },
  { proc: '934567890', marca: '◆ (figura)', ap: 'F', titular: 'Comércio Alfa ME', pasta: '2025/0711', dep: '21/11/2025', sit: 'EXIGÊNCIA', classe: '41' },
  { proc: '945678901', marca: 'NORTE SUL', ap: 'N', titular: 'Grupo Beta Ltda.', pasta: '2024/0320', dep: '08/02/2024', sit: 'ARQUIVADO', classe: '9' },
]

function useForaDoClique(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb() }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [ref, cb])
}

type ToastV = 'success' | 'danger' | 'info' | 'warning'
const TOASTS: { v: ToastV; I: Ph.Icon; msg: string; acao?: string }[] = [
  { v: 'success', I: Ph.CheckCircle, msg: 'Lead criado com sucesso.' },
  { v: 'danger', I: Ph.WarningCircle, msg: 'Não foi possível salvar.' },
  { v: 'info', I: Ph.Info, msg: 'Cartão movido para Ganho.', acao: 'Desfazer' },
  { v: 'warning', I: Ph.WarningCircle, msg: 'Prazo vence amanhã.' },
]

export function ApolComponentes({ so }: { so?: string } = {}) {
  const [sbRec, setSbRec] = useState(false)
  const [sbItem, setSbItem] = useState('Marcas')
  const [carregando, setCarregando] = useState(false)
  const [campoErro, setCampoErro] = useState('12345')
  const [chips, setChips] = useState<Record<string, boolean>>({ Nominativa: false, Mista: true })
  const [aba, setAba] = useState('Dashboard')
  const [filtrosAbertos, setFiltrosAbertos] = useState(true)
  const [pesquisou, setPesquisou] = useState(false)
  const [menuAcoes, setMenuAcoes] = useState(false)
  const [selecionados, setSelecionados] = useState<string[]>(['912345678'])
  const [aviso, setAviso] = useState(false)
  const [pagina, setPagina] = useState(1)
  const [drawer, setDrawer] = useState<string | null>('912345678')
  const [confirmar, setConfirmar] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; t: typeof TOASTS[number] }[]>([])
  const pacRef = useRef<HTMLDivElement>(null)
  useForaDoClique(pacRef, () => setMenuAcoes(false))

  const disparar = (t: typeof TOASTS[number]) => {
    const id = Date.now(); setToasts(x => [...x.slice(-2), { id, t }])
    setTimeout(() => setToasts(x => x.filter(y => y.id !== id)), t.acao ? 8000 : 4000)
  }
  const proc = PROCESSOS.find(p => p.proc === drawer)
  const todos = selecionados.length === PROCESSOS.length

  const corpo = (<>
      {(!so || so === 'c-casca') && (<>
        {!so && <H3 id="c-casca">Casca da aplicação</H3>}
      <div className="demo">
        <div className="dm-shell">
          <aside className={`dm-sb ${sbRec ? 'rec' : ''}`}>
            <button type="button" className="dm-toggle" onClick={() => setSbRec(r => !r)} aria-label={sbRec ? 'Expandir menu' : 'Recolher menu'}>{sbRec ? <Ph.CaretRight size={12} weight="bold" /> : <Ph.CaretLeft size={12} weight="bold" />}</button>
            <div className="dm-logo"><span className="dm-logo-mark"><Ph.Tag size={16} weight="fill" /></span><span className="dm-logo-txt">Apol<small>LDSOFT · Marcas</small></span></div>
            <nav className="dm-nav">
              {([['Geral', [['Início', Ph.House], ['Marcas', Ph.Tag]]], ['Gestão', [['CRM', Ph.Kanban], ['Financeiro', Ph.CurrencyCircleDollar]]]] as const).map(([g, itens]) => (
                <div key={g}>
                  <div className="dm-grupo">{g}</div><div className="dm-grupo-sep" />
                  {itens.map(([n, I]) => (
                    <div key={n} className={`dm-item ${sbItem === n ? 'on' : ''}`} onClick={() => setSbItem(n)} title={sbRec ? n : undefined}><I size={18} weight={sbItem === n ? 'fill' : 'regular'} /><span>{n}</span></div>
                  ))}
                </div>
              ))}
            </nav>
          </aside>
          <div className="dm-main">
            <div className="dm-tb">
              <div className="r"><Ph.Bell size={18} /><div className="tb-av">EN</div></div>
            </div>
            <div className="dm-cont">
              <div className="crumb">{sbItem} <Ph.CaretRight size={10} /> Manutenção</div>
              <div className="page-title">Relatório de {sbItem === 'Marcas' ? 'Processos' : sbItem}</div>
              <Nota>Área de conteúdo · padding 20px · fundo <code>--c-bg</code></Nota>
            </div>
          </div>
        </div>
      </div>
      <Nota>Sidebar 220px (redimensionável 200–420, recolhida 60), canto direito com raio 12px. Topbar 56px, padding lateral 32px. Clique nos itens e no botão redondo da borda da sidebar para recolher ou expandir.</Nota>
      </>)}

      {(!so || so === 'c-botoes') && (<>
        {!so && <H3 id="c-botoes">Botões</H3>}
      <div className="demo">
        <Lbl>Padrão · 40px · 14/600 · raio 8 · padding 8×16</Lbl>
        <button className="btn btn-primary"><Ph.MagnifyingGlass size={16} />Pesquisar</button>
        <button className="btn btn-outline">Limpar</button>
        <button className="btn btn-success"><Ph.Check size={16} />Concluído</button>
        <button className="btn btn-danger">Excluir</button>
        <button className="btn btn-text-danger">Remover</button>
        <button className="btn btn-brand"><Ph.Plus size={16} weight="bold" />Novo processo</button>
      </div>
      <div className="demo">
        <Lbl>Compacto · 32px · 13/600</Lbl>
        <button className="btn btn-sm btn-primary"><Ph.FloppyDisk size={14} />Salvar</button>
        <button className="btn btn-sm btn-outline"><Ph.PencilSimple size={14} />Editar</button>
        <button className="btn btn-sm btn-pac">Ações (3)<Ph.CaretDown size={14} /></button>
      </div>
      <div className="demo">
        <Lbl>Estados — clique em “Salvar” para ver o carregando</Lbl>
        <button className="btn btn-primary" disabled>Desabilitado</button>
        <button className="btn btn-outline" disabled>Desabilitado</button>
        <button className={`btn btn-primary ${carregando ? 'loading' : ''}`} onClick={() => { setCarregando(true); setTimeout(() => setCarregando(false), 1600) }} aria-label={carregando ? 'Carregando' : undefined}>
          {carregando ? <span className="spin"><Ph.ArrowClockwise size={16} /></span> : 'Salvar'}
        </button>
        <button className="btn btn-outline loading" aria-label="Carregando"><span className="spin"><Ph.ArrowClockwise size={16} /></span></button>
      </div>
      <div className="tw-doc" style={{ marginTop: 12 }}><table className="dt">
        <thead><tr><th>Variante</th><th>Classe no app</th><th>Fundo · borda · texto</th></tr></thead>
        <tbody>
          <tr><td>Primário</td><td><code>.mf-btn-search</code> <code>.mp-btn-support</code></td><td><code>--c-support</code> · branco · hover <code>--c-support-h</code></td></tr>
          <tr><td>Secundário</td><td><code>.mf-btn-clear</code> <code>.mp-btn-ghost</code></td><td><code>--c-surface</code> · <code>--c-border</code> · <code>#51515C</code></td></tr>
          <tr><td>Sucesso</td><td><code>.mp-btn-success</code></td><td><code>--c-success</code> · branco</td></tr>
          <tr><td>Texto de perigo</td><td><code>.btn-danger-text</code></td><td>sem fundo · <code>--c-danger</code> · hover <code>--c-danger-bg</code></td></tr>
          <tr><td>Compacto</td><td><code>.hdr-action-btn</code> <code>.pac-btn</code> <code>.det-act-btn</code></td><td>32px · padding 0 14px</td></tr>
          <tr><td>Desabilitado</td><td>—</td><td>filled <code>#CBD5E1</code> · outline texto <code>#CBD5E1</code> · sem opacidade</td></tr>
          <tr><td>Carregando</td><td>filho <code>.animate-spin</code></td><td>só spinner 16px · largura mín. 64px</td></tr>
        </tbody>
      </table></div>
      </>)}

      {(!so || so === 'c-campos') && (<>
        {!so && <H3 id="c-campos">Campos de formulário</H3>}
      <div className="demo">
        <div className="campo-wrap"><span className="campo-lbl">Padrão</span><input className="campo" placeholder="Digite o nome da marca" /></div>
        <div className="campo-wrap"><span className="campo-lbl">Foco</span><input className="campo foco" defaultValue="APOL" /></div>
        <div className="campo-wrap"><span className="campo-lbl">Erro (digite 9 dígitos)</span>
          <input className={`campo ${/^\d{9}$/.test(campoErro) ? '' : 'erro'}`} value={campoErro} onChange={e => setCampoErro(e.target.value.replace(/\D/g, '').slice(0, 9))} />
          {!/^\d{9}$/.test(campoErro) && <span className="campo-erro-msg">Número de processo inválido.</span>}
        </div>
        <div className="campo-wrap"><span className="campo-lbl">Desabilitado</span><input className="campo" defaultValue="Não editável" disabled /></div>
        <div className="campo-wrap"><span className="campo-lbl">Select</span><select className="campo"><option>Todos</option><option>Ana</option><option>Bruno</option></select></div>
      </div>
      <div className="demo col">
        <Lbl>Linha de formulário (.mf-row) — rótulo 150px + campo flexível</Lbl>
        <div className="mf-row"><span className="mf-row-lbl">Responsável:</span><div className="mf-row-val"><select className="campo"><option>Todos</option></select></div></div>
        <div className="mf-row"><span className="mf-row-lbl">Situação:</span><div className="mf-row-val" style={{ gap: 16 }}>
          <label className="chk"><input type="checkbox" defaultChecked />Ativos</label>
          <label className="chk"><input type="checkbox" />Arquivados</label>
          <label className="chk"><input type="radio" name="r1" defaultChecked />Todos</label>
          <label className="chk"><input type="radio" name="r1" />Só meus</label>
        </div></div>
      </div>
      <Nota>32px · borda 1.5px · raio 6 · padding 0 16px · 12.5px. Foco sem halo. Erro: mensagem 12px, 8px abaixo, sem caixa nem ícone.</Nota>
      </>)}

      {(!so || so === 'c-chips') && (<>
        {!so && <H3 id="c-chips">Chips e badges</H3>}
      <div className="demo">
        <Lbl>Chip · clique para ativar</Lbl>
        {['Nominativa', 'Mista'].map(c => <button key={c} className={`chip ${chips[c] ? 'on' : ''}`} onClick={() => setChips(x => ({ ...x, [c]: !x[c] }))}>{c}</button>)}
        <button className="chip off" disabled>Figurativa</button>
        <button className="chip compacto">Últimos 30 dias</button>
      </div>
      <div className="demo">
        <Lbl>Badge de status (pílula)</Lbl>
        {(Object.keys(BADGE) as Situacao[]).map(s => <Badge key={s} s={s} />)}
      </div>
      <div className="demo">
        <Lbl>Sigla 22×22 (ApresentacaoBadge)</Lbl>
        <Sigla s="N" /><Sigla s="M" /><Sigla s="F" />
        <span className="sigla" style={{ background: 'var(--c-info-bg)', color: 'var(--c-info-txt)' }} title="Patente">P</span>
        <span className="sigla" style={{ background: 'var(--c-warning-bg)', color: 'var(--c-warning-txt)' }} title="Marca">T</span>
        <span className="sigla" style={{ background: 'var(--c-surface-2)', color: 'var(--c-table-head-txt)' }}>—</span>
        <span className="note" style={{ margin: 0 }}>N, M e F usam fundos literais sem versão escura (ver Pontos a padronizar).</span>
      </div>
      </>)}

      {(!so || so === 'c-abas') && (<>
        {!so && <H3 id="c-abas">Abas</H3>}
      <div className="demo col">
        <div className="abas" style={{ margin: 0 }}>
          {([['Dashboard', Ph.Gauge], ['Quadros', Ph.Kanban], ['Clientes', Ph.Users]] as const).map(([n, I]) => (
            <button key={n} className={`aba ${aba === n ? 'on' : ''}`} onClick={() => setAba(n)}><I size={14} weight={aba === n ? 'fill' : 'regular'} />{n}</button>
          ))}
        </div>
        <div style={{ color: 'var(--c-neutral)', fontSize: 12.5 }}>Conteúdo de <b style={{ color: 'var(--c-text)' }}>{aba}</b></div>
      </div>
      <Nota>Padding 9×14 · 12.5px · inativa 600 <code>--c-neutral</code> ícone regular · ativa 700 <code>--c-support</code> ícone fill + borda inferior 2px.</Nota>
      </>)}

      {(!so || so === 'c-filtros') && (<>
        {!so && <H3 id="c-filtros">Card de filtros</H3>}
      <div className="demo">
        <div className="mf-card">
          <div className="mf-card-hdr" onClick={() => setFiltrosAbertos(a => !a)}>Filtros de Pesquisa{filtrosAbertos ? <Ph.CaretUp size={14} /> : <Ph.CaretDown size={14} />}</div>
          {filtrosAbertos && <div>
            <div className="mf-two-col">
              <div className="mf-col">
                <div className="mf-row"><span className="mf-row-lbl">Processo:</span><div className="mf-row-val"><input className="campo" placeholder="Separe por vírgula" /></div></div>
                <div className="mf-row"><span className="mf-row-lbl">Marca:</span><div className="mf-row-val"><select className="campo" style={{ flex: '0 0 120px' }}><option>Contém</option><option>Igual a</option></select><input className="campo" /></div></div>
              </div>
              <div className="mf-col">
                <div className="mf-row"><span className="mf-row-lbl">Responsável:</span><div className="mf-row-val"><select className="campo"><option>Todos</option></select></div></div>
                <div className="mf-row"><span className="mf-row-lbl">Classe NCL:</span><div className="mf-row-val"><input className="campo" placeholder="Ex.: 35, 41" /></div></div>
              </div>
            </div>
            <div className="mf-footer"><button className="btn btn-outline" onClick={() => setPesquisou(false)}>Limpar</button><button className="btn btn-primary" onClick={() => { setPesquisou(true); setFiltrosAbertos(false) }}><Ph.MagnifyingGlass size={16} />Pesquisar</button></div>
          </div>}
        </div>
        {pesquisou && <div className="note" style={{ margin: 0 }}>✓ Pesquisar fecha o card de filtros — igual ao app. Clique no cabeçalho para reabrir.</div>}
      </div>
      <Nota>No app o card é <i>sticky</i> no topo. Duas colunas com 32px de vão; 1 coluna em ≤900px.</Nota>
      </>)}

      {(!so || so === 'c-toolbar') && (<>
        {!so && <H3 id="c-toolbar">Barra de ações</H3>}
      <div className="demo col">
        <div className="toolbar">
          <span className="count"><strong>1.234</strong> processos{selecionados.length > 0 && <> · {selecionados.length} selecionado{selecionados.length > 1 ? 's' : ''}</>}</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <div className="ordenar"><span>Ordenar</span><select className="campo"><option>Data de depósito</option><option>Marca</option></select></div>
            <div className="pac" ref={pacRef}>
              <button className="btn btn-sm btn-pac" onClick={() => { if (selecionados.length === 0) { setAviso(true); return } setMenuAcoes(m => !m) }}>Ações ({selecionados.length})<Ph.CaretDown size={14} /></button>
              {menuAcoes && <div className="pac-menu">
                <div className="pac-item" onClick={() => setMenuAcoes(false)}><Ph.FileXls size={15} />Exportar XLS</div>
                <div className="pac-item" onClick={() => setMenuAcoes(false)}><Ph.FilePdf size={15} />Exportar PDF</div>
                <div className="pac-item" onClick={() => setMenuAcoes(false)}><Ph.EnvelopeSimple size={15} />Enviar por e-mail</div>
                <div className="pac-sep" />
                <div className="pac-item perigo" onClick={() => { setMenuAcoes(false); setConfirmar(true); document.getElementById('c-modal')?.scrollIntoView({ behavior: 'smooth' }) }}><Ph.Trash size={15} />Excluir</div>
              </div>}
            </div>
          </div>
        </div>
        {aviso && selecionados.length === 0 && <div className="aviso"><Ph.WarningCircle size={14} />Selecione ao menos um processo para exportar.<button aria-label="Fechar" onClick={() => setAviso(false)}><Ph.X size={14} /></button></div>}
      </div>
      <Nota>O menu fica sempre visível; sem seleção, mostra o aviso amarelo em vez de esconder botões. Desmarque todas as linhas da tabela abaixo e clique em “Ações”.</Nota>
      </>)}

      {(!so || so === 'c-tabela') && (<>
        {!so && <H3 id="c-tabela">Tabela e paginação</H3>}
      <div className="demo col">
        <div className="tw"><table className="tbl">
          <thead><tr>
            <th style={{ width: 40 }}><input type="checkbox" checked={todos} onChange={() => setSelecionados(todos ? [] : PROCESSOS.map(p => p.proc))} aria-label="Selecionar todos" /></th>
            <th style={{ width: 120 }}>Processo</th><th>Marca</th><th style={{ width: 72 }}>Apres.</th><th>Titular</th><th style={{ width: 120 }}>Depósito</th><th style={{ width: 112 }}>Situação</th><th className="c-acoes" style={{ width: 56 }} />
          </tr></thead>
          <tbody>
            {PROCESSOS.map(p => {
              const on = selecionados.includes(p.proc)
              return (
                <tr key={p.proc} className={on ? 'sel' : ''}>
                  <td><input type="checkbox" checked={on} onChange={() => setSelecionados(s => on ? s.filter(x => x !== p.proc) : [...s, p.proc])} aria-label={`Selecionar ${p.proc}`} /></td>
                  <td className="c-proc" onClick={() => { setDrawer(p.proc); document.getElementById('c-drawer')?.scrollIntoView({ behavior: 'smooth' }) }}>{p.proc}</td>
                  <td className="c-marca">{p.marca}</td><td><Sigla s={p.ap} /></td>
                  <td className="c-sec">{p.titular}<br />Pasta {p.pasta}</td><td style={{ fontSize: 12 }}>{p.dep}</td><td><Badge s={p.sit} /></td>
                  <td className="c-acoes"><Ph.DotsThreeVertical size={18} /></td>
                </tr>
              )
            })}
          </tbody>
        </table></div>
        <div className="pag">
          <span>Exibindo <strong>{(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, 1234)}</strong> de <strong>1.234</strong></span>
          <div className="pag-ctrls">
            <select className="campo pag-size"><option>20 por página</option><option>50 por página</option><option>100 por página</option></select>
            <div className="pag-btns">
              <button className="pag-btn" disabled={pagina === 1} onClick={() => setPagina(p => p - 1)} aria-label="Anterior"><Ph.CaretLeft size={12} /></button>
              {[1, 2, 3].map(n => <button key={n} className={`pag-btn ${pagina === n ? 'on' : ''}`} onClick={() => setPagina(n)}>{n}</button>)}
              <span style={{ lineHeight: '28px', color: 'var(--c-text-muted)' }}>…</span>
              <button className={`pag-btn ${pagina === 62 ? 'on' : ''}`} onClick={() => setPagina(62)}>62</button>
              <button className="pag-btn" disabled={pagina === 62} onClick={() => setPagina(p => p === 3 ? 62 : p + 1)} aria-label="Próxima"><Ph.CaretRight size={12} /></button>
            </div>
          </div>
        </div>
      </div>
      <Nota>Clique no número do processo para abrir o drawer. Cabeçalho 11/700 UPPERCASE em <code>--c-table-head</code> · células <code>8px 16px</code> · colunas em múltiplos de 8 · coluna de ações fixa à direita.</Nota>
      </>)}

      {(!so || so === 'c-drawer') && (<>
        {!so && <H3 id="c-drawer">Drawer</H3>}
      <div className="demo">
        <div className="drawer-stage" style={{ background: drawer ? undefined : 'var(--c-bg)' }}>
          {!drawer && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><button className="btn btn-outline" onClick={() => setDrawer('912345678')}><Ph.SidebarSimple size={16} />Abrir drawer</button></div>}
          <div className={`drawer ${drawer ? '' : 'fechado'}`}>
            {proc && <>
              <div className="pdd-hdr">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><div className="pdd-hdr-title">Processo {proc.proc}</div><div><Badge s={proc.sit} /></div></div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><button className="btn btn-sm btn-outline"><Ph.PencilSimple size={14} />Editar</button><button className="pdd-close" aria-label="Fechar" onClick={() => setDrawer(null)}><Ph.X size={16} weight="bold" /></button></div>
              </div>
              <div className="pdd-body">
                <div className="pdd-section">
                  <div className="pdd-sec-title"><Ph.Info size={13} />Dados do processo</div>
                  <div className="pdd-grid">
                    {[['Marca', proc.marca], ['Classe NCL', proc.classe], ['Titular', proc.titular], ['Depósito', proc.dep]].map(([l, v]) => <div key={l}><div className="pdd-flabel">{l}</div><div className="pdd-fval">{v}</div></div>)}
                  </div>
                </div>
                <div className="pdd-section">
                  <div className="pdd-sec-title"><Ph.ClockCounterClockwise size={13} />Histórico</div>
                  <div style={{ fontSize: 12.5, color: 'var(--c-neutral)' }}>Seção · padding 16×22 · divisória <code>--c-border-soft</code></div>
                </div>
              </div>
              <div className="pdd-footer"><button className="btn btn-outline" onClick={() => setDrawer(null)}>Cancelar</button><button className="btn btn-primary">Salvar</button></div>
            </>}
          </div>
        </div>
      </div>
      <Nota>65% da largura (mín. 520px) · overlay <code>rgba(0,0,0,.3)</code> · entra em .3s. Variante compacta do cabeçalho: padding 14×18, fundo <code>--c-surface-2</code>, título 14/700.</Nota>
      </>)}

      {(!so || so === 'c-modal') && (<>
        {!so && <H3 id="c-modal">Modal</H3>}
      <div className="grid g2">
        <div className="modal-stage">
          <div className="modal" style={{ maxWidth: 448 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><h4>Novo contato</h4><button style={{ border: 0, background: 'none', color: 'var(--c-text-muted)', cursor: 'pointer', display: 'flex' }}><Ph.X size={18} /></button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="campo-wrap"><span className="campo-lbl">Nome</span><input className="campo" /></div>
              <div className="campo-wrap"><span className="campo-lbl">E-mail</span><input className="campo" /></div>
            </div>
            <div className="modal-acoes"><button className="btn btn-outline">Cancelar</button><button className="btn btn-primary">Salvar</button></div>
          </div>
        </div>
        <div className="modal-stage" style={{ alignItems: 'center' }}>
          {confirmar ? (
            <div className="modal" style={{ maxWidth: 420 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ph.WarningCircle size={22} weight="fill" color="var(--c-danger)" /></div>
                <div><h4>Excluir {selecionados.length > 1 ? `${selecionados.length} processos` : 'processo'}?</h4><p>Esta ação não pode ser desfeita.</p></div>
              </div>
              <div className="modal-acoes">
                <button className="btn btn-outline" disabled={excluindo} onClick={() => setConfirmar(false)}>Cancelar</button>
                <button className="btn btn-danger" disabled={excluindo} onClick={() => { setExcluindo(true); setTimeout(() => { setExcluindo(false); setConfirmar(false); disparar(TOASTS[0]) }, 1200) }}>{excluindo ? 'Aguarde...' : 'Excluir'}</button>
              </div>
            </div>
          ) : <button className="btn btn-danger" onClick={() => setConfirmar(true)}><Ph.Trash size={16} />Abrir confirmação</button>}
        </div>
      </div>
      <Nota>À esquerda, o <b>Modal genérico</b> (md 448px / lg 560px, raio 12, padding 24). À direita, o <b>ConfirmModal</b> (máx. 420px, sempre por cima), obrigatório para ação destrutiva — <code>window.confirm()</code> é proibido.</Nota>
      </>)}

      {(!so || so === 'c-toast') && (<>
        {!so && <H3 id="c-toast">Toast</H3>}
      <div className="demo">
        <Lbl>Clique para disparar no canto da área</Lbl>
        {TOASTS.map(t => <button key={t.v} className="btn btn-sm btn-outline" onClick={() => disparar(t)}><t.I size={14} weight="fill" color={`var(--c-${t.v})`} />{t.v === 'success' ? 'Sucesso' : t.v === 'danger' ? 'Erro' : t.v === 'info' ? 'Informação (com ação)' : 'Alerta'}</button>)}
        <div style={{ position: 'relative', width: '100%', minHeight: 180, borderTop: '1px dashed var(--c-border)', marginTop: 4 }}>
          <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            {toasts.length === 0 && TOASTS.map(t => (
              <div key={t.v} className={`toast toast-${t.v}`}><t.I size={16} weight="fill" />{t.msg}{t.acao && <button className="acao">{t.acao}</button>}<button className="fechar"><Ph.X size={13} weight="bold" /></button></div>
            ))}
            {toasts.map(({ id, t }) => (
              <div key={id} className={`toast toast-${t.v} toast-in`}><t.I size={16} weight="fill" />{t.msg}{t.acao && <button className="acao">{t.acao}</button>}<button className="fechar" onClick={() => setToasts(x => x.filter(y => y.id !== id))}><Ph.X size={13} weight="bold" /></button></div>
            ))}
          </div>
        </div>
      </div>
      <Nota>Canto inferior direito, 28px das bordas · 13/600 · raio 10 · borda 1.5px · <code>--shadow-md</code> · 4s (8s com ação).</Nota>
      </>)}

      {(!so || so === 'c-kpi') && (<>
        {!so && <H3 id="c-kpi">Cards de painel</H3>}
      <div className="demo col">
        <div className="grid g4">
          <div className="kpi"><div className="t"><Ph.Tray size={16} />Entraram no Período</div><div className="v">48</div><div className="l" style={{ color: 'var(--c-success)', fontWeight: 700 }}>+12 vs. período anterior</div></div>
          <div className="kpi"><div className="t"><Ph.Trophy size={16} />Ganhos</div><div className="v">17</div><div className="l">35% de conversão</div></div>
          <div className="kpi"><div className="t"><Ph.CurrencyCircleDollar size={16} />Valor ganho</div><div className="v">R$ 31,7 mil</div><div className="l">No período</div></div>
          <div className="kpi"><div className="t"><Ph.Timer size={16} />Tempo médio</div><div className="v">12 dias</div><div className="l">Do Novo Lead ao Ganho</div></div>
        </div>
        <div style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}><b style={{ fontSize: 13 }}>Cartões por Etapa</b><span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>01/10 – 23/10/2026</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([['Novo Lead', 22], ['Qualificação', 14], ['Proposta', 9], ['Ganho', 17]] as const).map(([n, q]) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '112px 1fr 40px', gap: 16, alignItems: 'center', fontSize: 12.5 }}>
                <span>{n}</span><div style={{ height: 10, borderRadius: 99, background: 'var(--c-surface-2)' }}><div style={{ height: '100%', width: `${q / 22 * 100}%`, borderRadius: 99, background: 'var(--c-support)' }} /></div><b style={{ textAlign: 'right' }}>{q}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Nota>KPI: padding 12×16, raio 12, valor 20/800 · 5 por linha (3 + 2 abaixo de 1100px). Card de painel: padding 16×20, título 13/700, colunas de no mínimo 520px.</Nota>
      </>)}

      {(!so || so === 'c-estados') && (<>
        {!so && <H3 id="c-estados">Estados de página</H3>}
      <div className="grid g2">
        <div className="vazio"><Ph.MagnifyingGlass size={32} color="var(--c-text-muted)" /><span>Nenhum registro encontrado.</span><button className="btn btn-outline">Limpar filtros</button></div>
        <div className="vazio"><Ph.WarningCircle size={32} color="var(--c-danger)" /><span>Não foi possível carregar os processos.</span></div>
        <div className="vazio-rico"><div className="circ"><Ph.Kanban size={20} /></div><b>Nenhum quadro ainda</b><p>Crie um quadro para organizar oportunidades por etapa.</p></div>
        <div className="carregando">
          <div className="tw" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}><div className="skel" style={{ width: '60%' }} /><div className="skel" /><div className="skel" style={{ width: '80%' }} /><div className="skel" /></div>
          <div className="ov"><span>Carregando...</span><span className="spin"><Ph.ArrowClockwise size={18} /></span></div>
        </div>
      </div>
      <Nota>Listagem carregando = overlay translúcido com spinner (sem skeleton na tabela). Skeleton só em cards.</Nota>
      </>)}
  </>)
  if (so) return <div className="apol-solo">{corpo}</div>
  return (
    <Secao id="componentes" num="08" titulo="Componentes" lead="Réplicas das classes do app, com os mesmos valores.">
      {corpo}
    </Secao>
  )
}
