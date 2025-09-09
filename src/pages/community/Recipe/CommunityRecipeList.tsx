// src/pages/CommunityRecipeList/CommunityRecipeList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// import './CommunityList.css'; // 페이지 전용 CSS
import CommunityList from './CommunityList.module.css'; 

// 샘플 아이콘 import
import rankingIcon from '../../../assets/sample/순위아이콘.png';
import crown1 from '../../../assets/sample/1등 왕관.png';
import crown2 from '../../../assets/sample/2등 왕관.png';
import crown3 from '../../../assets/sample/3등 왕관.png';
import crown4 from '../../../assets/sample/4등 왕관.png';
import CommunityHeader from '../Header/CommunityHeader';
import CommunitySidebar from '../Sidebar/CommunitySidebar';
import RecipeCard from './RecipeCard';
import type { Recipe } from '../../../type/Recipe';
import Pagination from '../../../components/Pagination';
import axios from 'axios';

// API 파라미터 타입을 정의합니다. (선택적 프로퍼티로)
interface ApiParams {
  sort?: string;
  ingredient?: string;
  rcp_mth_no?: string;
  rcp_sta_no?: string;
}

const CommunityRecipeList: React.FC = () => {
     const navigate = useNavigate();
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    // 랭킹 레시피는 별도 API로 관리하는 것이 좋습니다. 지금은 일단 유지.
    const [rankingRecipes, setRankingRecipes] = useState<Recipe[]>([]);

    // 로딩 상태를 관리할 state 추가 (초기값: true)
    const [isLoading, setIsLoading] = useState(true);
    
    // API 요청에 사용할 파라미터를 state로 관리
    const [searchParams, setSearchParams] = useState<ApiParams>({ sort: 'createdAt' }); // 기본 정렬: 최신순

    // 백엔드 API를 호출하는 함수 (useCallback으로 불필요한 재성성 방지)
    const fetchRecipes = useCallback(async () => {
        setIsLoading(true); // API 호출 시작 시 로딩 상태로 변경
        try {
            const response = await axios.get('http://localhost:8080/community/recipe', {
                params: searchParams
            });
            setRecipes(response.data);
            setRankingRecipes(response.data.slice(0, 4)); // 랭킹 데이터 임시 처리
        } catch (error) {
            console.error("레시피 데이터를 불러오는데 실패했습니다.", error);
        } finally {
            setIsLoading(false); // API 호출 완료 시 (성공/실패 모두) 로딩 상태 해제
        }
    }, [searchParams]);

    // 컴포넌트가 처음 렌더링될 때, 그리고 fetchRecipes 함수가 변경될 때 데이터를 불러옵니다.
    useEffect(() => {
        fetchRecipes();
    }, [fetchRecipes]);

    // 사이드바에서 '조회' 버튼을 눌렀을 때 실행될 함수
    const handleSearch = (sidebarParams: Omit<ApiParams, 'sort'>) => {
        // 기존 정렬 조건은 유지하면서, 사이드바의 검색 조건을 합칩니다.
        setSearchParams(prevParams => ({ ...prevParams, ...sidebarParams }));
    };

    // 정렬 버튼 클릭 핸들러
    const handleSort = (sortType: string) => {
        setSearchParams(prevParams => ({ ...prevParams, sort: sortType }));
    };


    return (
        <>
        <CommunityHeader />
        <div className={CommunityList.main}>

        <CommunitySidebar onSearch={handleSearch} />
        <div className={CommunityList.container}>
            
            <button className={CommunityList.write} onClick={() => navigate('/community/recipe/write')}>레시피 작성하기</button>

            {/* 금주 Pick! 랭킹 섹션 */}
            <table className={CommunityList.ranking}>
            <thead>
                <tr>
                <th colSpan={4}>
                    <div className={CommunityList.ranking_title}>
                    <img src={rankingIcon} height='50px' width='50px' alt="랭킹 아이콘" />
                    금주 Pick!
                    </div>
                </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                {rankingRecipes.map((recipe, index) => (
                    <td key={`rank-${recipe.rcp_no}`}>
                        {/* 랭킹에 맞는 왕관 이미지를 동적으로 보여줄 수 있습니다. */}
                        {index === 0 && <img src={crown1} id="crown" alt="1등" />}
                        {index === 1 && <img src={crown2} id="crown" alt="2등" />}
                        {index === 2 && <img src={crown3} id="crown" alt="3등" />}
                        {index === 3 && <img src={crown4} id="crown" alt="4등" />}
                        {/* 재사용 가능한 RecipeCard 컴포넌트 사용 */}
                        <RecipeCard recipe={recipe} />
                    </td>
                    
                ))}
                </tr>
            </tbody>
            </table>

            <br />

            {/* 전체 레시피 리스트 섹션 */}
            <div className={CommunityList.list}>
                <div className={CommunityList.list_header}>
                    {/* 버튼 클릭 시 정렬 조건 변경 */}
                    <div 
                        className={searchParams.sort === 'createdAt' ? CommunityList.active_sort : ''}
                        onClick={() => handleSort('createdAt')}
                    >
                    최신순
                    </div>
                    <div 
                        className={searchParams.sort === 'stars' ? CommunityList.active_sort : ''}
                        onClick={() => handleSort('stars')}
                    >
                        별점순
                    </div>
                </div>
                <hr />
                <div className={CommunityList.content_container}>
                    {isLoading ? (
                        // 1. 로딩 중일 때 보여줄 UI
                        <p style={{fontSize:'20px', color:'#888'}}>레시피를 불러오는 중입니다...</p>
                    ) : recipes.length > 0 ? (
                        // 2. 로딩이 끝났고, 데이터가 있을 때
                        recipes.map(recipe => (
                            <Link to={`/recipe/${recipe.rcp_no}`} key={recipe.rcp_no} style={{ textDecoration: 'none' }}>
                                <RecipeCard recipe={recipe} />
                            </Link>
                        ))
                    ) : (
                        // 3. 로딩이 끝났는데, 데이터가 없을 때
                        <div className={CommunityList.empty_list}>
                            <p>조건에 맞는 레시피가 없어요. 😢</p>
                        </div>
                    )}
                </div>
            </div>
            <Pagination/>
        </div>
        </div>
    </>
    );
};

export default CommunityRecipeList;