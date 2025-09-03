// ChallengeMain.tsx
import { useState, useEffect } from 'react';
import styles from './ChallengeMain.module.css';
import { useNavigate } from 'react-router-dom';
import CommunityHeader from '../CommunityHeader';

// 챌린지 데이터 타입 정의
interface ChallengeItem {
  id: number;
  rank?: number;
  title: string;
  author: string;
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

  useEffect(() => {

    const mockPopularData: ChallengeItem[] = [
      { id: 1, rank: 1, title: '마라탕에 탕후루 넣어먹기 챌린지 !!!', author: '망곰eee', views: 40, likes: 120, imageUrl: 'https://placehold.co/80x80/ffe6b7/000000?text=Image+1'},
      { id: 2, rank: 2, title: '... 챌린지 2', author: 'goofy', views: 40, likes: 110, imageUrl: '...'},
      { id: 3, rank: 3, title: '... 챌린지 3', author: 'goofy', views: 40, likes: 100, imageUrl: '...'},
    ];
    const mockRecentData: ChallengeItem[] = [
      { id: 4, title: '최신 챌린지 1', author: 'goofy', views: 40, likes: 90, imageUrl: '...'},
      { id: 5, title: '최신 챌린지 2', author: 'goofy', views: 40, likes: 80, imageUrl: '...'},
      { id: 6, title: '최신 챌린지 3', author: 'goofy', views: 40, likes: 70, imageUrl: 'https://placehold.co/80x80/ffe6b7/000000?text=Image+1'},
      { id: 7, title: '최신 챌린지 4', author: 'goofy', views: 40, likes: 60, imageUrl: '...'},
    ];

    setPopularChallenges(mockPopularData);
    setRecentChallenges(mockRecentData);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderChallengeCard = (challenge: ChallengeItem) => (
    <div key={challenge.id} className={styles.challengeCard}>
      {challenge.rank && <div className={styles.rankBadge}>{challenge.rank}</div>}
      <div className={styles.imagePlaceholder}>이미지</div>
      <div className={styles.cardInfo}>
        <div className={styles.authorInfo}>
          <div className={styles.profileIcon}></div>
          <span className={styles.authorName}>{challenge.author}</span>
        </div>
        <div className={styles.stats}>
          <span>👁️ {challenge.views}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
    <CommunityHeader/>
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
                    onClick={handleRegisterClick} // onClick 이벤트 핸들러를 추가합니다.
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