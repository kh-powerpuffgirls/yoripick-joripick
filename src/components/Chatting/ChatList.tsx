import React, { useMemo, useState } from "react";
import style from './chatModal.module.css'
import { type Message } from "../../type/chatmodal";
import { useDispatch } from "react-redux";
import { closeChat } from "../../features/chatSlice";
import { useNavigate } from "react-router-dom";

interface ChatListProps {
    messages: Message[] | undefined;
    userNo: number | undefined;
    localLastRead: number | null;
}

const ChatListComponent: React.FC<ChatListProps> = ({
    messages,
    userNo,
    localLastRead,
}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isDelayOpen2, setDelayOpen2] = useState(false);

    setTimeout(() => {
        setDelayOpen2(true)
    }, 1000)

    const renderedMessages = useMemo(() => {
        return messages?.map((msg, index) => {
            const currentMsgDate = new Date(msg.createdAt as string);
            const currentDateString = currentMsgDate.toLocaleDateString();
            const prevMsgDateString =
                index > 0
                    ? new Date(messages[index - 1].createdAt).toLocaleDateString()
                    : null;
            const isNewDate = prevMsgDateString !== currentDateString;

            // 구분선 조건: 마지막 읽은 메시지 바로 다음 메시지 앞
            const prevMsgNo = messages[index - 1]?.messageNo ?? 0;
            const isUnreadDivider =
                !isDelayOpen2 &&
                localLastRead !== null &&
                msg.messageNo !== undefined &&
                msg.messageNo > localLastRead &&
                (prevMsgNo <= localLastRead);
                
            return (
                <div key={msg.createdAt + index}>
                    {isUnreadDivider && (
                        <div className={style.dateSeparator}>아직 읽지 않은 메시지</div>
                    )}
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
                    {msg.userNo === 0 ? (
                        <div className={style.dateSeparator}>{msg.content}</div>
                    ) : (
                        <div
                            className={`${style.msg} ${msg.userNo !== userNo || msg.username === "요픽"
                                ? style.left
                                : style.right
                                }`}
                        >
                            <div
                                className={`${style.username} ${msg.userNo !== userNo || msg.username === "요픽"
                                    ? style.alignLeft
                                    : style.alignRight
                                    }`}
                            >
                                {msg.username}
                            </div>
                            <div className={style.msgWrapper}>
                                {!(msg.userNo !== userNo || msg.username === "요픽") && (
                                    <div className={style.time}>
                                        {new Date(msg.createdAt as string).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                )}
                                <div
                                    className={`${style.msgBubble} ${msg.userNo !== userNo || msg.username === "요픽"
                                        ? style.other
                                        : style.me
                                        }`}
                                >
                                    {!msg.imageNo && msg.content}
                                    {msg.imageNo && (
                                        <img
                                            src={msg.content}
                                            alt="이미지"
                                            className={style.image}
                                        />
                                    )}
                                    {msg.button?.linkUrl && (
                                        <div className={style.linkBtn}>
                                            <button
                                                onClick={() => {
                                                    navigate(msg.button?.linkUrl as string);
                                                    dispatch(closeChat());
                                                }}
                                            >
                                                바로가기
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {(msg.userNo !== userNo || msg.username === "요픽") && (
                                    <div className={style.time}>
                                        {new Date(msg.createdAt as string).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    }, [messages, userNo, localLastRead, navigate, dispatch]);

    return <>{renderedMessages}</>;
};

export const ChatList = React.memo(ChatListComponent);