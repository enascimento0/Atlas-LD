import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, LockKey, PencilSimple, Plus, UserCirclePlus } from '@phosphor-icons/react'
import { Avatar } from '../components/conteudo/Pecas'
import { Modal } from '../components/ui/Dialogos'
import { Cabecalho } from '../components/ui/Doc'
import { listarHistorico, listarUsuarios, salvarUsuario, useDadosAtlas } from '../lib/api'
import { AREAS } from '../lib/areas'
import { useUsuario } from '../lib/auth'
import { dataHora, ROTULO_ACAO } from '../lib/formatar'
import { podeGerenciarUsuarios, ROTULO_PERFIL } from '../lib/permissoes'
import { usePreferencias } from '../lib/preferencias'
import type { Area, Perfil, Usuario } from '../lib/tipos'

type Rascunho = Omit<Usuario, 'id'> & { id?: string }
const NOVO: Rascunho = { nome: '', login: '', email: '', senha: 'Atlas@2026', perfil: 'colaborador', areas: ['produtos'], podePublicar: false, ativo: true }

const COR_PERFIL: Record<Perfil, [string, string]> = {
  admin: ['--c-ai-bg', '--c-ai'], colaborador: ['--c-info-bg', '--c-info-txt'], leitor: ['--c-table-head', '--c-neutral'],
}

export default function Colaboradores() {
  const eu = useUsuario()
  useDadosAtlas()
  const [aba, setAba] = useState<'usuarios' | 'atividade'>('usuarios')
  const [editando, setEditando] = useState<Rascunho | null>(null)

  if (!podeGerenciarUsuarios(eu)) return (
    <div className="pagina">
      <Cabecalho trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: 'Administração' }]} titulo="Acesso restrito" />
      <div className="vazio-rico">
        <div className="circ"><LockKey size={20} /></div>
        <b style={{ fontSize: 15 }}>Somente o time de Produtos administra o Atlas</b>
        <p>A gestão de colaboradores e permissões é restrita a administradores.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}><ArrowRight size={16} />Voltar ao início</Link>
      </div>
    </div>
  )

  const usuarios = listarUsuarios()
  const atividade = listarHistorico()
  return (
    <div className="pagina">
      <Cabecalho trilha={[{ rotulo: 'Atlas', rota: '/' }, { rotulo: 'Administração' }, { rotulo: 'Colaboradores' }]} titulo="Colaboradores e permissões"
        acoes={<button className="btn btn-primary" onClick={() => setEditando({ ...NOVO })}><Plus size={16} weight="bold" />Novo colaborador</button>} />

      <div className="abas" role="tablist">
        <button role="tab" aria-selected={aba === 'usuarios'} className={`aba ${aba === 'usuarios' ? 'active' : ''}`} onClick={() => setAba('usuarios')}>Colaboradores<span className="cont">{usuarios.length}</span></button>
        <button role="tab" aria-selected={aba === 'atividade'} className={`aba ${aba === 'atividade' ? 'active' : ''}`} onClick={() => setAba('atividade')}>Atividade recente<span className="cont">{atividade.length}</span></button>
      </div>

      {aba === 'usuarios' ? (
        <div className="tw">
          <table className="tbl" style={{ minWidth: 820 }}>
            <thead><tr><th style={{ width: '28%' }}>Pessoa</th><th>Usuário</th><th>Perfil</th><th style={{ width: '26%' }}>Áreas</th><th>Publicar</th><th>Situação</th><th style={{ width: 56 }} /></tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Avatar nome={u.nome} tam={28} /><div><b>{u.nome}</b><div className="note" style={{ margin: 0 }}>{u.email}</div></div></div></td>
                  <td className="mono">{u.login}</td>
                  <td><span className="badge" style={{ background: `var(${COR_PERFIL[u.perfil][0]})`, color: `var(${COR_PERFIL[u.perfil][1]})` }}>{ROTULO_PERFIL[u.perfil].toUpperCase()}</span></td>
                  <td>{u.perfil === 'leitor' ? <span className="note" style={{ margin: 0 }}>Somente leitura</span> : u.perfil === 'admin' ? 'Todas' : u.areas.length ? u.areas.map(a => AREAS.find(x => x.id === a)!.rotulo).join(', ') : '—'}</td>
                  <td>{u.perfil === 'leitor' ? '—' : u.podePublicar ? 'Sim' : 'Não'}</td>
                  <td><span className="badge" style={u.ativo ? { background: 'var(--c-success-bg)', color: 'var(--c-success-txt)' } : { background: 'var(--c-table-head)', color: 'var(--c-neutral)' }}>{u.ativo ? 'ATIVO' : 'INATIVO'}</span></td>
                  <td><button className="icb" aria-label={`Editar ${u.nome}`} title="Editar" onClick={() => setEditando({ ...u })}><PencilSimple size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : atividade.length === 0 ? (
        <div className="vazio-rico"><b>Nenhuma atividade registrada</b><p>As criações, edições e publicações aparecem aqui.</p></div>
      ) : (
        <div className="card" style={{ padding: '4px 20px' }}>
          <ul className="hist">
            {atividade.slice(0, 80).map(r => (
              <li key={r.id}><Avatar nome={r.usuarioNome} /><div>
                <b>{r.usuarioNome}</b> {ROTULO_ACAO[r.tipo].toLowerCase()}{r.paginaTitulo ? <>: <span>{r.paginaTitulo}</span></> : ''}{r.detalhe ? <> <span className="mono">· {r.detalhe}</span></> : ''}
                <small>{dataHora(r.em)}</small></div></li>
            ))}
          </ul>
        </div>
      )}

      {editando && <FormUsuario inicial={editando} ehEu={editando.id === eu?.id} fechar={() => setEditando(null)} />}
    </div>
  )
}

