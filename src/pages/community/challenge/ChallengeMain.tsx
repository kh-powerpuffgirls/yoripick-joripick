import { useState, useEffect } from 'react';
import styles from './ChallengeMain.module.css';
import { useNavigate } from 'react-router-dom';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

// 챌린지 데이터 타입 정의
interface ChallengeItem {
  challengeNo: number;
  username: string;
  title: string;
  views: number;
  likes: number;
  imageUrl: string;
}

const ChallengeMain = () => {
  const [popularChallenges, setPopularChallenges] = useState<ChallengeItem[]>([]);
  const [recentChallenges, setRecentChallenges] = useState<ChallengeItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 10;
  const navigate = useNavigate();

  // 페이지 이동 함수
  const handleRegisterClick = () => {
    navigate('/community/challenge/form');
  };

  const handleCardClick = (challengeNo: number) => {
    navigate(`/community/challenge/${challengeNo}`);
  };

  useEffect(() => {
    // 백엔드 API를 호출하는 비동기 함수
    const fetchChallenges = async () => {
      try {
        // 백엔드 API의 '최신 챌린지' 엔드포인트 호출
        const recentResponse = await axios.get<ChallengeItem[]>('http://localhost:8080/community/challenge');
        setRecentChallenges(recentResponse.data);

        // 현재 백엔드에 인기순 정렬 기능이 없으므로, 좋아요 수로 정렬하는 로직을 프론트에서 임시로 구현합니다.
        const sortedPopular = [...recentResponse.data].sort((a, b) => b.likes - a.likes).slice(0, 3);
        setPopularChallenges(sortedPopular);

      } catch (error) {
        console.error("챌린지 데이터를 불러오는 데 실패했습니다.", error);
      }
    };

    fetchChallenges();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderChallengeCard = (challenge: ChallengeItem) => (
    <div key={challenge.challengeNo} className={styles.challengeCard} onClick={() => handleCardClick(challenge.challengeNo)}>
      {/* 인기 챌린지에는 순위 표시 */}
      {popularChallenges.includes(challenge) && (
        <div className={styles.rankBadge}>{popularChallenges.findIndex(p => p.challengeNo === challenge.challengeNo) + 1}</div>
      )}
      <div className={styles.imagePlaceholder}>
        <img src={`http://localhost:8080/images/${challenge.imageUrl}`} alt={challenge.title} className={styles.challengeImage} />
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
        {/* 타이틀 및 등록 버튼 */}
        <div className={styles.headerButtons}>
          <div className={styles.challengeTitle}>
            마라탕에 탕후루 넣어먹기 챌린지 !!!
          </div>
        </div>

        {/* 인기 챌린지 섹션 */}
        <div className={styles.section}>
          <h2>인기 챌린지 &gt;</h2>
          <div className={styles.cardGrid}>
            {popularChallenges.map(renderChallengeCard)}
          </div>
        </div>

        {/* 최신 챌린지 섹션 */}
        <div className={styles.section}>
          <h2>최신 챌린지 &gt;</h2>
          <div className={styles.cardGrid}>
            {recentChallenges.map(renderChallengeCard)}
          </div>
        </div>

        {/* 새 챌린지 요청 및 등록 버튼 */}
        <div className={styles.actionButtons}>
          <button className={styles.requestButton}>새 챌린지 요청</button>
          <button
            className={styles.registerButton}
            onClick={handleRegisterClick}
          >
            등록하기
          </button>
        </div>

        {/* 페이지네이션 */}
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
          >&gt;</button>
        </div>
      </div>
    </>
  );
};

export default ChallengeMain;