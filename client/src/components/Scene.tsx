import {
    type ElementRef, useEffect,
    useRef
} from "react";
import { OrbitControls, Grid, TransformControls } from "@react-three/drei";
import type { Shape, Vector3Tuple, MoveShapePayload } from "../types/shape";
import ShapeMesh from "./ShapeMesh";
import { socket } from "../socket";

type SceneProps = {
    shapes: Shape[];
    selectedShapeId: string | null;
    onSelectShape: (shapeId: string ) => void;
    onDeselectShape: () => void;
    onMoveShape: (
        shapeId: string,
        position: Vector3Tuple
    ) => void;
    currentUserId: string | null;
};

function Scene({
   shapes,
   selectedShapeId,
   onSelectShape,
   onMoveShape,
   currentUserId
    }:SceneProps) {

    const transformRef =
        useRef<ElementRef<typeof TransformControls>>(null);

    const selectedShape = shapes.find(
        (shape) => shape.id === selectedShapeId
    );

    useEffect(() => {
        const controls = transformRef.current;

        if (!controls || !selectedShape) {
            return;
        }

        function handleDraggingChanged(event: { value: boolean }) {
            document.body.style.cursor = event.value ? "grabbing" : "auto";

            if (event.value) {
                return;
            }

            const object = controls.object;

            if (!object) {
                return;
            }


            const position: Vector3Tuple = [
                object.position.x,
                object.position.y,
                object.position.z,
            ];

            onMoveShape(selectedShape.id, position);
        }

        function handleObjectChange() {
            const object = controls.object;
            if (!object) return;

            socket.emit("move-shape", {
                id: selectedShape.id,
                position: [object.position.x, object.position.y, object.position.z],
            } satisfies MoveShapePayload);
        }

        controls.addEventListener("objectChange", handleObjectChange);

        controls.addEventListener(
            "dragging-changed",
            handleDraggingChanged
        );


        return () => {

            controls.removeEventListener(
                "dragging-changed",
                handleDraggingChanged
            );
            controls.removeEventListener("objectChange", handleObjectChange);
        };
    }, [selectedShape, onMoveShape]);

    return (

        <>
            <ambientLight intensity={1.2} />

            <directionalLight position={[5, 8, 5]} intensity={2} castShadow />

            {shapes.map((shape) =>{

                if(shape.id === selectedShapeId){
                    return null;
                }
                const isLockedByAnotherUser =
                    shape.ownerId !== null &&
                    shape.ownerId !== currentUserId;

                return (
                    <ShapeMesh
                        key={shape.id}
                        shape={shape}
                        isSelected={false}
                        isLockedByAnotherUser={
                            isLockedByAnotherUser
                        }
                        onSelect={onSelectShape}
                    />
                )
            })}

            {selectedShape && (
                <TransformControls
                    ref={transformRef}
                    mode="translate"
                    position={selectedShape.position}
                >
                    <ShapeMesh
                        shape={{...selectedShape, position: [0, 0, 0]}}
                        isSelected
                        onSelect={onSelectShape}
                        isLockedByAnotherUser={false}
                    />
                </TransformControls>
            )}

            <Grid
                args={[20, 20]}
                position={[0, 0, 0]}
                cellSize={1}
                cellThickness={0.6}
                sectionSize={5}
                sectionThickness={1.2}
                fadeDistance={25}
                infiniteGrid
                onClick={(event) => {
                    event.stopPropagation();
                    onDeselectShape();
                }}
            />

            <OrbitControls makeDefault />

        </>
    )
}

export default Scene;