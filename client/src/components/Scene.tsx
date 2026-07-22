import {
    type ElementRef,
    useEffect,
    useRef,
    useState
} from "react";
import {
    Grid,
    OrbitControls,
    TransformControls,
} from "@react-three/drei";
import type { Shape, Vector3Tuple, MoveShapePayload, QuaternionTuple, ForceFeedbackPayload } from "../types/shape";
import ShapeMesh from "./ShapeMesh";
import { socket } from "../socket";
import { areShapesColliding, getShapeRadius } from "../utils/collision";

type SceneProps = {
    shapes: Shape[];
    selectedShapeId: string | null;
    onSelectShape: (shapeId: string ) => void;
    onDeselectShape: () => void;
    onMoveShape: (
        shapeId: string,
        position: Vector3Tuple,
        rotation: QuaternionTuple
    ) => void;
    currentUserId: string | null;
    collidingShapeIds: Set<string>;
};

function Scene({
                   shapes,
                   selectedShapeId,
                   onSelectShape,
                   onMoveShape,
                   currentUserId,
                   collidingShapeIds
               }:SceneProps) {

    const transformRef =
        useRef<ElementRef<typeof TransformControls>>(null);

    const [transformMode, setTransformMode] =
        useState<"translate" | "rotate">("translate");

    const activeCollisionsRef = useRef<Set<string>>(new Set());

    const selectedShape = shapes.find(
        (shape) => shape.id === selectedShapeId
    );

    useEffect(() => {
        //key down event to choose between rotate and drag
        function handleKeyDown (event: KeyboardEvent) {
            if (event.key === "g" || event.key === "G") {
                setTransformMode("translate");
            } else if (event.key === "r" || event.key === "R") {
                setTransformMode("rotate");
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        const controls = transformRef.current;

        if (!controls || !selectedShape) {
            return;
        }

        activeCollisionsRef.current = new Set();

        function readObjectTransform(): {
            position: Vector3Tuple;
            rotation: QuaternionTuple;
        } | null {
            const object = controls.object;
            if (!object) {
                return null;
            }

            return {
                position: [
                    object.position.x,
                    object.position.y,
                    object.position.z,
                ],
                rotation: [
                    object.quaternion.x,
                    object.quaternion.y,
                    object.quaternion.z,
                    object.quaternion.w,
                ],
            };
        }

        function checkCollisions(draggedPosition: Vector3Tuple) {
            if (!selectedShape) return;

            const draggedRadius = getShapeRadius(selectedShape.type);
            const currentlyTouchingIds = new Set<string>();

            for (const otherShape of shapes) {
                if (otherShape.id === selectedShape.id) continue;

                const isTouching = areShapesColliding(
                    draggedPosition,
                    selectedShape.type,
                    otherShape.position,
                    otherShape.type
                );

                if (!isTouching) continue;

                currentlyTouchingIds.add(otherShape.id);

                const contactJustStarted =
                    !activeCollisionsRef.current.has(otherShape.id);

                if (contactJustStarted) {
                    const dx = draggedPosition[0] - otherShape.position[0];
                    const dy = draggedPosition[1] - otherShape.position[1];
                    const dz = draggedPosition[2] - otherShape.position[2];
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    const penetration = Math.max(
                        draggedRadius + getShapeRadius(otherShape.type) - distance,
                        0.01
                    );

                    const force: Vector3Tuple =
                        distance > 0
                            ? [
                                (dx / distance) * penetration,
                                (dy / distance) * penetration,
                                (dz / distance) * penetration,
                            ]
                            : [penetration, 0, 0];

                    socket.emit("force-feedback", {
                        shapeId: selectedShape.id,
                        otherShapeId: otherShape.id,
                        force,
                    } satisfies ForceFeedbackPayload);
                }
            }

            activeCollisionsRef.current = currentlyTouchingIds;
        }

        function handleDraggingChanged(event: { value: boolean }) {
            document.body.style.cursor = event.value ? "grabbing" : "auto";

            if (event.value) {
                return;
            }

            const transform = readObjectTransform();

            if (!transform) {
                return;
            }

            onMoveShape(selectedShape.id, transform.position, transform.rotation);
        }

        function handleObjectChange() {
            const transform = readObjectTransform();
            if (!transform) return;

            socket.emit("move-shape", {
                id: selectedShape.id,
                position: transform.position,
                rotation: transform.rotation,
            } satisfies MoveShapePayload);
            checkCollisions(transform.position);
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
    }, [selectedShape, onMoveShape, shapes]);

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
                        isColliding={collidingShapeIds.has(shape.id)}
                    />
                )
            })}

            {selectedShape && (
                <TransformControls
                    ref={transformRef}
                    mode={transformMode}
                    position={selectedShape.position}
                    quaternion={selectedShape.rotation}
                >
                    <ShapeMesh
                        shape={{
                            ...selectedShape,
                            position: [0, 0, 0],
                            rotation: [0, 0, 0, 1],
                        }}
                        isSelected
                        onSelect={onSelectShape}
                        isLockedByAnotherUser={false}
                        isColliding={collidingShapeIds.has(selectedShape.id)}
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