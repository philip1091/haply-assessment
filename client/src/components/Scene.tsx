import {
    type ElementRef,
    useRef
} from "react";
import { OrbitControls, Grid, TransformControls } from "@react-three/drei";
import type { Shape, Vector3Tuple } from "../types/shape";
import ShapeMesh from "./ShapeMesh";

type SceneProps = {
    shapes: Shape[];
    selectedShapeId: string | null;
    onSelectShape: (shapeId: string | null) => void;
    onMoveShape: (
        shapeId: string,
        position: Vector3Tuple
    ) => void;
};

function Scene({
   shapes,
   selectedShapeId,
   onSelectShape,
   onMoveShape,
    }:SceneProps) {

    const transformRef =
        useRef<ElementRef<typeof TransformControls>>(null);

    const selectedShape = shapes.find(
        (shape) => shape.id === selectedShapeId
    );

    return (

        <>
            <ambientLight intensity={1.2} />

            <directionalLight position={[5, 8, 5]} intensity={2} />

            {shapes.map((shape) =>
                shape.id === selectedShapeId ? null : (
                    <ShapeMesh
                        key={shape.id}
                        shape={shape}
                        isSelected={false}
                        onSelect={onSelectShape}
                    />
                )
            )}

            {selectedShape && (
                <TransformControls
                    ref={transformRef}
                    mode="translate"
                    onMouseUp={() => {
                        const object =
                            transformRef.current?.object;

                        if (!object) return;

                        onMoveShape(selectedShape.id, [
                            object.position.x,
                            object.position.y,
                            object.position.z,
                        ]);
                    }}
                >
                    <ShapeMesh
                        shape={selectedShape}
                        isSelected
                        onSelect={onSelectShape}
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
                onClick={() => onSelectShape(null)}
            />

            <OrbitControls makeDefault />

        </>
    )
}

export default Scene;