// ChallengeForm.tsx
import React, { useState, useEffect } from 'react';
import styles from './ChallengeForm.module.css';
import CommunityHeader from '../CommunityHeader';

interface ChallengeFormProps {
  isEdit?: boolean;
  postId?: string;
}

const ChallengeForm = ({ isEdit = false, postId }: ChallengeFormProps) => {
  const [title, setTitle] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

  useEffect(() => {
    // 수정 모드일 경우 기존 게시글 데이터를 불러옴
    if (isEdit && postId) {
      // API 호출 로직 (예시)
      // fetch(`/api/posts/${postId}`).then(response => response.json()).then(data => {
      //   setTitle(data.title);
      //   setImageUrl(data.imageUrl);
      //   setVideoUrl(data.videoUrl);
      // });
      
      // 목업 데이터
      setTitle('마라탕에 팅후루 넣어먹기 챌린지 !!!');
      setImageUrl('https://placehold.co/80x80/ffe6b7/000000?text=Image+1');
      setVideoUrl('https://youtu.be/7HjLushlx6s?eb=65MVLjs7zrdahXeLV');
    }
  }, [isEdit, postId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUrl(file.name); // 파일 이름으로 미리보기 업데이트
      // 실제 이미지 업로드 로직 (API 호출 등)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      console.log('게시글 수정:', { title, imageUrl, videoUrl });
      // 수정 API 호출
    } else {
      console.log('게시글 등록:', { title, imageUrl, videoUrl });
      // 등록 API 호출
    }
    // 성공 후 페이지 이동 로직
  };

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      console.log('게시글 삭제:', postId);
      // 삭제 API 호출
    }
  };

  return (
    <>
    <CommunityHeader/>
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>참여하는 푸드 챌린지</h1>
      <div className={styles.titleDisplay}>{title || '마라탕에 팅후루 넣어먹기 챌린지 !!!'}</div>
      
      <div className={styles.previewBox}>미리보기</div>

      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>이미지 업로드 *</label>
          <div className={styles.fileInputBox}>
            <label htmlFor="image-upload" className={styles.fileButton}>이미지 선택</label>
            <input
              id="image-upload"
              type="file"
              className={styles.hiddenInput}
              onChange={handleImageChange}
            />
            <span className={styles.fileName}>{imageUrl || '선택된 이미지 없음'}</span>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>챌린지 URL</label>
          <input
            type="text"
            className={styles.urlInput}
            placeholder="URL을 등록해주세요."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            {isEdit ? '수정' : '등록'}
          </button>
          <button type="button" className={styles.cancelButton}>취소</button>
          {isEdit && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={handleDelete}
            >
              삭제
            </button>
          )}
        </div>
      </form>
    </div>
    </>
  );
};

export default ChallengeForm;