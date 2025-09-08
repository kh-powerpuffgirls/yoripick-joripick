import { useEffect, useRef, useState } from "react";
import { Client, type Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { Message as ChatMessage } from "../type/chatmodal";
import { addNotification, removeNotification } from "../features/notiSlice";
import { sendMessage } from "../features/chatSlice";

const useChat = () => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const rooms = useSelector((state: RootState) => state.chat.rooms);
    const stompClient = useRef<Client | null>(null);
    const dispatch = useDispatch();

    const subscriptions = useRef<{ [roomNo: string]: any }>({});
    const [isConnect, setIsConnect] = useState(false);

    useEffect(() => {
        if (!userNo || !accessToken) return;

        const socket = new SockJS("http://localhost:8081/ws");
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: { Authorization: `Bearer ${accessToken}` },
            onConnect: () => {
                console.log("STOMP connected!");
                setIsConnect(true);
            },
            onStompError: (frame) => {
                console.error("Broker error:", frame.headers["message"]);
                setIsConnect(false);
            },
            onWebSocketClose: () => {
                console.warn("WebSocket closed");
                setIsConnect(false);
            },
        });
        stompClient.current.activate();
        return () => {
            stompClient.current?.deactivate();
            setIsConnect(false);
        };
    }, [userNo, accessToken]);

    useEffect(() => {
        if (!stompClient.current?.connected) return;
        rooms.forEach((room) => {
            if (!subscriptions.current[room.roomNo] && room.type !== "cservice") {
                subscriptions.current[room.roomNo] = stompClient.current?.subscribe(
                    `/topic/${room.roomNo}`,
                    (msg: Message) => {
                        const data = JSON.parse(msg.body);
                        dispatch(sendMessage(data));
                        if (data.userNo != userNo) {
                            dispatch(addNotification(data));
                            setTimeout(() => {
                                dispatch(removeNotification(data));
                            }, 2000);
                        }
                    }
                );
                console.log("구독 완료:", room.roomNo);
            }
        });
        Object.keys(subscriptions.current).forEach((roomNo) => {
            if (!rooms.find(r => r.roomNo == roomNo)) {
                subscriptions.current[roomNo]?.unsubscribe();
                delete subscriptions.current[roomNo];
                console.log("구독 해제:", roomNo);
            }
        });
    }, [rooms, isConnect]);

    const sendChatMessage = (roomNo: string | number | undefined, message: ChatMessage) => {
        if (stompClient.current?.connected) {
            stompClient.current.publish({
                destination: `/app/${roomNo}`,
                body: JSON.stringify(message),
            });
        } else {
            console.warn("STOMP가 연결되어 있지 않습니다.");
        }
    };
    return { sendChatMessage };
};

export default useChat;