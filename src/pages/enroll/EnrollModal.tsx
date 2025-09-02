import { useState } from "react";
import styles from "./EnrollModal.module.css";

interface EnrollModalProps {
  onClose: () => void;
}

export default function EnrollModal({ onClose }: EnrollModalProps) {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");

  // 유효성 검사 함수
  const validateId = () => /^[a-zA-Z0-9]{6,12}$/.test(id);
  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateNickname = () =>
    (/^[가-힣]{2,8}$/.test(nickname) || /^[a-zA-Z0-9]{4,16}$/.test(nickname));
  const validatePassword = () =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/.test(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateId()) return alert("아이디는 영문/숫자 조합 6~12자여야 합니다.");
    if (!validateEmail()) return alert("올바른 이메일 주소를 입력하세요.");
    if (!validateNickname())
      return alert("닉네임은 한글 2~8자 또는 영문/숫자 4~16자여야 합니다.");
    if (!validatePassword())
      return alert("비밀번호는 영문+숫자+특수문자 포함 8~15자여야 합니다.");
    if (password !== passwordCheck)
      return alert("비밀번호가 일치하지 않습니다.");

    alert("회원가입 성공!");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>회원 정보 입력</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>아이디</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="영문, 숫자 혼합하여 6~12자로 입력해주세요"
            />
            <button type="button" className={styles.subBtn}>중복 확인</button>
          </div>

          {/* 이메일 */}
          <label>이메일 주소</label>
          <div className={styles.inputRow}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일은 중복될 수 없습니다."
            />
            <button type="button" className={styles.subBtn}>인증메일 전송</button>
          </div>

          <div className={styles.inputRow}>
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="인증번호 입력"
            />
            <button type="button" className={styles.subBtn}>인증</button>
          </div>

          <label>닉네임</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="한글 2~8자, 영문/숫자 4~16자 입력"
            />
            <button type="button" className={styles.subBtn}>중복 확인</button>
          </div>

          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="영문, 숫자, 특수문자 포함 8~15자"
          />

          <label>비밀번호 확인</label>
          <input
            type="password"
            value={passwordCheck}
            onChange={(e) => setPasswordCheck(e.target.value)}
            placeholder="비밀번호 동일하게 입력해주세요"
          />

          <button type="submit" className={styles.submitBtn}>
            회원 가입
          </button>
        </form>
      </div>
    </div>
  );
}