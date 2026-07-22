import {useRef} from "react";
import type { Mesh } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { Shape } from "../types/shape";

type ShapeMeshProps = {
    shape: Shape;
    isSelected: boolean;
    onSelect: (shapeId: string) => void;
};

function ShapeMesh({ shape, isSelected, onSelect }: ShapeMeshProps) {
    const meshRef = useRef<Mesh>(null);

    function handleClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation();
        //onclick send the shape id to the scene component
        onSelect(shape.id);
    }

    return (
        <mesh ref={meshRef} position={shape.position} onClick={handleClick}>
            {shape.type === "cube" ? (
                <boxGeometry args={[1, 1, 1]} />
            ) : (
                <sphereGeometry args={[0.6, 32, 32]} />
            )}

            <meshStandardMaterial color={shape.color}
                emissive={isSelected ? "#333333" : "#000000"}
            />
        </mesh>
    );
}

export default ShapeMesh;