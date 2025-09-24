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
import { useNavigate } from "react-router-dom";

export const ChatModal = () => {
    const dispatch = useDispatch();
    let { isOpen, rooms, currentRoomId } = useSelector((state: RootState) => state.chat);
    const [input, handleInputChange, resetInput, setInput] = useInput({ text: "" });
    const modalRef = useRef<HTMLDivElement>(null);
    let currentRoom = rooms.find((r) => r.roomNo === currentRoomId);
    const user = useSelector((state: RootState) => state.auth.user);
    const userNo = user?.userNo;
    const { sendChatMessage } = useChat();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const navigate = useNavigate();

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
    const mutation = useMutation<Message, Error, FormData>({
        mutationFn: (message: FormData) =>
            saveMessage(currentRoom?.type, currentRoomId, message),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["rooms", userNo] });
            sendChatMessage(currentRoomId, res);
        }
    });
    const handleSend = async (type: ChatRoomCreate) => {
        if (!input.text.trim() || !currentRoom) return;
        resetInput();
        let message: Message = {
            content: input.text,
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
                    { question: input.text },
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
                                        {!msg.imageNo && msg.content}
                                        {msg.imageNo && (
                                            <img src={msg.content} alt="이미지" className={style.previewImage} />
                                        )}
                                        {msg.button?.linkUrl && (
                                            <div className={style.linkBtn}>
                                                <button onClick={() => {
                                                    navigate(msg.button?.linkUrl as string);
                                                    dispatch(closeChat());
                                                }}>바로가기</button>
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