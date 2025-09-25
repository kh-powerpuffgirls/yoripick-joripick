import { useSelector, useDispatch } from "react-redux";
import style from "../Chatting/Notification.module.css";
import type { RootState } from "../../store/store";
import { removeNotification, startClosingAnimation } from "../../features/myIngSlice";
import type { Message } from "../../type/ingmodal";
import React, { useEffect, useState } from "react";

export const Notification = () => {
  const dispatch = useDispatch();
  const message = useSelector((state: RootState) => state.mying.message);
  const ings = useSelector((state: RootState) => state.mying);
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    setIsShown(true);
  }, []);

  const handleStartClose = (messageId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    dispatch(startClosingAnimation(messageId));
  };

  const handleClick = (message: Message) => {
    // if (room) {
    //   dispatch(openChat(room));
    //   if (message.id) {
    //       dispatch(removeNotification(message.id));
    //   }
    // }
  };

  if(!message) return;

  return (
    <div>
        <div
        //   className={`${style.notiItem} ${isShown ? style.slideUp : ""} ${message.isClosing ? style.fadeOut : ""}`}
          onAnimationEnd={(e) => {
            // if (e.animationName === style.fadeOut) {
            //   dispatch(removeNotification(message.id as string));
            // }
          }}
        >
          <div className={style.notiHeader}>
            <h3>새로운 메세지</h3>
            {/* <span>{ings.find((r) => r.ingNo == message.roomNo)?.className}</span> */}
          </div>
          <div className={style.notiContent}>
            <div className={style.profile}></div>
            <div className={style.messageBody}>
              <p>
                <strong>username</strong>
              </p>
              <p className={style.messageText}>{message.content}</p>
            </div>
          </div>
          <div className={style.notiActions}>
            <button
              className={`${style.notiBtn} ${style.cancelBtn}`}
            //   onClick={(e) => handleStartClose(message.id as string, e)}
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
    </div>
  );
};