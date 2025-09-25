import React, { useState } from "react";
import styles from "./Modal.module.css";
import type { User } from "../../type/authtype";
import { useDispatch, useSelector } from "react-redux";
import { updateAlarmSettings } from "../../features/authSlice";
import axios from "axios";
import type { RootState } from "../../store/store";
import { api } from "../../api/authApi";

interface AlarmModalProps {
  user: User;
  onClose: () => void;
}

const AlarmModal = ({ user, onClose }: AlarmModalProps) => {
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    msgNoti: user.msgNoti === "Y",
    replyNoti: user.replyNoti === "Y",
    rvwNoti: user.rvwNoti === "Y",
    expNoti: user.expNoti === "Y",
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {

    const payload: {
      userNo: number;
      msgNoti: "Y" | "N";
      replyNoti: "Y" | "N";
      rvwNoti: "Y" | "N";
      expNoti: "Y" | "N";
    } = {
      userNo: user.userNo,
      msgNoti: settings.msgNoti ? "Y" : "N",
      replyNoti: settings.replyNoti ? "Y" : "N",
      rvwNoti: settings.rvwNoti ? "Y" : "N",
      expNoti: settings.expNoti ? "Y" : "N",
    };

    try {
      await api.put(`/users/alarm`,payload);

      console.log(payload);

      dispatch(
        updateAlarmSettings({
          msgNoti: payload.msgNoti,
          replyNoti: payload.replyNoti,
          rvwNoti: payload.rvwNoti,
          expNoti: payload.expNoti,
        })
      );
      onClose();
    } catch (err) {
      alert("알림 설정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>

        <div className={styles.modalBody}>
          <h3>{user.username} 님의</h3>
          <h3>실시간 알림 설정</h3>
          <div className={styles.checkboxList}>
            <label className={styles.alarmCheckbox}>
              <input type="checkbox" checked={settings.msgNoti} onChange={() => toggleSetting("msgNoti")} />
              <span>메시지 알림</span>
            </label>
            <label className={styles.alarmCheckbox}>
              <input type="checkbox" checked={settings.replyNoti} onChange={() => toggleSetting("replyNoti")} />
              <span>댓글 알림</span>
            </label>
            <label className={styles.alarmCheckbox}>
              <input type="checkbox" checked={settings.rvwNoti} onChange={() => toggleSetting("rvwNoti")} />
              <span>리뷰 알림</span>
            </label>
            <label className={styles.alarmCheckbox}>
              <input type="checkbox" checked={settings.expNoti} onChange={() => toggleSetting("expNoti")} />
              <span>소비기한 임박 알림</span>
            </label>
          </div>

          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={handleSave}>설정 완료</button>
            <button className={styles.closeBtn} onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlarmModal;