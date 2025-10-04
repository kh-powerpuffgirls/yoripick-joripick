import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import styles from './FreeMain.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import cx from "classnames";
import ingDefaultStyle from "../../../assets/css/ingDefault.module.css";
import SikBti from "../Recipe/SikBti";

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

const FreeMain = () => {
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState<FreePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const user = useSelector((state: RootState) => state.auth.user); // 로그인 유저 확인

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<FreePost[]>('http://3.38.213.177:8081/community/free');
      setAllPosts(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('게시글 목록 불러오기 실패:', err);
      setError('게시글 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return allPosts.slice(indexOfFirstPost, indexOfLastPost);
  }, [allPosts, currentPage, postsPerPage]);

  const totalPages = Math.max(1, Math.ceil(allPosts.length / postsPerPage));

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <CommunityHeader />
      <div className={cx(styles['community-main-container'], ingDefaultStyle['ing-default'])}>
        <div className={styles['main-content']}>
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
                      {post.sik_bti && (
                        <SikBti sikBti={post.sik_bti} style={{ marginLeft: '5px' }} />
                      )}
                      <span className={styles['post-likes']}>좋아요: {post.likes}</span>
                      <span className={styles['post-views']}>조회수: {post.views}</span>
                      <span className={styles['post-date']}>
                        작성일: {new Date(post.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className={styles['post-image-container']}>
                    <img
                      src={
                        post.serverName
                          ? `http://3.38.213.177:8081/images/${post.serverName}?t=${new Date().getTime()}`
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

          {totalPages >= 1 && (
            <div className={styles.pagination}>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
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
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                &gt;
              </button>
            </div>
          )}

          {/* 로그인한 유저만 등록 버튼 */}
          {user && (
            <div className={styles['button-container']}>
              <button
                onClick={() => navigate('/community/free/form')}
                className={styles['register-button']}
              >
                등록 하기
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FreeMain;
