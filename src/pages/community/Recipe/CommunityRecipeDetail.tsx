import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // URL에서 레시피 번호(rcpNo)를 가져오기 위함
import { api } from '../../../api/authApi';
import type { RecipeDetail } from '../../../type/Recipe';

import styles from './CommuntiyRecipeDetail.module.css'; // ✨ CSS 모듈 사용

// 샘플 아이콘 
import likeIcon from '../../../assets/sample/like_unclick.png';
import dislikeIcon from '../../../assets/sample/dislike_unclick.png';

// 자식 컴포넌트들 
import DetailTable from './DetailTable';
import CookingSteps from './CookingSteps';
import Reviews from './Reviews';

const CommunityRecipeDetail: React.FC = () => {
  // 1. URL에서 현재 레시피의 번호(ID)를 가져옵니다.
  const { rcpNo } = useParams<{ rcpNo: string }>(); 
  
  // 2. API로부터 받아온 레시피 데이터를 저장할 state
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. 컴포넌트가 처음 렌더링될 때 API를 호출하여 데이터 요청
  useEffect(() => {
    const fetchRecipeDetail = async () => {
      if (!rcpNo) return;
      
      try {
        // 백엔드에 /api/recipes/{rcpNo} 주소로 데이터 요청
        const response = await api.get(`/api/recipes/${rcpNo}`);
        setRecipe(response.data);
      } catch (err) {
        setError('레시피 정보를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetail();
  }, [rcpNo]); // rcpNo가 바뀔 때마다 데이터를 다시 불러옴

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return <div>레시피를 불러오는 중입니다...</div>;
  }

  // 에러 발생 시 표시할 UI
  if (error || !recipe) {
    return <div>{error || '레시피를 찾을 수 없습니다.'}</div>;
  }
  
  // 4. 데이터 로딩이 끝나면 화면을 그립니다.
  return (
    <div className={styles.container}>
      {/* ==================== 상단 헤더 ==================== */}
      <div className={styles.head_title}>
        <div className={styles.approval_star}>
          <div>{recipe.isOfficial ? '공식' : '식구'}</div>
          <span>★{recipe.avgStars.toFixed(1)}</span>
        </div>
        <span className={styles.rcp_name}>{recipe.rcpName}</span>
        <span className={styles.created_at}>
          {new Date(recipe.createdAt).toLocaleString()}
        </span>
        <div className={styles.other_info}>
          좋아요 {recipe.likeCount} | 리뷰 {recipe.reviewCount} | 조회수 {recipe.views}
        </div>
      </div>

      <div className={styles.content}>
        {/* ==================== 대표 이미지 및 소개 ==================== */}
        <div className={styles.basic_info}>
          <img src={recipe.mainImage} alt={recipe.rcpName} />
          <span>{recipe.rcpInfo}</span>
        </div>
        
        {/* ==================== 작성자 정보 및 재료/영양 테이블 ==================== */}
        {/* 복잡한 테이블 부분은 별도 컴포넌트로 분리 */}
        <DetailTable recipe={recipe} />

        {/* ==================== 조리 순서 ==================== */}
        {/* 조리 순서 부분도 별도 컴포넌트로 분리 */}
        <CookingSteps steps={recipe.steps} />

        {/* ==================== 좋아요/싫어요 버튼 ==================== */}
        <div className={styles.Likes}>
          <img src={likeIcon} alt="좋아요" />
          <img src={dislikeIcon} alt="싫어요" />
        </div>

        {/* ==================== 리뷰 영역 ==================== */}
        {/* 리뷰 영역도 별도 컴포넌트로 분리 */}
        <Reviews rcpNo={recipe.rcpNo} />
      </div>
    </div>
  );
};

export default CommunityRecipeDetail;