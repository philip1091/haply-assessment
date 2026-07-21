import { OrbitControls, Grid } from "@react-three/drei";
import type { Shape } from "../types/shape";
import ShapeMesh from "./ShapeMesh";

type SceneProps = {
    shapes: Shape[];
};

function Scene({shapes}:SceneProps) {
    return (
        <>
            <ambientLight intensity={1.2} />

            <directionalLight position={[5, 8, 5]} intensity={2} />

            {shapes.map((shape) => (
                <ShapeMesh key={shape.id} shape={shape} />
            ))}

            <Grid
                args={[20, 20]}
                position={[0, 0, 0]}
                cellSize={1}
                cellThickness={0.6}
                sectionSize={5}
                sectionThickness={1.2}
                fadeDistance={25}
                infiniteGrid
            />

            <OrbitControls makeDefault />

        </>
    )
}

export default Scene;