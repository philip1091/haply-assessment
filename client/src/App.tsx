import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import './App.css'
import Scene from "./components/Scene.tsx";
import Toolbar from "./components/Toolbar.tsx";
import type { Shape, ShapeType, Vector3Tuple } from "./types/shape";
import { getRandomColor } from "./utils/randomColors";

function App() {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShapeId, setSelectedShapeId] =
        useState<string | null>(null);

    function addShape(type: ShapeType) {
        const newShape: Shape = {
            id: crypto.randomUUID(),
            type,
            position: [
                Math.random() * 4 - 2,
                0.5,
                Math.random() * 4 - 2,
            ],
            color: getRandomColor(),
        };

        setShapes((currentShapes) => [...currentShapes, newShape]);
        setSelectedShapeId(newShape.id);
    }

    function moveShape(
        shapeId: string,
        position: Vector3Tuple
    ) {
        setShapes((currentShapes) =>
            currentShapes.map((shape) =>
                shape.id === shapeId
                    ? { ...shape, position }
                    : shape
            )
        );
    }


  return (
    <main className="app">
      <Toolbar onAddShape={addShape}  />
      <section className="canvas-container">
        <Canvas camera={{ position: [5, 5, 7], fov: 50 }}>
          <Scene
              shapes={shapes}
              selectedShapeId={selectedShapeId}
              onSelectShape={setSelectedShapeId}
              onMoveShape={moveShape}
          />
        </Canvas>
      </section>
    </main>
  )
}

export default App
