import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { store } from '../../../store/store';
import type { RootState } from '../../../store/store';
import CommunityHeader from '../Header/CommunityHeader';
import styles from '../mypost/MyPost.module.css';
import React from 'react';

const API_BASE = 'http://localhost:8081';

const getAccessToken = (): string | null => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (err: AxiosError) => Promise.reject(err)
);

interface MarketSellDtoWithForms {
  productId: number;
  title: string;
  createdAt: string;
  views: number;
  buyForms: {
    formNo: number;
    buyerName: string;
    createdAt: string;
  }[];
}

const MarketMyList = () => {
  const [posts, setPosts] = useState<MarketSellDtoWithForms[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const userNo = user?.userNo;

  const [shouldRefetch, setShouldRefetch] = useState(false);

  useEffect(() => {
    if (!userNo) {
      setError('게시글 목록을 보려면 로그인이 필요합니다.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 1000);
      return;
    }
    fetchMyPosts();
  }, [userNo, shouldRefetch, navigate]);

  useEffect(() => {
    const handleFocus = () => {
      setShouldRefetch(true);
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchMyPosts = async () => {
    setLoading(true);
    setShouldRefetch(false);
    setError(null);

    try {
      const response = await api.get<MarketSellDtoWithForms[]>('/community/market/my-posts');
      setPosts(response.data);
      setLoading(false);
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        navigate('/login');
      } else {
        setError('게시글을 불러오는 데 실패했습니다.');
      }
      setLoading(false);
    }
  };

  const handleFormClick = (formNo: number) => {
    navigate(`/community/market/my-buy-form/${formNo}`);
  };

  if (loading) return <div className={styles['loading-message']}>로딩 중...</div>;
  if (error) return <div className={styles['error-message']}>{error}</div>;

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles['post-list']}>
          <div className={styles['title-box']}>
            <h1>내 판매 목록</h1>
          </div>
          <table className={styles['post-table']}>
            <thead className={styles['table-header']}>
              <tr>
                <th>번호</th>
                <th>판매글 제목</th>
                <th>날짜</th>
                <th>조회수</th>
              </tr>
            </thead>
            <tbody>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <React.Fragment key={post.productId}>
                    <tr className={styles['post-row']}>
                      <td>{post.productId}</td>
                      <td>{post.title || '-'}</td>
                      <td>
                        {new Date(post.createdAt).toLocaleDateString('ko-KR', {
                          year: '2-digit',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </td>
                      <td>{post.views}</td>
                    </tr>
                    {post.buyForms && post.buyForms.length > 0 && (
                      <tr>
                        <td colSpan={4}>
                          <div className={styles['form-list']}>
                            <h4>구매 신청 목록</h4>
                            <ul>
                              {post.buyForms.map((form) => (
                                <li
                                  key={form.formNo}
                                  className={styles['form-item']}
                                  onClick={() => handleFormClick(form.formNo)}
                                >
                                  {form.buyerName} - 신청일: {new Date(form.createdAt).toLocaleDateString()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>
                    <p className={styles.noPosts}>등록된 판매글이 없습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MarketMyList;
