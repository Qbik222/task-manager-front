// src/api/websocket/projectSocket.ts
const BASE_URL = "ws://127.0.0.1:8000"

export function projectsSocket(url: string): WebSocket {
    const socket = new WebSocket(`${BASE_URL}${url}`);


    socket.onopen = () => {
        console.log("Socket connected");
    };

    socket.onerror = (e) => {
        console.error("Socket error:", e);
    };

    socket.onclose = (e) => {
        console.log("Socket closed:", e);
    };

    return socket;
}