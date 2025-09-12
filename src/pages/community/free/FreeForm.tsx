import {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import styles from './FreeForm.module.css';
import {store} from '../../../store/store'

// axios 전역 withCredentials 설정 (쿠키 자동 포함)
axios.defaults.withCredentials = true;

const getAccessToken = () => {
    return store.getState().auth.accessToken;
};
const api = axios.create({
    baseURL: `http://localhost:8081/api/inglist`,
    withCredentials: true
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
    async (error) => {
        console.log(error);
        return Promise.reject(error);
    }
)


// 요청 인터셉터로 디버깅용 로그 출력
axios.interceptors.request.use((config) => {
  console.log('요청 URL:', config.url);
  console.log('withCredentials:', config.withCredentials);
  console.log('요청 헤더:', config.headers);
  return config;
});

const API_BASE = 'http://localhost:8081';

interface FreePost {
  boardNo?: number;
  title: string;
  subheading?: string;
  content: string;
  userNo: number;
  serverName?: string | null;
}

const FreeForm = () => {
  const { boardNo } = useParams<{ boardNo: string }>();
  const isEdit = Boolean(boardNo);
  const navigate = useNavigate();
  
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userNo = useSelector((state: RootState) => state.auth.user?.userNo);

  const [title, setTitle] = useState('');
  const [subheading, setSubheading] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userNo) {
      setError('게시글을 작성하려면 로그인이 필요합니다.');
    }
  }, [userNo, navigate]);

  useEffect(() => {
    if (!isEdit) return;

    const fetchPost = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get<FreePost>(
          `${API_BASE}/community/free/${boardNo}`,
          {
            // withCredentials는 전역설정에 이미 포함됨
          }
        );

        setTitle(data.title);
        setSubheading(data.subheading || '');
        setContent(data.content);
        if (data.serverName) {
          setPreviewImage(`${API_BASE}/images/${data.serverName}`);
        }
      } catch {
        setError('게시글을 불러오는 데 실패했거나 권한이 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [boardNo, isEdit]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  console.log('accessToken in handleSubmit:', accessToken);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!userNo) {
      setError('게시글을 작성하려면 로그인이 필요합니다.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setMessage('제목과 내용을 반드시 입력하세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('userNo', String(userNo));
      if (subheading.trim()) formData.append('subheading', subheading);
      if (selectedImage) formData.append('file', selectedImage);

      const url = `${API_BASE}/community/free${isEdit ? `/${boardNo}` : ''}`;
      const method = isEdit ? axios.put : axios.post;

      await method(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // 이곳에서 accessToken을 Authorization 헤더에 추가합니다.
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        withCredentials: true,
      });

      setMessage(isEdit ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');
      setTimeout(() => navigate('/community/free'), 1500);
    } catch (e) {
      console.error(e);
      setError(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    // window.confirm은 사용자 경험을 위해 커스텀 모달 UI로 대체하는 것이 좋습니다.
    const confirmed = window.confirm('정말 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/community/free/${boardNo}`, {
        headers: {
          // 삭제 요청에도 accessToken을 추가합니다.
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        withCredentials: true,
      });

      setMessage('게시글이 삭제되었습니다.');
      setTimeout(() => navigate('/community/free'), 1500);
    } catch (e) {
      console.error(e);
      setError('게시글 삭제에 실패했습니다.');
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
