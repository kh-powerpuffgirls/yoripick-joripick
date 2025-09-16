import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../../../api/authApi';
import type { RecipeDetail } from '../../../type/Recipe';
import type { RootState } from '../../../store/store';

import styles from './RecipeDetail.module.css'; // Detail.css를 모듈로 사용

// 아이콘 및 자식 컴포넌트 import
import likeIcon from '../../../assets/sample/like_unclick.png';
import dislikeIcon from '../../../assets/sample/dislike_unclick.png';
import DetailTable from './DetailTable';
import CookingSteps from './CookingSteps';
import Reviews from './Reviews';

const RecipeDetail: React.FC = () => {
    // 1. URL에서 현재 레시피의 번호(ID)를 가져옵니다. (예: /recipe/123)
    const { rcpNo } = useParams<{ rcpNo: string }>(); 
    
    // 페이지 이동 함수
    const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const navigate = useNavigate();

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

    // 삭제 버튼 클릭 시 실행될 핸들러 함수
    const handleDelete = async () => {
        if (window.confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
            try {
            await api.delete(`/api/recipes/${rcpNo}`);
            alert('레시피가 삭제되었습니다.');
            navigate('/community/recipes'); // 목록 페이지로 이동
        } catch (err) {
            alert('삭제에 실패했습니다.');
        }
        }
    };

    // 수정 버튼 클릭 시 실행될 핸들러 함수
    const handleEdit = () => {
        navigate(`/community/recipe/edit/${rcpNo}`);
    };

     // 로딩 중일 때
    if (isLoading) {
    return <div>레시피를 불러오는 중입니다...</div>;
    }

    // 에러 발생 시
    if (error || !recipe) {
    return <div>{error || '레시피를 찾을 수 없습니다.'}</div>;
    }

    //로그인유저, 작성자 같은지 확인
    const isOwner = loginUserNo === recipe.writer.userNo;

   

    // 4. 데이터 로딩 완료 후 화면 렌더링
    return (
        <div className={styles.container}>
        {/* ==================== 상단 헤더 ==================== */}
        <div className={styles.head_title}>
            <div className={styles.approval_star}>
            <div>{recipe.isOfficial ? '공식' : '식구'}</div>
            <span>★{(recipe.avgStars || 0).toFixed(1)}</span>
            </div>
            <span style={{fontWeight: 'bold', fontSize: '50px'}}>{recipe.rcpName}</span>
            <span style={{fontSize: '20px', color: '#636363'}}>{new Date(recipe.createdAt).toLocaleString()}</span>
            <div className={styles.other_info}>
            좋아요 <span style={{color: '#FF0000'}}>{recipe.likeCount}</span> |
            리뷰 <span style={{color: '#009626'}}>{recipe.reviewCount}</span> |
            조회수 <span style={{color: '#009626'}}>{recipe.views}</span>
            </div>
        </div>

        <div className={styles.content}>
                {/* 로그인유저가 작성자랑 같을때만 랜더링 */}
                {isOwner && (
                <div className={styles.user_btn}>
                    <button id={styles.action_btn} onClick={handleDelete}>삭제하기</button>
                    <button id={styles.action_btn} onClick={handleEdit}>수정하기</button>
                </div>
                )}
            {/* ==================== 대표 이미지 및 소개 ==================== */}
            <div className={styles.basic_info}>
            {recipe.mainImage && <img src={`/images/${recipe.mainImage}`} alt={recipe.rcpName} />}
            <span>{recipe.rcpInfo}</span>
            </div>
            
            {/* ✨ 1. 재료/영양 테이블 자식 컴포넌트 */}
            <DetailTable recipe={recipe} />

            {/* ✨ 2. 조리 순서 자식 컴포넌트 */}
            <CookingSteps steps={recipe.steps} />

            {/* ==================== 좋아요/싫어요 버튼 ==================== */}
            <div className={styles.Likes}>
            <img src={likeIcon} height="90px" alt="좋아요" />
            <img src={dislikeIcon} height="90px" alt="싫어요" />
            </div>

            {/* ✨ 3. 리뷰 영역 자식 컴포넌트 */}
            <Reviews rcpNo={recipe.rcpNo} />
        </div>
        </div>
    );
};

export default RecipeDetail;