import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import styles from "./ChallengeMain.module.css";
import CommunityHeader from "../Header/CommunityHeader";
import axios from "axios";
import { store } from "../../../store/store";
import ChallengeSuggestionForm from "./ChallengeSuggestionForm";

const API_BASE_URL = "http://localhost:8081";

// 액세스 토큰 가져오기
const getAccessToken = () => store.getState().auth.accessToken;

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

interface ChallengeItem {
  challengeNo: number;
  username: string;
  title: string;
  views: number;
  likes: number;
  serverName?: string;
  sik_bti?: string;
  profileImageServerName?: string; // 프로필 이미지 경로
}

interface ActiveChallenge {
  chInfoNo: number;
  title: string;
  startDate: string;
  endDate: string;
}

const ChallengeMain = () => {
  const [popularChallenges, setPopularChallenges] = useState<ChallengeItem[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeItem[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // 챌린지 등록 마감 여부 확인
  const isChallengeRegistrationClosed = (challenge: ActiveChallenge | null): boolean => {
    if (!challenge) return true;
    const endDate = new Date(challenge.endDate);
    const today = new Date();
    endDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return today > endDate;
  };

  const isClosed = isChallengeRegistrationClosed(activeChallenge);

  // 데이터 fetch
  const fetchData = async () => {
    try {
      const [activeResponse, recentResponse] = await Promise.all([
        api.get<ActiveChallenge[]>("/community/challenge/active"),
        api.get<ChallengeItem[]>("/community/challenge"),
      ]);
      setActiveChallenge(activeResponse.data?.[0] || null);
      setRecentChallenges(recentResponse.data);
      const sortedPopular = [...recentResponse.data]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 3);
      setPopularChallenges(sortedPopular);
    } catch (error) {
      console.error("데이터를 불러오는 데 실패했습니다.", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 등록 버튼 클릭
  const handleRegisterClick = () => {
    if (!user) {
      setErrorMessage("로그인 후 이용해주세요.");
      return;
    }
    if (isClosed) {
      setErrorMessage(
        "현재 챌린지 등록 기간이 마감되었습니다. 새로운 챌린지를 기대해주세요!"
      );
      return;
    }
    navigate("/community/challenge/form");
  };

  // 새 챌린지 요청 버튼 클릭
  const handleSuggestionClick = () => {
    if (!user) {
      setErrorMessage("로그인 후 이용해주세요.");
      return;
    }
    setIsSuggestionOpen(true);
  };

  // 챌린지 카드 클릭
  const handleCardClick = (challengeNo: number) => {
    navigate(`/community/challenge/${challengeNo}`);
  };

  // 챌린지 카드 렌더링
  const renderChallengeCard = (challenge: ChallengeItem) => (
    <div
      key={challenge.challengeNo}
      className={styles.challengeCard}
      onClick={() => handleCardClick(challenge.challengeNo)}
    >
      <div className={styles.imagePlaceholder}>
        {challenge.serverName ? (
          <img
            src={`${API_BASE_URL}/images/${challenge.serverName}`}
            alt={challenge.title}
            className={styles.challengeImage}
          />
        ) : (
          <div className={styles.defaultImage}>이미지 없음</div>
        )}
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.authorInfo}>
          {challenge.profileImageServerName ? (
            <img
              src={`${API_BASE_URL}${challenge.profileImageServerName}`}
              alt={`${challenge.username} 프로필`}
              className={styles.profileImage}
            />
          ) : (
            <div className={styles.defaultProfile}></div>
          )}
          <span className={styles.authorName}>
            {challenge.username}
            {challenge.sik_bti && ` (${challenge.sik_bti})`}
          </span>
        </div>

        <div className={styles.stats}>
          <span>👁️ {challenge.views}</span>
          <span>❤️ {challenge.likes}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CommunityHeader />

      <div className={styles.container}>
        {errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}

        <div className={styles.headerButtons}>
          <div className={styles.challengeTitle}>
            {activeChallenge?.title || "챌린지 제목 없음"}
          </div>
        </div>

        <div className={styles.section}>
          <h2>인기 챌린지 &gt;</h2>
          <div className={styles.popularCardGrid}>
            {popularChallenges.map(renderChallengeCard)}
          </div>
        </div>

        <div className={styles.section}>
          <h2>최신 챌린지 &gt;</h2>
          <div className={styles.recentCardGrid}>
            {recentChallenges.map(renderChallengeCard)}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={styles.requestButton}
            onClick={handleSuggestionClick}
          >
            새 챌린지 요청
          </button>

          <button
            className={styles.registerButton}
            onClick={handleRegisterClick}
            disabled={isClosed}
            style={{
              backgroundColor: isClosed ? "#ccc" : "",
              cursor: isClosed ? "not-allowed" : "pointer",
            }}
          >
            {isClosed ? "등록 마감" : "등록하기"}
          </button>
        </div>
      </div>

      {isSuggestionOpen && (
        <ChallengeSuggestionForm onClose={() => setIsSuggestionOpen(false)} />
      )}
    </>
  );
};

export default ChallengeMain;
