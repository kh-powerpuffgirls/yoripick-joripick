import React, { useState } from 'react';
import styles from './CommuntiyRecipeDetail_modal.module.css';
import type { PhotoReviewModal } from '../../../../type/Recipe';

const PhotoReviewModal: React.FC<PhotoReviewModal> = ({ reviews, initialIndex, loggedInUser, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentReview = reviews[currentIndex];

  const changeSlide = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < reviews.length) {
      setCurrentIndex(newIndex);
    }
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
  }

  return (
    <div className={styles.modal_overlay}>
      <div className={styles.modal_photoreview}>
        <div className={styles.head_title}>
            <span>포토리뷰 모아보기</span>
            <img src="/src/assets/sample/X_btn.png" id={styles.close} onClick={onClose}/>
        </div>
        <div className={styles.container_photoreview}>
          {/* 왼쪽: 선택된 리뷰 상세 */}
          <div className={styles.preview}>
            <div id={styles.one_img}>
              <button onClick={() => changeSlide(-1)} disabled={currentIndex === 0}>◀</button>
              <div id={styles.slide}>
                <img src={currentReview.server_name} height="390px" width="390px" />
              </div>
              <button onClick={() => changeSlide(1)} disabled={currentIndex === reviews.length - 1}>▶</button>
            </div>
            <div className={styles.profile_container}>
              {/* ... 프로필 정보, 별점, 날짜 등 JSX ... */}
            </div>
            <div className={styles.content}>
              <span>{currentReview.content}</span>
            </div>
          </div>
          {/* 오른쪽: 전체 이미지 목록 */}
          <div className={styles.img_list}>
            {reviews.map((review, index) => (
              <img 
                key={review.review_no} 
                src={review.server_name} 
                onClick={() => selectImage(index)}
                className={currentIndex === index ? styles.active_thumbnail : ''}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoReviewModal;