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
  // 상태 관리: 인기 챌린지, 최신 챌린지, 현재 진행 중인 챌린지, 에러 메시지
  const [popularChallenges, setPopularChallenges] = useState<ChallengeItem[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeItem[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 모달이에용
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  // 페이지 이동 훅 사용
  const navigate = useNavigate();
  // 로그인 했나여?
  const user = useSelector((state: RootState) => state.auth.user);
  
  const fetchData = async () => {
    try {
      // 진행 중인 챌린지와 전체 챌린지 데이터 요청
      const [activeResponse, recentResponse] = await Promise.all([
        api.get<ActiveChallenge[]>("/community/challenge/active"),
        api.get<ChallengeItem[]>("/community/challenge"),
      ]);

      // 진행 중인 챌린지 상태 업데이트
      const activeData = activeResponse.data?.[0] || null;
      setActiveChallenge(activeData);
      // 최신 챌린지 목록 상태 업데이트
      setRecentChallenges(recentResponse.data);

      // 최신 챌린지 목록을 좋아요(짱) 수 기준으로 정렬하여 인기 챌린지 3개를 선정
      const sortedPopular = [...recentResponse.data].sort((a, b) => b.likes - a.likes).slice(0, 3);
      setPopularChallenges(sortedPopular);
    } catch (error) {
      console.error("데이터를 불러오는 데 실패했습니다.", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // '등록하기' 버튼 클릭
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
    setIsSuggestionOpen(true); // 모달 오픈더 도어어어어어어
  };
  //상세 페이지 이동
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
      )}`
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.authorInfo}>
          <span className={styles.authorName}>{challenge.username}</span>
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
        {/* 에러 메시지가 있을 경우 표시 */}
        {errorMessage && <div className={styles.errorBox}>{errorMessage}</div>}

        <div className={styles.headerButtons}>
          <div className={styles.challengeTitle}>
            {/* 현재 진행 중인 챌린지 제목 표시 */}
            {activeChallenge?.title || "챌린지 제목 없음"}
          </div>
        </div>

        {/* 인기 챌린지 섹션 */}
        <div className={styles.section}>
          <h2>인기 챌린지 &gt;</h2>
          <div className={styles.popularCardGrid}>
            {popularChallenges.map(renderChallengeCard)}
          </div>
        </div>

        {/* 최신 챌린지 섹션 */}
        <div className={styles.section}>
          <h2>최신 챌린지 &gt;</h2>
          <div className={styles.recentCardGrid}>
            {recentChallenges.map(renderChallengeCard)}
          </div>
        </div>

        {/* 액션 버튼 섹션 */}
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