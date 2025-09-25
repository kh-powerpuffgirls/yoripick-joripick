import type { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EnrollModal from "../enroll/EnrollModal";
import styles from "./Login.module.css";
import { saveUserData } from "../../features/authSlice";
import { api } from "../../api/authApi";
import ResetPasswordModal from "./ResetPasswordModal";
import errorMessages from "../../components/ErrorMessages";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const location = useLocation();

  const validateForm = () => {
    const idRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,15}$/;

    if (!email.trim() || !password.trim()) {
      return "아이디와 비밀번호를 모두 입력하세요!";
    }
    if (!idRegex.test(email)) {
      return errorMessages.INVALID_EMAIL;
    }
    if (!pwRegex.test(password)) {
      return errorMessages.INVALID_PASSWORD;
    }
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const from = (location.state as { from?: Location })?.from?.pathname || "/home";

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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

      dispatch(saveUserData(res.data));
      navigate(from, { replace: true });
    } catch (err) {
      const error = err as AxiosError<{ errorCode: string; message?: string }>;
      if (error.response) {
        const { errorCode, message } = error.response.data;

        if (errorCode === "INACTIVE_USER") {
          alert(errorMessages[errorCode]);
          return;
        }
        setError(errorMessages[errorCode]|| "로그인 처리 중 오류가 발생했습니다.");
      } else {
        setError("서버와 연결할 수 없습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

    const handleKakaoLogin = () => {
      window.location.href = "http://localhost:8081/oauth2/authorization/kakao";
    };

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
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
            <button
              type="button"
              className={`${styles.socialBtn} ${styles.kakao}`}
              onClick={handleKakaoLogin}
            >
              카카오로 로그인
            </button>
          </div>

          <div className={styles.authLinks}>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setShowEnrollModal(true)}
            >
              회원가입
            </button>
            <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setShowResetModal(true)}
            >
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