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

        shapes = [...shapes, shape];

        // broadcast to every connected client.
        io.emit("shape-created", shape);
    });

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
    });
});

httpServer.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});