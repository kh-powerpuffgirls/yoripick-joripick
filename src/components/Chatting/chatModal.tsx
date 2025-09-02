import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { closeChat, openChat, sendMessage } from "../../features/chatSlice";
import style from './chatModal.module.css'
import useInput from "../../hooks/useInput";
import axios from "axios";
import { useEffect, useRef } from "react";

export const ChatModal = () => {
    const dispatch = useDispatch();
    const { isOpen, rooms, currentRoomId } = useSelector((state: RootState) => state.chat);
    const [input, handleInputChange, resetInput, setInput] = useInput({
        text: ""
    });
    
    const currentRoom = rooms.find((r) => r.id === currentRoomId);
    
    const bodyRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [currentRoom?.messages]);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!input.text.trim()) return;
        dispatch(sendMessage({ text: input.text, sender: "me" }));
        resetInput();
        // 채팅방이 챗봇일 경우
        try {
            const response = await axios.post("http://localhost:8080/chat", { question: input.text });
            dispatch(sendMessage({ text: response.data, sender: "other" }));
        } catch (err) {
            console.error(err);
            dispatch(sendMessage({ text: "서버 오류 발생", sender: "other" }));
        }
        // 채팅방이 쿠킹 클래스일경우
    };

    return (
        <div className={style.modal}>
            {/* header */}
            <div className={style.header}>
                <div className={style.chatList}>
                    {rooms.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => dispatch(openChat(r.id))}
                            className={r.id === currentRoomId ? style.active : ""}>
                            {r.id === currentRoomId ? r.name : r.name.charAt(0)}
                        </button>
                    ))}
                </div>
                <button onClick={() => dispatch(closeChat())}>X</button>
            </div>

            {/* messages */}
            <div ref={bodyRef} className={style.body}>
                {currentRoom?.messages.map((msg) => (
                    <div className={`${style.msgBubble} ${msg.sender === "me" ? style.me : style.other}`}>
                        {msg.text}
                    </div>
                ))}
            </div>

            {/* input */}
            <div className={style.footer}>
                <input
                    value={input.text}
                    onChange={(e) => setInput({ text: e.target.value })}
                    placeholder="메시지를 입력하세요..."
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button onClick={handleSend}>전송</button>
            </div>
        </div>
    )
}