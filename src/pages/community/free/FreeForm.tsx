import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './FreeForm.module.css';

const API_BASE = 'http://localhost:8080';

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

  const [title, setTitle] = useState('');
  const [subheading, setSubheading] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const tempUserNo = 2;

  useEffect(() => {
    if (!isEdit) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<FreePost>(`${API_BASE}/community/free/${boardNo}`);
        setTitle(data.title);
        setSubheading(data.subheading || '');
        setContent(data.content);
        if (data.serverName) setPreviewImage(`${API_BASE}/images/${data.serverName}`);
      } catch {
        setError('게시글을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [boardNo, isEdit]);

  // 이미지 선택 핸들링
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  // 작성 또는 수정 제출
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage('제목과 내용을 반드시 입력하세요.');
      return;
    }

    try {
      setMessage(null);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (subheading.trim()) formData.append('subheading', subheading);
      formData.append('userNo', tempUserNo.toString());
      if (selectedImage) formData.append('file', selectedImage);

      const url = `${API_BASE}/community/free${isEdit ? `/${boardNo}` : ''}`;
      const method = isEdit ? axios.put : axios.post;

      await method(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(isEdit ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');
      navigate('/community/free');
    } catch (e) {
      console.error(e);
      setMessage(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 게시글을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`${API_BASE}/community/free/${boardNo}`);
      alert('게시글이 삭제되었습니다.');
      navigate('/community/free');
    } catch (e) {
      console.error(e);
      alert('게시글 삭제에 실패했습니다.');
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
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={styles.inputField}
        />

        <input
          type="text"
          placeholder="부제목 (선택)"
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          className={styles.inputField}
        />

        <div className={styles.imagePreviewContainer}>
          {previewImage ? (
            <img src={previewImage} alt="미리보기" className={styles.imagePreview} />
          ) : (
            <div className={styles.placeholderText}>이미지를 업로드하세요</div>
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
