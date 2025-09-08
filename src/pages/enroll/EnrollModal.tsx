import { useState, useRef } from "react";
import styles from "./EnrollModal.module.css";

interface EnrollModalProps {
  onClose: () => void;
}

export default function EnrollModal({ onClose }: EnrollModalProps) {
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState<null | boolean>(null);
  const [nicknameStatus, setNicknameStatus] = useState<null | boolean>(null);
  const [passwordMatch, setPasswordMatch] = useState<null | boolean>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [passwordValid, setPasswordValid] = useState<null | boolean>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const emailCodeRef = useRef<HTMLInputElement>(null);
  const nicknameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordCheckRef = useRef<HTMLInputElement>(null);

  // 이메일 검증
  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 바이트 계산 (초성/중성/종성 모두 2바이트)
  const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (
        (code >= 0xac00 && code <= 0xd7a3) || // 완성형 한글
        (code >= 0x1100 && code <= 0x1112) || // 초성
        (code >= 0x1161 && code <= 0x1175) || // 중성
        (code >= 0x11a8 && code <= 0x11c2)    // 종성
      ) {
        byteLength += 2;
      } else {
        byteLength += 1;
      }
    }
    return byteLength;
  };

  // 닉네임 유효성
  const validateNickname = (nickname: string) => {
    const byteLength = getByteLength(nickname);
    const pattern =/^[\u1100-\u11FF가-힣ㄱ-ㅎa-zA-Z0-9]+$/;
    return pattern.test(nickname) && byteLength >= 4 && byteLength <= 16;
  };

  // 비밀번호 유효성
  const validatePassword = (value?: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*]).{8,15}$/.test(value ?? password);

  const handleSendEmail = async () => {
    if (!validateEmail()) {
      alert("올바른 이메일 주소를 입력하세요.");
      emailRef.current?.focus();
      return;
    }
    try {
      const res = await fetch("http://localhost:8081/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("메일 전송 실패");
      setEmailSent(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch {
      alert("인증번호 전송 중 오류가 발생했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch("http://localhost:8081/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: emailCode }),
      });
      const data = await res.json();
      setEmailVerified(res.ok && data.verified ? true : false);
    } catch {
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  const handleCheckNickname = () => {
    if (!validateNickname(nickname)) {
      alert("닉네임 형식이 올바르지 않습니다.");
      nicknameRef.current?.focus();
      return;
    }
    setNicknameStatus(nickname.toLowerCase() === "test" ? false : true);
  };

  const checkPasswordMatch = (pw: string, pwCheck: string) => {
    if (pw === "" && pwCheck === "") {
      setPasswordMatch(null);
      return;
    }
    setPasswordMatch(pw === pwCheck);
  };

  const onPasswordChange = (value: string) => {
    setPassword(value);
    setPasswordValid(validatePassword(value));
    checkPasswordMatch(value, passwordCheck);
  };

  const onPasswordCheckChange = (value: string) => {
    setPasswordCheck(value);
    checkPasswordMatch(password, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("이메일을 입력하세요.");
    if (!emailSent) return alert("인증메일 전송 버튼을 눌러주세요.");
    if (!emailVerified) return alert("이메일 인증을 완료해주세요.");
    if (!nickname) return alert("닉네임을 입력하세요.");
    if (nicknameStatus !== true) return alert("닉네임 중복확인을 해주세요.");
    if (!password) return alert("비밀번호를 입력하세요.");
    if (!validatePassword()) return alert("비밀번호 형식이 올바르지 않습니다.");
    if (!passwordCheck) return alert("비밀번호 확인을 입력하세요.");
    if (passwordMatch !== true) return alert("비밀번호가 일치하지 않습니다.");

    try {
      const res = await fetch("http://localhost:8081/auth/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nickname, password }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "회원가입 실패");
      alert("회원가입 성공!");
      onClose();
    } catch {
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>회원 정보 입력</h2>
          <button className={styles.closeBtn} onClick={onClose}>✖</button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>이메일</label>
          <div className={styles.inputRow}>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setEmailSent(false); setEmailVerified(null); }} ref={emailRef} />
            <button type="button" className={styles.subBtn} onClick={handleSendEmail}>인증메일 전송</button>
          </div>

          {showAlert && <div className={styles.alertPopup}>인증메일 전송완료 !</div>}

          <div className={styles.inputRow}>
            <input type="text" value={emailCode} onChange={e => { setEmailCode(e.target.value); setEmailVerified(null); }} ref={emailCodeRef} />
            <button type="button" className={styles.subBtn} onClick={handleVerifyCode}>인증</button>
          </div>
          {emailVerified === true && <p className={styles.successText}>인증완료</p>}
          {emailVerified === false && <p className={styles.errorText}>인증번호가 다릅니다</p>}

          <label>닉네임</label>
          <div className={styles.inputRow}>
            <input type="text" value={nickname} onChange={e => { setNickname(e.target.value); setNicknameStatus(null); }} ref={nicknameRef} />
            <button type="button" className={styles.subBtn} onClick={handleCheckNickname}>중복 확인</button>
          </div>
          {nicknameStatus === true && <p className={styles.successTextSmall}>사용 가능한 닉네임입니다</p>}
          {nicknameStatus === false && <p className={styles.errorTextSmall}>중복된 닉네임입니다</p>}

          <label>비밀번호</label>
          <input type="password" value={password} onChange={e => onPasswordChange(e.target.value)} ref={passwordRef} />
          {password && passwordValid === false && <p className={styles.errorTextSmall}>비밀번호는 영문, 숫자, 특수문자 포함 8~15글자이어야 합니다.</p>}

          <label>비밀번호 확인</label>
          <input type="password" value={passwordCheck} onChange={e => onPasswordCheckChange(e.target.value)} ref={passwordCheckRef} />
          {passwordMatch === true && <p className={styles.successTextSmall}>비밀번호가 일치합니다.</p>}
          {passwordMatch === false && <p className={styles.errorTextSmall}>비밀번호가 다릅니다. 확인해주세요.</p>}

          <button type="submit" className={styles.submitBtn}>회원가입</button>
        </form>
      </div>
    </div>
  );
}