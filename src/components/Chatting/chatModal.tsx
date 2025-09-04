import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { closeChat, openChat, sendMessage, setRooms } from "../../features/chatSlice";
import style from './chatModal.module.css'
import useInput from "../../hooks/useInput";
import axios from "axios";
import { useEffect, useRef } from "react";
import useChat from "../../hooks/useChat";
import type { ChatRoom } from "../../type/chatmodal";
import { getRooms, saveMessage } from "../../api/chatApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ChatModal = () => {
    const dispatch = useDispatch();
    let { isOpen, rooms, currentRoomId } = useSelector((state: RootState) => state.chat);
    const [input, handleInputChange, resetInput, setInput] = useInput({ text: "" });
    const modalRef = useRef<HTMLDivElement>(null);
    const currentRoom = rooms.find((r) => r.classNo === currentRoomId);
    const {isAuthenticated, user} = useSelector( (state:RootState) => state.auth);
    const userId = user?.userNo;
    const { sendChatMessage } = useChat({ roomId: currentRoomId, myId: userId });

    // 채팅방 목록 로딩
    const { data: roomData } = useQuery({
        queryKey: ["rooms", userId],
        queryFn: () => getRooms(userId),
        staleTime: 1000 * 60,
        gcTime : 1000 * 60 * 5,
        enabled : isAuthenticated
    });
    useEffect(() => {
        if (roomData) {
            const rooms = roomData.map((room: ChatRoom) => ({ ...room, messages: [] }));
            dispatch(setRooms(rooms));
            console.log(rooms);
        }
    }, [roomData, dispatch]);

    // 모달 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                dispatch(closeChat());
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, dispatch]);

    // 스크롤 맨 아래로 내리기
    const bodyRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [currentRoom?.messages]);

    // 채팅 메세지 보내기
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ content, role }: { content: string, role: "USER" | "BOT" }) => 
            saveMessage(userId, content, role),
        onSuccess : () => queryClient.invalidateQueries({queryKey:["rooms", userId]})
    });
    const handleSend = async (type: "admin" | "cclass" | "cservice" | null | undefined) => {
        if (!input.text.trim()) return;
        resetInput();
        if (type === "cservice") {
            dispatch(sendMessage({ content: input.text, username: "me" }));
            mutation.mutate({ content: input.text, role: "USER" });
            try {
                const response = await axios.post("http://localhost:8080/chat",
                    { question: input.text },
                    { withCredentials: true });

                dispatch(sendMessage({
                    content: response.data.answer,
                    username: "other",
                    button: response.data.button
                }));
                mutation.mutate({ content: response.data.answer, role: "BOT" });

            } catch (err) {
                dispatch(sendMessage({ content: "서버 오류 발생", username: "other" }));
                mutation.mutate({ content: "서버 오류 발생", role: "BOT" });
            }
        } else if (type === "admin" || "cclass") {
            sendChatMessage(input.text);
        }
    };

    if (!isOpen) return null;

    return (
            <div ref={modalRef} className={style.modal}>
                {/* header */}
                <div className={style.header}>
                    <div className={style.chatList}>
                        {rooms.map((r) => (
                            // active일 경우 name 표시하고 아닐경우 이미지 띄우는거 가능?
                            <button
                                key={r.classNo}
                                onClick={() => dispatch(openChat(r))}
                                className={r.classNo === currentRoomId ? style.active : ""}>
                                {r.classNo === currentRoomId ? r.className : r.className.charAt(0)}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => dispatch(closeChat())}>X</button>
                </div>

                {/* messages */}
                <div ref={bodyRef} className={style.body}>
                    {currentRoom?.messages.map((msg) => (
                        <div className={`${style.msgBubble} ${msg.username === "me" ? style.me : style.other}`}>
                            {msg.content}
                            {msg.button && (
                                <div className={style.linkBtn}>
                                    <a href={msg.button.url}
                                        target="_blank">바로가기</a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* input */}
                <div className={style.footer}>
                    <input
                        value={input.text}
                        onChange={(e) => setInput({ text: e.target.value })}
                        placeholder="메시지를 입력하세요..."
                        onKeyDown={(e) => e.key === "Enter" && handleSend(currentRoom?.type)}
                    />
                    <button onClick={() => handleSend(currentRoom?.type)}>전송</button>
                </div>
            </div>
    )
}