import { OrbitControls, Grid } from "@react-three/drei";

function Scene() {
    return (
        <>
            <ambientLight intensity={1.2} />

            <directionalLight position={[5, 8, 5]} intensity={2} />

            <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="orange" />
            </mesh>

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