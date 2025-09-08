import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EnrollModal from "../enroll/EnrollModal";
import styles from "./Login.module.css";
import { loginSuccess } from "../../features/authSlice";
import { api } from "../../api/authApi";
// import type { RootState } from "../../store/store";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  // const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     alert("이미 로그인된 사용자입니다.");
  //     navigate(-1);
  //   }
  // }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const idRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,15}$/

    if (!email.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 모두 입력하세요!");
      return;
    }

    if (!idRegex.test(email)) {
      setError("아이디는 6~12자의 영문과 숫자를 혼합하여 입력해야 합니다.");
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
      const error = err as AxiosError;
      if (error.response?.status === 401) {
        setError("비밀번호가 잘못되었습니다.");
        setLoading(false);
      } else if (error.response?.status === 404) {
        setError("등록된 계정이 없습니다. 회원가입 후 이용해주세요.");
        setLoading(false);
      } else {
        setError("로그인 처리 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }
  };

  const handleKakaoLogin = () => {
    location.href = "http://localhost:8081/oauth2/authorization/kakao";
  };

  const handleNaverLogin = () => {
    alert("네이버 로그인 구현 필요");
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
          <button className={`${styles.socialBtn} ${styles.naver}`} onClick={handleNaverLogin}>
            네이버로 로그인
          </button>
        </div>

        <div className={styles.authLinks}>
          <button type="button" className={styles.linkBtn} onClick={() => setShowEnrollModal(true)}>
            회원가입
          </button>
          <button type="button" className={styles.linkBtn} onClick={() => navigate("/find-account")}>
            비밀번호 찾기
          </button>
        </div>
      </section>

      {showEnrollModal && <EnrollModal onClose={() => setShowEnrollModal(false)} />}
    </div>
  );
}