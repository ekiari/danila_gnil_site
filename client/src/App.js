import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import "./App.css";

function App() {
    const [songUrl, setSongUrl] = useState("");
    const [error, setError] = useState(null);
    const audioRef = useRef(null);
    const socket = io("http://185.228.234.191:3001");

    useEffect(() => {
        socket.on("playSong", (url) => {
            setSongUrl(url);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.load();
            }
        });
    }, [socket]);

    const fetchRandomSong = async () => {
        try {
            await axios.get("http://185.228.234.191:3001/random-song");
        } catch (error) {
            console.error("Error fetching song:", error);
            setError("Failed to fetch song");
        }
    };

    const handleSongEnded = () => {
        socket.emit("songEnded");
    };

    const handleCanPlay = () => {
        if (audioRef.current) {
            audioRef.current.play().catch((error) => {
                console.error("Error playing audio:", error);
            });
        }
    };

    return (
        <div className="App">
            <h1>Online Radio</h1>
            {error && <p>{error}</p>}
            <audio
                ref={audioRef}
                src={songUrl}
                autoPlay
                controls
                controlsList="nodownload noremoteplayback noplaybackrate noseekback noseekforward"
                onEnded={handleSongEnded}
                onCanPlay={handleCanPlay}
            />
            <button onClick={fetchRandomSong}>Next Song</button>
        </div>
    );
}

export default App;
