import { useCallback } from 'react'
import { PhaserGame } from './components/game/PhaserGame'
import { EventBus } from './game/events/EventBus'
import { GameEvents } from './game/events/eventTypes'
import './styles/App.css'

function App() {
  const handleUpdateGameText = useCallback(() => {
    EventBus.emit(GameEvents.UpdateMainText, { text: 'Texto actualizado desde React' })
  }, [])

  return (
    <div className="app">
      <header className="app__header">
        <h1>Manipulador de Alimentos</h1>
        <button type="button" onClick={handleUpdateGameText}>
          Actualizar texto del juego
        </button>
      </header>
      <main className="app__game">
        <PhaserGame />
      </main>
    </div>
  )
}

export default App
