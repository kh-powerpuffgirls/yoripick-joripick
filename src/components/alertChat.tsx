import { useDispatch, useSelector } from "react-redux";
import type { ChatModalProps, ChatRoomCreate } from "../type/chatmodal";
import axios from "axios";
import { openChat, resetRoom } from "../features/chatSlice";
import { hideAlert } from "../features/alertSlice";
import type { Dispatch, UnknownAction } from "redux";
import style from "./alertModal.module.css"
import type { RootState } from "../store/store";
import type { User } from "../type/authtype";
import { deleteRooms } from "../api/chatApi";

const handleNewChat = async (user: User | null, type: ChatRoomCreate, dispatch: Dispatch<UnknownAction>) => {
    dispatch(hideAlert());
    dispatch(resetRoom(type));
    const newRoom = await deleteRooms(type as ChatRoomCreate, user as User);
    dispatch(openChat(newRoom));
    if (type === "cservice") {
        try {
            await axios.delete(`http://localhost:8080/chat/${user?.userNo}`, { withCredentials: true });
        } catch (err) {
            console.error("Error:", err);
        }
    }
};
export const NewChatModal = ({ type }: ChatModalProps) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();
    if (!type) return null;
    if (type === "admin" && user?.roles.includes("ROLE_ADMIN")) return (
        <>
            <h3>관리자는 관리자 문의를 시작할 수 없습니다.</h3>
            <button className={style.confirm} onClick={() => dispatch(hideAlert())}>확인</button>
        </>
    )
    return (
        <>
            <h3>{"새 대화를 시작하시겠습니까?"}</h3>
            <p>이전 대화기록은 삭제됩니다.</p>
            <button className={style.confirm} onClick={() => handleNewChat(user, type, dispatch)}>확인</button>
            <button className={style.cancel} onClick={() => dispatch(hideAlert())}>취소</button>
        </>
    );
};