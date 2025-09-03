import { useDispatch } from "react-redux";
import type { ChatRoom, ChatRoomCreate } from "../type/chatmodal";
import axios from "axios";
import { openChat } from "../features/chatSlice";
import { hideAlert } from "../features/alertSlice";
import type { Dispatch, UnknownAction } from "redux";
import style from "./alertModal.module.css"

const userId = "0"; // 로그인 기능 끝나면 수정

const handleNewChat = async (type: "chat" | "cservice" | null, dispatch: Dispatch<UnknownAction>) => {
    const newRoom: ChatRoom = {
        classNo: Date.now().toString(),
        className: type === "chat" ? "관리자 문의하기" : "FAQ BOT, 요픽",
        type,
        messages: []
    }
    try {
        await axios.delete(`http://localhost:8081/chat/rooms/${type}/${userId}`, { withCredentials: true });
        // 챗봇 서버에서 대화히스토리 지우거나 세션id 쿠키에 있던거 초기화해야할텐데...
        dispatch(openChat(newRoom));
    } catch (err) {
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 404) {
                dispatch(openChat(newRoom));
            } else {
                console.error("Axios error:", err.response?.status || err.message);
            }
        } else if (err instanceof Error) {
            console.error("JS Error:", err.message);
        } else {
            console.error("Unknown error:", err);
        }
    } finally {
        dispatch(hideAlert());
    }
};

export const NewChatModal = ({ type }: ChatRoomCreate) => {
    const dispatch = useDispatch();
    return (
        <>
            <h3>{"새 대화를 시작하시겠습니까?"}</h3>
            <p>이전 대화기록은 삭제됩니다.</p>
            <button className={style.confirm} onClick={() => handleNewChat(type, dispatch)}>확인</button>
            <button className={style.cancel}onClick={() => dispatch(hideAlert())}>취소</button>
        </>
    );
};