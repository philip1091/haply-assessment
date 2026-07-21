import { Canvas } from "@react-three/fiber";
import './App.css'
import Scene from "./components/Scene.tsx";

function App() {
  return (
    <main className="app">
      <header className="toolbar">
        <h1>Haply Assessment</h1>
      </header>
      <section className="canvas-container">
        <Canvas camera={{ position: [5, 5, 7], fov: 50 }}>
          <Scene />
        </Canvas>
      </section>
    </main>
  )
}

export default App
