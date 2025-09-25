import { useEffect } from "react";
import { Client, type Message } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useDispatch, useSelector } from "react-redux";
import { store, type RootState } from "../store/store";
import {
    setConnected,
    addSubscribedRoom,
    removeSubscribedRoom,
    clearSubscribedRooms,
} from "../features/stompSlice";
import { sendMessage } from "../features/chatSlice";
import { addNotification, startClosingAnimation } from "../features/notiSlice";
import { stompManager } from "../type/chatmodal";

const useChat = () => {
    const dispatch = useDispatch();
    const { connected, subscribedRooms } = useSelector(
        (state: RootState) => state.stomp
    );
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const userNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const rooms = useSelector((state: RootState) => state.chat.rooms);
    const userSettings = useSelector((state: RootState) => state.noti.userSettings);

    useEffect(() => {
        if (!userNo || !accessToken) return;

        const socket = new SockJS("http://localhost:8081/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            connectHeaders: { Authorization: `Bearer ${accessToken}` },
            onConnect: () => {
                console.log("STOMP connected!");
                dispatch(setConnected(true));
            },
            onStompError: (frame) => {
                console.error("Broker error:", frame.headers["message"]);
                dispatch(setConnected(false));
            },
            onWebSocketClose: () => {
                console.warn("WebSocket closed");
                dispatch(setConnected(false));
            },
        });

        stompManager.client = client;
        client.activate();

        return () => {
            client.deactivate();
            dispatch(setConnected(false));
            dispatch(clearSubscribedRooms());
            stompManager.subscriptions.forEach((sub) => sub.unsubscribe?.());
            stompManager.subscriptions.clear();
        };
    }, [userNo, accessToken]);

    useEffect(() => {
        if (!stompManager.client?.connected || !userSettings) return;

        rooms.forEach((room) => {
            const roomNo = String(room.roomNo);

            // 이미 구독했으면 무시
            if (!stompManager.client) return;
            if (stompManager.subscriptions.has(roomNo)) return;
            if (room.type === "cservice") return;

            const sub = stompManager.client.subscribe(`/topic/${roomNo}`, (msg: Message) => {
                const data = JSON.parse(msg.body);
                dispatch(sendMessage(data));

                if (
                    data.userNo != userNo &&
                    data.userNo != 0 &&
                    userSettings.newMessage === "Y" &&
                    room.notification === "Y"
                ) {
                    if (data.imageNo) {
                        const imgData = { ...data, content: "사진을 보냈습니다." };
                        dispatch(addNotification(imgData));
                    } else {
                        dispatch(addNotification(data));
                    }
                    // 알림 자동 종료
                    const addedNotification = store.getState().noti.list.find(
                        (noti) => noti.content === data.content && noti.roomNo === data.roomNo
                    );
                    if (addedNotification?.id) {
                        setTimeout(() => {
                            dispatch(startClosingAnimation(addedNotification.id));
                        }, 2000);
                    }
                }
            });

            stompManager.subscriptions.set(roomNo, sub);
            dispatch(addSubscribedRoom(roomNo));
            console.log("구독 완료:", roomNo);
        });

        // rooms에 없는 방은 구독 해제
        subscribedRooms.forEach((roomNo) => {
            if (!rooms.find((r) => String(r.roomNo) === roomNo)) {
                stompManager.subscriptions.get(roomNo)?.unsubscribe();
                stompManager.subscriptions.delete(roomNo);
                dispatch(removeSubscribedRoom(roomNo));
                console.log("구독 해제:", roomNo);
            }
        });
    }, [rooms, connected, userNo]);

    const sendChatMessage = (roomNo: string | number | undefined, message: any) => {
        if (stompManager.client?.connected) {
            stompManager.client.publish({
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
