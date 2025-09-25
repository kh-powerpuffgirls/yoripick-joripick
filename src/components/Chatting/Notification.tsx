import { useSelector, useDispatch } from "react-redux";
import style from "./Notification.module.css";
import type { RootState } from "../../store/store";
import { removeNotification, startClosingAnimation } from "../../features/notiSlice";
import { openChat } from "../../features/chatSlice";
import React, { useEffect, useState } from "react";
import type { NotificationState } from "../../type/components";

export const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.noti.list);
  type NotificationMessage = NotificationState["list"][number];
  const rooms = useSelector((state: RootState) => state.chat.rooms);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setIsShown(true);
  }, []);

  const handleStartClose = (messageId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch(startClosingAnimation(messageId));
  };

  const handleClick = (message: NotificationMessage) => {
    const room = rooms.find((r) => r.roomNo == message.roomNo);
    if (room) {
      dispatch(openChat(room));
      dispatch(removeNotification(message.id));
    }
  };

  return (
    <div>
      {notifications.map((message) => (
        <div
          key={message.id}
          className={`${style.notiItem} ${isShown ? style.slideUp : ""} ${message.isClosing ? style.fadeOut : ""
            }`}
          onAnimationEnd={(e) => {
            if (e.animationName === style.fadeOut) {
              dispatch(removeNotification(message.id as string));
            }
          }}
        >
          <div className={style.notiHeader}>
            <h3>새로운 메세지</h3>
            <span>{rooms.find((r) => r.roomNo == message.roomNo)?.className}</span>
          </div>
          <div className={style.notiContent}>
            <div className={style.profile}></div>
            <div className={style.messageBody}>
              <p>
                <strong>{message.username}</strong>
              </p>
              <p className={style.messageText}>{message.content}</p>
            </div>
          </div>
          <div className={style.notiActions}>
            <button
              className={`${style.notiBtn} ${style.cancelBtn}`}
              onClick={(e) => handleStartClose(message.id as string, e)}
            >
              취소
            </button>
            <button
              className={`${style.notiBtn} ${style.moveBtn}`}
              onClick={() => handleClick(message)}
            >
              이동
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};