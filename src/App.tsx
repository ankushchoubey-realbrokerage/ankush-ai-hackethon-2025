import './App.css'
import { Game } from './components/Game'
import { SettingsProvider } from './contexts/SettingsContext'

function App() {
  return (
    <SettingsProvider>
      <Game />
    </SettingsProvider>
  )
}

export default App
