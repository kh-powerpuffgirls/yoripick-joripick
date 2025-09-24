import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from '../../../store/store';
import styles from "./ChallengeMain.module.css";
import CommunityHeader from "../CommunityHeader";
import axios from "axios";
import { store } from '../../../store/store';
import ChallengeSuggestionForm from "./ChallengeSuggestionForm";

// API 기본 URL 정의
const API_BASE_URL = "http://localhost:8081";

// Redux 스토어에서 accessToken을 가져오기
const getAccessToken = () => store.getState().auth.accessToken;

// API 호출을 위한 axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 모든 요청에 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 챌린지 아이템 데이터 타입 정의
interface ChallengeItem {
  challengeNo: number;
  username: string;
  title: string;
  views: number;
  likes: number;
  serverName?: string;
  sik_bti?: string; 
}

// 현재 진행 중인 챌린지 데이터 타입 정의
interface ActiveChallenge {
  chInfoNo: number;
  title: string;
  startDate: string;
  endDate: string;
}

// 챌린지 커뮤니티 메인 페이지 컴포넌트
const ChallengeMain = () => {
  const [popularChallenges, setPopularChallenges] = useState<ChallengeItem[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeItem[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const fetchData = async () => {
    try {
      const [activeResponse, recentResponse] = await Promise.all([
        api.get<ActiveChallenge[]>("/community/challenge/active"),
        api.get<ChallengeItem[]>("/community/challenge"),
      ]);

      setActiveChallenge(activeResponse.data?.[0] || null);
      setRecentChallenges(recentResponse.data);

      const sortedPopular = [...recentResponse.data].sort((a, b) => b.likes - a.likes).slice(0, 3);
      setPopularChallenges(sortedPopular);
    } catch (error) {
      console.error("데이터를 불러오는 데 실패했습니다.", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterClick = () => {
    if (!user) {
      setErrorMessage("로그인 후 이용해주세요.");
      return;
    }
    navigate("/community/challenge/form");
  };

  const handleSuggestionClick = () => {
    if (!user) {
      setErrorMessage("로그인 후 이용해주세요.");
      return;
    }
    setIsSuggestionOpen(true);
  };

  const handleCardClick = (challengeNo: number) => {
    navigate(`/community/challenge/${challengeNo}`);
  };

  const renderChallengeCard = (challenge: ChallengeItem) => (
    <div key={challenge.challengeNo} className={styles.challengeCard} onClick={() => handleCardClick(challenge.challengeNo)}>
      <div className={styles.imagePlaceholder}>
        {challenge.serverName ? (
          <img src={`${API_BASE_URL}/images/${challenge.serverName}`} alt={challenge.title} className={styles.challengeImage} />
        ) : (
          <div className={styles.defaultImage}>이미지 없음</div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>
            {challenge.username}
            {challenge.sik_bti && ` (${challenge.sik_bti})`}
          </span>
        </div>
        <div className={styles.stats}>
          <span>👁️ {challenge.views}</span>
          <span>❤️ {challenge.likes}</span> {/* 좋아요 숫자만 표시, 클릭 기능 제거 */}
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
          <button className={styles.requestButton} onClick={handleSuggestionClick}>
            새 챌린지 요청
          </button>
          <button className={styles.registerButton} onClick={handleRegisterClick}>
            등록하기
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
