import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { store } from '../../../store/store';
import styles from './FreeForm.module.css';

// API 기본 URL 정의
const API_BASE = 'http://localhost:8081';

// Redux 스토어에서 accessToken을 가져오기
const getAccessToken = () => store.getState().auth.accessToken;

// API 호출을 위한 axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// 모든 요청에 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// 오류 처리
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => Promise.reject(error),
);

// 이미지 URL 생성
const getImageUrl = (serverName: string) => `${API_BASE}/images/${serverName}`;

// 게시글 데이터 타입 정의
interface FreePost {
  boardNo?: number;
  title: string;
  subheading?: string;
  content: string;
  userNo: number;
  serverName?: string | null;
}

// 게시글 작성 및 수정 폼 컴포넌트
const FreeForm = () => {
  // URL 파라미터에서 게시글 번호 가져오기
  const { boardNo } = useParams<{ boardNo: string }>();
  // 수정 모드 여부 판단
  const isEdit = Boolean(boardNo);
  // 페이지 이동 함수
  const navigate = useNavigate();

  // 로그인된 사용자 번호 가져오기
  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  // 상태 관리
  const [title, setTitle] = useState('');
  const [subheading, setSubheading] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 로그인 여부 체크
  useEffect(() => {
    if (!userNo) setError('게시글 작성/수정을 위해 로그인 필요');
  }, [userNo]);

  // 수정 모드일 때 기존 게시글 데이터 불러오기
  useEffect(() => {
    if (!isEdit) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<FreePost>(`/community/free/${boardNo}`);
        setTitle(data.title);
        setSubheading(data.subheading || '');
        setContent(data.content);
        if (data.serverName) setPreviewImage(getImageUrl(data.serverName));
      } catch {
        setError('게시글 불러오기 실패 또는 권한 없음');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [boardNo, isEdit]);

  // 이미지 선택 시 미리보기
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  // 폼 제출 (게시글 작성/수정) 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!userNo) return setError('로그인이 필요합니다.');
    if (!title.trim() || !content.trim())
      return setMessage('제목과 내용을 반드시 입력하세요.');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('userNo', String(userNo));
      if (subheading.trim()) formData.append('subheading', subheading);
      if (selectedImage) formData.append('file', selectedImage);

      const url = `/community/free${isEdit ? `/${boardNo}` : ''}`;
      const method = isEdit ? api.put : api.post;

      await method(url, formData);
      setMessage(isEdit ? '게시글 수정 완료' : '게시글 작성 완료');
      setTimeout(() => navigate('/community/free'), 1500);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError('로그인이 필요합니다.');
        navigate('/login');
      } else {
        setError(isEdit ? '게시글 수정 실패' : '게시글 작성 실패');
      }
    }
  };

  // 게시글 삭제 처리
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/community/free/${boardNo}`, { params: { userNo } });
      setMessage('게시글 삭제 완료');
      setTimeout(() => navigate('/community/free'), 1500);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setError('로그인 후 이용해 주세요.');
        navigate('/login');
      } else {
        setError('게시글 삭제 실패');
      }
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <div className={styles.container}>
      <h1>{isEdit ? '게시글 수정' : '게시글 작성'}</h1>

      {message && <div className={styles.messageBox}>{message}</div>}
      {error && <div className={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.formSpace}>
        <input
          type="text"
          placeholder="부제목 (선택)"
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          className={styles.inputField}
        />

        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.inputField}
        />

        <div className={styles.imagePreviewContainer}>
          {previewImage ? (
            <img
              src={previewImage}
              alt="미리보기"
              className={styles.imagePreview}
            />
          ) : (
            <div className={styles.placeholderText}>
              이미지를 업로드하세요
            </div>
          )}
        </div>

        <label className={styles.labelButton}>
          이미지 선택
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={styles.hiddenInput}
          />
        </label>

        <textarea
          placeholder="내용"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className={styles.contentTextarea}
        />

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {isEdit ? '수정 완료' : '작성 완료'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/community/free')}
            className={styles.cancelButton}
          >
            취소
          </button>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className={styles.deleteButton}
            >
              삭제
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FreeForm;