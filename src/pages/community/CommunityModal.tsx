import styles from './CommunityModal.module.css';

interface CommunityModalProps {
  message?: string;
  onConfirm?: () => void;
  onClose: () => void;
  showCancel?: boolean;
}

const CommunityModal = ({ message, onConfirm, onClose, showCancel = false }: CommunityModalProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message || ''}</p>
        <div className={styles.actions}>
          <button className={styles.confirmBtn} onClick={handleConfirm}>확인</button>
          {showCancel && (
            <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityModal;