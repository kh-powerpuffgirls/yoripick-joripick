// import React, 'react';
import React,{ useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

// --- CSS 및 자식 컴포넌트 import ---
import styles from './CommuntiyRecipeDetail.module.css';
import NutrientInfo from './NutrientInfo'; // 기존 NutrientInfo 컴포넌트
import CommunityRecipeDetail_Detail from './CommunityRecipeDetail_Detail'; // 조리순서 컴포넌트
import PhotoReviewModal from './modal/PhotoReview'; // 새로 만들 포토리뷰 모달
import WriteReviewModal from './modal/WriteReview'; // 새로 만들 리뷰작성 모달
import type { Recipe, Review } from '../../../type/Recipe';


// ==========================================================
// 컴포넌트 시작
// ==========================================================
const CommunityRecipeDetail: React.FC = () => {
  // 1. URL 파라미터에서 레시피 ID 가져오기 (예: /community/recipe/123)
  const { recipeId } = useParams<{ recipeId: string }>();

  // 2. State 관리
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photoReviews, setPhotoReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  // 모달 표시 여부 state
  const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
  const [isWriteModalOpen, setWriteModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // [임시] 현재 로그인한 유저 정보 (나중에 실제 로그인 시스템으로 대체)
  const loggedInUser = { user_no: 1, username: '현재로그인유저' };

  // 3. 데이터 로딩 (useEffect)
  useEffect(() => {
    // 레시피 상세 정보 불러오기
    const fetchRecipe = async () => {
      // const response = await axios.get(`/api/recipes/${recipeId}`);
      // setRecipe(response.data);

      // --- 현재는 목(mock) 데이터로 테스트 ---
      setRecipe({
        rcp_no: Number(recipeId),
        userInfo: { user_no: 2, username: '망곰eee', sik_bti: '육식 티라노', image_no: 2, server_name: '/src/assets/sample/profile.png'},
        rcp_name: '매콤팽이버섯',
        rcp_info: '매콤꾸덕 소스와 쫄깃한 팽이의 만남, 초간단 밥도둑 반찬 어때요?',
        created_at: new Date('2025-07-15T08:00:00'),
        image_no :2,
        server_name : '/src/assets/sample/recipe.png',
        views: 50,
        stars : 3.5,
        delete_sataus: 'N',
      });
    };
    
    // 리뷰 목록 불러오기
    const fetchReviews = async (page: number) => {
      // const response = await axios.get(`/api/reviews/${recipeId}?page=${page}&size=5`);
      // const newReviews = response.data.reviews;
      // setReviews(prev => [...prev, ...newReviews]);
      // setHasMoreReviews(response.data.hasMore);

      // --- 현재는 목(mock) 데이터로 테스트 ---
      if (page === 1) { // 첫 페이지만 데이터가 있다고 가정
        const mockReviewsData: Review[] = Array(7).fill(null).map((_, i) => ({
          review_no: i,
          userInfo: { user_no: i === 0 ? 1 : 10 + i, username: `리뷰어${i}`, sik_bti: '잡식 프로틴', image_no: 1 , server_name : '/src/assets/sample/profile.png'},
          stars: 4.5 - (i * 0.5),
          content: `정말 맛있네요! ${i + 1}번째 후기입니다.`,
          server_name: i < 5 ? '/src/assets/sample/recipe.png' : undefined, // 5개만 포토리뷰
          review_date: `2025.09.0${i + 1}`,
          ref_no: 1,
          rcp_source:'comm',
          delete_sataus:'N',
        }));
        setReviews(mockReviewsData);
        setPhotoReviews(mockReviewsData.filter(r => r.server_name));
        setHasMoreReviews(true);
      } else {
        setHasMoreReviews(false); // 2페이지부터는 데이터 없음
      }
    };
    
    fetchRecipe();
    fetchReviews(reviewPage);
  }, [recipeId, reviewPage]);


  // 4. 이벤트 핸들러
  const handleLoadMoreReviews = () => {
    if (hasMoreReviews) {
      setReviewPage(prevPage => prevPage + 1);
    }
  };

  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setPhotoModalOpen(true);
  };
  
  // 리뷰 작성 완료 후 실행될 콜백 함수
  const handleReviewSubmit = () => {
    setWriteModalOpen(false);
    // [중요] 새 리뷰가 추가되었으므로 리뷰 목록을 새로고침해야 함
    setReviewPage(1); // 1페이지부터 다시 로드
    setReviews([]);   // 기존 목록 비우기
  };

  if (!recipe) return <div>레시피 정보를 불러오는 중입니다...</div>;

  return (
    <>
      {/* 모달들은 필요할 때만 렌더링 */}
      {isPhotoModalOpen && (
        <PhotoReviewModal
          reviews={photoReviews}
          initialIndex={selectedPhotoIndex}
          loggedInUser={loggedInUser}
          onClose={() => setPhotoModalOpen(false)}
        />
      )}
      {isWriteModalOpen && (
        <WriteReviewModal
          recipeId={recipe.rcp_no}
          onClose={() => setWriteModalOpen(false)}
          onReviewSubmit={handleReviewSubmit}
        />
      )}

      {/* --- 본문 페이지 --- */}
      <div className={styles.container}>
        
        {/* ... (Detail.html의 head_title, content, basic_info 등 구조를 여기에 JSX로 변환) ... */}
        {/* 예시: 삭제/수정 버튼 */}
        {loggedInUser.user_no === recipe.userInfo.user_no && (
          <div className={styles.user_btn}>
            <button id={styles.action_btn}>삭제하기</button>
            <button id={styles.action_btn}>수정하기</button>
          </div>
        )}

        {/* 작성자 프로필 */}
        <div className={styles.user_report}>
          <Link to={`/profile/${recipe.userInfo.user_no}`} className={styles.writer_profile}>
            <img src="/src/assets/sample/profile.png" id={styles.profile}/>
            <div className={styles.profile_name}>
              <span className={styles.eat_bti}>{recipe.userInfo.sik_bti}</span>
              <span className={styles.nickname}>{recipe.userInfo.username}</span>
            </div>
          </Link>
          <button className={styles.report}>신고하기</button>
        </div>

        {/* 영양성분 정보 (NutrientInfo 컴포넌트 사용) */}
        {/* <NutrientInfo nutrients={recipe.nutrients} /> */}

        {/* 조리순서 (CommunityRecipeDetail_Detail 컴포넌트 사용) */}
        <CommunityRecipeDetail_Detail />
        
        {/* 리뷰 섹션 */}
        <div className={styles.Reviews}>
          {/* 포토리뷰 */}
          <div id={styles.photoReview}>
            <div id={styles.title}>
              <div>포토리뷰 <span>{photoReviews.length}</span></div>
              <button id={styles.write_btn} onClick={() => setWriteModalOpen(true)}>리뷰작성하기</button>
            </div>
            <hr />
            <div className={styles.photo_container}>
              {photoReviews.slice(0, 4).map((review, index) => (
                <div className={styles.photo_box} key={review.review_no} onClick={() => openPhotoModal(index)}>
                  <img src={review.server_name} alt="포토리뷰" />
                </div>
              ))}
              {photoReviews.length > 4 && (
                <div className={styles.photo_box_add} onClick={() => openPhotoModal(0)}>
                  + 더보기<br/>{photoReviews.length}
                </div>
              )}
            </div>
          </div>
          
          {/* 텍스트 리뷰 */}
          <div id={styles.Review}>
            {/* ... 리뷰 목록 헤더 ... */}
            <div className={styles.review_container}>
              {reviews.map(review => (
                <React.Fragment key={review.review_no}>
                  <div id={styles.review}>
                    {/* ... 리뷰 내용, 프로필 등 JSX ... */}
                    {loggedInUser.user_no === review.userInfo.user_no ? (
                      <div>
                        <button className={styles.delete}>삭제</button>
                        <button className={styles.edit}>수정</button>
                      </div>
                    ) : (
                      <button className={styles.report}>신고</button>
                    )}
                  </div>
                  <hr/>
                </React.Fragment>
              ))}
            </div>
            {hasMoreReviews && (
              <div id={styles.add_btn} onClick={handleLoadMoreReviews}>+ 더보기</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityRecipeDetail;