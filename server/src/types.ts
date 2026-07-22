export type ShapeType = "cube" | "sphere";

export type Vector3Tuple = [number, number, number];

export type QuaternionTuple = [number, number, number, number];

export type Shape = {
    id: string;
    type: ShapeType;
    position: Vector3Tuple;
    rotation: QuaternionTuple;
    color: string;
    ownerId: string | null;
};

export type MoveShapePayload = {
    id: string;
    position: Vector3Tuple;
    rotation: QuaternionTuple;
};

export type ShapeLockChangedPayload = {
    shapeId: string;
    ownerId: string | null;
};

export type ShapeLockPayload = {
    shapeId: string;
};