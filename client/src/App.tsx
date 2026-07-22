import {useCallback, useState, useEffect} from "react";
import { Canvas } from "@react-three/fiber";
import './App.css'
import Scene from "./components/Scene.tsx";
import Toolbar from "./components/Toolbar.tsx";
import type {
    MoveShapePayload,
    Shape,
    ShapeLockChangedPayload,
    ShapeLockPayload,
    ShapeType,
    Vector3Tuple,
} from "./types/shape";
import { getRandomColor } from "./utils/randomColors";
import { socket } from "./socket";

function App() {
    const [shapes, setShapes] = useState<Shape[]>([]);
    const [selectedShapeId, setSelectedShapeId] =
        useState<string | null>(null);
    const [currentUserId, setCurrentUserId] =
        useState<string | null>(null);

    function addShape(type: ShapeType) {
        console.log(getRandomColor())
        const newShape: Shape = {
            id: crypto.randomUUID(),
            type,
            position: [
                Math.random() * 4 - 2,
                0.5,
                Math.random() * 4 - 2,
            ],
            color: getRandomColor(),
            ownerId: null,
        };

        // setShapes((currentShapes) => [...currentShapes, newShape]);
        socket.emit("create-shape", newShape);
        // setSelectedShapeId(newShape.id);
    }

    const requestShapeLock = useCallback(
        (shapeId: string) => {
            socket.emit("request-lock", {
                shapeId,
            } satisfies ShapeLockPayload);
        },
        []
    );

    const deselectShape = useCallback(() => {
        if (!selectedShapeId) {
            return;
        }

        socket.emit("release-lock", {
            shapeId: selectedShapeId,
        } satisfies ShapeLockPayload);

        setSelectedShapeId(null);
    }, [selectedShapeId]);

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
        function handleConnect() {
            setCurrentUserId(socket.id ?? null);
        }

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

        function handleShapeMoved({id, position}: MoveShapePayload) {
            setShapes((currentShapes) =>
                currentShapes.map((shape) =>
                    shape.id === id ? {...shape, position} : shape
                )
            );
        }
        function handleLockChanged({shapeId, ownerId,}: ShapeLockChangedPayload) {
            setShapes((currentShapes) =>
                currentShapes.map((shape) =>
                    shape.id === shapeId
                        ? {
                            ...shape,
                            ownerId,
                        }
                        : shape
                )
            );
            if (ownerId === null) {
                setSelectedShapeId((currentSelectedId) =>
                    currentSelectedId === shapeId
                        ? null
                        : currentSelectedId
                );
            }
        }
        function handleLockAcquired({shapeId}: ShapeLockPayload) {
            setSelectedShapeId(shapeId);
        }

        function handleLockDenied() {
            setSelectedShapeId(null);
        }

        socket.on("connect", handleConnect);
        socket.on("initial-state", handleInitialState);
        socket.on("shape-created", handleShapeCreated);
        socket.on("shape-moved", handleShapeMoved);
        socket.on("lock-changed", handleLockChanged);
        socket.on("lock-acquired", handleLockAcquired);
        socket.on("lock-denied", handleLockDenied);
        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("initial-state", handleInitialState);
            socket.off("shape-created", handleShapeCreated);
            socket.off("shape-moved", handleShapeMoved);
            socket.off("lock-changed", handleLockChanged);
            socket.off("lock-acquired", handleLockAcquired);
            socket.off("lock-denied", handleLockDenied);
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
            onPointerMissed={deselectShape}
        >
          <Scene
              shapes={shapes}
              selectedShapeId={selectedShapeId}
              onSelectShape={requestShapeLock}
              onDeselectShape={deselectShape}
              onMoveShape={moveShape}
              currentUserId={currentUserId}
          />
        </Canvas>
      </section>
    </main>
  )
}

export default App
