import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EnrollModal from "../enroll/EnrollModal";
import styles from "./Login.module.css";
import { loginSuccess } from "../../features/authSlice";
import { api } from "../../api/authApi";
import ResetPasswordModal from "./ResetPasswordModal";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const idRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,15}$/;

    if (!email.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력하세요!");
      return;
    }

    if (!idRegex.test(email)) {
      setError("이메일을 다시 확인하여 주세요.");
      return;
    }

    if (!pwRegex.test(password)) {
      setError("비밀번호는 8~15자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      dispatch(loginSuccess(res.data));
      navigate("/home");
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;

        switch (errorCode) {
          case "WRONG_PASSWORD":
            setError(message || "비밀번호가 일치하지 않습니다.");
            break;
          case "WRONG_EMAIL":
            setError(message || "존재하지 않는 이메일입니다.");
            break;
          case "ACCOUNT_LOCKED":
            setError(message || "계정이 잠겼습니다. 관리자에게 문의하세요.");
            break;
          default:
            setError(message || "로그인 처리 중 오류가 발생했습니다.");
        }
      } else {
        setError("서버와 연결할 수 없습니다.");
      }
      setLoading(false);
    }
  };

  const handleKakaoLogin = () => {
    location.href = "http://localhost:8081/oauth2/authorization/kakao";
  };

  // ✅ return은 컴포넌트 마지막에
  return (
    <div className={styles.page}>
      <section className={styles.card}>
        <h2 className={styles.title}>로그인</h2>

        <form onSubmit={handleLogin} className={styles.form}>
          <label htmlFor="userid" className={styles.label}>
            이메일
          </label>
          <input
            id="userid"
            type="text"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="userid"
          />

          <label htmlFor="password" className={styles.label}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? "로그인 중…" : "로그인"}
          </button>

          {error && <p className={styles.error}>{error}</p>}
        </form>

        <div className={styles.dividerWrap}>
          <div className={styles.divider} />
          <span className={styles.dividerText}>또는</span>
          <div className={styles.divider} />
        </div>

        <div className={styles.socialGroup}>
          <button className={`${styles.socialBtn} ${styles.kakao}`} onClick={handleKakaoLogin}>
            카카오로 로그인
          </button>
        </div>

        <div className={styles.authLinks}>
          <button type="button" className={styles.linkBtn} onClick={() => setShowEnrollModal(true)}>
            회원가입
          </button>
          <button type="button" className={styles.linkBtn} onClick={() => setShowResetModal(true)}>
            비밀번호를 잊어버리셨나요？
          </button>
        </div>
      </section>

      {showEnrollModal && <EnrollModal onClose={() => setShowEnrollModal(false)} />}
      {showResetModal && (
        <ResetPasswordModal
          onClose={() => setShowResetModal(false)}
          onConfirm={(email) => {
            alert(`${email} 계정의 비밀번호가 변경되었습니다.`);
            setShowResetModal(false);
          }}
        />
      )}
    </div>
  );
}