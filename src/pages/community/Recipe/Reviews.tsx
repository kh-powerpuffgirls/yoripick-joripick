import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../api/authApi';
import type { Review } from '../../../type/Recipe'; // Recipe.ts에서 Review 타입 import
import styles from './Reviews.module.css';

// 아이콘 import
import starIcon from '../../../assets/sample/star.png';
import reportIcon from '../../../assets/sample/신고아이콘_회색.png';
import sampleProfileImg from '../../../assets/sample/profile.png';

//modal import
import WriteReviewModal from './modal/WriteReviewModal';
import PhotoReviewModal from './modal/PhotoReview';

// 이 컴포넌트가 부모로부터 받을 props 타입
interface ReviewsProps {
  rcpNo: number;
}

// 리뷰 목록 API의 응답 타입을 정의
interface ReviewPage {
  reviews: Review[];
  totalPages: number;
}

const Reviews: React.FC<ReviewsProps> = ({ rcpNo }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photoReviews, setPhotoReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState('latest'); // 'latest' or 'stars'
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 모달의 열림/닫힘 상태를 관리하는 state
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // 포토 리뷰 모달에 전달할, 사용자가 클릭한 사진의 인덱스
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // 리뷰 목록을 불러오는 함수
  const fetchReviews = useCallback(async (isLoadMore = false) => {
    setIsLoading(true);
    try {
      const response = await api.get<ReviewPage>(`/api/reviews/${rcpNo}`, {
        params: { page: isLoadMore ? page + 1 : 0, sort }
      });
      
      if (isLoadMore) {
        setReviews(prev => [...prev, ...response.data.reviews]);
      } else {
        setReviews(response.data.reviews);
      }
      setPage(isLoadMore ? page + 1 : 0);
      setTotalPages(response.data.totalPages);

    } catch (error) {
      console.error('리뷰 로딩 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [rcpNo, sort, page]);

  // 포토 리뷰 목록을 불러오는 함수
  const fetchPhotoReviews = useCallback(async () => {
    try {
      const response = await api.get<Review[]>(`/api/reviews/${rcpNo}/photos`);
      setPhotoReviews(response.data);
    } catch (error) {
      console.error('포토 리뷰 로딩 실패:', error);
    }
  }, [rcpNo]);

  // 컴포넌트가 처음 로드되거나 정렬 방식이 바뀔 때 데이터를 다시 불러옴
  useEffect(() => {
    fetchPhotoReviews();
    fetchReviews();
  }, [rcpNo, sort]); // sort가 바뀔 때 fetchReviews가 재생성되고 이 effect가 실행됨

  // ---  모달을 여는 이벤트 핸들러 ---
  const handleOpenWriteModal = () => {
    setIsWriteModalOpen(true);
  };

   const handleOpenPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index); // 사용자가 클릭한 사진의 인덱스를 저장
    setIsPhotoModalOpen(true);
  };
  
  //  리뷰 작성이 완료되면 모달을 닫고 리뷰 목록을 새로고침하는 함수
  const handleReviewSubmitted = () => {
    setIsWriteModalOpen(false);
    fetchReviews(); // 일반 리뷰 새로고침
    fetchPhotoReviews(); // 포토 리뷰 새로고침
  };

  const handleLoadMore = () => {
    if (!isLoading && page < totalPages - 1) {
      fetchReviews(true);
    }
  };

  return (
    <>
        {/* ==================== 모달 영역 ==================== */}
        {/* isWriteModalOpen이 true일 때만 WriteReviewModal을 렌더링 */}
        {isWriteModalOpen && (
            <WriteReviewModal 
            rcpNo={rcpNo} 
            onClose={() => setIsWriteModalOpen(false)} 
            onReviewSubmit={handleReviewSubmitted}
            />
        )}
        
        {/* isPhotoModalOpen이 true이고 photoReviews가 있을 때만 PhotoReviewModal을 렌더링 */}
        {isPhotoModalOpen && photoReviews.length > 0 && (
            <PhotoReviewModal 
            photoReviews={photoReviews}
            initialIndex={selectedPhotoIndex}
            onClose={() => setIsPhotoModalOpen(false)}
            />
        )}

        {/* ==================== 리뷰 섹션 JSX ==================== */}
        <div className={styles.reviews_section}>
        {/* ==================== 포토리뷰 ==================== */}
        <div id="photoReview">
            <div className={styles.title_area}>
            <h2>포토리뷰 <span>{photoReviews.length}</span></h2>
            <button onClick={handleOpenWriteModal}>리뷰작성하기</button>
            </div>
            <hr />
            <div className={styles.photo_container}>
            {photoReviews.slice(0, 4).map((review, index) => (
                <div key={review.reviewNo} className={styles.photo_box} onClick={() => handleOpenPhotoModal(index)}>
                    <img src={review.serverName} alt="포토리뷰" />
                </div>
            ))}
            <div className={`${styles.photo_box} ${styles.photo_box_add}`} onClick={() => handleOpenPhotoModal(0)}>
              + 더보기<br />{photoReviews.length}
            </div>
            </div>
        </div>

        {/* ==================== 일반리뷰 ==================== */}
        <div id="Review">
            <div className={styles.title_area}>
            <h2>리뷰 <span>{reviews.length}</span></h2>
            <div className={styles.sort_area}>
                <span onClick={() => setSort('latest')} className={sort === 'latest' ? styles.active_sort : ''}>최신순</span> | 
                <span onClick={() => setSort('stars')} className={sort === 'stars' ? styles.active_sort : ''}>별점순</span>
            </div>
            </div>
            <hr />
            <div className={styles.review_container}>
            {reviews.map(review => (
                <div key={review.reviewNo} className={styles.review_item}>
                <img src={review.userInfo.serverName ? review.userInfo.serverName : sampleProfileImg} alt={review.userInfo.username} className={styles.profile_img} />
                <div className={styles.profile_content}>
                    <div className={styles.profile}>
                    <div className={styles.profile_name}>
                        <span className={styles.nickname}>{review.userInfo.username}</span>
                    </div>
                    <div className={styles.stars}>
                        <img src={starIcon} alt="별점" />
                        <span>{review.stars.toFixed(1)}</span>
                    </div>
                    <div className={styles.review_actions}>
                        <button className={styles.action_btn}>수정</button>
                        <button className={styles.action_btn}>삭제</button>
                        <button className={styles.action_btn}><img src={reportIcon} alt="신고"/>신고</button>
                    </div>
                    </div>
                    <p className={styles.rcp_content}>{review.content}</p>
                    <span className={styles.date}>{new Date(review.reviewDate).toLocaleDateString()}</span>
                </div>
                <img src={review.serverName} alt="리뷰 사진" className={styles.review_img} />
                </div>
            ))}
            </div>
            {page < totalPages - 1 && (
            <div className={styles.add_btn} onClick={handleLoadMore}>
                {isLoading ? '로딩 중...' : '+ 더보기'}
            </div>
            )}
        </div>
        </div>
    </>
  );
};

export default Reviews;