import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { useState } from "react";
import axios from "axios";
import { api } from "../../api/authApi";

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdateProfile: (url: string) => void;
}

const ProfileModal = ({ user, onClose, onUpdateProfile }: ProfileModalProps) => {
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.profile || "/default-profile.png");
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
          onUpdateProfile(res.data.url);
          setPreviewUrl(res.data.url);
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