export type ShapeType = "cube" | "sphere";

export type Vector3Tuple = [number, number, number];

export type Shape = {
    id: string;
    type: ShapeType;
    position: Vector3Tuple;
    color: string;
};

export type MoveShapePayload = {
    id: string;
    position: Vector3Tuple;
};