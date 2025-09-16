import React, { useState } from 'react';
import styles from './DetailModal.module.css'; // ✨ 통합된 CSS 모듈 사용
import type { PhotoReviewModalProps } from '../../../../type/Recipe';

// 아이콘 import
import closeIcon from '../../../../assets/sample/X_btn.png';
import starIcon from '../../../../assets/sample/star.png';
import reportIcon from '../../../../assets/sample/신고아이콘_회색.png';
import sampleProfileImg from '../../../../assets/sample/profile.png';


const PhotoReviewModal: React.FC<PhotoReviewModalProps> = ({ photoReviews, initialIndex, onClose }) => {
  // 현재 보여줄 리뷰의 인덱스(순번)를 관리하는 state
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // 현재 인덱스에 해당하는 리뷰 데이터
  const currentReview = photoReviews[currentIndex];

  // 이전/다음 슬라이드로 변경하는 함수
  const changeSlide = (direction: number) => {
    const newIndex = currentIndex + direction;
    // 배열의 범위를 벗어나지 않도록 체크
    if (newIndex >= 0 && newIndex < photoReviews.length) {
      setCurrentIndex(newIndex);
    }
  };

  // 썸네일 이미지를 클릭했을 때 해당 이미지로 바로 이동하는 함수
  const selectImage = (index: number) => {
    setCurrentIndex(index);
  };

  // 프로필 이미지가 없을 경우 샘플 이미지를 사용
  const profileImageUrl = currentReview.userInfo.serverName 
    ? currentReview.userInfo.serverName 
    : sampleProfileImg;

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_photoreview} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head_title}>
            <span>포토리뷰 모아보기 <a style={{ color: '#FE8051' }}>{photoReviews.length}</a></span>
            <img src={closeIcon} id={styles.close} onClick={onClose} alt="닫기"/>
        </div>
        <div className={styles.container_photoreview}>
          {/* 왼쪽: 선택된 리뷰 상세 */}
          <div className={styles.preview}>
            <div id={styles.one_img}>
              <button onClick={() => changeSlide(-1)} disabled={currentIndex === 0}>◀</button>
              <div id={styles.slide}>
                <img src={`/images/${currentReview.serverName}`} height="390px" width="390px" alt="리뷰 이미지"/>
              </div>
              <button onClick={() => changeSlide(1)} disabled={currentIndex === photoReviews.length - 1}>▶</button>
            </div>
            <div className={styles.profile_container}>
                <div className={styles.profile}>
                    <img src={profileImageUrl} alt="프로필"/>
                    <div className={styles.profile_name}>
                        <span className={styles['eat-bti']}>{currentReview.userInfo.sik_bti}</span>
                        <span className={styles.nickname}>{currentReview.userInfo.username}</span>
                    </div>
                    <div className={styles.stars}>
                        <img src={starIcon} alt="별점"/>
                        {currentReview.stars.toFixed(1)}
                    </div>
                    <span className={styles.date}>{new Date(currentReview.reviewDate).toLocaleDateString()}</span>
                </div>
                <button className={styles.report}>
                    <img src={reportIcon} alt="신고"/>
                    <span>신고</span>
                </button>
            </div>
            <div className={styles.content_photoreview}>
                <span>{currentReview.content}</span>
            </div>
          </div>
          {/* 오른쪽: 전체 이미지 목록 */}
          <div className={styles.img_list}>
            {photoReviews.map((review, index) => (
              <img 
                key={review.reviewNo} 
                src={`/images/${review.serverName}`}
                onClick={() => selectImage(index)}
                className={currentIndex === index ? styles.active_thumbnail : ''}
                alt={`리뷰 ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoReviewModal;