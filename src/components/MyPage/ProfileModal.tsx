import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { useState } from "react";
import { api } from "../../api/authApi";
import { useDispatch } from "react-redux";
import { updateImageNo, updateProfileImage } from "../../features/authSlice";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateProfile: (url: string) => void;
  profileImg: File | null;
  setProfileImg: React.Dispatch<React.SetStateAction<File | null>>;
}

const ProfileModal = ({ user, onClose, profileImg, setProfileImg }: ProfileModalProps) => {
  const dispatch = useDispatch();
  const [previewUrl, setPreviewUrl] = useState<string>(user.profile || "default-profile.png");
  const handleFileChange = (file: File | null) => {
    if (file) {
      setProfileImg(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!profileImg) {
      onClose();
      return;
    }

    try {
      const form = new FormData();
      form.append("file", profileImg);
      form.append("userNo", String(user.userNo));

      const res = await api.post("/mypage/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        console.log("업로드 성공", res.data);
        alert(res.data.message);

        if (res.data.url) {
          dispatch(updateProfileImage(res.data.url));
          dispatch(updateImageNo(res.data.imageNo));
        }
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("파일 업로드 에러", err);
    } finally {
      onClose();
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

        <div className={styles.modalBody}>
          <img src={previewUrl} alt="profile" className={styles.previewImg} />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          {profileImg && <p>선택된 파일: {profileImg.name}</p>}
        </div>

        <div className={styles.actions}>
          <button className={styles.saveBtn} onClick={handleSave}>저장</button>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;