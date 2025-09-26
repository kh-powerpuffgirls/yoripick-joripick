import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useMatch } from 'react-router-dom';
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
import bookMark_ck from '../../../assets/sample/bookMark_ck.png';
import bookMark_unck from '../../../assets/sample/bookMark_unck.png';

// 자식 컴포넌트
import DetailTable from './DetailTable';
import CookingSteps from './CookingSteps';
import Reviews from './Reviews';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';

// 신고 모달 인터페이스
interface ModalState {
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

interface ReportOption {
  reportType: string;
  category: string;
  detail: string;
}

export interface ReportTargetInfo {
  author: string;
  title: string;
  category: string;
  refNo: number;
}

const CommunityRecipeDetail: React.FC = () => {
    // 1. URL에서 현재 레시피의 번호(ID)
    const { rcpNo } = useParams<{ rcpNo: string }>(); 
    const loginUserNo = useSelector((state: RootState) => state.auth.user?.userNo);
    const navigate = useNavigate();
    const isCommunityRecipe = useMatch('/community/recipe/:rcpNo');

    // 2. API로부터 받아온 레시피 데이터를 저장할 state
    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 좋아요 상태
    const [myLikeStatus, setMyLikeStatus] = useState<'LIKE' | 'DISLIKE' | null>(null);
    const [likeCount, setLikeCount] = useState(0);

    // 북마크 상태
    const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
    const [bookmarkCount, setBookmarkCount] = useState(0);

    // 신고 상태
    const [modal, setModal] = useState<ModalState | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
    const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
    
    // 3. 컴포넌트가 처음 렌더링될 때 API를 호출하여 데이터 요청
    const fetchRecipeDetail = useCallback(async () => {
        if (!rcpNo) return;
        
        try {
            let url = '';

            if (isCommunityRecipe) {
                url = loginUserNo
                    ? `/api/community/recipe/${rcpNo}/${loginUserNo}`
                    : `/api/community/recipe/${rcpNo}`;
                } else {
                    url = loginUserNo
                    ? `/api/recipe/detail/${rcpNo}/${loginUserNo}`
                    : `/api/recipe/detail/${rcpNo}`;
                }
                
                
            const response = await api.get(url);
            setRecipe(response.data);

            if (response.data.isBookmarked !== undefined) {
                setIsBookmarked(response.data.isBookmarked); 
            }

            if (response.data.myLikeStatus !== undefined) {
                setMyLikeStatus(response.data.myLikeStatus || null);
            }

            setBookmarkCount(response.data.bookmarkCount || 0);
            setLikeCount(response.data.likeCount || 0);
        } catch (err) {
            setError('레시피 정보를 불러오는 데 실패했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [rcpNo, loginUserNo, isCommunityRecipe]); 

    //useEffect는 fetchRecipeDetail 함수를 호출하는 역할
    useEffect(() => {
        fetchRecipeDetail();
    }, [fetchRecipeDetail]);

    //  좋아요/싫어요 버튼 클릭 핸들러
    const handleLikeClick = async (newStatus: 'LIKE' | 'DISLIKE') => {
        if (!loginUserNo) {
            alert('로그인이 필요한 기능입니다.');
            return;
        }
        const finalStatus = myLikeStatus === newStatus ? 'COMMON' : newStatus;
        try {
            await api.post(`/api/community/recipe/${rcpNo}/like/${loginUserNo}`, { status: finalStatus });            
            fetchRecipeDetail();
        } catch (error) {
            alert('오류가 발생했습니다. 다시 시도해주세요.');
            // 실패 시에는 별도 처리 없이 다음 fetchRecipeDetail 호출 시 동기화되므로 UI 복원 코드가 필요 없습니다.
        }
    };

    // 북마크 버튼 클릭 핸들러
     const handleBookmarkClick = async () => {
        if (!loginUserNo) {
            alert("로그인이 필요한 기능입니다.");
            return;
        }
        try {
            // 북마크 토글 API 호출
            const response = await api.post(`/api/recipe/${rcpNo}/bookmark/${loginUserNo}`);
            // API 응답으로 받은 최신 북마크 상태로 UI를 업데이트
            setIsBookmarked(response.data.bookmarked);
            setBookmarkCount(response.data.bookmarkCount);
            
        } catch (error) {
            console.error("북마크 처리 실패:", error);
            alert("오류가 발생했습니다.");
        }
    };

    // 신고
    const openModal = (modalData: ModalState) => setModal(modalData);
    const closeModal = () => setModal(null);
    const handleModalConfirm = () => {
        modal?.onConfirm?.();
        closeModal();
    };

    const fetchReportOptions = async (category: string) => {
      try {
        const res = await api.get<ReportOption[]>(`/community/report/types`);
        const filteredOptions = res.data.filter(option => option.category === category);
        setReportOptions(filteredOptions);
      } catch (err) {
        console.error('신고 유형 조회 오류:', err);
        openModal({ message: '신고 유형 조회에 실패했습니다.', showCancel: false });
        setReportOptions([]);
      }
    };
  
    const handleReportClick = async (targetInfo: ReportTargetInfo) => {
      if (!loginUserNo) {
        openModal({ message: '로그인 후 이용 가능합니다.', showCancel: false });
        return;
      }
      if (loginUserNo === targetInfo.refNo) {
        openModal({ message: '자신이 작성한 게시물은 신고할 수 없습니다.', showCancel: false });
        return;
      }
  
      setReportTargetInfo(targetInfo);
      await fetchReportOptions(targetInfo.category);
      setIsReportModalOpen(true);
    };
    
    // 신고
    const handleReportSubmit = async (reportType: string, content: string, refNo: number, refType: string) => {
      try {
        await api.post(`/community/report`, { reportType, content, refNo, refType });
        openModal({ message: '신고가 접수되었습니다.', showCancel: false });
        setIsReportModalOpen(false);
        setReportTargetInfo(null);
      } catch (err: any) {
        console.error('신고 처리 오류:', err.response?.data?.message || err.message);
        openModal({ message: err.response?.data?.message || '신고 처리에 실패했습니다.', showCancel: false });
        setIsReportModalOpen(false);
        setReportTargetInfo(null);
      }
    };

    // 삭제 버튼 클릭 시 실행될 핸들러 함수
    const handleDelete = async () => {
        if (window.confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/community/recipe/${rcpNo}`);
                alert('레시피가 삭제되었습니다.');
                navigate('/community/recipe'); // 목록 페이지 경로 확인
            } catch (err) {
                alert('삭제에 실패했습니다.');
            }
        }
    };

    // 수정 버튼 클릭 시 실행될 핸들러 함수
    const handleEdit = () => {
        navigate(`/community/recipe/edit/${rcpNo}`);
    };

    if (isLoading) {
        return <div>레시피를 불러오는 중입니다...</div>;
    }

    if (error || !recipe) {
        return <div>{error || '레시피를 찾을 수 없습니다.'}</div>;
    }

    const isOwner = loginUserNo === recipe.writer?.userNo;

    // 4. 데이터 로딩 완료 후 화면 렌더링
    return (
        <>
            {/* 신고 */}
            {modal && <CommunityModal message={modal.message} onConfirm={handleModalConfirm} onClose={closeModal} showCancel={modal.showCancel} />}
            {isReportModalOpen && reportTargetInfo && (
                <ReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    onSubmit={handleReportSubmit}
                    reportOptions={reportOptions}
                    targetInfo={reportTargetInfo}
                />
            )}
            <div className={styles.container}>

            {/* ==================== 상단 헤더 ==================== */}
            <div className={styles.head_title}>
                <div className={styles.approval_star}>
                <div>{recipe.writer == null  ? '공식' : '식구'}</div>
                <span>★{(recipe.avgStars || 0).toFixed(1)}</span>
                </div>
                <span style={{fontWeight: 'bold', fontSize: '50px'}}>{recipe.rcpName}</span>
                <span style={{fontSize: '20px', color: '#636363'}}>
                    { recipe.writer &&(
                        new Date(recipe.createdAt).toLocaleString()
                    ) }
                    {recipe.updatedAt && (
                        <span style={{ marginLeft: '10px' }}>
                        | (수정){new Date(recipe.updatedAt).toLocaleString()}
                        </span>
                    )}
                </span>
                <div className={styles.other_info}>
                    {recipe.isOfficial ? (
                        <>
                        북마크 <span style={{color: '#ff0000ff'}}>{bookmarkCount}</span> |
                        </>
                    ) : (
                        <>
                        좋아요 <span style={{color: '#FF0000'}}>{likeCount}</span> |
                        </>
                    )}
                    리뷰 <span style={{color: '#009626'}}>{recipe.reviewCount}</span> |
                    조회수 <span style={{color: '#009626'}}>{recipe.views}</span>
                </div>
            </div>

            <div className={styles.content}>

                {recipe.isOfficial && isBookmarked !== null && (
                    // 1. 공식 레시피일 경우: 북마크 버튼을 표시합니다.
                    <div className={styles.bookMark}>
                        <img 
                            src={isBookmarked ? bookMark_ck : bookMark_unck} 
                            alt="북마크"
                            onClick={handleBookmarkClick}
                        />
                        {bookmarkCount}
                    </div>
                )}
                
                {/* 사용자 레시피의 수정/삭제 버튼 */}
                {(!recipe.isOfficial && isOwner) && (
                    <div className={styles.user_btn}>
                        <button id={styles.action_btn} onClick={handleDelete}>삭제하기</button>
                        <button id={styles.action_btn} onClick={handleEdit}>수정하기</button>
                    </div>
                )}
                <div className={styles.basic_info}>
                    {recipe.mainImage && <img src={recipe.mainImage} alt={recipe.rcpName} />}
                <span>{recipe.rcpInfo}</span>
                </div>
                
                {/* ✨ 1. 재료/영양 테이블 자식 컴포넌트 */}
                <DetailTable recipe={recipe} onReportClick={handleReportClick} /> 
                {/* ✨ 2. 조리 순서 자식 컴포넌트 */}
                <CookingSteps steps={recipe.steps} />
                {/* ==================== 좋아요/싫어요 버튼 ==================== */}
                { !recipe.isOfficial&&(
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
                )}

                {/* ✨ 3. 리뷰 영역 자식 컴포넌트 */}
                <Reviews rcpNo={recipe.rcpNo} onReviewSubmit={fetchRecipeDetail} reviewCount={recipe.reviewCount} onReportClick={handleReportClick} />
            </div>
        </div>
        </>
    );
};
export default CommunityRecipeDetail;