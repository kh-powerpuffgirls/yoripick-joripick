import { useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import styles from "./EnrollModal.module.css";
import errorMessages from "../../components/ErrorMessages";

interface EnrollModalProps {
  onClose: () => void;
}

export default function EnrollModal({ onClose }: EnrollModalProps) {
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [emailVerified, setEmailVerified] = useState<null | boolean>(null);
  const [usernameStatus, setUsernameStatus] = useState<null | boolean>(null);
  const [passwordMatch, setPasswordMatch] = useState<null | boolean>(null);
  const [passwordValid, setPasswordValid] = useState<null | boolean>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const emailCodeRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordCheckRef = useRef<HTMLInputElement>(null);

  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 한글/영문/숫자 → 바이트 계산
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

  const validateUsername = (username: string) => {
    const byteLength = getByteLength(username);
    const pattern = /^[\u1100-\u11FF가-힣ㄱ-ㅎa-zA-Z0-9]+$/;
    return pattern.test(username) && byteLength >= 4 && byteLength <= 16;
  };

  const validatePassword = (value?: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[~!@#$%^&*]).{8,15}$/.test(value ?? password);

  const handleSendEmail = async () => {
    if (!validateEmail()) {
      alert(errorMessages.INVALID_EMAIL);
      emailRef.current?.focus();
      return;
    }
    try {
      await axios.post("https://api.ypjp.store:8443/auth/email-codes", { email });
      setEmailSent(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;
        alert(errorMessages[errorCode] || message || "인증번호 전송 중 오류가 발생했습니다.");
      } else {
        alert("네트워크 오류가 발생했습니다.");
      }
    }
  };
  
  const handleVerifyCode = async () => {
    try {
      const res = await axios.post("https://api.ypjp.store:8443/auth/email-codes/verify", {
        email,
        code: emailCode,
      });
      setEmailVerified(res.data.verified === true);
    } catch {
      alert("인증번호 확인 중 오류가 발생했습니다.");
    }
  };

  const handleCheckUsername = async () => {
    if (!validateUsername(username)) {
      alert(errorMessages.INVALID_USERNAME);
      usernameRef.current?.focus();
      return;
    }
    try {
      const res = await axios.get("https://api.ypjp.store:8443/auth/users/check", {
        params: { username },
      });
      setUsernameStatus(res.data.available);
    } catch (err) {
      alert("닉네임 중복 확인 중 오류가 발생했습니다.");
    }
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
    if (!email) return alert(errorMessages.INVALID_EMAIL);
    if (!emailSent) return alert("인증메일 전송 버튼을 눌러주세요.");
    if (!emailVerified) return alert("이메일 인증을 완료해주세요.");
    if (!username) return alert(errorMessages.INVALID_USERNAME);
    if (usernameStatus !== true) return alert("사용자 이름 중복확인을 해주세요.");
    if (!password) return alert(errorMessages.INVALID_PASSWORD);
    if (!validatePassword()) return alert(errorMessages.INVALID_PASSWORD);
    if (!passwordCheck) return alert("비밀번호 확인을 입력하세요.");
    if (passwordMatch !== true) return alert("비밀번호가 일치하지 않습니다.");

    try {
      const res = await axios.post("https://api.ypjp.store:8443/auth/users", {
        email,
        username,
        password,
      });

      if (res.status !== 201) {
        return alert(res.data.message || "회원가입 실패");
      }

      alert("회원가입 성공!");
      onClose();
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;
        alert(errorMessages[errorCode] || message || "회원가입 중 오류가 발생했습니다.");
      } else {
        alert("네트워크 오류가 발생했습니다.");
      }
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
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailSent(false); setEmailVerified(null); }}
              ref={emailRef}
              placeholder="이메일은 중복될 수 없습니다."
            />
            <button type="button" className={styles.subBtn} onClick={handleSendEmail}>인증메일 전송</button>
          </div>

          {showAlert && <div className={styles.alertPopup}>인증메일 전송완료 !</div>}

          <div className={styles.inputRow}>
            <input
              type="text"
              value={emailCode}
              onChange={e => { setEmailCode(e.target.value); setEmailVerified(null); }}
              ref={emailCodeRef}
              placeholder="인증번호 입력"
            />
            <button type="button" className={styles.subBtn} onClick={handleVerifyCode}>인증</button>
          </div>
          {emailVerified === true && <p className={styles.successText}>인증완료</p>}
          {emailVerified === false && <p className={styles.errorText}>인증번호가 다릅니다</p>}

          <label>사용자 이름</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setUsernameStatus(null); }}
              ref={usernameRef}
              placeholder="한글·영문·숫자 4~16byte"
            />
            <button type="button" className={styles.subBtn} onClick={handleCheckUsername}>중복 확인</button>
          </div>
          {usernameStatus === true && <p className={styles.successTextSmall}>사용 가능한 사용자 이름입니다</p>}
          {usernameStatus === false && <p className={styles.errorTextSmall}>중복된 사용자 이름입니다</p>}

          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            ref={passwordRef}
            placeholder="영문,숫자,특수문자 포함 8~15자"
            style={{ width: "230px" }}
          />
          {password && passwordValid === false && (
            <p className={styles.errorTextSmall}>
              <br />
              비밀번호는 영문, 숫자, 특수문자 포함 8~15글자이어야 합니다.
            </p>
          )}

          <label>비밀번호 확인</label>
          <input
            type="password"
            value={passwordCheck}
            onChange={e => onPasswordCheckChange(e.target.value)}
            ref={passwordCheckRef}
            placeholder="비밀번호 동일하게 입력해주세요."
            style={{ width: "230px" }}
          />
          {passwordMatch === true && (
            <p className={styles.successTextSmall}>
              <br />
              비밀번호가 일치합니다.
            </p>
          )}
          {passwordMatch === false && (
            <p className={styles.errorTextSmall}>
              <br />
              비밀번호가 다릅니다. 확인해주세요.
            </p>
          )}
          <button type="submit" className={styles.submitBtn}>회원가입</button>
        </form>
      </div>
    </div>
  );
}