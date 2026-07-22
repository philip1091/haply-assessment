import {useCallback, useState, useEffect} from "react";
import { Canvas } from "@react-three/fiber";
import './App.css'
import Scene from "./components/Scene.tsx";
import Toolbar from "./components/Toolbar.tsx";
import type { Shape, ShapeType, Vector3Tuple, MoveShapePayload } from "./types/shape";
import { getRandomColor } from "./utils/randomColors";
import { socket } from "./socket";

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

        // setShapes((currentShapes) => [...currentShapes, newShape]);
        socket.emit("create-shape", newShape);
        setSelectedShapeId(newShape.id);
    }

    const moveShape = useCallback(
        (
            shapeId: string,
            position: Vector3Tuple
        ) => {
            // setShapes((currentShapes) =>
            //     currentShapes.map((shape) =>
            //         shape.id === shapeId ? {...shape, position,} : shape
            //     )
            // );
            socket.emit("move-shape", {
                id: shapeId,
                position,
            } satisfies MoveShapePayload);
        },
        []
    );

    useEffect(() => {
        function handleInitialState(serverShapes: Shape[]) {
            setShapes(serverShapes);
        }

        function handleShapeCreated(createdShape: Shape) {
            setShapes((currentShapes) => {
                const shapeAlreadyExists = currentShapes.some(
                    (shape) => shape.id === createdShape.id
                );

                if (shapeAlreadyExists) {
                    return currentShapes;
                }

                return [...currentShapes, createdShape];
            });
        }

        function handleShapeMoved({id, position,}: MoveShapePayload) {
            setShapes((currentShapes) =>
                currentShapes.map((shape) =>
                    shape.id === id ? {...shape, position} : shape
                )
            );
        }
        socket.on("initial-state", handleInitialState);
        socket.on("shape-created", handleShapeCreated);
        socket.on("shape-moved", handleShapeMoved);
        socket.connect();

        return () => {
            socket.off("initial-state", handleInitialState);
            socket.off("shape-created", handleShapeCreated);
            socket.off("shape-moved", handleShapeMoved);
            socket.disconnect();
        };

    }, []);


  return (
    <main className="app">
      <Toolbar onAddShape={addShape}  />
      <section className="canvas-container">
        <Canvas
            camera={{ position: [5, 5, 7], fov: 50 }}
            shadows
            onPointerMissed={() =>
                setSelectedShapeId(null)
            }
        >
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
