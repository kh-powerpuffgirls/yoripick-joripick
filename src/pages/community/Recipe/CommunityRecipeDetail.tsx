import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { api } from '../../../api/authApi';
import type { RootState } from '../../../store/store';
import type { RecipeDetail, Review } from '../../../type/Recipe'; // Review 타입 추가

// --- CSS 및 자식 컴포넌트 import ---
import styles from './CommuntiyRecipeDetail.module.css'; // 새로 만들 CSS 모듈
import CommunityHeader from '../Header/CommunityHeader';
import NutrientInfo from './NutrientInfo'; // 기존 NutrientInfo 컴포넌트
import CommunityRecipeDetail_Detail from './CommunityRecipeDetail_Detail'; // 기존 조리순서 컴포넌트
import WriteReviewModal from './modal/WriteReviewModal'; // 리뷰 작성 모달
import PhotoReviewModal from './modal/PhotoReview'; // 포토 리뷰 모달
import SikBti from './SikBti'; // SikBti 컴포넌트

// --- 아이콘 이미지 import ---
import userIcon from '../../../assets/sample/profile.png';
import viewsIcon from '../../../assets/sample/눈 아이콘.png';
import starIcon from '../../../assets/sample/star.png';
import reportIcon from '../../../assets/sample/신고아이콘_회색.png';
import like from '../../../assets/sample/like_unclick.png';
import like_ck from '../../../assets/sample/like_click.png';
import dislike from '../../../assets/sample/dislike_unclick.png';
import dislike_ck from '../../../assets/sample/dislike_click.png';

