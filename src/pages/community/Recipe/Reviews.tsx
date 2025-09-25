import React, { useState, useEffect } from 'react';
import { api } from '../../../api/authApi';
import type { Review } from '../../../type/Recipe'; // Recipe.ts에서 Review 타입 import
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import styles from './Reviews.module.css';

// 아이콘 import
import starIcon from '../../../assets/sample/star.png';
import sampleProfileImg from '../../../assets/sample/profile.png';

//modal import
import WriteReviewModal from './modal/WriteReviewModal';
import PhotoReviewModal from './modal/PhotoReview';
import SikBti from './SikBti';

// 이 컴포넌트가 부모로부터 받을 props 타입
interface ReviewsProps {
  rcpNo: number;
  onReviewSubmit: () => void; 
  reviewCount: number;
}

const Reviews: React.FC<ReviewsProps> = ({ rcpNo, onReviewSubmit, reviewCount }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photoReviews, setPhotoReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);

  // 리뷰 목록을 불러오는 함수
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/api/community/recipe/${rcpNo}/reviews?page=${page}&sort=${sort}`);
        
        if (page === 0) {
          // 첫 페이지 로드 또는 정렬 변경 시: 데이터를 완전히 새로고침
          setReviews(response.data.reviews);
        } else {
          // 더보기 클릭 시: 기존 데이터에 새로운 데이터를 추가
          setReviews(prevReviews => [...prevReviews, ...response.data.reviews]);
        }
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('리뷰 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (rcpNo) fetchReviews();
  }, [rcpNo, page, sort]);

  // 포토 리뷰 목록을 불러오는 함수
  useEffect(() => {
    const fetchPhotoReviews = async () => {
      try {
        const response = await api.get(`/api/community/recipe/${rcpNo}/reviews/photos`);
        setPhotoReviews(response.data);
      } catch (error) {
        console.error('포토 리뷰 로딩 실패:', error);
      }
    };
    if (rcpNo) fetchPhotoReviews();
  }, [rcpNo]);

  // 모달을 여는 이벤트 핸들러
  const handleOpenWriteModal = () => setIsWriteModalOpen(true);
  const handleOpenPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setIsPhotoModalOpen(true);
  };
  
  // 리뷰 작성 완료 시 실행될 함수
  const handleReviewSubmitted = () => {
    setIsWriteModalOpen(false);
    // 1. 부모 컴포넌트(RecipeDetail)의 리뷰 개수 등을 새로고침하도록 신호를 보냅니다.
    onReviewSubmit(); 
    // 2. 현재 컴포넌트의 리뷰 목록도 1페이지부터 다시 불러옵니다.
    handleSortChange('latest'); 
    // 3. 포토 리뷰 목록도 새로고침합니다.
    const fetchPhotoReviews = async () => {
        const response = await api.get(`/api/community/recipe/${rcpNo}/reviews/photos`);
        setPhotoReviews(response.data);
    };
    fetchPhotoReviews();
  };

  // '더보기' 버튼 클릭 핸들러
  const handleLoadMore = () => {
    if (!isLoading && page < totalPages - 1) {
      setPage(prevPage => prevPage + 1);
    }
  };

  // 정렬방식 변경시, 페이지를 0으로 리셋
  const handleSortChange = (newSort: string) => {
    if (sort !== newSort) {
      setReviews([]); // 기존 목록을 비워 사용자 경험을 개선합니다.
      setPage(0);
      setSort(newSort);
    }
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async (reviewNo: number) => {
    // 1. 사용자에게 정말 삭제할 것인지 확인
    if (!window.confirm("정말로 리뷰를 삭제하시겠습니까?")) {
      return;
    }

    try {
      // 2. 백엔드에 삭제 API 요청
      await api.delete(`/api/community/recipe/${rcpNo}/reviews/${reviewNo}/${loginUserNo}`);
      
      // 3. API 호출 성공 시, 화면에서 해당 리뷰를 즉시 제거
      setReviews(prevReviews => prevReviews.filter(review => review.reviewNo !== reviewNo));
      
      // 4. 부모 컴포넌트(RecipeDetail)에 리뷰 개수 변경을 알림
      onReviewSubmit();

      alert("리뷰가 삭제되었습니다.");

    } catch (error) {
      console.error("리뷰 삭제 실패:", error);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  // 포토리뷰 삭제
  const handlePhotoReviewDeleted = (deletedReviewNo: number) => {
    setPhotoReviews(prev => prev.filter(review => review.reviewNo !== deletedReviewNo));
    // 부모에게도 리뷰 개수 변경을 알림
    onReviewSubmit(); 
  };

  return (
    <>
      {/* ==================== 모달 영역 (조건부 렌더링) ==================== */}
      {isWriteModalOpen && (
        <WriteReviewModal 
          rcpNo={rcpNo} 
          onClose={() => setIsWriteModalOpen(false)} 
          onReviewSubmit={handleReviewSubmitted}
        />
      )}
      
      {isPhotoModalOpen && photoReviews.length > 0 && (
        <PhotoReviewModal 
          photoReviews={photoReviews}
          initialIndex={selectedPhotoIndex}
          onClose={() => setIsPhotoModalOpen(false)}
          rcpNo={rcpNo}
          loginUserNo={loginUserNo}
          onDeleteReview={handlePhotoReviewDeleted}
        />
      )}

      {/* ==================== 리뷰 섹션 JSX ==================== */}
      <div className={styles.reviews_section}>
        {/* --- 포토리뷰 --- */}
        <div id="photoReview">
          <div className={styles.title_area}>
            <h2>포토리뷰 <span style={{color:'#029D60'}}>{photoReviews.length}</span></h2>
            <button onClick={handleOpenWriteModal}>리뷰작성하기</button>
          </div>
          <hr />
          <div className={styles.photo_container}>
            {photoReviews.slice(0, 4).map((review, index) => (
              <div key={review.reviewNo} className={styles.photo_box} onClick={() => handleOpenPhotoModal(index)}>
                {review.serverName && <img src={review.serverName} alt="포토리뷰" />}
              </div>
            ))}
            <div className={`${styles.photo_box} ${styles.photo_box_add}`} onClick={() => handleOpenPhotoModal(0)} style={{padding:'10px'}}>
              + 더보기<br />{photoReviews.length}
            </div>
          </div>
        </div>
        {/* --- 일반리뷰 --- */}
        <div id="Review">
          <div className={styles.title_area}>
            <h2>리뷰 <span style={{color:'#029D60'}}>{reviewCount}</span></h2>
            <div className={styles.sort_area}>
              <span onClick={() => handleSortChange('latest')} className={sort === 'latest' ? styles.active_sort : ''}>최신순</span> | 
              <span onClick={() => handleSortChange('stars')} className={sort === 'stars' ? styles.active_sort : ''}>별점순</span>
            </div>
          </div>
          <hr />
          <div className={styles.review_container}>
            {reviews.map(review => {
              const isOwner = loginUserNo === review.userInfo.userNo;
              return (
              <div key={review.reviewNo} className={styles.review_item}>
                <img src={review.userInfo.serverName || sampleProfileImg} alt={review.userInfo.username} className={styles.profile_img} />
                <div className={styles.profile_content}>
                  <div className={styles.profile}>
                    <div className={styles.profile_name}>
                      {review.userInfo.sikBti && <SikBti sikBti={review.userInfo.sikBti} style={{fontSize: '11px' }} />}
                      <span className={styles.nickname}>{review.userInfo.username}</span>
                    </div>
                    <div className={styles.stars}>
                      <img src={starIcon} alt="별점" />
                      <span>{review.stars.toFixed(1)}</span>
                    </div>
                    <div className={styles.review_actions}>
                      {isOwner && (
                        <button className={styles.action_btn} onClick={()=>handleDeleteReview(review.reviewNo)}>삭제</button>
                      )}
                      {!isOwner &&(
                      <button className={styles.action_btn}>신고</button>
                      )}
                    </div>
                  </div>
                  <p className={styles.rcp_content}>{review.content}</p>
                  <span className={styles.date}>{new Date(review.reviewDate).toLocaleDateString()}</span>
                </div>
                {review.serverName && <img src={review.serverName} alt="리뷰 사진" className={styles.review_img} />}
              </div>
            );
          }
            )}
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