import {useState} from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type { Shape } from "../types/shape";

type ShapeMeshProps = {
    shape: Shape;
    isSelected: boolean;
    onSelect: (shapeId: string) => void;
    isLockedByAnotherUser: boolean;
    isColliding: boolean;
};

function ShapeMesh({ shape, isSelected, onSelect, isLockedByAnotherUser, isColliding }: ShapeMeshProps) {
    const [isHovered, setIsHovered] = useState(false);

    function handleClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation();
        if (isLockedByAnotherUser) {
            return;
        }
        //onSelect send the shape id to the scene component
        onSelect(shape.id);
    }

    function handlePointerOver(event: ThreeEvent<PointerEvent>) {
        event.stopPropagation();
        if (isLockedByAnotherUser) {
            return;
        }
        setIsHovered(true);
        document.body.style.cursor = "grab";
    }

    function handlePointerOut() {
        setIsHovered(false);
        document.body.style.cursor = "auto";
    }

    const emissiveColor = isColliding
        ? "#ff3333"
        : isSelected
            ? "#222222"
            : isHovered
                ? "#111111"
                : "#000000";

    const emissiveIntensity = isColliding
        ? 1
        : isSelected
            ? 0.6
            : isHovered
                ? 0.35
                : 0;

    return (
        <mesh
            position={shape.position}
            quaternion={shape.rotation}
            onClick={handleClick}
            castShadow
            receiveShadow
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
        >
            {shape.type === "cube" ? (
                <boxGeometry args={[1, 1, 1]} />
            ) : (
                <sphereGeometry args={[0.6, 32, 32]} />
            )}

            <meshStandardMaterial
                color={shape.color}
                emissive={emissiveColor}
                emissiveIntensity={emissiveIntensity}
                opacity={isLockedByAnotherUser ? 0.45 : 1}
                transparent
            />
        </mesh>
    );
}

export default ShapeMesh;