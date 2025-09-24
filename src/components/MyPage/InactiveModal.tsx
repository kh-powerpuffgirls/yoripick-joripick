import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";

interface InactiveModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

function InactiveModal({ user, onClose, onConfirm }: InactiveModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{user.username}님, 정말 회원탈퇴 하시겠습니까?</h2>
        <p>
          탈퇴 후에는 90일 동안 계정 정보를 보관하며,  
          이후에는 계정을 복구할 수 없습니다.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className={styles.closeBtn} onClick={onClose}>
            취소
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm}>
            탈퇴하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default InactiveModal;