// FreeForm.tsx
import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import styles from './FreeForm.module.css';
import CommunityHeader from '../CommunityHeader';

interface FreeFormProps {
  isEdit?: boolean;
  postId?: string;
  onSuccess?: () => void;
}

interface FreePost {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  content: string;
  imageUrl?: string;
}

const FreeForm = ({ isEdit = false, postId, onSuccess }: FreeFormProps) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && postId) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`http://localhost:8080/community/posts/${postId}`);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const data: FreePost = await res.json();
          setTitle(data.title);
          setSubtitle(data.subtitle);
          setContent(data.content);
          setIsLoading(false);
        } catch (err) {
          setMessage('게시글을 불러오는 데 실패했습니다.');
          setIsError(true);
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [isEdit, postId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit
      ? `http://localhost:8080/community/posts/${postId}`
      : 'http://localhost:8080/community/write';
    const author = '현주짱';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, author, content }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      setMessage(isEdit ? '게시글이 성공적으로 수정되었습니다.' : '게시글이 성공적으로 작성되었습니다.');
      setIsError(false);
      
      if (!isEdit) {
        setTitle('');
        setSubtitle('');
        setContent('');
        setSelectedImage(null);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('API 호출 실패:', err);
      setMessage(isEdit ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
      setIsError(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:8080/community/posts/${postId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Delete failed');

        setMessage('게시글이 성공적으로 삭제되었습니다.');
        setIsError(false);
        // 삭제 성공 후 페이지 이동 (예: 목록 페이지로)
        // window.location.href = '/community/free';
      } catch (err) {
        setMessage('게시글 삭제에 실패했습니다.');
        setIsError(true);
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) setSelectedImage(file);
  };
  
  if (isLoading) return <div>로딩중...</div>;

  return (
    <>
    <CommunityHeader/>
    <div className={styles.container}>
      <div className={styles.mainCard}>
        <div className={styles.headingContainer}>
          <h1 className={styles.heading}>게시글 {isEdit ? '수정' : '작성'}</h1>
        </div>

        {message && (
          <div className={`${styles.messageBox} ${isError ? styles.errorBox : styles.successBox}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formSpace}>
          <input
            type="text"
            placeholder="소제목을 입력해주세요."
            className={styles.inputField}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="제목을 입력해주세요."
            className={styles.inputField}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className={styles.imagePreviewContainer}>
            {selectedImage ? (
              <img src={URL.createObjectURL(selectedImage)} className={styles.imagePreview} alt="미리보기" />
            ) : (
              <span className={styles.placeholderText}>이미지 미리보기</span>
            )}
          </div>

          <div className={styles.imageUploadArea}>
            <p className={styles.uploadText}>
              이미지 업로드
              <span className={styles.uploadSubtext}>운영정책에 어긋나는 이미지 등록 시 이용이 제한될 수 있습니다.</span>
            </p>
            <label className={styles.labelButton}>
              이미지 선택
              <input
                type="file"
                className={styles.hiddenInput}
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>

          <textarea
            placeholder="내용을 입력해주세요."
            className={styles.contentTextarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>{isEdit ? '수정' : '등록'}</button>
            <button type="button" className={styles.cancelButton} onClick={() => window.history.back()}>취소</button>
            {isEdit && (
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>삭제</button>
            )}
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default FreeForm;