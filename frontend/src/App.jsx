import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game';
import Results from './components/Results';

function GameRouter() {
  const { gameState } = useGame();

  switch (gameState) {
    case 'home':
      return <Home />;
    case 'lobby':
      return <Lobby />;
    case 'playing':
      return <Game />;
    case 'results':
      return <Results />;
    default:
      return <Home />;
  }
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen w-full">
        <GameRouter />
      </div>
    </GameProvider>
  );
}

export default App;
