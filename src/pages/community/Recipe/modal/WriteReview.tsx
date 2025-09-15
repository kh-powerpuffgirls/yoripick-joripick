import React, { useState, useRef } from 'react';
import axios from 'axios';
import styles from './CommuntiyRecipeDetail_modal.module.css';
import type { ReviewModalProps } from '../../../../type/Recipe';

const WriteReviewModal: React.FC<ReviewModalProps> = ({ recipeId, onClose, onReviewSubmit }) => {
  const [stars, setStars] = useState(0);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (stars === 0 || !content) {
      alert('별점과 한줄 리뷰를 모두 입력해주세요.');
      return;
    }
    const formData = new FormData();
    formData.append('recipeId', String(recipeId));
    formData.append('stars', String(stars));
    formData.append('content', content);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      // await axios.post('/api/reviews', formData, { headers: {'Content-Type': 'multipart/form-data'} });
      alert('리뷰가 등록되었습니다.');
      onReviewSubmit(); // 부모에게 완료 알림
    } catch (error) {
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