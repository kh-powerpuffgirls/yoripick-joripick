import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { closeChat, openChat, sendMessage } from "../../features/chatSlice";
import style from './chatModal.module.css'
import useInput from "../../hooks/useInput";

export const ChatModal = () => {
    const dispatch = useDispatch();
    const { isOpen, rooms, currentRoomId } = useSelector((state: RootState) => state.chat);
    const [input, handleInputChange, resetInput, setInput] = useInput({
        text: ""
    });

    if (!isOpen) return null;
    const currentRoom = rooms.find((r) => r.id === currentRoomId);

    const handleSend = () => {
        if (!input.text.trim()) return;
        dispatch(sendMessage(input));
        resetInput();
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
            <div className={style.body}>
                {currentRoom?.messages.map((msg) => (
                    <div className={`${style.msgBubble} ${msg.sender === "me" ? style.me : style.other}`} key={msg.id}>
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