function FormUsuario({ inicial, ehEu, fechar }: { inicial: Rascunho; ehEu: boolean; fechar: () => void }) {
  const { avisar } = usePreferencias()
  const [d, setD] = useState<Rascunho>(inicial)
  const [erro, setErro] = useState('')
  const set = <K extends keyof Rascunho>(k: K, v: Rascunho[K]) => { setD(x => ({ ...x, [k]: v })); setErro('') }
  const alternarArea = (a: Area) => set('areas', d.areas.includes(a) ? d.areas.filter(x => x !== a) : [...d.areas, a])

  const salvar = () => {
    try { salvarUsuario(d); avisar(inicial.id ? 'Permissões atualizadas.' : 'Colaborador cadastrado.'); fechar() } catch (e) { setErro((e as Error).message) }
  }
  return (
    <Modal titulo={inicial.id ? 'Editar colaborador' : 'Novo colaborador'} fechar={fechar} largura={520} acoes={<>
      <button className="btn btn-outline" onClick={fechar}>Cancelar</button>
      <button className="btn btn-primary" onClick={salvar}><UserCirclePlus size={16} />Salvar</button>
    </>}>
      <div className="mdl-campos">
        <label className="campo-wrap"><span className="campo-lbl">Nome</span><input className="campo" value={d.nome} onChange={e => set('nome', e.target.value)} autoFocus /></label>
        <label className="campo-wrap"><span className="campo-lbl">E-mail</span><input className="campo" type="email" value={d.email} onChange={e => set('email', e.target.value)} /></label>
        <div className="mdl-duas">
          <label className="campo-wrap" style={{ minWidth: 0 }}><span className="campo-lbl">Usuário</span><input className="campo" value={d.login} onChange={e => set('login', e.target.value)} autoComplete="off" /></label>
          <label className="campo-wrap" style={{ minWidth: 0 }}><span className="campo-lbl">Senha (simulação)</span><input className="campo" value={d.senha} onChange={e => set('senha', e.target.value)} autoComplete="off" /></label>
        </div>
        <label className="campo-wrap"><span className="campo-lbl">Perfil</span>
          <select className="campo" value={d.perfil} onChange={e => set('perfil', e.target.value as Perfil)} disabled={ehEu}>
            {(Object.keys(ROTULO_PERFIL) as Perfil[]).map(p => <option key={p} value={p}>{ROTULO_PERFIL[p]}</option>)}
          </select>
          {ehEu && <span className="note">Você não pode alterar o seu próprio perfil.</span>}
        </label>

        {d.perfil === 'colaborador' && (
          <fieldset className="mdl-grupo">
            <legend>Pode criar e editar em</legend>
            {AREAS.map(a => <label key={a.id} className="chk"><input type="checkbox" checked={d.areas.includes(a.id)} onChange={() => alternarArea(a.id)} />{a.rotulo}</label>)}
            <label className="chk" style={{ marginTop: 6 }}><input type="checkbox" checked={d.podePublicar} onChange={e => set('podePublicar', e.target.checked)} />Autorizado a publicar e despublicar</label>
          </fieldset>
        )}
        {d.perfil === 'admin' && <p className="note" style={{ margin: 0 }}>Administradores têm acesso global: criam, editam, publicam, excluem e gerenciam colaboradores em todas as áreas.</p>}
        {d.perfil === 'leitor' && <p className="note" style={{ margin: 0 }}>Leitores consultam conteúdos publicados, navegam e pesquisam, sem ver controles de edição.</p>}

        <label className="chk"><input type="checkbox" checked={d.ativo} onChange={e => set('ativo', e.target.checked)} disabled={ehEu} />Acesso ativo</label>
      </div>
      {erro && <div className="aviso" role="alert" style={{ marginTop: 12 }}>{erro}</div>}
    </Modal>
  )
}
