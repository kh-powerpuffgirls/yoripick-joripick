import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { useState } from "react";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
}

const ProfileModal = ({ user, onClose }: ProfileModalProps) => {
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.profile || "/default-profile.png");

  const handleFileChange = (file: File | null) => {
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file)); // 미리보기 URL 생성
    }
  };

  const handleSave = () => {
    if (profileImg) {
      console.log("업로드할 이미지:", profileImg);
    }
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>프로필 변경</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>
        <img src={previewUrl} alt="profile" className={styles.previewImg} />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
        {profileImg && <p>선택된 파일: {profileImg.name}</p>}
        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>저장</button>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;