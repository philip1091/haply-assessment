import type { Shape } from "../types/shape";

type ShapeMeshProps = {
    shape: Shape;
};

function ShapeMesh({ shape }: ShapeMeshProps) {
    return (
        <mesh position={shape.position}>
            {shape.type === "cube" ? (
                <boxGeometry args={[1, 1, 1]} />
            ) : (
                <sphereGeometry args={[0.6, 32, 32]} />
            )}

            <meshStandardMaterial color={shape.color} />
        </mesh>
    );
}

export default ShapeMesh;