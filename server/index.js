import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import http from "http";
import { Server } from "socket.io";

const app = express();
const port = 3001;

app.use(cors());
app.use("/music", express.static(path.join(path.resolve(), "music")));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // URL клиента
        methods: ["GET", "POST"],
    },
});

const musicDirectory = path.join(path.resolve(), "music");

let currentSong = "";

const getRandomSong = () => {
    const files = fs.readdirSync(musicDirectory);
    const mp3Files = files.filter((file) => file.endsWith(".mp3"));

    if (mp3Files.length === 0) {
        throw new Error("No mp3 files found");
    }

    const randomFile = mp3Files[Math.floor(Math.random() * mp3Files.length)];
    return `http://localhost:3001/music/${randomFile}`;
};

io.on("connection", (socket) => {
    console.log("a user connected");

    if (currentSong) {
        socket.emit("playSong", currentSong);
    }

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("songEnded", () => {
        currentSong = getRandomSong();
        io.emit("playSong", currentSong);
    });
});

app.get("/random-song", (req, res) => {
    try {
        currentSong = getRandomSong();
        io.emit("playSong", currentSong);

        res.sendFile(path.join(musicDirectory, path.basename(currentSong)));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
