import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import './App.css'
import Scene from "./components/Scene.tsx";
import Toolbar from "./components/Toolbar.tsx";
import type { Shape, ShapeType } from "./types/shape";

function App() {
    const [shapes, setShapes] = useState<Shape[]>([]);

    function addShape(type: ShapeType) {
        const newShape: Shape = {
            id: crypto.randomUUID(),
            type,
            position: [
                Math.random() * 4 - 2,
                0.5,
                Math.random() * 4 - 2,
            ],
            color: type === "cube" ? "orange" : "royalblue",
        };

        setShapes((currentShapes) => [...currentShapes, newShape]);
    }
  return (
    <main className="app">
      <Toolbar onAddShape={addShape}  />
      <section className="canvas-container">
        <Canvas camera={{ position: [5, 5, 7], fov: 50 }}>
          <Scene shapes={shapes} />
        </Canvas>
      </section>
    </main>
  )
}

export default App
