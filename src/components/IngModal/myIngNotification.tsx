import { useSelector, useDispatch } from "react-redux";
import style from "../Chatting/Notification.module.css";
import type { RootState } from "../../store/store";
import React, { useEffect, useState } from "react";
import { startClosingAnimation } from "../../features/myIngSlice";
import { useNavigate } from "react-router";
import { lodingImg } from "../../assets/images";

export const MyIngNotification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const ings = useSelector((state: RootState) => state.mying.ings);
    const isClosing = useSelector((state: RootState) => state.mying.isClosing);
    const [isShown, setIsShown] = useState(false);

    const handleStartClose = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        dispatch(startClosingAnimation());
        setIsShown(false);

        localStorage.setItem("myIngNotificationClosed", "true");
    };
    const handleStartCloseAndNavigate = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        dispatch(startClosingAnimation());
        setIsShown(false);
        
        localStorage.setItem("myIngNotificationClosed", "true");
        
        navigate('/mypage/inglist');
    };

    useEffect(() => {
        const isClosed = localStorage.getItem("myIngNotificationClosed") === "true";
        if (!isClosed) {
            const timer = setTimeout(() => {
                setIsShown(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!ings || ings.length == 0 || isClosing == undefined) return null;

    return (
        <div>
            <div
                className={`${style.notiItem} ${isShown ? style.slideUp : ""} ${isClosing ? style.fadeOut : ""} ${style["exp-modal"]}`}
                onAnimationEnd={(e) => {
                    if (e.animationName === style.fadeOut) {
                        dispatch(startClosingAnimation());
                    }
                }}
            >
                <div className={style.notiHeader}>
                    <h3>내 식재료 관리</h3>
                </div>
                <div className={style.notiContent}>
                    <div className={style.profile}>
                        <img src={lodingImg.bang}/>
                    </div>
                    <div className={style.messageBody}>
                        <p><strong>소비기한이 임박했습니다!</strong></p>
                        <p className={style.messageText}>
                            {ings.map((item, index) => (
                                <span key={index}>
                                {item.ingName}
                                {item.quantity ? `(${item.quantity})` : ''}
                                {index < ings.length - 1 ? ', ' : ''}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
                <div className={style.notiActions}>
                    <button
                        className={`${style.notiBtn} ${style.cancelBtn}`}
                        onClick={handleStartClose}
                    >
                        취소
                    </button>
                    <button
                        className={`${style.notiBtn} ${style.moveBtn}`}
                        onClick={handleStartCloseAndNavigate}>
                        이동
                    </button>
                </div>
            </div>
        </div>
    );
};
