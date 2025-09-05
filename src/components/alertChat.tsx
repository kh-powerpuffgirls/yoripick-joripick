import { useDispatch, useSelector } from "react-redux";
import type { ChatModalProps, ChatRoom, ChatRoomCreate } from "../type/chatmodal";
import axios from "axios";
import { openChat, resetRoom } from "../features/chatSlice";
import { hideAlert } from "../features/alertSlice";
import type { Dispatch, UnknownAction } from "redux";
import style from "./alertModal.module.css"
import type { RootState } from "../store/store";
import type { User } from "../type/authtype";
import { deleteRooms } from "../api/chatApi";

const handleNewChat = async (user: User | null, type: ChatRoomCreate, dispatch: Dispatch<UnknownAction>) => {
    const newRoom: ChatRoom = {
        classNo: type === "admin" ? -1 : 0,
        className: type === "admin" ? "관리자 문의하기" : "FAQ BOT, 요픽",
        type,
        messages: []
    }
    dispatch(hideAlert());
    dispatch(resetRoom(type));
    if (user && type) {
        deleteRooms(type, user);
    }
    dispatch(openChat(newRoom));
    if (type == "cservice") {
        try {
            await axios.delete(`http://localhost:8080/chat/${user?.userNo}`, { withCredentials: true });
        } catch (err) {
            console.error("Error:", err);
        }
    }
};

export const NewChatModal = ({type}: ChatModalProps) => {
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();
    if (!type) return null;
    return (
        <>
            <h3>{"새 대화를 시작하시겠습니까?"}</h3>
            <p>이전 대화기록은 삭제됩니다.</p>
            <button className={style.confirm} onClick={() => handleNewChat(user, type, dispatch)}>확인</button>
            <button className={style.cancel} onClick={() => dispatch(hideAlert())}>취소</button>
        </>
    );
};