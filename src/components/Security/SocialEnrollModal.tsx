import { useState, useRef } from "react";
import styles from "../../pages/enroll/EnrollModal.module.css";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

interface SocialEnrollModalProps {
  email: string;
  provider: string;
  providerUserId: string;
  onClose: () => void;
}

export default function SocialEnrollModal({ email, provider, providerUserId, onClose }: SocialEnrollModalProps) {
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<null | boolean>(null);
  const [error, setError] = useState("");
  const usernameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (
        (code >= 0xac00 && code <= 0xd7a3) ||
        (code >= 0x1100 && code <= 0x1112) ||
        (code >= 0x1161 && code <= 0x1175) ||
        (code >= 0x11a8 && code <= 0x11c2)
      )
        byteLength += 2;
      else byteLength += 1;
    }
    return byteLength;
  };

  const validateUsername = (username: string) => {
    const byteLength = getByteLength(username);
    const pattern = /^[\u1100-\u11FF가-힣ㄱ-ㅎa-zA-Z0-9]+$/;
    return pattern.test(username) && byteLength >= 4 && byteLength <= 16;
  };

  const handleCheckUsername = async () => {
    if (!validateUsername(username)) {
      setError("닉네임 형식이 올바르지 않습니다.");
      usernameRef.current?.focus();
      return;
    }
    try {
      const res = await axios.get("https://api.ypjp.store/auth/users/check", {
        params: { username },
      });
      setUsernameStatus(res.data.available);
      setError("");
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;
        switch (errorCode) {
          case "INVALID_USERNAME":
            setError(message || "닉네임을 입력하세요.");
            break;
          default:
            setError(message || "중복 확인 중 오류 발생");
        }
      } else {
        setError("서버와 연결할 수 없습니다.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || usernameStatus !== true) {
      alert("닉네임 중복확인을 해주세요.");
      return;
    }

    try {
      await axios.post(
        "https://api.ypjp.store/auth/users/social",
        { email, username, provider, providerUserId },
        { withCredentials: true }
      );

      alert("회원가입 및 로그인 완료!");
      navigate("/home", { replace: true });
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message: string }>;
      if (error.response) {
        const { message } = error.response.data;
        alert(message || "회원가입 중 오류 발생");
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>이제 거의 다 왔어요 ! </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✖
          </button>
        </div>
        <p className={styles.nicknameGuide}>
          현재 사이트에서 사용할 닉네임을 입력해주세요.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>이메일</label>
          <input type="email" value={email} disabled className={styles.input} />

          <label>닉네임</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameStatus(null);
              }}
              ref={usernameRef}
              placeholder="한글·영문·숫자 4~16byte"
            />
            <button
              type="button"
              className={styles.subBtn}
              onClick={handleCheckUsername}
            >
              중복 확인
            </button>
          </div>

          {usernameStatus === true && (
            <p className={styles.successTextSmall}>사용 가능한 닉네임입니다</p>
          )}
          {usernameStatus === false && (
            <p className={styles.errorTextSmall}>중복된 닉네임입니다</p>
          )}
          {error && <p className={styles.errorTextSmall}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            회원 가입 완료하기
          </button>
        </form>
      </div>
    </div>
  );
}