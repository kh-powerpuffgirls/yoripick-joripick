import { useDispatch, useSelector } from "react-redux";
import type { ChatRoom, ChatRoomCreate } from "../type/chatmodal";
import axios from "axios";
import { openChat } from "../features/chatSlice";
import { hideAlert } from "../features/alertSlice";
import type { Dispatch, UnknownAction } from "redux";
import style from "./alertModal.module.css"
import type { RootState } from "../store/store";
import type { User } from "../type/authtype";
import { deleteRooms } from "../api/chatApi";

const handleNewChat = async (user: User | null, type: "admin" | "cclass" | "cservice" | null, dispatch: Dispatch<UnknownAction>) => {
    const newRoom: ChatRoom = {
        classNo: Date.now(),
        className: type === "admin" ? "관리자 문의하기" : "FAQ BOT, 요픽",
        type,
        messages: []
    }
    if (user) {
        try {
            deleteRooms(type, user);
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
            dispatch(openChat(newRoom));
            dispatch(hideAlert());
        }
    }
    try {
        await axios.delete(`http://localhost:8080/chat`, { withCredentials: true });
    } catch (err) {
        console.error("Error:", err);
    } finally {
        dispatch(openChat(newRoom));
        dispatch(hideAlert());
    }
};

export const NewChatModal = ({ type }: ChatRoomCreate) => {
    const {user} = useSelector( (state:RootState) => state.auth);
    const dispatch = useDispatch();
    return (
        <>
            <h3>{"새 대화를 시작하시겠습니까?"}</h3>
            <p>이전 대화기록은 삭제됩니다.</p>
            <button className={style.confirm} onClick={() => handleNewChat(user, type, dispatch)}>확인</button>
            <button className={style.cancel} onClick={() => dispatch(hideAlert())}>취소</button>
        </>
    );
};