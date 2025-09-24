import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { store } from '../../../store/store';
import type { RootState } from '../../../store/store';
import mypostStyles from './MyPost.module.css';
import { useNavigate } from 'react-router-dom';
import CommunityHeader from '../CommunityHeader';

// API 기본 URL 정의
const API_BASE = 'http://localhost:8081';

// Redux 스토어에서 accessToken을 가져오기
const getAccessToken = () => store.getState().auth.accessToken;

// API 호출
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// 토큰 주입
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

interface MyPostDto {
  id: number;
  title: string;
  description: string;
  createdDate: string;
  views: number;
  category: string; // BOARD, RECIPE, CHALLENGE, MARKET
}

const MyPost = () => {
  const [posts, setPosts] = useState<MyPostDto[]>([]);
  const [selectedPost, setSelectedPost] = useState<MyPostDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 로그인 됐나?
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // 로그인 상태 확인
    if (!user) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }
    fetchPosts();
  }, [user]);

  const fetchPosts = async () => {
    try {
      const response = await api.get<MyPostDto[]>('/community/mypost');
      setPosts(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to fetch posts:', err);
      if (err.response && err.response.status === 401) {
        setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setError('게시글을 불러오는 데 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handlePostClick = (post: MyPostDto) => {
    switch (post.category) {
      case 'BOARD':
        navigate(`/community/free/${post.id}`);
        break;
      case 'RECIPE':
        navigate(`/community/recipe/${post.id}`);
        break;
      case 'CHALLENGE':
        navigate(`/community/challenge/${post.id}`);
        break;
      case 'MARKET':
        navigate(`/community/marketplace/${post.id}`);
        break;
      default:
        console.warn('Unknown category:', post.category);
    }
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  if (loading) {
    return <div className={mypostStyles['loading-message']}>로딩 중...</div>;
  }

  if (error) {
    return <div className={mypostStyles['error-message']}>{error}</div>;
  }

  return (
    <>
      <CommunityHeader />
      <div className={mypostStyles.container}>
        {!selectedPost ? (
          <div className={mypostStyles['post-list']}>
            <div className={mypostStyles['title-box']}>
              <h1>내 게시물 보기</h1>
            </div>
            <table className={mypostStyles['post-table']}>
              <thead className={mypostStyles['table-header']}>
                <tr>
                  <th>번호</th>
                  <th>제목</th>
                  <th>날짜</th>
                  <th>조회수</th>
                  <th>종류</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={`${post.category}-${post.id}`}
                    className={mypostStyles['post-row']}
                    onClick={() => handlePostClick(post)}
                  >
                    <td>{post.id}</td>
                    <td>{post.title || '-'}</td>
                    <td>
                      {new Date(post.createdDate).toLocaleDateString('ko-KR', {
                        year: '2-digit',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </td>
                    <td>{post.views}</td>
                    <td>{post.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
        <div className={mypostStyles['post-detail-card']}>
                  <button onClick={handleBackToList} className={mypostStyles['back-button']}>
                    &larr; 목록으로 돌아가기
                  </button>
                  <h1>{selectedPost.title || '제목 없음'}</h1>
                  <div className={mypostStyles['post-meta']}>
                    작성일: {new Date(selectedPost.createdDate).toLocaleDateString()} | 조회수: {selectedPost.views} | 종류: {selectedPost.category}
                  </div>
                  {selectedPost.category === 'CHALLENGE' ? (
                    <p className={mypostStyles['post-description']}>챌린지 게시글은 별도의 내용이 없습니다.</p>
                  ) : (
                    <p className={mypostStyles['post-description']}>{selectedPost.description || '내용 없음'}</p>
                  )}
                </div>
              )}
            </div>
    </>
  );
};

export default MyPost;