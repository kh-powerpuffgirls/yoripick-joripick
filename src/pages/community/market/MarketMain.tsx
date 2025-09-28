import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import styles from './MarketMain.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import CommunityModal from '../CommunityModal';
import axios from 'axios';
import SikBti from '../Recipe/SikBti';

interface MarketMain {
  productId: number;
  title: string;
  author: string;
  authorNo: number;
  authorProfileUrl: string;
  imageUrl: string;
  views: number;
  likes: number;
  createdAt: string;
  sikBti: string;
}

const API_BASE = 'http://localhost:8081';

const MarketMain = () => {
  const navigate = useNavigate();
  const [popularPosts, setPopularPosts] = useState<MarketMain[]>([]);
  const [recentPosts, setRecentPosts] = useState<MarketMain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const postsPerPage = 8;
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const popularResponse = await axios.get(`${API_BASE}/community/market/popular`);
        setPopularPosts(popularResponse.data);

        const recentResponse = await axios.get(`${API_BASE}/community/market/recent`);
        setRecentPosts(recentResponse.data);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch market posts:', err);
        setError('게시글을 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleRegisterClick = () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    navigate('/community/market/form');
  };

  const handleMyListClick = () => {
    if (!user) {
      setShowModal(true);
      return;
    }
    navigate('/community/market/my-list');
  };

  const handlePageChange = (page: number) => {
    const totalPages = Math.ceil(recentPosts.length / postsPerPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const topPopularPosts = popularPosts.slice(0, 3);
  const sortedRecentPosts = [...recentPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const paginatedRecentPosts = sortedRecentPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );
  const totalPages = Math.ceil(sortedRecentPosts.length / postsPerPage);

  const formatDateToShort = (isoString: string) => {
    const date = new Date(isoString);
    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const renderPostCard = (post: MarketMain & { createdAt: string }) => (
  <div
    key={post.productId}
    className={styles.postCard}
    onClick={() => navigate(`/community/market/buyForm/${post.productId}`)}
  >
    <img
      src={`${API_BASE}${post.imageUrl}`}
      alt={post.title}
      className={styles.postImage}
    />

    <div className={styles.postInfo}>
      <h3 className={styles.postTitle}>{post.title}</h3>

      <div className={styles.authorContainer}>
        <div className={styles.profileRow}>
          <img
            src={`${API_BASE}${post.authorProfileUrl}`}
            alt={`${post.author}의 프로필`}
            className={styles.profileIcon}
          />
          <div className={styles.profileText}>
          {post.sikBti && (
            <SikBti
              sikBti={post.sikBti} 
              style={{ marginRight: '6px', marginBottom: '1px', display: 'inline', fontSize: '0.7rem' }} 
            />
          )}            
          <span className={styles.authorNickname}>{post.author}</span>
          </div>
        </div>

        <div className={styles.dateTimeViews}>
          <span className={styles.postDate}>{formatDateToShort(post.createdAt)}</span>
          <span className={styles.postViews}>👁️ {post.views}</span>
        </div>
      </div>
    </div>
  </div>
);

  if (isLoading) {
    return <div className={styles.loading}>게시글을 불러오는 중입니다...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <CommunityHeader />

      {showModal && (
        <CommunityModal
          message="로그인 후 이용 가능합니다."
          onConfirm={() => setShowModal(false)}
          onClose={() => setShowModal(false)}
          showCancel={false}
        />
      )}

      <div className={styles.container}>
        <h1 className={styles.mainTitle}>직거래 장터</h1>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>인기 거래 &gt;</h2>
          </div>
          <div className={`${styles.popularPostGrid}`}>
            {topPopularPosts.length > 0
              ? topPopularPosts.map(renderPostCard)
              : <p className={styles.noPosts}>인기 거래 게시글이 없습니다.</p>}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>최신 거래 &gt;</h2>
          </div>
          <div className={`${styles.recentPostGrid}`}>
            {paginatedRecentPosts.length > 0
              ? paginatedRecentPosts.map(renderPostCard)
              : <p className={styles.noPosts}>최신 거래 게시글이 없습니다.</p>}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={i + 1 === currentPage ? styles.active : ''}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.myListButton} onClick={handleMyListClick}>
            내 판매 목록
          </button>
          <button className={styles.registerButton} onClick={handleRegisterClick}>
            등록하기
          </button>
        </div>
      </div>
    </>
  );
};

export default MarketMain;
