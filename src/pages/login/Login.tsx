import type { AxiosError } from "axios";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch } from "react-redux";
import EnRollModal from "../enroll/EnrollModal";

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    const dispatch = useDispatch();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const idRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,12}$/;
        const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,15}$/;

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

        api
            .post("/auth/login", { email, password })
            .then(res => {
                console.log(res);
                dispatch(loginSucess(res.data));
                navigate("/home", { state: { flash: "로그인 성공" } });
            })
            .catch((err: AxiosError) => {
                if (err.response?.status === 404) {
                    const doSingUp = confirm("등록된 계정이 없습니다. 현재 입력한 이메일/비밀번호로 회원가입 할까요?");

                    if (!doSingUp) {
                        setError("계정을 다시 확인해주세요");
                        setLoading(false);
                        return;
                    }

                    api.post("/auth/signup", { email, password })
                        .then(res => {
                            console.log(res);
                            dispatch(loginSucess(res.data));
                            navigate("/home", { state: { flash: "로그인 성공" } });
                        })
                        .catch(() => {
                            setError("회원가입에 실패했습니다. 나중에 다시 실행해 주세요");
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                } else if (err.response?.status === 401) {
                    setError("비밀번호가 잘못되었습니다.");
                } else {
                    setError("로그인 처리 중 오류가 발생했습니다.");
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleKakaoLogin = () => {
        location.href = "http://localhost:8081/api/oauth2/authorization/kakao";
    };

    const handleNaverLogin = () => {
    };

    return (
        <div className={styles.page}>
            <section className={styles.card}>
                <h2 className={styles.title}>로그인</h2>

                <form onSubmit={handleLogin} className={styles.form}>
                    <label htmlFor="userid" className={styles.label}>
                        아이디
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
                    <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => setShowEnrollModal(true)}
                    >
                        회원가입
                    </button>
                    <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => navigate("/find-account")}
                    >
                        아이디/비밀번호 찾기
                    </button>
                </div>
            </section>

            {showEnrollModal && <EnRollModal onClose={() => setShowEnrollModal(false)} />}
        </div>
    );
}