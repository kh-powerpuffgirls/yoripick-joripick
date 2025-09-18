import React, { useState } from "react";
import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";

interface AlarmModalProps {
  user: User;
  onClose: () => void;
}

const AlarmModal = ({ user, onClose }: AlarmModalProps) => {
  const [settings, setSettings] = useState({
    message: false,
    comment: false,
    review: false,
    expiration: true,
    recipeApproval: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    console.log(`${user.username}님의 알림 설정:`, settings);
    // TODO: API 호출
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{user.username}님의 실시간 알림 설정</h2>
        <div className="checkbox-list">
          <label>
            <input type="checkbox" checked={settings.message} onChange={() => toggleSetting("message")} />
            메시지 알림
          </label>
          <label>
            <input type="checkbox" checked={settings.comment} onChange={() => toggleSetting("comment")} />
            댓글 알림
          </label>
          <label>
            <input type="checkbox" checked={settings.review} onChange={() => toggleSetting("review")} />
            리뷰 알림
          </label>
          <label>
            <input type="checkbox" checked={settings.expiration} onChange={() => toggleSetting("expiration")} />
            소비기한 임박 알림
          </label>
          <label>
            <input type="checkbox" checked={settings.recipeApproval} onChange={() => toggleSetting("recipeApproval")} />
            레시피 승인/기각 알림
          </label>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.saveBtn} onClick={handleSave}>설정 완료</button>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
};

export default AlarmModal;