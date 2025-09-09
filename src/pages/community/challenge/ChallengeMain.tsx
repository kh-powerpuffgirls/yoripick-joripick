import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ChallengeMain.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

interface ChallengeItem {
  challengeNo: number;
  username: string;
  title: string;
  views: number;
  likes: number;
  postImageUrl?: string;
}

interface ActiveChallenge {
  chInfoNo: number;
  title: string;
  imageUrl?: string;
}

const ChallengeMain = () => {
  const [popularChallenges, setPopularChallenges] = useState<ChallengeItem[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeItem[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 10;
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/community/challenge/form');
  };

  const handleCardClick = (challengeNo: number) => {
    navigate(`/community/challenge/${challengeNo}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeResponse, recentResponse] = await Promise.all([
          axios.get<ActiveChallenge>('http://localhost:8080/community/challenge/active'),
          axios.get<ChallengeItem[]>('http://localhost:8080/community/challenge'),
        ]);

        setActiveChallenge(activeResponse.data);
        setRecentChallenges(recentResponse.data);

        const sortedPopular = [...recentResponse.data]
          .sort((a, b) => b.likes - a.likes)
          .slice(0, 3);
        setPopularChallenges(sortedPopular);
      } catch (error) {
        console.error('데이터를 불러오는 데 실패했습니다.', error);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 순위 뱃지가 포함되지 않은 일반 챌린지 카드 렌더링 함수
  const renderChallengeCard = (challenge: ChallengeItem) => (
    <div
      key={challenge.challengeNo}
      className={styles.challengeCard}
      onClick={() => handleCardClick(challenge.challengeNo)}
    >
      <div className={styles.imagePlaceholder}>
        {challenge.postImageUrl ? (
          <img
            src={`http://localhost:8080/images/${challenge.postImageUrl}`}
            alt={challenge.title}
            className={styles.challengeImage}
          />
        ) : (
          <div className={styles.defaultImage}>
            이미지 없음
          </div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.authorInfo}>
          <div className={styles.profileIcon}></div>
          <span className={styles.authorName}>{challenge.username}</span>
        </div>
        <div className={styles.stats}>
          <span>👁️ {challenge.views}</span>
          <span>❤️ {challenge.likes}</span>
        </div>
      </div>
    </div>
  );

  // 순위 뱃지가 포함된 인기 챌린지 카드 렌더링 함수
  const renderPopularChallengeCard = (challenge: ChallengeItem, index: number) => (
    <div
      key={challenge.challengeNo}
      className={styles.challengeCard}
      onClick={() => handleCardClick(challenge.challengeNo)}
    >
      <div className={styles.rankBadge}>
        {index + 1}
      </div>
      <div className={styles.imagePlaceholder}>
        {challenge.postImageUrl ? (
          <img
            src={`http://localhost:8080/images/${challenge.postImageUrl}`}
            alt={challenge.title}
            className={styles.challengeImage}
          />
        ) : (
          <div className={styles.defaultImage}>
            이미지 없음
          </div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.authorInfo}>
          <div className={styles.profileIcon}></div>
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
        <div className={styles.headerButtons}>
          <div className={styles.challengeTitle}>
            {activeChallenge?.title || '챌린지 제목 없음'}
          </div>
        </div>

        <div className={styles.section}>
          <h2>인기 챌린지 &gt;</h2>
          {/* ⭐ popular-cardGrid 클래스 적용 */}
          <div className={styles['popular-cardGrid']}>
            {popularChallenges.map(renderPopularChallengeCard)}
          </div>
        </div>

        <div className={styles.section}>
          <h2>최신 챌린지 &gt;</h2>
          {/* ⭐ recent-cardGrid 클래스 적용 */}
          <div className={styles['recent-cardGrid']}>
            {recentChallenges.map(renderChallengeCard)}
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.requestButton}>새 챌린지 요청</button>
          <button className={styles.registerButton} onClick={handleRegisterClick}>
            등록하기
          </button>
        </div>

        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >
            &gt;
          </button>
        </div>
      </div>
    </>
  );
};

export default ChallengeMain;