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
import { saveUserData } from '../../../features/authSlice';
import styles from './FreeForm.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import CommunityModal from '../CommunityModal';

const API_BASE = 'http://3.38.213.177:8081';
const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => Promise.reject(error),
);

interface FreePost {
  boardNo?: number;
  title: string;
  subheading?: string;
  content: string;
  userNo: number;
  serverName?: string | null;
  imageUrl?: string | null;
}

const FreeForm = () => {
  const { boardNo } = useParams<{ boardNo: string }>();
  const isEdit = Boolean(boardNo);
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const userNo = user?.userNo;

  const [title, setTitle] = useState('');
  const [subheading, setSubheading] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('authUser');
    const savedToken = localStorage.getItem('accessToken');

    if (savedUser && savedToken && !user) {
      store.dispatch(
        saveUserData({
          user: JSON.parse(savedUser),
          accessToken: savedToken,
        }),
      );
    }
  }, [user]);

  useEffect(() => {
    if (!isEdit) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<FreePost>(`/community/free/${boardNo}`);
        setTitle(data.title);
        setSubheading(data.subheading || '');
        setContent(data.content);
        if (data.imageUrl) setPreviewImage(data.imageUrl);
      } catch {
        setModalMessage('게시글 불러오기 실패 또는 권한 없음');
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

  const handleClearImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    setIsImageDeleted(true); 
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!userNo) return setModalMessage('로그인이 필요합니다.');
    if (!title.trim() || !content.trim())
      return setModalMessage('제목과 내용을 반드시 입력하세요.');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (subheading.trim()) formData.append('subheading', subheading);
      if (selectedImage) formData.append('file', selectedImage);

      formData.append('isImageDeleted', String(isImageDeleted));

      const url = `/community/free${isEdit ? `/${boardNo}` : ''}`;
      const method = isEdit ? api.put : api.post;

      await method(url, formData);
      setModalMessage(isEdit ? '게시글 수정 완료' : '게시글 작성 완료');
      setTimeout(() => navigate('/community/free'), 1000);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setModalMessage('로그인이 필요합니다.');
        navigate('/login');
      } else {
        setModalMessage(isEdit ? '게시글 수정 실패' : '게시글 작성 실패');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/community/free/${boardNo}`);
      setModalMessage('게시글 삭제 완료');
      setTimeout(() => navigate('/community/free'), 1000);
    } catch (e: any) {
      if (e.response?.status === 401) {
        setModalMessage('로그인 후 이용해 주세요.');
        navigate('/login');
      } else {
        setModalMessage('게시글 삭제 실패');
      }
    }
  };

  if (loading) return <div className={styles.loading}>로딩 중...</div>;

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <h1>{isEdit ? '자유 게시판 (수정)' : '자유 게시판 (작성)'}</h1>

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
       <div className={styles.previewBox}>
          {previewImage ? (
            <>
              <img
                src={previewImage}
                alt="미리보기"
                className={styles.previewImage}
              />
              <button
                type="button"
                onClick={handleClearImage}
                className={styles.clearButton}
              >
                이미지 삭제
              </button>
            </>
          ) : (
            "미리보기"
          )}

            </div>
            <div className={styles.inputGroup}>
          <label className={styles.label}>이미지 업로드</label>
          <div>
            <div className={styles.fileInputBox}>
              <p className={styles.notice}>
                운영정책에 어긋나는 이미지 등록 시 이용이 제한될 수 있습니다.
              </p>
              </div>
              <label className={styles.fileButton}>
                선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.hiddenInput}
                />
              </label>
              <span className={styles.fileName}>
                {selectedImage?.name || '선택된 파일 없음'}
              </span>
            </div>
          </div>

          <textarea
            placeholder="내용"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className={styles.contentTextarea}
          />

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>
              {isEdit ? '수정' : '등록'}
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
      {modalMessage && (
        <CommunityModal
          message={modalMessage}
          onClose={() => setModalMessage(null)}
        />
      )}
    </>
  );
};

export default FreeForm;
