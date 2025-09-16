import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../../../api/authApi';
import type { RecipeDetail } from '../../../type/Recipe';
import type { RootState } from '../../../store/store';

import styles from './RecipeDetail.module.css'; // Detail.css를 모듈로 사용

// 아이콘 
import likeClick from '../../../assets/sample/like_click.png';
import likeUnclick from '../../../assets/sample/like_unclick.png';
import dislikeClick from '../../../assets/sample/dislike_click.png';
import dislikeUnclick from '../../../assets/sample/dislike_unclick.png';

// 자식 컴포넌트
import DetailTable from './DetailTable';
import CookingSteps from './CookingSteps';
import Reviews from './Reviews';

const CommunityRecipeDetail: React.FC = () => {
    // 1. URL에서 현재 레시피의 번호(ID)
    const { rcpNo } = useParams<{ rcpNo: string }>(); 
    
    // 페이지 이동 함수
    const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const navigate = useNavigate();

    // 2. API로부터 받아온 레시피 데이터를 저장할 state
    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 좋아요 상태
    const [myLikeStatus, setMyLikeStatus] = useState<'LIKE' | 'DISLIKE' | null>(null);
    const [likeCount, setLikeCount] = useState(0);

    // 3. 컴포넌트가 처음 렌더링될 때 API를 호출하여 데이터 요청
    useEffect(() => {
        const fetchRecipeDetail = async () => {
        if (!rcpNo) return;
        
        try {
            const url = loginUserNo
                ? `/api/community/recipe/${rcpNo}/${loginUserNo}`
                : `/api/community/recipe/${rcpNo}`;
            
            const response = await api.get(url);
            
            setRecipe(response.data);
            setMyLikeStatus(response.data.myLikeStatus || null);
            setLikeCount(response.data.likeCount);
        } catch (err) {
            setError('레시피 정보를 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
        };
        fetchRecipeDetail();
    }, [rcpNo]); // rcpNo가 바뀔 때마다 데이터를 다시 불러옴

    // ✨ 추가: 좋아요/싫어요 버튼 클릭 핸들러
    const handleLikeClick = async (newStatus: 'LIKE' | 'DISLIKE') => {
        if (!loginUserNo) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }

        // 현재 상태와 같은 버튼을 다시 누르면 '중립' 상태로 변경 (토글 기능)
        const finalStatus = myLikeStatus === newStatus ? 'COMMON' : newStatus;
        
        // 1. UI 즉시 업데이트 (Optimistic UI Update)
        const originalStatus = myLikeStatus;
        const originalCount = likeCount;

        setMyLikeStatus(finalStatus === 'COMMON' ? null : finalStatus);
        if(finalStatus === 'LIKE') {
            setLikeCount(originalStatus === 'LIKE' ? originalCount - 1 : originalCount + 1);
        } else if (finalStatus === 'COMMON' && originalStatus === 'LIKE') {
            setLikeCount(originalCount - 1);
        }

        // 2. 백엔드에 변경사항 전송
        try {
             await api.post(`/api/community/recipe/${rcpNo}/like/${loginUserNo}`, { status: finalStatus });
        } catch (error) {
            // 3. API 호출 실패 시 UI를 원래대로 되돌림
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            setMyLikeStatus(originalStatus);
            setLikeCount(originalCount);
        }
    };

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
            좋아요 <span style={{color: '#FF0000'}}>{likeCount}</span> |
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
            {recipe.mainImage && <img src={recipe.mainImage} alt={recipe.rcpName} />}
            <span>{recipe.rcpInfo}</span>
            </div>
            
            {/* ✨ 1. 재료/영양 테이블 자식 컴포넌트 */}
            <DetailTable recipe={recipe} />

            {/* ✨ 2. 조리 순서 자식 컴포넌트 */}
            <CookingSteps steps={recipe.steps} />

            {/* ==================== 좋아요/싫어요 버튼 ==================== */}
            <div className={styles.Likes}>
                <img 
                    src={myLikeStatus === 'LIKE' ? likeClick : likeUnclick} 
                    height="90px" 
                    alt="좋아요" 
                    onClick={() => handleLikeClick('LIKE')}
                />
                <img 
                    src={myLikeStatus === 'DISLIKE' ? dislikeClick : dislikeUnclick} 
                    height="90px" 
                    alt="싫어요"
                    onClick={() => handleLikeClick('DISLIKE')}
                />
            </div>

            {/* ✨ 3. 리뷰 영역 자식 컴포넌트 */}
            <Reviews rcpNo={recipe.rcpNo} />
        </div>
        </div>
    );
};

export default CommunityRecipeDetail;