import React from 'react';
import style from './classModal.module.css';

interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatData: any;
}

export const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, chatData }) => {
    if (!isOpen) return null;

    return (
        <div className={style.modalOverlay} onClick={onClose}>
            <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={style.modalHeader}>
                    <h3>{chatData.className}</h3>
                    <button className={style.closeButton} onClick={onClose}>&times;</button>
                </div>
                <div className={style.chatLog}>
                    {chatData.messages && chatData.messages.length > 0 ? (
                        chatData.messages.map((msg: any, index: number) => (
                            <div key={index} className={style.chatMessage}>
                                <div className={style.messageHeader}>
                                    <span className={style.messageUser}>{msg.username}</span>
                                    <span className={style.messageTime}>{new Date(msg.time).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: false
                                    })}</span>
                                </div>
                                <div className={style.messageBody}>
                                    {msg.imageNo ? (
                                        <img src={msg.content} alt="이미지" className={style.previewImage} />
                                    ) : (
                                        <>{msg.content}</>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={style.noMessages}>채팅 기록이 없습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
};