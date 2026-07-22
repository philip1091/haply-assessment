import type { ShapeType, Vector3Tuple } from "../types/shape";

const shape_radius: Record<ShapeType, number> = {
    cube: 0.7,
    sphere: 0.6,
};

export function getShapeRadius(type: ShapeType): number {
    return shape_radius[type];
}

export function areShapesColliding(
    positionA: Vector3Tuple,
    typeA: ShapeType,
    positionB: Vector3Tuple,
    typeB: ShapeType
): boolean {
    const dx = positionA[0] - positionB[0];
    const dy = positionA[1] - positionB[1];
    const dz = positionA[2] - positionB[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return distance < getShapeRadius(typeA) + getShapeRadius(typeB);
}