import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { closeChat, openChat, sendMessage } from "../../features/chatSlice";
import style from './chatModal.module.css'
import useInput from "../../hooks/useInput";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { ChatRoomCreate, Message } from "../../type/chatmodal";
import { saveMessage } from "../../api/chatApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useChat from "../../hooks/useChat";

export const ChatModal = () => {
    const dispatch = useDispatch();
    const { isOpen, rooms, currentRoomId } = useSelector((state: RootState) => state.chat);
    const [input, handleInputChange, resetInput, setInput] = useInput({ text: "" });
    const modalRef = useRef<HTMLDivElement>(null);
    let currentRoom = rooms.find((r) => r.roomNo === currentRoomId);
    const user = useSelector((state: RootState) => state.auth.user);
    const userNo = user?.userNo;
    const { sendChatMessage } = useChat();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        if (!bodyRef.current) return;
        const scrollToBottom = () => {
            bodyRef.current!.scrollTop = bodyRef.current!.scrollHeight;
        };
        const imgs = bodyRef.current.querySelectorAll('img');
        imgs.forEach(img => img.addEventListener('load', scrollToBottom));
        scrollToBottom();
        return () => {
            imgs.forEach(img => img.removeEventListener('load', scrollToBottom));
        };
    }, [isOpen, currentRoom?.messages, previewUrl]);

    // 채팅 메세지 보내기
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (message: Message) =>
            saveMessage(currentRoom?.type, currentRoomId, message),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["rooms", userNo] })
    });
    const handleSend = async (type: ChatRoomCreate) => {
        if (!input.text.trim()) return;
        resetInput();
        let message: Message = {
            content: input.text,
            userNo: userNo as number,
            username: user?.username as string,
            button: undefined,
            createdAt: new Date().toISOString(),
            roomNo: currentRoomId ?? "",
        }
        if (type === "cservice") {
            mutation.mutate(message);
            dispatch(sendMessage(message));
            sendChatMessage(currentRoomId, message);
            try {
                const response = await axios.post(`http://localhost:8080/chat/${userNo}`,
                    { question: input.text },
                    { withCredentials: true });
                message.username = "요픽";
                message.content = response.data.content;
                if (response.data.button) {
                    message.button = response.data.button;
                }
                mutation.mutate(message);
                dispatch(sendMessage(message));
                sendChatMessage(currentRoomId, message);
            } catch (err) {
                message.username = "요픽";
                message.content = "서버 오류 발생";
                mutation.mutate(message);
                dispatch(sendMessage(message));
                sendChatMessage(currentRoomId, message);
            }
        } else if (type === "admin" || type === "cclass") {
            message.username = user?.username as string;
            mutation.mutate(message);
            sendChatMessage(currentRoomId, message);
        }
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
        if (!selectedFile || !currentRoom) return;
        const message = {
            content: previewUrl as string,
            userNo: user?.userNo as number,
            username: user?.username as string,
            button: undefined,
            createdAt: new Date().toISOString(),
            roomNo: currentRoom.roomNo
        };
        mutation.mutate(message);
        sendChatMessage(currentRoomId, message);
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
                {currentRoom?.messages.map((msg, index) => {
                    const currentMsgDate = new Date(msg.createdAt as string);
                    const currentDateString = currentMsgDate.toLocaleDateString();
                    const prevMsgDateString =
                        index > 0
                            ? new Date(currentRoom.messages[index - 1].createdAt).toLocaleDateString()
                            : null;
                    const isNewDate = prevMsgDateString !== currentDateString;

                    return (
                        <div key={msg.createdAt + index}>
                            {isNewDate && (
                                <div className={style.dateSeparator}>
                                    {currentMsgDate.toLocaleDateString([], {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </div>
                            )}
                            <div className={`${style.msg} ${(msg.userNo !== userNo || msg.username === "요픽") ? style.left : style.right}`}>
                                <div className={`${style.username} ${(msg.userNo !== userNo || msg.username === "요픽") ? style.alignLeft : style.alignRight}`}>
                                    {msg.username}
                                </div>
                                <div className={style.msgWrapper}>
                                    {!(msg.userNo !== userNo || msg.username === "요픽") && (
                                        <div className={style.time}>
                                            {new Date(msg.createdAt as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    )}
                                    <div className={`${style.msgBubble} ${(msg.userNo !== userNo || msg.username === "요픽") ? style.other : style.me}`}>
                                        {msg.content}
                                        {msg.button?.linkUrl && (
                                            <div className={style.linkBtn}>
                                                <a href={`${window.location.pathname.split("/")[0]}${msg.button.linkUrl}`} target="_blank">바로가기</a>
                                            </div>
                                        )}
                                    </div>
                                    {(msg.userNo !== userNo || msg.username === "요픽") && (
                                        <div className={style.time}>
                                            {new Date(msg.createdAt as string).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
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
                            value={input.text}
                            onChange={(e) => setInput({ text: e.target.value })}
                            placeholder="메시지를 입력하세요..."
                            onKeyDown={(e) => e.key === "Enter" && handleSend(currentRoom.type)}
                        />
                        <button onClick={() => handleSend(currentRoom.type)}>전송</button>
                    </>
                )}
            </div>
        </div>
    )
}