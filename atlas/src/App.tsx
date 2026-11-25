import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Shell } from './components/layout/Shell'
import { Inicio } from './pages/Inicio'
import { Login } from './pages/Login'
import { DesignSystemLayout, DesignSystemVisao } from './pages/design-system/DesignSystem'
import { AREAS } from './lib/areas'
import { useUsuario } from './lib/auth'

const Icones = lazy(() => import('./pages/design-system/icones/Icones'))
const Componentes = lazy(() => import('./pages/design-system/componentes/Componentes'))
const Cores = lazy(() => import('./pages/design-system/fundamentos/Cores'))
const Tipografia = lazy(() => import('./pages/design-system/fundamentos/Tipografia'))
const Espacamento = lazy(() => import('./pages/design-system/fundamentos/Espacamento'))
const Efeitos = lazy(() => import('./pages/design-system/fundamentos/Efeitos'))
const Downloads = lazy(() => import('./pages/design-system/downloads/Downloads'))
const AreaLista = lazy(() => import('./pages/conteudo/AreaLista'))
const Pagina = lazy(() => import('./pages/conteudo/Pagina'))
const Editor = lazy(() => import('./pages/conteudo/Editor'))
const Novidades = lazy(() => import('./pages/Novidades'))
const Colaboradores = lazy(() => import('./pages/Colaboradores'))


/* Endereços antigos do Design System (APOL+ e Biblioteca separados) levam ao lugar unificado. */
function RedirecionaDS({ para, hash }: { para: string; hash?: string }) {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const aba = params.get('aba')
  if (para === '/design-system/componentes' && aba) {
    params.delete('aba')
    const destino = ({ cores: 'cores', tipografia: 'tipografia', sombras: 'efeitos' } as Record<string, string>)[aba]
    if (destino) return <Navigate to={`/design-system/${destino}`} replace />
  }
  const q = params.toString()
  return <Navigate to={{ pathname: para, search: q ? `?${q}` : '', hash }} replace />
}
function Carregando() {
  return <div className="carregando" style={{ minHeight: 240 }}><div className="ov" style={{ background: 'transparent' }}><span>Carregando...</span></div></div>
}

export default function App() {
  const usuario = useUsuario()
  if (!usuario) return <Login />
  return (
    <Shell>
      <Suspense fallback={<Carregando />}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/design-system" element={<DesignSystemLayout />}>
            <Route index element={<DesignSystemVisao />} />
            <Route path="componentes" element={<Componentes />} />
            <Route path="cores" element={<Cores />} />
            <Route path="tipografia" element={<Tipografia />} />
            <Route path="espacamento" element={<Espacamento />} />
            <Route path="efeitos" element={<Efeitos />} />
            <Route path="icones" element={<Icones />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="apol" element={<RedirecionaDS para="/design-system/cores" />} />
            <Route path="apol-componentes" element={<RedirecionaDS para="/design-system/componentes" />} />
            <Route path="biblioteca" element={<RedirecionaDS para="/design-system/componentes" />} />
          </Route>
          {AREAS.flatMap(a => [
            <Route key={a.id} path={a.rota} element={<AreaLista area={a.id} />} />,
            <Route key={`${a.id}-novo`} path={`${a.rota}/novo`} element={<Editor area={a.id} />} />,
            <Route key={`${a.id}-ver`} path={`${a.rota}/:slug`} element={<Pagina area={a.id} />} />,
            <Route key={`${a.id}-ed`} path={`${a.rota}/:slug/editar`} element={<Editor area={a.id} />} />,
          ])}
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/novidades" element={<Novidades />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  )
}
