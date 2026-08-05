import { PhaserGame } from './components/game/PhaserGame'
import './styles/App.css'

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Manipulador de Alimentos</h1>
      </header>
      <main className="app__game">
        <PhaserGame />
      </main>
    </div>
  )
}

export default App
