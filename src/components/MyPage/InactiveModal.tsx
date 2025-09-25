import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { api } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import useLogout from "../../hooks/logout";

interface InactiveModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}


function InactiveModal({ user, onClose, onConfirm }: InactiveModalProps) {
  const navigate = useNavigate();
  const logout = useLogout();

  const Inactivehandle = async () => {
    try {
      await api.post("users/inactive", { userNo: user.userNo });

      logout();

      onConfirm();

      alert("회원탈퇴 성공! 홈으로 돌아갑니다.");
      return;
    } catch (error) {
      alert("회원탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{user.username}님, <br />정말 회원탈퇴 하시겠습니까?</h2>
        <br />
        <p>
          탈퇴 후에는 90일 동안 계정 정보를 보관하며,<br />
          이후에는 계정을 복구할 수 없습니다.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className={styles.deleteBtn} onClick={Inactivehandle}>
            탈퇴하기
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default InactiveModal;