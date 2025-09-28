import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import styles from "./ChallengeMain.module.css";
import CommunityHeader from "../Header/CommunityHeader";
import axios from "axios";
import { store } from "../../../store/store";
import ChallengeSuggestionForm from "./ChallengeSuggestionForm";
import SikBti from "../Recipe/SikBti";

const API_BASE = "http://localhost:8081";
const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

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
  profileImageServerName?: string;
  createdAt: string;
}

interface ActiveChallenge {
  chInfoNo: number;
  title: string;
  startDate: string;
  endDate: string;
}

const formatDateToShort = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
};

const ChallengeMain = () => {
  const [popularChallenges, setPopularChallenges] = useState<ChallengeItem[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeItem[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [recentCurrentPage, setRecentCurrentPage] = useState(1);

  const recentPerPage = 8;
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const isClosed = activeChallenge
    ? new Date().setHours(0, 0, 0, 0) > new Date(activeChallenge.endDate).setHours(0, 0, 0, 0)
    : true;

  const fetchData = async () => {
    try {
      const [activeResp, recentResp] = await Promise.all([
        api.get<ActiveChallenge[]>("/community/challenge/active"),
        api.get<ChallengeItem[]>("/community/challenge"),
      ]);
      setActiveChallenge(activeResp.data?.[0] || null);
      setRecentChallenges(recentResp.data);
      const sortedPopular = [...recentResp.data].sort((a, b) => b.likes - a.likes).slice(0, 3);
      setPopularChallenges(sortedPopular);
    } catch (err) {
      console.error("데이터 로드 실패", err);
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
    if (isClosed) {
      setErrorMessage("현재 챌린지 등록 기간이 마감되었습니다.");
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

  const recentToDisplay = useMemo(
    () =>
      recentChallenges.slice(
        (recentCurrentPage - 1) * recentPerPage,
        recentCurrentPage * recentPerPage
      ),
    [recentChallenges, recentCurrentPage]
  );

  const totalPages = Math.ceil(recentChallenges.length / recentPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setRecentCurrentPage(page);
  };

  const renderCard = (challenge: ChallengeItem, rank?: number) => (
    <div
      key={challenge.challengeNo}
      className={styles.postCard}
      onClick={() => handleCardClick(challenge.challengeNo)}
    >
      {rank !== undefined && rank < 3 && (
        <div className={`${styles.crownIcon} ${styles[`rank${rank + 1}`]}`}>
          {rank === 0 && <span role="img" aria-label="1st place crown">👑</span>}
          {rank === 1 && <span role="img" aria-label="2nd place crown">👑</span>}
          {rank === 2 && <span role="img" aria-label="3rd place crown">👑</span>}
        </div>
      )}
      <div className={styles.imagePlaceholder}>
        {challenge.serverName ? (
          <img
            src={`${API_BASE}/images/${challenge.serverName}`}
            alt={challenge.title}
            className={styles.postImage}
          />
        ) : (
          <div className={styles.defaultImage}>이미지 없음</div>
        )}
      </div>
      <div className={styles.postInfo}>
        <h3 className={styles.postTitle}>{challenge.title}</h3>
        <div className={styles.authorContainer}>
          <div className={styles.profileRow}>
            {challenge.profileImageServerName ? (
              <img
                src={`${API_BASE}${challenge.profileImageServerName}`}
                alt={challenge.username}
                className={styles.profileIcon}
              />
            ) : (
              <div className={styles.defaultProfile}></div>
            )}
            <div className={styles.profileText}>
              {challenge.sik_bti && (
                <SikBti
                  sikBti={challenge.sik_bti}
                  style={{ marginRight: "6px", display: "inline", fontSize: "0.7rem" }}
                />
              )}
              <span className={styles.authorNickname}>{challenge.username}</span>
            </div>
          </div>
          <div className={styles.dateTimeViews}>
            <span className={styles.postDate}>{formatDateToShort(challenge.createdAt)}</span>
            <span className={styles.postViews}>
              👁️ {challenge.views} ❤️ {challenge.likes}
            </span>
          </div>
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
            {activeChallenge?.title || "현재 진행 중인 챌린지 없음"}
          </div>
        </div>

        <div className={styles.section}>
          <h2>인기 챌린지 &gt;</h2>
          <div className={styles.popularPostGrid}>
            {popularChallenges.map((challenge, i) => renderCard(challenge, i))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>최신 챌린지 &gt;</h2>
          <div className={styles.recentPostGrid}>
              {recentToDisplay.length > 0
                  ? recentToDisplay.map((challenge) => renderCard(challenge))
                  : <p className={styles.noPosts}>등록된 챌린지가 없습니다.</p>
              }
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(recentCurrentPage - 1)}
                disabled={recentCurrentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={i + 1 === recentCurrentPage ? styles.active : ""}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(recentCurrentPage + 1)}
                disabled={recentCurrentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button
            className={styles.requestButton}
            onClick={handleSuggestionClick}
            disabled={!user}
            title={!user ? "로그인 후 이용해주세요." : ""}
          >
            새 챌린지 요청
          </button>
          <button
            className={`${styles.registerButton} ${isClosed ? styles.disabledButton : ""}`}
            onClick={handleRegisterClick}
            disabled={isClosed || !user}
            title={isClosed ? "현재 챌린지 등록 기간이 마감되었습니다." : ""}
          >
            {isClosed ? "등록 마감" : "등록 하기"}
          </button>
        </div>
      </div>
      {isSuggestionOpen && <ChallengeSuggestionForm onClose={() => setIsSuggestionOpen(false)} />}
    </>
  );
};

export default ChallengeMain;