import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import styles from "./ResetPasswordModal.module.css";
import errorMessages from "../../components/ErrorMessages";

interface ResetPasswordModalProps {
  onClose: () => void;
  onConfirm: (email: string) => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  onClose,
  onConfirm,
}) => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState({
    sending: false,
    verifying: false,
    changing: false,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let interval: number;
    if (timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const validatePassword = (password: string) => {
    return /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,15}$/.test(password);
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      alert(errorMessages.INVALID_EMAIL);
      return;
    }

    setLoading((prev) => ({ ...prev, sending: true }));
    try {
      await axios.post("https://api.ypjp.store/auth/email-codes/reset", { email });
      alert("인증메일이 발송되었습니다.");
      setTimer(5 * 60);
      setIsVerified(false);
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;
        alert(errorMessages[errorCode] || message || "이메일 전송 중 오류가 발생했습니다.");
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    } finally {
      setLoading((prev) => ({ ...prev, sending: false }));
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      alert("인증번호를 입력해주세요.");
      return;
    }
    if (timer <= 0) {
      alert("인증번호가 만료되었습니다.");
      return;
    }

    setLoading((prev) => ({ ...prev, verifying: true }));
    try {
      const res = await axios.post("https://api.ypjp.store/auth/email-codes/verify", {
        email,
        code: verificationCode,
      });

      if (res.data.verified) {
        alert("인증 성공!");
        setIsVerified(true);
        setTimer(0);
      } else {
        alert("인증번호가 올바르지 않습니다.");
      }
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;
        alert(errorMessages[errorCode] || message || "인증 처리 중 오류가 발생했습니다.");
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    } finally {
      setLoading((prev) => ({ ...prev, verifying: false }));
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      alert("비밀번호를 모두 입력해주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!validatePassword(newPassword)) {
      alert(errorMessages.INVALID_PASSWORD);
      return;
    }

    setLoading((prev) => ({ ...prev, changing: true }));
    try {
      await axios.post("https://api.ypjp.store/auth/reset-password", {
        email,
        password: newPassword,
      });

      alert("비밀번호가 변경되었습니다.");
      onConfirm(email);
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;
        alert(errorMessages[errorCode] || message || "비밀번호 변경 중 오류가 발생했습니다.");
      } else {
        alert("서버와 연결할 수 없습니다.");
      }
    } finally {
      setLoading((prev) => ({ ...prev, changing: false }));
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.resetModal}>
        <h2>비밀번호 찾기</h2>

        <div className={styles.resetModal__group}>
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading.sending || isVerified}
          />
          <button onClick={handleSendEmail} disabled={loading.sending || isVerified}>
            {loading.sending ? "전송 중..." : "인증메일 전송"}
          </button>
        </div>

        <div className={styles.resetModal__group}>
          <input
            type="text"
            placeholder="인증번호 입력 ( 5분이내에 입력해주세요. )"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            disabled={isVerified}
          />
          {isVerified ? (
            <span className={styles.verifiedText}>인증완료</span>
          ) : (
            <span className={styles.resetModal__timer}>{formatTimer(timer)}</span>
          )}
          <button
            onClick={handleVerify}
            disabled={loading.verifying || isVerified || timer <= 0}
          >
            {loading.verifying ? "확인 중..." : "인증"}
          </button>
        </div>

        {isVerified && (
          <>
            <div className={styles.resetModal__group}>
              <label>새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading.changing}
              />
            </div>

            <div className={styles.resetModal__group}>
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading.changing}
              />
            </div>

            {confirmPassword.length > 0 && (
              <div
                className={
                  newPassword === confirmPassword
                    ? styles.passwordMatch
                    : styles.passwordMismatch
                }
              >
                {newPassword === confirmPassword
                  ? "비밀번호가 일치합니다."
                  : "비밀번호가 다릅니다. 확인해주세요."}
              </div>
            )}

            <div className={styles.buttonContainer}>
              <button
                onClick={handleChangePassword}
                disabled={loading.changing}
                className={styles.confirmButton}
              >
                {loading.changing ? "변경 중..." : "비밀번호 변경"}
              </button>
            </div>
          </>
        )}

        <button onClick={onClose} className={styles.resetModal__closeBtn}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;