import './Chat.css';

import { Client } from '@stomp/stompjs';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const WEBSOCKET_URL = 'http://localhost:8080/ws';

function Chat() {

    const [user, setUser] = useState({ username: "", role: "GUEST" });
    const [room, setRoom] = useState("1");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const role = JSON.parse(decoded.roles)[0] || "GUEST";
                setUser({ username: decoded.username, role: role });
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("authToken");
                navigate("/login");
            }
          } else {
                navigate("/login");
          }
    }, [navigate]);

    const connect = () => {
        if (!user.username || !room) return;

        const client = new Client({
            brokerURL: WEBSOCKET_URL,
            connectHeaders: { username: user.username },
            onConnect: () => {
                setMessages([]);

                client.subscribe(`/topic/room/${room}`, (message) => {
                    setMessages((prev) => [...prev, JSON.parse(message.body)]);
                });

                client.subscribe(`/user/${user.username}/queue/disconnect`, (message) => {
                    alert("You have been disconnected due to a new login.");
                    client.deactivate();
                    navigate("/login");
                });

                client.publish({
                    destination: `/app/chat/${room}`,
                    body: JSON.stringify({ username: user.username, message: `${user.username} joined the chat!` }),
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
            body: JSON.stringify({ username: user.username, "message": message }),
          });
          setMessage("");
        }     
    };

    const disconnect = () => {
        if (stompClient) {
          stompClient.publish({
            destination: `/app/chat/${room}`,
            body: JSON.stringify({ username: user.username, message: `${user.username} left the chat!` }),
          });
          stompClient.deactivate();
          setIsConnected(false);
        }
    };


    return (
        <div>
            {!isConnected ? (
                <div className="flex items-center justify-center h-screen bg-gray-100">
                    <div className="bg-white p-6 rounded-2xl shadow-lg w-96">
                        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Join a Chat Room</h2>
                        
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm mb-1">Username</label>
                            <input
                            type="text"
                            value={user.username}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your username"
                            disabled
                            />
                        </div>
                
                        <div className="mb-4">
                            <label className="block text-gray-600 text-sm mb-1">Room</label>
                            <input
                            type="text"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter room name"/>
                        </div>
                
                        <button onClick={connect} className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200">Join Room</button>
                    </div>
                </div>
            ) : (
                <div className="flex h-screen bg-gray-100 p-4">
                    <div className="flex-1 bg-white rounded-xl shadow-lg p-4 overflow-y-auto h-full">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Room</h2>
                        <div className="space-y-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`p-3 rounded-lg max-w-xs ${
                                msg.username === user.username ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-gray-800"
                            }`}>
                                <strong className="block text-sm">{msg.username}</strong>
                                <p className="text-sm">{msg.message}</p>
                            </div>
                        ))}
                        </div>
                    </div>

                    <div className="w-1/3 bg-white rounded-xl shadow-lg p-4 ml-4 flex flex-col relative">
                        <button onClick={disconnect} className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 transition">
                            Disconnect
                        </button>



                        {user.role.includes("GUEST") ? (
                            <h2 className="mt-12 text-lg font-semibold text-gray-800 text-center">Guest User has only read permission</h2>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Send Message</h2>

                                <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Type your message..."/>

                                <button onClick={sendMessage} className="mt-3 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"> Send </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chat;
