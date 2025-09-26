import styles from "./RestoreAccountModal.module.css";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function RestoreAccountModal({ onClose, onConfirm }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p>회원탈퇴된 계정입니다. 복구하시겠습니까?</p>
        <div className={styles.btnGroup}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            예
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            아니오
          </button>
        </div>
      </div>
    </div>
  );
}