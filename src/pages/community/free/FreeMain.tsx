import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './FreeMain.module.css';

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
  const [posts, setPosts] = useState<FreePost[]>([]); // 게시글 목록
  const [loading, setLoading] = useState(true); // 로딩
  const [error, setError] = useState<string | null>(null); // 에러

  // 서버에서 게시글 목록을 가져오는 함수
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<FreePost[]>('http://localhost:8081/community/free');
      setPosts(response.data);
    } catch (err) {
      console.error('게시글 목록 불러오기 실패:', err);
      setError('게시글 목록을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 목록
  useEffect(() => {
    fetchPosts();
  }, []);

  // 로딩 및 에러 처리
  if (loading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles['community-main-container']}>
      <div className={styles['main-content']}>
        {/* 게시글 리스트 */}
        <div className={styles['post-list-section']}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.boardNo}
                className={styles['post-card']}
                // 게시글 클릭 시 상세 페이지 ㄱㄱ
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
  );
};

export default FreeMain;