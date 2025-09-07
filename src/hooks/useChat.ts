import { useEffect, useRef } from "react";
import { Client, type Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../features/chatSlice";
import type { UseChatProps } from "../type/chatmodal";
import type { RootState } from "../store/store";
import { getAdminSubs } from "../api/chatApi";

const useChat = ({ roomId, myId }: UseChatProps) => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const user = useSelector((state: RootState) => state.auth.user);
    const isAdmin = user?.roles.includes("ROLE_ADMIN");
    const dispatch = useDispatch();
    const stompClient = useRef<Client | null>(null);

    useEffect(() => {
        if (!myId || !accessToken) return;

        const socket = new SockJS("http://localhost:8081/ws");
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: { Authorization: `Bearer ${accessToken}` },
        });

        stompClient.current.onConnect = async () => {
            if (isAdmin) {
                const rooms = await getAdminSubs(myId);
                rooms.forEach((room: { classNo: string }) => {
                    stompClient.current?.subscribe(`/topic/${room.classNo}`, (msg: Message) => {
                        const data = JSON.parse(msg.body);
                        dispatch(
                            sendMessage({
                                content: data.content,
                                userNo: data.userNo,
                                username: data.userNo === myId ? "USER" : data.username,
                                createdAt: data.createdAt,
                                button: data.button,
                            })
                        );
                    });
                    console.log(`관리자 ${myId}가 구독한 방: ${room.classNo}`);
                });
            }
            if (roomId) {
                stompClient.current?.subscribe(`/topic/${roomId}`, (msg: Message) => {
                    const data = JSON.parse(msg.body);
                    dispatch(
                        sendMessage({
                            content: data.content,
                            userNo: data.userNo,
                            username: data.userNo === myId ? "USER" : data.username,
                            createdAt: data.createdAt,
                            button: data.button,
                        })
                    );
                    console.log(`사용자 ${myId}가 구독한 방: ${roomId}`);
                });
            }
        };
        stompClient.current.activate();
        return () => {
            stompClient.current?.deactivate();
        };
    }, [myId, accessToken, isAdmin, roomId, dispatch]);

    const sendChatMessage = (content: string) => {
        if (stompClient.current?.connected && roomId) {
            stompClient.current.publish({
                destination: `/app/${roomId}`,
                body: JSON.stringify({ content, userNo: myId }),
            });
        }
    };
    return { sendChatMessage };
};

export default useChat;