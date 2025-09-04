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

  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateNickname = () =>
    (/^[가-힣]{2,8}$/.test(nickname) || /^[a-zA-Z0-9]{4,16}$/.test(nickname));
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
  } catch (error) {
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

    if (res.ok && data.verified) {
      setEmailVerified(true);
    } else {
      setEmailVerified(false);
    }
  } catch (error) {
    alert("인증번호 확인 중 오류가 발생했습니다.");
  }
};

  const handleCheckNickname = () => {
    if (!validateNickname()) {
      alert("닉네임 형식이 올바르지 않습니다.");
      nicknameRef.current?.focus();
      return;
    }
    if (nickname.toLowerCase() === "test") {
      setNicknameStatus(false);
    } else {
      setNicknameStatus(true);
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

  if (!email) {
    alert("이메일을 입력하세요.");
    emailRef.current?.focus();
    return;
  }
  if (!emailSent) {
    alert("인증메일 전송 버튼을 눌러주세요.");
    return;
  }
  if (!emailVerified) {
    alert("이메일 인증을 완료해주세요.");
    emailCodeRef.current?.focus();
    return;
  }
  if (!nickname) {
    alert("닉네임을 입력하세요.");
    nicknameRef.current?.focus();
    return;
  }
  if (nicknameStatus !== true) {
    alert("닉네임 중복확인을 해주세요.");
    nicknameRef.current?.focus();
    return;
  }
  if (!password) {
    alert("비밀번호를 입력하세요.");
    passwordRef.current?.focus();
    return;
  }
  if (!validatePassword()) {
    alert("비밀번호는 영문, 숫자, 특수문자 포함 8~15자여야 합니다.");
    passwordRef.current?.focus();
    return;
  }
  if (!passwordCheck) {
    alert("비밀번호 확인을 입력하세요.");
    passwordCheckRef.current?.focus();
    return;
  }
  if (passwordMatch !== true) {
    alert("비밀번호가 일치하지 않습니다.");
    passwordCheckRef.current?.focus();
    return;
  }

  try {
    const res = await fetch("http://localhost:8081/auth/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nickname, password }),
    });

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      console.error("서버 에러:", data);
      alert(data.message || "회원가입 실패");
      return;
    }

    alert("회원가입 성공!");
    onClose();
  } catch (error) {
    console.error("네트워크 오류:", error);
    alert("회원가입 중 오류가 발생했습니다.");
  }
};
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>회원 정보 입력</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✖
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label>이메일 주소</label>
          <div className={styles.inputRow}>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailSent(false);
                setEmailVerified(null);
              }}
              placeholder="이메일은 중복될 수 없습니다."
              ref={emailRef}
              required
            />
            <button
              type="button"
              className={styles.subBtn}
              onClick={handleSendEmail}
            >
              인증메일 전송
            </button>
          </div>

          {showAlert && (
            <div className={styles.alertPopup}>인증메일 전송완료 !</div>
          )}

          <div className={styles.inputRow}>
            <input
              type="text"
              value={emailCode}
              onChange={(e) => {
                setEmailCode(e.target.value);
                setEmailVerified(null);
              }}
              placeholder="인증번호 입력"
              disabled={!emailSent}
              ref={emailCodeRef}
              required
            />
            <button
              type="button"
              className={styles.subBtn}
              disabled={!emailSent}
              onClick={handleVerifyCode}
            >
              인증
            </button>
          </div>
          {emailVerified === true && (
            <p className={styles.successText}>인증완료</p>
          )}
          {emailVerified === false && (
            <p className={styles.errorText}>인증번호가 다릅니다</p>
          )}

          <label>닉네임</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameStatus(null);
              }}
              placeholder="한글 2~8자, 영문/숫자 4~16자 입력"
              ref={nicknameRef}
              required
            />
            <button
              type="button"
              className={styles.subBtn}
              onClick={handleCheckNickname}
            >
              중복 확인
            </button>
          </div>
          {nicknameStatus === true && (
            <p className={styles.successTextSmall}>사용 가능한 닉네임입니다</p>
          )}
          {nicknameStatus === false && (
            <p className={styles.errorTextSmall}>중복된 닉네임입니다</p>
          )}

          <label>비밀번호</label>
          <input
            style={{width:"300px", marginBottom:"10px"}}
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="영문, 숫자, 특수문자 포함 8~15자"
            ref={passwordRef}
            required
          />
          <br/>
          {password && passwordValid === false && (
            <p className={styles.errorTextSmall}>
              비밀번호는 영문, 숫자, 특수문자 포함 8~15글자이어야 합니다.
            </p>
          )}


          <label>비밀번호 확인</label>
          <input
          style={{width:"300px", marginBottom:"10px"}}
            type="password"
            value={passwordCheck}
            onChange={(e) => onPasswordCheckChange(e.target.value)}
            placeholder="비밀번호 동일하게 입력해주세요"
            ref={passwordCheckRef}
            required
          />
          <br/>
          {passwordMatch === true && (
            <p className={styles.successTextSmall}>비밀번호가 일치합니다.</p>
          )}
          {passwordMatch === false && (
            <p className={styles.errorTextSmall}>
              비밀번호가 다릅니다. 확인해주세요.
            </p>
          )}

          <button type="submit" className={styles.submitBtn}>
            회원 가입
          </button>
        </form>
      </div>
    </div>
  );
}