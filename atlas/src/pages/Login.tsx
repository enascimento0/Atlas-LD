import { useState, type FormEvent } from 'react'
import { Eye, EyeSlash, SignIn, WarningCircle, Info } from '@phosphor-icons/react'
import { entrar } from '../lib/auth'
import { ROTULO_PERFIL } from '../lib/permissoes'
import { USUARIOS_DEMO } from '../lib/semente'

function LogoAtlas() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 12h17M12 3.5c3 2.6 3 14.4 0 17M12 3.5c-3 2.6-3 14.4 0 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/* Usuário pré-cadastrado (fake) já preenchido: produtos01 / Atlas@2026 */
const PADRAO = USUARIOS_DEMO[0]!

export function Login() {
  const [login, setLogin] = useState(PADRAO.login)
  const [senha, setSenha] = useState(PADRAO.senha)
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    try { entrar(login, senha) } catch (x) { setErro((x as Error).message) }
  }

  return (
    <div className="lg">
      <div className="lg-glow" aria-hidden />
      <main className="lg-form-area">
        <div className="lg-marca"><span className="sb-logo-mark"><LogoAtlas /></span><b>Atlas</b></div>
        <form className="lg-form" onSubmit={enviar} noValidate>
          <h2>Entrar no Atlas</h2>
          <p className="lg-sub">Use seu usuário da LDSOFT para continuar.</p>

          <div className="lg-aviso"><Info size={16} weight="fill" /><span>Ambiente de demonstração: os dados ficam salvos só neste navegador.</span></div>

          <label className="campo-wrap">
            <span className="campo-lbl">Usuário</span>
            <input className={`campo ${erro ? 'erro' : ''}`} value={login} onChange={e => { setLogin(e.target.value); setErro('') }} autoComplete="username" autoFocus />
          </label>

          <label className="campo-wrap">
            <span className="campo-lbl">Senha</span>
            <div className="campo-ic">
              <input className={`campo ${erro ? 'erro' : ''}`} type={ver ? 'text' : 'password'} value={senha} onChange={e => { setSenha(e.target.value); setErro('') }} autoComplete="current-password" style={{ paddingRight: 40 }} />
              <button type="button" className="lg-olho" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>{ver ? <EyeSlash size={16} /> : <Eye size={16} />}</button>
            </div>
            {erro && <span className="campo-erro-msg" role="alert" style={{ display: 'flex', gap: 6, alignItems: 'center', lineHeight: 1.3 }}><WarningCircle size={14} weight="fill" />{erro}</span>}
          </label>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}><SignIn size={16} />Entrar</button>

          <div className="lg-demo">
            <div className="lg-demo-tit">Perfis de demonstração</div>
            <div className="lg-demo-lista">
              {USUARIOS_DEMO.filter(u => u.id !== 'u-colab2').map(u => (
                <button type="button" key={u.id} className="chip compacto" onClick={() => { setLogin(u.login); setSenha(u.senha); setErro('') }}>
                  {ROTULO_PERFIL[u.perfil]} <span style={{ opacity: .65 }}>· {u.login}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
        <footer className="lg-rodape">LDSOFT · Atlas</footer>
      </main>
    </div>
  )
}
