
// src/pages/CommunityRecipeList/CommunityRecipeList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate,useMatch } from 'react-router-dom';

// import './CommunityList.css'; // 페이지 전용 CSS
import list from './CommunityList.module.css'; 

// 샘플 아이콘 import
import rankingIcon from '../../../assets/sample/순위아이콘.png';
import crown1 from '../../../assets/sample/1등 왕관.png';
import crown2 from '../../../assets/sample/2등 왕관.png';
import crown3 from '../../../assets/sample/3등 왕관.png';
import crown4 from '../../../assets/sample/4등 왕관.png';
import CommunityHeader from '../Header/CommunityHeader';
import CommunitySidebar from '../Sidebar/CommunitySidebar';
import RecipeCard from './RecipeCard';

import type {  RecipeListItem, RecipePage } from '../../../type/Recipe';
import RcpPagination from '../Sidebar/RcpPagination';
import {api} from '../../../api/authApi';
import OfficialRecipeCard from './OfficialRecipeCard';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';

// API 파라미터 타입을 정의합니다. (선택적 프로퍼티로)
interface ApiParams {
  page?: number;
  sort?: string;
  ingredients?: string;
  rcpMthNo?: string;
  rcpStaNo?: string;
}

const CommunityRecipeList: React.FC = () => {
    const navigate = useNavigate();
    const userNo = useSelector((state: RootState) => state.auth?.user?.userNo);
    
    const isOfficialListPage = useMatch('/api/recipe');

    // 공식 레시피 랭킹 state
    const [officialRankingRecipes, setOfficialRankingRecipes] = useState<RecipeListItem[]>([]);
    const [rankingRecipes, setRankingRecipes] = useState<RecipeListItem[]>([]); 
    
    // 상태 관리
    const [recipePage, setRecipePage] = useState<RecipePage>({
      recipes: [], totalPages: 0, totalElements: 0,
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams, setSearchParams] = useState<ApiParams>({
        page: 0, 
        sort: isOfficialListPage ? 'bookmarks_desc' : 'createdAt',
    });

    // API 호출 함수
    const fetchRecipes = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = isOfficialListPage ? `/api/recipe/${userNo}` : '/api/community/recipe';
            const response = await api.get(endpoint, { params: searchParams });

            setRecipePage(response.data);
        } catch (error) {
            console.error("레시피 데이터를 불러오는데 실패했습니다.", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchParams,  isOfficialListPage]);

    // searchParams가 변경될 때마다 레시피 목록을 다시 불러옴
    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    // 랭킹 레시피는 페이지 로드 시 한 번만 불러옴
    useEffect(() => {
        const fetchRanking = async () => {
            if (isOfficialListPage) {
                // 공식 레시피 페이지일 경우
                try {
                    const response = await api.get('/api/recipe/ranking'); 
                    setOfficialRankingRecipes(response.data);
                } catch (error) {
                    console.error("공식 랭킹 레시피를 불러오는데 실패했습니다.", error);
                }
            } else {
                try {
                    const response = await api.get('/api/community/recipe/ranking');
                    setRankingRecipes(response.data);
                } catch (error) {
                    console.error("랭킹 레시피를 불러오는데 실패했습니다.", error);
                }
            }
        };
        fetchRanking();
    }, [isOfficialListPage]);

    const handleSort = (sortType: string) => {
        setSearchParams(prev => ({ ...prev, sort: sortType, page: 0 }));
    };

    // 이벤트 핸들러
    const handleSearch = (sidebarParams: Omit<ApiParams, 'sort' | 'page'>) => {
        setSearchParams(prev => ({ ...prev, ...sidebarParams, page: 0 }));
    };

    const handlePageChange = (page: number) => {
        setSearchParams(prev => ({ ...prev, page: page - 1 }));
    };

    return (
        <>
            {!isOfficialListPage &&
                <CommunityHeader />
            }
            <div className={list.main}>
                <CommunitySidebar isOfficial={!!isOfficialListPage}  onSearch={handleSearch} />
                <div className={list.container}>
                    { isOfficialListPage ?(
                        // 공식 레시피 "금주 Pick!"
                        <table className={list.ranking}>
                            <thead>
                                <tr><th colSpan={4}>
                                    <div className={list.ranking_title}>
                                        <img src={rankingIcon} height='50px' width='50px' alt="랭킹 아이콘" />
                                        인기 Pick!
                                    </div>
                                </th></tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {officialRankingRecipes.map((recipe, index) => (
                                        <td key={`rank-${recipe.rcpNo}`}>
                                            {index === 0 && <img src={crown1} id={list.crown} alt="1등" />}
                                            {index === 1 && <img src={crown2} id={list.crown} alt="2등" />}
                                            {index === 2 && <img src={crown3} id={list.crown} alt="3등" />}
                                            {index === 3 && <img src={crown4} id={list.crown} alt="4등" />}
                                            <Link to={`/recipe/${recipe.rcpNo}`} style={{ textDecoration: 'none' }}>
                                                <OfficialRecipeCard recipe={recipe} />
                                            </Link>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    ): (
                        <>
                            <button className={list.write} onClick={() => navigate('/community/recipe/write')}>레시피 작성하기</button>
                            <table className={list.ranking}>
                                <thead>
                                    <tr>
                                        <th colSpan={4}>
                                            <div className={list.ranking_title}>
                                                <img src={rankingIcon} height='50px' width='50px' alt="랭킹 아이콘" />
                                                금주 Pick!
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {rankingRecipes.map((recipe, index) => (
                                            <td key={`rank-${recipe.rcpNo}`}>
                                                {index === 0 && <img src={crown1} id={list.crown} alt="1등" />}
                                                {index === 1 && <img src={crown2} id={list.crown} alt="2등" />}
                                                {index === 2 && <img src={crown3} id={list.crown} alt="3등" />}
                                                {index === 3 && <img src={crown4} id={list.crown} alt="4등" />}
                                                <Link to={`/community/recipe/${recipe.rcpNo}`} style={{ textDecoration: 'none' }}>
                                                    <RecipeCard recipe={recipe} />
                                                </Link>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                    


                    <br />

                    {/* 전체 레시피 리스트 섹션 */}
                    <div className={list.list}>
                        <div className={list.list_header}>
                            {isOfficialListPage ? (
                                <>
                                    <div className={searchParams.sort === 'bookmarks_desc' ? list.active_sort : ''} onClick={() => handleSort('bookmarks_desc')}>북마크⬆</div>
                                    <div className={searchParams.sort === 'bookmarks_asc' ? list.active_sort : ''} onClick={() => handleSort('bookmarks_asc')}>북마크⬇</div>
                                </>
                            ) : (
                                <>
                                    <div className={searchParams.sort === 'createdAt' ? list.active_sort : ''} onClick={() => handleSort('createdAt')}>최신순</div>
                                    <div className={searchParams.sort === 'stars' ? list.active_sort : ''} onClick={() => handleSort('stars')}>별점순</div>
                                </>
                            )}
                        </div>
                        
                        <hr />
                        <div className={list.content_container}>
                            {isLoading ? (
                                <p style={{textAlign: 'center', fontSize:'18px', color:'#888'}}>레시피를 불러오는 중입니다...</p>
                            ) : recipePage && recipePage.recipes && recipePage.recipes.length > 0 ? (
                                recipePage.recipes.map(recipe => (
                                    <Link to={recipe.isOfficial ? `/recipe/${recipe.rcpNo}` : `/community/recipe/${recipe.rcpNo}`} key={recipe.rcpNo} style={{ textDecoration: 'none' }}>
                                        {recipe.isOfficial ? (
                                            <OfficialRecipeCard recipe={recipe} />
                                        ) : (
                                            <RecipeCard recipe={recipe} />
                                        )}
                                    </Link>
                                ))
                            ) : (
                                <div className={list.empty_list}>
                                    <p>조건에 맞는 레시피가 없어요. 😢</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <RcpPagination
                        currentPage={searchParams.page ? searchParams.page + 1 : 1}
                        totalPages={recipePage.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
};

export default CommunityRecipeList;