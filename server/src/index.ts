import express from "express";
import cors from "cors";
import {createServer} from "node:http";

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

app.get("/", (_request, response) => {
    response.json({
        message: "Haply Shape Sandbox server is running"
    });
});

httpServer.listen(PORT, () => {
    console.log(
        `Server running at http://localhost:${PORT}`
    );
});