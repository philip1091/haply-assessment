import type { ThreeEvent } from "@react-three/fiber";
import type { Shape } from "../types/shape";

type ShapeMeshProps = {
    shape: Shape;
    isSelected: boolean;
    onSelect: (shapeId: string) => void;
    isLockedByAnotherUser: boolean;
};

function ShapeMesh({ shape, isSelected, onSelect, isLockedByAnotherUser }: ShapeMeshProps) {

    function handleClick(event: ThreeEvent<MouseEvent>) {
        event.stopPropagation();
        if (isLockedByAnotherUser) {
            return;
        }
        //onSelect send the shape id to the scene component
        onSelect(shape.id);
    }

    return (
        <mesh position={shape.position} onClick={handleClick} castShadow receiveShadow>
            {shape.type === "cube" ? (
                <boxGeometry args={[1, 1, 1]} />
            ) : (
                <sphereGeometry args={[0.6, 32, 32]} />
            )}

            <meshStandardMaterial
                color={shape.color}
                emissive={
                    isSelected
                        ? "#222222"
                        : "#000000"
                }
                emissiveIntensity={isSelected ? 0.6 : 0}
                opacity={isLockedByAnotherUser ? 0.45 : 1}
                transparent

            />
        </mesh>
    );
}

export default ShapeMesh;