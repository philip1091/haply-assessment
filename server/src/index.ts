import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import {createServer} from "node:http";

import type {
    MoveShapePayload,
    Shape,
} from "./types.js";

const PORT = 3001;
const CLIENT_URL = "http://localhost:5173";

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
  }),
);

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
    },
});

let shapes: Shape[] = [];

app.get("/", (_request, response) => {
    response.json({
        message: "Haply Shape Sandbox server is running",
        shapeCount: shapes.length,
    });
});

io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // sending the current scene to the new client that is connected.
    socket.emit("initial-state", shapes);

    socket.on("create-shape", (shape: Shape) => {
        const shapeAlreadyExists = shapes.some(
            (existingShape) => existingShape.id === shape.id
        );

        if (shapeAlreadyExists) {
            return;
        }

        const newShape: Shape = {
            ...shape,
            ownerId: null,
        };

        shapes = [...shapes, newShape];

        // broadcast to every connected client.
        io.emit("shape-created", newShape);
    });

    socket.on(
        "request-lock",
        ({ shapeId }: ShapeLockPayload) => {
            const shape = shapes.find(
                (currentShape) => currentShape.id === shapeId
            );

            if (!shape) {
                return;
            }

            const lockIsAvailable =
                shape.ownerId === null ||
                shape.ownerId === socket.id;

            if (!lockIsAvailable) {
                socket.emit("lock-denied", {
                    shapeId,
                } satisfies ShapeLockPayload);

                return;
            }

            shapes = shapes.map((currentShape) =>
                currentShape.id === shapeId
                    ? {
                        ...currentShape,
                        ownerId: socket.id,
                    }
                    : currentShape
            );

            io.emit("lock-changed", {
                shapeId,
                ownerId: socket.id,
            } satisfies ShapeLockChangedPayload);

            socket.emit("lock-acquired", {
                shapeId,
            } satisfies ShapeLockPayload);
        }
    );

    socket.on(
        "release-lock",
        ({ shapeId }: ShapeLockPayload) => {
            const shape = shapes.find(
                (currentShape) => currentShape.id === shapeId
            );

            if (!shape || shape.ownerId !== socket.id) {
                return;
            }

            shapes = shapes.map((currentShape) =>
                currentShape.id === shapeId
                    ? {
                        ...currentShape,
                        ownerId: null,
                    }
                    : currentShape
            );

            io.emit("lock-changed", {
                shapeId,
                ownerId: null,
            } satisfies ShapeLockChangedPayload);
        }
    );

    socket.on(
        "move-shape",
        ({ id, position }: MoveShapePayload) => {
            const shapeExists = shapes.some(
                (shape) => shape.id === id
            );

            if (!shapeExists) {
                return;
            }

            shapes = shapes.map((shape) =>
                shape.id === id
                    ? {
                        ...shape,
                        position,
                    }
                    : shape
            );

            io.emit("shape-moved", {
                id,
                position,
            } satisfies MoveShapePayload);
        }
    );

    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);

        const releasedShapeIds = shapes
            .filter((shape) => shape.ownerId === socket.id)
            .map((shape) => shape.id);

        shapes = shapes.map((shape) =>
            shape.ownerId === socket.id
                ? {
                    ...shape,
                    ownerId: null,
                }
                : shape
        );

        releasedShapeIds.forEach((shapeId) => {
            io.emit("lock-changed", {
                shapeId,
                ownerId: null,
            } satisfies ShapeLockChangedPayload);
        });
    });
});

httpServer.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});