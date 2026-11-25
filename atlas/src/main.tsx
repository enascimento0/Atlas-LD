import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles/tokens.css'
import './styles/app.css'
import './styles/apol.css'
import './styles/biblioteca.css'
import './styles/ds-previas.css'
import './styles/conteudo.css'
import './styles/seletor-data.css'
import { PreferenciasProvider } from './lib/preferencias'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <PreferenciasProvider>
        <App />
      </PreferenciasProvider>
    </HashRouter>
  </StrictMode>,
)
