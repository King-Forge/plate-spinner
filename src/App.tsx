import "./App.css";
import GameStage from "./game/render/GameStage";

function App() {
  return (
    <>
      <h1>Plate Spinner (project placeholder name)</h1>
      <h3>Sandbox utility for creating and tuning individual tasks</h3>
      <div>{GameStage()}</div>
    </>
  );
}

export default App;
