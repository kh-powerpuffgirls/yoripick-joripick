// src/pages/CommunityRecipeList/CommunityRecipeList.tsx
import React, { useState, useEffect } from 'react';
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


const CommunityRecipeList: React.FC = () => {
    const navigate = useNavigate();
    // DB에서 가져올 레시피 목록을 담을 state
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    // 주간 랭킹 레시피를 담을 state
    const [rankingRecipes, setRankingRecipes] = useState<Recipe[]>([]);

    // 백엔드 API가 준비되면 이 함수를 통해 데이터를 가져옵니다.
    const fetchRecipes = async () => {
        try {
        // const response = await axios.get('http://localhost:8080/api/recipes');
        // setRecipes(response.data.recipes);
        // setRankingRecipes(response.data.rankingRecipes);

        // --- 현재는 목(mock) 데이터로 테스트 ---
        const mockRecipes: Recipe[] = Array(12).fill({
            rcp_no: 1, user_no: 1, rcp_name: '팽이버섯 유부 말이 15분 완성!', rcp_info: '...',
            userInfo: { nickname: '망곰eee', eat_bti: '육식 티라노', profileImage: '' },
            image_no: 1, views: 123, stars: 40, created_at: new Date().toISOString(),
        }).map((recipe, index) => ({ ...recipe, rcp_no: index + 1 })); // 각기 다른 key를 갖도록 id 부여

        setRecipes(mockRecipes);
        setRankingRecipes(mockRecipes.slice(0, 4)); // 목 데이터 중 4개를 랭킹으로 사용
        // --- 여기까지 목 데이터 ---

        } catch (error) {
        console.error("레시피 데이터를 불러오는데 실패했습니다.", error);
        }
    };

    // 컴포넌트가 처음 렌더링될 때 한 번만 데이터를 불러옵니다.
    useEffect(() => {
        fetchRecipes();
    }, []);


    return (
        <>
        <CommunityHeader />
        <div className={CommunityList.main}>
        <CommunitySidebar />
        <div className={CommunityList.container}>
            
            <button className={CommunityList.write} onClick={() => navigate('/write')}>레시피 작성하기</button>

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
                <div>최신순</div>
                <div>별점순</div>
            </div>
            <hr />
            <div className={CommunityList.content_container}>
                {recipes.map(recipe => (
                // Link를 사용해 클릭 시 상세 페이지로 이동
                <Link to={`/recipe/${recipe.rcp_no}`} key={recipe.rcp_no} style={{ textDecoration: 'none' }}>
                    <RecipeCard recipe={recipe} />
                </Link>
                ))}
            </div>
            </div>
        <Pagination/>
        </div>
        </div>
    </>
    );
};

export default CommunityRecipeList;