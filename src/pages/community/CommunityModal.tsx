import styles from './CommunityModal.module.css';

interface CommunityModalProps {
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export default function CommunityModal({ message, onConfirm, onCancel }: CommunityModalProps) {
    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    {onConfirm && <button className={styles.confirmBtn} onClick={onConfirm}>확인</button>}
                    {onCancel && <button className={styles.cancelBtn} onClick={onCancel}>취소</button>}
                </div>
            </div>
        </div>
    );
}
