import React, { useState } from 'react';
import { api } from '../../../../api/authApi';
import styles from './DetailModal.module.css';
import type { WriteReviewModalProps } from '../../../../type/Recipe';
import type { RootState } from '../../../../store/store';

import closeIcon from '../../../../assets/sample/X_btn.png';
import sampleProfileImg from '../../../../assets/sample/profile.png';
import { useSelector } from 'react-redux';

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({ rcpNo, onClose, onReviewSubmit }) => {
  const [stars, setStars] = useState(0);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const userProfile = useSelector((state: RootState) => state.auth.user?.profile);


  // 유저 프로필
  const profileImageUrl = userProfile 
    ? userProfile
    : sampleProfileImg;

  // 별점 클릭 시 state 변경 (0.5점 단위 처리를 위해 value를 2로 나눔)
  const handleRating = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStars(Number(e.target.value) / 2);
  };
  
  // 이미지 선택 시 미리보기 기능
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      if (preview) {
        URL.revokeObjectURL(preview); // 기존 미리보기 URL 해제
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  // '작성 완료' 버튼 클릭 시
  const handleSubmit = async () => {
    if (stars === 0) return alert('별점을 선택해주세요.');
    if (!content.trim()) return alert('한줄 리뷰를 입력해주세요.');

    const formData = new FormData();
    formData.append('rcpNo', String(rcpNo));
    formData.append('stars', String(stars));
    formData.append('content', content);
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.post('/api/reviews', formData, { 
        headers: {'Content-Type': 'multipart/form-data'} 
      });
      alert('리뷰가 성공적으로 등록되었습니다.');
      onReviewSubmit(); // 부모에게 완료 사실을 알려 리뷰 목록 새로고침
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_writereview}>
        {/* ... (Review_modal.html의 JSX 구조) ... */}
        {/* 예시: 별점, 한줄리뷰 input, 이미지 업로드 ... */}
        <div className={styles.btn}>
            <button id={styles.cancel} onClick={onClose}>작성 취소</button>
            <button id={styles.complete} onClick={handleSubmit}>작성 완료</button>
        </div>
      </div>
    </div>
  );
};
// export default WriteReviewModal;