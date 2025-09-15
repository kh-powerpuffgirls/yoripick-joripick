import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";

interface AllergyModalProps {
  user: User;
  onClose: () => void;
}

const AllergyModal = ({ user, onClose }: AllergyModalProps) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{user.username}님의 알레르기 정보</h2>
        <div className={styles.checkboxList}>
          <label><input type="checkbox" /> 돼지고기</label>
          <label><input type="checkbox" /> 새우</label>
          <label><input type="checkbox" /> 대두콩</label>
          <label><input type="checkbox" /> 아보카도</label>
        </div>
        <button className={styles.saveBtn}>저장</button>
        <button className={styles.closeBtn} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default AllergyModal;