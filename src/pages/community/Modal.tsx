import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
    subMessage?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, message, subMessage }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <p className={styles.mainMessage}>{message}</p>
                {subMessage && <p className={styles.subMessage}>{subMessage}</p>}
                <div className={styles.modalActions}>
                    <button className={styles.confirmButton} onClick={onConfirm}>
                        확인
                    </button>
                    <button className={styles.cancelButton} onClick={onClose}>
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;