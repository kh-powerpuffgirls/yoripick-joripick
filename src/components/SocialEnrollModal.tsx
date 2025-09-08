import { useState, useRef } from "react";
import styles from "../pages/enroll/EnrollModal.module.css";
import { useNavigate } from "react-router-dom";

interface SocialEnrollModalProps {
  email: string;
  provider: string;
  providerUserId: string;
  onClose: () => void;
}

export default function SocialEnrollModal({ email, provider, providerUserId, onClose }: SocialEnrollModalProps) {
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<null | boolean>(null);
  const [error, setError] = useState("");
  const nicknameRef = useRef<HTMLInputElement>(null);
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
      ) byteLength += 2;
      else byteLength += 1;
    }
    return byteLength;
  };

  const validateNickname = (nickname: string) => {
    const byteLength = getByteLength(nickname);
    const pattern = /^[\u1100-\u11FF가-힣ㄱ-ㅎa-zA-Z0-9]+$/;
    return pattern.test(nickname) && byteLength >= 4 && byteLength <= 16;
  };

  const handleCheckNickname = async () => {
    if (!validateNickname(nickname)) {
      alert("닉네임 형식이 올바르지 않습니다.");
      nicknameRef.current?.focus();
      return;
    }
    try {
      const res = await fetch(`http://localhost:8081/auth/check-username?username=${nickname}`);
      if (!res.ok) throw new Error("닉네임 확인 실패");
      const data = await res.json();
      setNicknameStatus(data.available);
    } catch {
      setError("중복 확인 중 오류 발생");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname || nicknameStatus !== true) return alert("닉네임 중복확인을 해주세요.");

    try {
      const res = await fetch("http://localhost:8081/auth/enroll/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username: nickname, provider, providerUserId, accessToken: null }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "회원가입 실패");
      alert("소셜 회원가입 성공!");
      navigate(`/oauth2/success?accessToken=${data.accessToken}`,{ replace: true })
    } catch {
      alert("회원가입 중 오류 발생");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>소셜 회원가입</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>이메일</label>
          <input type="email" value={email} disabled className={styles.input} />

          <label>닉네임</label>
          <div className={styles.inputRow}>
            <input type="text" value={nickname} onChange={e => { setNickname(e.target.value); setNicknameStatus(null); }} ref={nicknameRef} />
            <button type="button" className={styles.subBtn} onClick={handleCheckNickname}>중복 확인</button>
          </div>

          {nicknameStatus === true && <p className={styles.successTextSmall}>사용 가능한 닉네임입니다</p>}
          {nicknameStatus === false && <p className={styles.errorTextSmall}>중복된 닉네임입니다</p>}
          {error && <p className={styles.errorTextSmall}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>회원가입</button>
        </form>
      </div>
    </div>
  );
}``