import React, { useCallback,useEffect, useState } from 'react';
import card from './RecipeCard.module.css';
import type { RecipeListItem } from '../../../type/Recipe'; // 기존 타입 재활용
import { api } from '../../../api/authApi'; // API 호출용

// 아이콘 import (경로는 실제 위치에 맞게 수정해주세요)
import bookMark_ck from '../../../assets/sample/bookMark_ck.png';
import bookMark_unck from '../../../assets/sample/bookMark_unck.png';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import SikBti from './SikBti';

interface OfficialRecipeCardProps {
  recipe: RecipeListItem;
}

const OfficialRecipeCard: React.FC<OfficialRecipeCardProps> = ({ recipe }) => {
    const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);
    
    // 북마크 상태를 UI에서 즉시 반영하기 위한 state
    const [isBookmarked, setIsBookmarked] = useState(recipe.isBookmarked);
    const [bookmarkCount, setBookmarkCount] = useState(recipe.bookmarkCount);

    // 북마크 상태 가져오기
    const fetchBookmarkStatus = useCallback(async () => {
        if (!loginUserNo) {
            // 로그인 안 된 상태면 isBookmarked 초기값
            setIsBookmarked(false);
            return;
        }
        try {
            const response = await api.get(`/api/recipe/${recipe.rcpNo}/bookmark/${loginUserNo}`);
            
            setIsBookmarked(response.data.bookmarked);
            setBookmarkCount(response.data.bookmarkCount);
        } catch (error) {
            console.error("북마크 처리 실패:", error);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        }
    }, [loginUserNo, recipe.rcpNo]);

    useEffect(() => {
        fetchBookmarkStatus();
    }, [fetchBookmarkStatus]);
    
    // 북마크 클릭 핸들러
    const handleBookmarkClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // 상위 Link 태그의 페이지 이동을 막습니다.

        
        if (!loginUserNo) {
            alert("로그인이 필요한 기능입니다.");
            return;
        }

        try {
            // RecipeDetail과 동일한 API 엔드포인트를 사용합니다.
            const response = await api.post(`/api/recipe/${recipe.rcpNo}/bookmark/${loginUserNo}`);
            
            // API 응답으로 받은 최신 상태로 UI를 업데이트합니다.
            setIsBookmarked(response.data.bookmarked);
            setBookmarkCount(response.data.bookmarkCount);

        } catch (error) {
            console.error("북마크 처리 실패:", error);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        }
    };
    
    return (
        <div className={card.content}>
            <div className={card.imageBox}>
                <img src={recipe.serverName} alt={recipe.rcpName} className={card.thumbnail} />
            </div>
            <div className={card.info_container}>
                <div id={card.info_text}>
                    <div className={card.profile}>
                        {recipe.username==null ? (
                            <div className={card.official_off}>공식</div>
                        ) : (
                            <>
                                <div className={card.official_user}>식구</div> 
                                <div className={card.profile_name}>
                                    {recipe.sikBti && <SikBti sikBti={recipe.sikBti} style={{fontSize: '8px' }} />}
                                    <span className={card.nickname}>{recipe.username}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={card.title}>{recipe.rcpName}</div>
                </div>
                <div className={card.bookMark}>
                    <img 
                        src={isBookmarked ? bookMark_ck : bookMark_unck}  
                        alt="북마크" 
                        onClick={handleBookmarkClick} 
                    />
                    {bookmarkCount} 
                </div>
            </div>
        </div>
    );
};

export default OfficialRecipeCard;