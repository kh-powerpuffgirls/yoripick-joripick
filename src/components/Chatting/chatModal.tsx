import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { closeChat, openChat, sendMessage } from "../../features/chatSlice";
import style from './chatModal.module.css'
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { ChatRoomCreate, Message } from "../../type/chatmodal";
import { getLastRead, lastRead, saveMessage } from "../../api/chatApi";
import { useMutation } from "@tanstack/react-query";
import useChat from "../../hooks/useChat";
import { ChatList } from "./ChatList";

export const ChatModal = () => {
    const dispatch = useDispatch();
    let { isOpen, rooms, currentRoomId } = useSelector((state: RootState) => state.chat);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    let currentRoom = rooms.find((r) => r.roomNo === currentRoomId);
    const user = useSelector((state: RootState) => state.auth.user);
    const userNo = user?.userNo;
    const { sendChatMessage } = useChat();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [localLastRead, setLocalLastRead] = useState<number | null>(null);
    const cacheMessages = currentRoom?.messages; 

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

    // 마지막 읽은 메시지 조회 + 로컬 상태 업데이트
    useEffect(() => {
        if (!isOpen || !currentRoom || !currentRoom.messages.length || !userNo) return;
        const lastMsg = currentRoom.messages[currentRoom.messages.length - 1];
        if (!lastMsg.messageNo) return;
        const fetchLastRead = async () => {
            try {
                const lastReadMessageNo = await getLastRead(userNo, currentRoom.roomNo);
                setLocalLastRead(lastReadMessageNo ?? null);
            } catch (err) {
                console.error(err);
                setLocalLastRead(null);
            }
        };

        // 메세지를 보낼때 마다, 마지막 읽은글 업뎃하기?
        fetchLastRead()
        .then(()=> lastRead(userNo, currentRoom.roomNo, lastMsg.messageNo!!))
        .catch(console.error);
    }, [isOpen, userNo]);

    // 마지막 읽은 메시지 조회 + 로컬 상태 업데이트
    useEffect(() => {
        if (!isOpen || !currentRoom || !currentRoom.messages.length || !userNo) return;
        const lastMsg = currentRoom.messages[currentRoom.messages.length - 1];
        if (!lastMsg.messageNo) return;
        lastRead(userNo, currentRoom.roomNo, lastMsg.messageNo!!)
    }, [isOpen, userNo, currentRoom]);

    // 스크롤 처리
    const bodyRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!isOpen || !currentRoom || !bodyRef.current) return;
        const el = bodyRef.current;
        if (localLastRead) {
            const idx = currentRoom.messages.findIndex(m => m.messageNo === localLastRead);
            if (idx >= 0 && idx < currentRoom.messages.length - 1) {
                const target = el.children[idx + 1];
                if (target) (target as HTMLElement).scrollIntoView({ block: "start" });
                return;
            }
        }
        el.scrollTop = el.scrollHeight;
    }, [isOpen, currentRoom, localLastRead]);

    // 채팅 메세지 보내기
    const mutation = useMutation<Message, Error, FormData>({
        mutationFn: (message: FormData) =>
            saveMessage(currentRoom?.type, currentRoomId, message),
        onSuccess: (res) => {
            sendChatMessage(currentRoomId, res);
        }
    });
    const handleSend = async (type: ChatRoomCreate) => {
        if (!inputRef.current?.value.trim() || !currentRoom) return;
        let message: Message = {
            content: inputRef.current?.value,
            userNo: userNo as number,
            username: user?.username as string,
            button: undefined,
            createdAt: new Date().toISOString(),
            roomNo: currentRoom.roomNo,
        }
        let messageBlob = new Blob(
            [JSON.stringify(message)],
            { type: "application/json" }
        );
        let formData = new FormData();
        formData.append("message", messageBlob);

        if (type === "cservice") {
            mutation.mutate(formData);
            dispatch(sendMessage(message));
            try {
                const response = await axios.post(`http://localhost:8080/chat/${userNo}`,
                    { question: inputRef.current.value },
                    { withCredentials: true });
                const botMessage: Message = {
                    ...message,
                    username: "요픽",
                    content: response.data.content,
                    button: response.data.button ?? undefined
                };
                const messageBlob = new Blob([JSON.stringify(botMessage)], { type: "application/json" });
                const formData = new FormData();
                formData.append("message", messageBlob);
                mutation.mutate(formData);
                dispatch(sendMessage(botMessage));
            } catch (err) {
                const botMessage: Message = {
                    ...message,
                    username: "요픽",
                    content: "서버 오류 발생",
                };
                const messageBlob = new Blob([JSON.stringify(botMessage)], { type: "application/json" });
                const formData = new FormData();
                formData.append("message", messageBlob);
                mutation.mutate(formData);
                dispatch(sendMessage(botMessage));
            }
        } else if (type === "admin" || type === "cclass") {
            mutation.mutate(formData);
        }
        inputRef.current.value= "";
    };

    useEffect(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
    }, [currentRoomId]);

    // 사진 선택
    const handleClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    const handleSendImage = () => {
        if (!currentRoom) return;
        const message: Message = {
            content: "사진을 보냈습니다.",
            userNo: user?.userNo as number,
            username: user?.username as string,
            button: undefined,
            createdAt: new Date().toISOString(),
            roomNo: currentRoom.roomNo,
        }
        const messageBlob = new Blob(
            [JSON.stringify(message)],
            { type: "application/json" }
        );
        const formData = new FormData();
        formData.append("message", messageBlob)
        if (selectedFile) {
            formData.append("selectedFile", selectedFile);
        }
        mutation.mutate(formData);
        setSelectedFile(null);
        setPreviewUrl(null);
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
                            key={r.roomNo}
                            onClick={() => dispatch(openChat(r))}
                            className={r.roomNo === currentRoomId ? style.active : ""}>
                            {r.roomNo === currentRoomId ? r.className : r.className.charAt(0)}
                        </button>
                    ))}
                </div>
                <button onClick={() => dispatch(closeChat())}>X</button>
            </div>

            {/* messages */}
            <div ref={bodyRef} className={style.body}>
                {/* <div>
                    <button>사진첩</button>
                    <button>공지사항</button>
                </div> */}
                <ChatList
                    messages={cacheMessages}
                    userNo={userNo}
                    localLastRead={localLastRead}
                />
                {previewUrl && (
                    <div className={`${style.previewContainer} ${style.msgBubble} ${style.me}`}>
                        <p style={{ alignSelf: "center" }}>전송하시겠습니까?</p>
                        <img src={previewUrl} alt="미리보기" className={style.previewImage} />
                        <div className={style.previewButtons}>
                            <button onClick={handleSendImage}>확인</button>
                            <button onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }}>취소</button>
                        </div>
                    </div>
                )}
            </div>

            {/* input */}
            <div className={style.footer}>
                {currentRoom && (
                    <>
                        {currentRoom.type !== "cservice" && (
                            <>
                                <button onClick={handleClick}>사진선택</button>
                                <input type="file" accept="image/*" style={{ display: "none" }}
                                    ref={fileInputRef} onChange={handleFileChange} />
                            </>
                        )}
                        <input
                            ref={inputRef} placeholder="메시지를 입력하세요..."
                            onKeyDown={(e) => e.key === "Enter" && handleSend(currentRoom.type)}
                        />
                        <button onClick={() => handleSend(currentRoom.type)}>전송</button>
                    </>
                )}
            </div>
        </div>
    )
}