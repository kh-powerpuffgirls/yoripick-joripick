import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal = ({ user, onClose }: ProfileModalProps) => {
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    user.profile || "/default-profile.png"
  );

  const handleFileChange = (file: File | null) => {
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const handleSave = async () => {
    if (!profileImg) {
      alert("파일을 선택하세요.");
      return;
    }

    // 프론트에서도 1차 파일 검증
    if (!profileImg.type.startsWith("image/")) {
      alert("파일형식이 옳지 않습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("file", profileImg);
    formData.append("userNo", String(user.userNo));

    try {
      const res = await axios.post("http://localhost:8081/mypage/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (res.data.success) {
        alert(res.data.message); // "프로필이 변경되었습니다."
        onClose();
      } else {
        alert(res.data.message || "업데이트 실패");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>프로필 변경</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✖
          </button>
        </div>
        <img src={previewUrl} alt="profile" className={styles.previewImg} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
        {profileImg && <p>선택된 파일: {profileImg.name}</p>}
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>
            저장
          </button>
          <button className={styles.closeBtn} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;