import { useEffect, useRef } from "react";
import { Client, type Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch } from "react-redux";
import { sendMessage } from "../features/chatSlice";
import type { UseChatProps } from "../type/components";
import { saveMessage } from "../api/chatApi";

const useChat = ({ roomId, myId }: UseChatProps) => {
    const dispatch = useDispatch();
    const stompClient = useRef<Client | null>(null);

    useEffect(() => {
        if (!roomId || !myId) return;

        const socket = new SockJS("http://localhost:8081/ws");
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
        });

        stompClient.current.onConnect = () => {
            stompClient.current?.subscribe(`/topic/chat/${roomId}`, (msg: Message) => {
                const data = JSON.parse(msg.body);
                if (data.sender === myId) {
                    dispatch(sendMessage({ text: data.text, sender: "me" }));
                } else {
                    dispatch(sendMessage({ text: data.text, sender: "other" }));
                }
            });
        };

        stompClient.current.activate();

        return () => {
            stompClient.current?.deactivate();
        };
    }, [roomId, myId]);

    const sendChatMessage = (text: string) => {
        if (stompClient.current && stompClient.current.connected) {
            stompClient.current.publish({
                destination: `/app/chat/${roomId}`,
                body: JSON.stringify({ text, sender: myId }),
            });
        }
    };

    return { sendChatMessage };
}

export default useChat;