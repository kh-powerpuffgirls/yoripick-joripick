import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './FreeMain.module.css';
import CommunityHeader from '../CommunityHeader';
import cx from "classnames";
import ingDefaultStyle from "../../../assets/css/ingDefault.module.css";

interface FreePost {
  boardNo: number;
  title: string;
  subheading?: string;
  content: string;
  createdDate: string;
  views: number;
  likes: number;
  replyCount: number;
  serverName?: string;
  username: string;
  sik_bti?: string;
}

// 자유 게시판 메인 페이지
const FreeMain = () => {
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState<FreePost[]>([]); // 모든 게시글 목록
  const [loading, setLoading] = useState(true); // 로딩
  const [error, setError] = useState<string | null>(null); // 에러
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const postsPerPage = 10; // 페이지당 게시글 수

  // 서버에서 게시글 목록을 가져오는 함수
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<FreePost[]>('http://localhost:8081/community/free');
      setAllPosts(response.data);
      console.log(response.data);
      setCurrentPage(1); // 새로운 데이터를 불러오면 첫 페이지로 돌아감
    } catch (err) {
      console.error('게시글 목록 불러오기 실패:', err);
      setError('게시글 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 목록을 처음 로드할 때 한 번만 실행
  useEffect(() => {
    fetchPosts();
  }, []);

  // 현재 페이지에 해당하는 게시글만 가져오는 useMemo
  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return allPosts.slice(indexOfFirstPost, indexOfLastPost);
  }, [allPosts, currentPage, postsPerPage]);

  // 총 페이지 수 계산
  const totalPages = Math.max(1, Math.ceil(allPosts.length / postsPerPage));

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // 로딩 및 에러 처리
  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <CommunityHeader />
      <div className={cx(styles['community-main-container'], ingDefaultStyle['ing-default'])}>
        <div className={styles['main-content']}>
          {/* 게시글 리스트 */}
          <div className={styles['post-list-section']}>
            {currentPosts.length > 0 ? (
              currentPosts.map((post) => (
                <div
                  key={post.boardNo}
                  className={styles['post-card']}
                  onClick={() => navigate(`/community/free/${post.boardNo}`)}
                >
                  <div className={styles['post-left']}>
                    <p className={styles['post-subtitle']}>
                      {post.subheading ? `[${post.subheading}]` : '[]'}
                    </p>
                    <h2 className={styles['post-title']}>{post.title}</h2>
                    <p>{post.content}</p>
                    <div className={styles['post-meta']}>
                      <span className={styles['post-author']}>{post.username}</span>
                      <span className={styles['post-sik-bti']}>({post.sik_bti})</span>
                      <span className={styles['post-likes']}>좋아요: {post.likes}</span>
                      <span className={styles['post-views']}>조회수: {post.views}</span>
                      <span className={styles['post-date']}>
                        작성일: {new Date(post.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* 게시글 이미지와 댓글 수 표시 */}
                  <div className={styles['post-image-container']}>
                    <img
                      src={
                        post.serverName
                          ? `http://localhost:8081/images/${post.serverName}?t=${new Date().getTime()}`
                          : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image'
                      }
                      alt={post.title}
                      className={styles['post-image']}
                    />
                    <div className={styles['comment-count-badge']}>💬 {post.replyCount}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noPosts}>게시글이 없습니다.</p>
            )}
          </div>
          
          {/* 페이지네이션 UI */}
          {totalPages >= 1 && (
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

          {/* 글쓰기 버튼 */}
          <div className={styles['button-container']}>
            <button
              onClick={() => navigate('/community/free/form')}
              className={styles['register-button']}
            >
              등록 하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreeMain;