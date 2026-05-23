import "./App.css";
import SandboxPage from "./game/render/SandboxPage";
import GamePage from "./game/render/GamePage";
import type { GameMode } from "./game/core/gameTypes";

function App() {
  const gameMode: GameMode = "game";

  return (
    <>
      <div>{gameMode === "sandbox" ? <SandboxPage /> : <GamePage />}</div>
    </>
  );
}

export default App;
