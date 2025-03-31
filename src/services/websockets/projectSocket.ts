// src/api/websocket/projectSocket.ts
const BASE_URL = "ws://127.0.0.1:8000"


type Project = {
    id: number;
    name: string;
    // Додаткові поля проекту
};

type WebSocketMessage = {
    type: string;
    payload: any;
};

type WebSocketCallbacks = {
    onMessage: (message: WebSocketMessage) => void;
    onError?: (error: string) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
};

class ProjectWebSocket {
    private socket: WebSocket | null = null;
    private callbacks: WebSocketCallbacks;
    private projectId: number;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;

    constructor(projectId: number, callbacks: WebSocketCallbacks) {
        this.projectId = projectId;
        this.callbacks = callbacks;
    }

    public connect(): void {
        const url = `${BASE_URL}/ws/projects/${this.projectId}/`;
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            this.callbacks.onConnect?.();
            console.log(`WebSocket connected to project ${this.projectId}`);
        };

        this.socket.onmessage = (event) => {
            try {
                const data: WebSocketMessage = JSON.parse(event.data);
                this.callbacks.onMessage(data);
            } catch (error) {
                this.callbacks.onError?.('Failed to parse WebSocket message');
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.callbacks.onError?.('WebSocket connection error');
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            this.handleReconnect();
        };
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
        } else {
            this.callbacks.onError?.('Max reconnection attempts reached');
        }
    }

    public disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public sendMessage(message: object): boolean {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }
}

export default ProjectWebSocket;