const CommunityRecipeDetail: React.FC = () => {
    // --- 기본 상수 선언 ---
    const { rcpNo } = useParams<{ rcpNo: string }>();
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    // --- State 관리 ---
    const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [photoReviews, setPhotoReviews] = useState<Review[]>([]);
    
    const [isLiked, setIsLiked] = useState(false);

    const [likeStatus, setLikeStatus] = useState<'LIKE' | 'DISLIKE' | 'COMMON'>('COMMON');
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    
    // 모달 State
    const [isWriteModalOpen, setWriteModalOpen] = useState(false);
    const [isPhotoModalOpen, setPhotoModalOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

    // --- 데이터 로딩 useEffect ---
    const fetchRecipeData = async () => {
        if (!rcpNo) return;
        setIsLoading(true);
        try {
            const params = { userNo: user ? user.userNo : 0 };
            const [recipeRes, reviewRes] = await Promise.all([
                api.get(`/api/community/recipe/${rcpNo}`, { params }),
                api.get(`/api/reviews/recipe/${rcpNo}`)
            ]);

            setRecipe(recipeRes.data);

            setLikeCount(recipeRes.data.likeCount);
            setIsLiked(recipeRes.data.isLiked);

            setReviews(reviewRes.data);
            setPhotoReviews(reviewRes.data.filter((r: Review) => r.serverName));
            setError(null);
        } catch (err) {
            console.error("데이터를 불러오는 데 실패했습니다.", err);
            setError("레시피 정보를 불러올 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipeData();
    }, [rcpNo,user]);
    
    // --- 이벤트 핸들러 ---
    const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 1. UI 즉시 업데이트 (Optimistic Update)
        setIsLiked(prev => !prev);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            // 2. 서버에 API 요청
            const response = await api.post(`/api/community/recipe/${rcpNo}/like`);
            
            // 3. 서버의 최신 데이터로 다시 상태 업데이트
            setLikeCount(response.data.likeCount);
            setIsLiked(response.data.isLiked);
        } catch (error) {
            console.error('좋아요 처리 실패:', error);
            alert('요청에 실패했습니다. 다시 시도해주세요.');
            // 4. 실패 시 UI 원래대로 복구
            setIsLiked(prev => !prev);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleReviewSubmit = () => {
        setWriteModalOpen(false);
        fetchRecipeData(); // 리뷰 목록 새로고침
    };

    const openPhotoModal = (index: number) => {
        setSelectedPhotoIndex(index);
        setPhotoModalOpen(true);
    };

    const handleDeleteRecipe = async () => {
        if (window.confirm('정말로 레시피를 삭제하시겠습니까?')) {
            try {
                await api.delete(`/api/community/recipe/${rcpNo}`);
                alert('레시피가 삭제되었습니다.');
                navigate('/community/recipe');
            } catch (err) {
                console.error('레시피 삭제 실패:', err);
                alert('레시피 삭제에 실패했습니다.');
            }
        }
    };


    // --- 로딩 및 에러 처리 ---
    if (isLoading) {
        return <><CommunityHeader /><div className={styles.loading}>레시피를 불러오는 중입니다...</div></>;
    }
    if (error) {
        return <><CommunityHeader /><div className={`${styles.loading} ${styles.error}`}>{error}</div></>;
    }
    if (!recipe) {
        return <><CommunityHeader /><div className={styles.loading}>해당 레시피를 찾을 수 없습니다.</div></>;
    }

    const writerProfileImage = recipe.writer.serverName || userIcon;

    return (
        <>
            <CommunityHeader />
            
            {/* --- 모달 영역 --- */}
            {isWriteModalOpen && (
                <WriteReviewModal
                    rcpNo={Number(rcpNo)}
                    onClose={() => setWriteModalOpen(false)}
                    onReviewSubmit={handleReviewSubmit}
                />
            )}
            {isPhotoModalOpen && photoReviews.length > 0 && (
                 <PhotoReviewModal
                    photoReviews={photoReviews}
                    initialIndex={selectedPhotoIndex}
                    onClose={() => setPhotoModalOpen(false)}
                />
            )}

            {/* --- 본문 페이지 --- */}
            <div className={styles.main}>
                <div className={styles.container}>
                    {/* --- 레시피 제목, 소개, 태그 --- */}
                    <div className={styles.intro_card}>
                        <h1>{recipe.rcpName}</h1>
                        <p>{recipe.rcpInfo}</p>
                        <div className={styles.tags}>
                            {recipe.tag?.split('#').filter(t => t).map((t, i) => <span key={i} className={styles.tag}>#{t}</span>)}
                        </div>
                    </div>

                    {/* --- 작성자 정보 및 관리 버튼 --- */}
                    <div className={styles.writer_card}>
                        <Link to={`/profile/${recipe.writer.userNo}`} className={styles.writer_profile}>
                            <img src={writerProfileImage} alt={recipe.writer.username} />
                            <div>
                                {recipe.writer.sik_bti && <SikBti sikBti={recipe.writer.sik_bti} />}
                                <span className={styles.nickname}>{recipe.writer.username}</span>
                            </div>
                        </Link>
                        <div className={styles.meta_and_actions}>
                            <div className={styles.recipe_meta}>
                                <span>작성일: {new Date(recipe.createdAt).toLocaleDateString()}</span>
                                <span><img src={viewsIcon} alt="조회수"/>{recipe.views}</span>
                                <span><img src={starIcon} alt="평점"/>{recipe.avgStars.toFixed(1)}</span>
                            </div>
                             {user?.userNo === recipe.writer.userNo ? (
                                <div className={styles.action_buttons}>
                                    <button onClick={() => navigate(`/community/recipe/edit/${rcpNo}`)}>수정</button>
                                    <button onClick={handleDeleteRecipe}>삭제</button>
                                </div>
                            ) : (
                                <button className={styles.report_button}><img src={reportIcon} alt="신고"/>신고</button>
                            )}
                        </div>
                    </div>
                    
                    {/* --- 대표이미지 및 요리 정보 --- */}
                    <div className={styles.main_visual}>
                        <img src={recipe.mainImage} alt={recipe.rcpName} className={styles.main_image} />
                    </div>

                    {/* --- 재료 & 영양성분 --- */}
                    <div className={styles.card}>
                        <h2>재료 및 영양 정보</h2>
                        <div className={styles.ingredient_nutrient_grid}>
                             <div className={styles.section_title}>재료 ({recipe.ingredients.length})</div>
                             <table className={styles.ing_table}>
                                <tbody>
                                    {Array.from({ length: Math.ceil(recipe.ingredients.length / 2) }).map((_, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {[0, 1].map(colIndex => {
                                                const item = recipe.ingredients[rowIndex * 2 + colIndex];
                                                return (
                                                    <td key={item ? `${item.ingName}-${rowIndex}` : `empty-${colIndex}`}>
                                                        {item && (
                                                            <div className={styles.ing_item}>
                                                                <span>{item.ingName}</span>
                                                                <span className={styles.ing_qty}>{item.quantity} ({item.weight}g)</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className={styles.section_title}>총 영양성분</div>
                            <NutrientInfo nutrients={recipe.totalNutrient} />
                        </div>
                    </div>

                    {/* --- 조리 순서 --- */}
                    <div className={styles.card}>
                        {/* API로 받은 step 데이터를 props로 넘겨주어야 합니다. */}
                        <CommunityRecipeDetail_Detail steps={recipe.steps} />
                    </div>

                    {/* ✅ 좋아요 버튼 및 카운트 표시 */}
                    <button className={styles.like_button} onClick={handleLike}>
                        <img src={isLiked ? like : like_ck} alt="좋아요"/>
                        <span>{likeCount}</span>
                    </button>

                    {/* --- 리뷰 섹션 --- */}
                    <div className={styles.card}>
                        <div className={styles.review_header}>
                            <h2>리뷰 <span className={styles.highlight}>{reviews.length}</span></h2>
                            <button className={styles.write_review_btn} onClick={() => setWriteModalOpen(true)}>리뷰 작성하기</button>
                        </div>
                        {/* 포토 리뷰 */}
                        {photoReviews.length > 0 && (
                            <div className={styles.photo_review_section}>
                                <div className={styles.section_title}>포토리뷰</div>
                                <div className={styles.photo_container}>
                                    {photoReviews.slice(0, 4).map((review, index) => (
                                        <div className={styles.photo_box} key={review.reviewNo} onClick={() => openPhotoModal(index)}>
                                            <img src={review.serverName} alt="포토리뷰" />
                                        </div>
                                    ))}
                                    {photoReviews.length > 4 && (
                                        <div className={styles.photo_box_add} onClick={() => openPhotoModal(0)}>
                                            +{photoReviews.length - 4} 더보기
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* 전체 리뷰 */}
                        <div className={styles.review_list}>
                            {reviews.length > 0 ? reviews.map(review => (
                                <div className={styles.review_item} key={review.reviewNo}>
                                    <div className={styles.review_writer}>
                                        <img src={review.userInfo.serverName || userIcon} alt={review.userInfo.username}/>
                                        <div>
                                            {review.userInfo.sik_bti && <SikBti sikBti={review.userInfo.sik_bti}/>}
                                            <span>{review.userInfo.username}</span>
                                        </div>
                                    </div>
                                    <div className={styles.review_content}>
                                        <div className={styles.review_meta}>
                                            <div className={styles.stars}>
                                                <img src={starIcon} alt="별점"/> {review.stars.toFixed(1)}
                                            </div>
                                            <span>{new Date(review.reviewDate).toLocaleDateString()}</span>
                                        </div>
                                        <p>{review.content}</p>
                                    </div>
                                    {review.serverName && <img src={review.serverName} alt="리뷰사진" className={styles.review_photo}/>}
                                </div>
                            )) : <p className={styles.no_review}>아직 작성된 리뷰가 없습니다. 첫 리뷰를 작성해보세요!</p>}
                        </div>
                    </div>

                    <button className={styles.back_button} onClick={() => navigate('/community/recipe')}>목록으로</button>

                </div>
            </div>
        </>
    );
};

export default CommunityRecipeDetail;