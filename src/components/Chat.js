import './Chat.css';

import { Client } from '@stomp/stompjs';
import { useState } from 'react';

const WEBSOCKET_URL = 'http://localhost:8080/ws';

function Chat() {

    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("1");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);


    const connect = () => {
        if (!username || !room) return;

        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            onConnect: () => {
                client.subscribe(`/topic/room/${room}`, (message) => {
                    setMessages((prev) => [...prev, JSON.parse(message.body)]);
                }, {user: username});

                client.publish({
                    destination: `/app/chat/${room}`,
                    body: JSON.stringify({ sender_id: username, message: `${username} joined the chat!` }),
                });

                setIsConnected(true);
            },
            onStompError: (error) => console.error("STOMP Error:", error),
        });
        client.activate();
        setStompClient(client);
    };
    
    const sendMessage = () => {
        if (stompClient && message.trim() !== "") {
          stompClient.publish({
            destination: `/app/chat/${room}`,
            body: JSON.stringify({ username, message }),
          });
          setMessage("");
        }     
    };

    const disconnect = () => {
        if (stompClient) {
          stompClient.publish({
            destination: `/app/chat/${room}`,
            body: JSON.stringify({ username, message: `${username} left the chat!` }),
          });
          stompClient.deactivate();
          setIsConnected(false);
        }
    };


    return (
        <div>
            {!isConnected ? (
                <>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter room"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                />
                <button onClick={connect}>Join</button>
                </>
            ) : (
                <>
                <div>
                    {messages.map((msg, index) => (
                    <p key={index}>
                        <strong>{msg.username}:</strong> {msg.message}
                    </p>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send</button>
                <button onClick={disconnect}>Disconnect</button>
                </>
            )}
        </div>
    );
}

export default Chat;
